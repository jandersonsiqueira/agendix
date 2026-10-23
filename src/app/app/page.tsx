import Link from "next/link";
import { getOrganizationContext } from "@/lib/context";
import { OrganizationForm } from "@/components/organization-form";
import { roleLabel } from "@/lib/roles";

export default async function Dashboard() {
  const { current, memberships } = await getOrganizationContext();
  if (!current)
    return (
      <div className="empty-screen">
        <div className="empty-illustration">✦</div>
        <span className="eyebrow">SUA JORNADA COMEÇA AQUI</span>
        <h1>Bem-vindo ao Agendix!</h1>
        <p>
          Você ainda não está vinculado a nenhum estabelecimento. Crie seu
          negócio agora ou aguarde o convite de uma empresa.
        </p>
        <div className="card empty-create">
          <h2>Crie seu estabelecimento</h2>
          <p>Seu espaço de trabalho ficará pronto em poucos segundos.</p>
          <OrganizationForm />
        </div>
        <div className="waiting-note">
          ✉{" "}
          <span>
            Vai trabalhar em uma empresa? Aguarde o convite do responsável. Você
            poderá acessá-la com esta mesma conta.
          </span>
        </div>
      </div>
    );
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PAINEL DO ESTABELECIMENTO</span>
          <h1>Visão geral</h1>
          <p>
            Bem-vindo ao espaço de trabalho de{" "}
            <strong>{current.organization.name}</strong>.
          </p>
        </div>
        <span className="role-pill">{roleLabel(current.role)}</span>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span>◷</span>
          <small>Agendamentos hoje</small>
          <strong>—</strong>
          <em>Disponível na próxima etapa</em>
        </div>
        <div className="stat-card">
          <span>♙</span>
          <small>Clientes</small>
          <strong>—</strong>
          <em>Disponível na próxima etapa</em>
        </div>
        <div className="stat-card">
          <span>✂</span>
          <small>Profissionais</small>
          <strong>—</strong>
          <em>Disponível na próxima etapa</em>
        </div>
        <div className="stat-card">
          <span>◈</span>
          <small>Faturamento hoje</small>
          <strong>—</strong>
          <em>Disponível na próxima etapa</em>
        </div>
      </div>
      <section className="card welcome-card">
        <div className="card-icon">✦</div>
        <h2>Seu Agendix está pronto para começar.</h2>
        <p>
          Concluímos a base de autenticação e gestão de estabelecimentos. Na
          próxima etapa, construiremos serviços, profissionais e agendamentos.
        </p>
        {["owner", "admin"].includes(current.role) && (
          <Link href="/app/equipe" className="btn primary inline-btn">
            Gerenciar equipe →
          </Link>
        )}
        {memberships.length > 1 && (
          <p className="subtle-text">
            Você pode alternar seus estabelecimentos no menu lateral.
          </p>
        )}
      </section>
    </div>
  );
}
