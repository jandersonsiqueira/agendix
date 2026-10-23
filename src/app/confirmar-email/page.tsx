import Link from "next/link";
import { safeNext } from "@/lib/redirect";

export const metadata = { title: "Confirme seu e-mail" };

export default async function ConfirmEmail({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  const loginHref = `/login${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <main className="invite-screen">
      <section className="card invite-card confirmation-card">
        <img src="/logo.png" alt="Agendix" className="invite-logo" />
        <div className="empty-illustration" aria-hidden="true">
          ✉
        </div>
        <span className="eyebrow">FALTA SÓ UM PASSO</span>
        <h1>Confirme seu e-mail</h1>
        <p>
          Enviamos um link de confirmação para o endereço informado no cadastro.
          Abra o e-mail e clique no link para ativar sua conta.
        </p>
        <p className="waiting-note">
          Não encontrou a mensagem? Confira também as pastas de spam e lixo
          eletrônico.
        </p>
        <Link href={loginHref} className="btn primary">
          Ir para o login
        </Link>
        <p className="subtle-text">
          Após confirmar seu endereço, entre para continuar.
        </p>
      </section>
    </main>
  );
}
