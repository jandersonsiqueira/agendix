import { getOrganizationContext } from "@/lib/context";
import { OrganizationForm } from "@/components/organization-form";
import { roleLabel } from "@/lib/roles";
export default async function Establishments() {
  const { memberships } = await getOrganizationContext();
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MINHA CONTA</span>
          <h1>Meus estabelecimentos</h1>
          <p>Uma conta para participar de quantas empresas precisar.</p>
        </div>
      </div>
      <div className="card">
        <h2>Estabelecimentos vinculados</h2>
        {memberships.length ? (
          <div className="company-list">
            {memberships.map((m) => (
              <div key={m.organization_id} className="company-row">
                <span className="company-icon">⌂</span>
                <div>
                  <strong>{m.organization.name}</strong>
                  <small>{roleLabel(m.role)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Você ainda não está vinculado a nenhuma empresa.</p>
        )}
      </div>
      <div className="card">
        <h2>Adicionar meu estabelecimento</h2>
        <p>
          Você pode ter sua própria empresa e continuar participando de outras.
        </p>
        <OrganizationForm />
      </div>
    </div>
  );
}
