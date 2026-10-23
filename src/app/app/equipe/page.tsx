import { SubmitButton } from "@/components/submit-button";
import { redirect } from "next/navigation";
import { getOrganizationContext } from "@/lib/context";
import { requireUser } from "@/lib/auth";
import { InviteForm } from "@/components/invite-form";
import { roleLabel } from "@/lib/roles";
import { removeMember, updateMember } from "@/app/actions";

type Member = {
  user_id: string;
  full_name: string;
  email: string;
  role: "owner" | "admin" | "receptionist" | "professional";
  status: string;
};
export default async function Team() {
  const { current } = await getOrganizationContext();
  if (!current || !["owner", "admin"].includes(current.role)) redirect("/app");
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("list_organization_members", {
    p_organization_id: current.organization_id,
  });
  if (error) {
    console.error("Erro ao carregar equipe:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error("Não foi possível carregar a equipe.");
  }
  const members = (data ?? []) as Member[];
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACESSOS E PERMISSÕES</span>
          <h1>Equipe</h1>
          <p>Gerencie quem pode acessar {current.organization.name}.</p>
        </div>
      </div>
      <div className="card">
        <h2>Membros ({members.length})</h2>
        <div className="member-list">
          {members.length === 0 && (
            <p>
              Nenhum membro encontrado. Use o formulário abaixo para convidar
              sua equipe.
            </p>
          )}
          {members.map((member) => (
            <div key={member.user_id} className="member-row">
              <span className="avatar">
                {(member.full_name || member.email).slice(0, 1).toUpperCase()}
              </span>
              <div className="member-identity">
                <strong>{member.full_name || member.email}</strong>
                <small>
                  {member.email} · {roleLabel(member.role)}
                </small>
              </div>
              {current.role === "owner" && member.role !== "owner" && (
                <div className="member-actions">
                  <form action={updateMember}>
                    <input type="hidden" name="userId" value={member.user_id} />
                    <select
                      name="role"
                      defaultValue={member.role}
                      aria-label={`Perfil de ${member.email}`}
                    >
                      <option value="professional">Profissional</option>
                      <option value="receptionist">Recepção</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <SubmitButton
                      className="btn small secondary"
                      pendingLabel="Salvando..."
                    >
                      Salvar
                    </SubmitButton>
                  </form>
                  <form action={removeMember}>
                    <input type="hidden" name="userId" value={member.user_id} />
                    <SubmitButton
                      className="btn small danger"
                      pendingLabel="Removendo..."
                    >
                      Remover
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Convidar alguém</h2>
        <p>
          Gere um link de convite para a pessoa. Ela poderá criar uma conta ou
          entrar com a que já possui.
        </p>
        <InviteForm isOwner={current.role === "owner"} />
        <p className="subtle-text">
          Por enquanto, o convite é compartilhado manualmente. O envio
          automático por e-mail será uma etapa posterior.
        </p>
      </div>
    </div>
  );
}
