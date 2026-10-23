import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitation } from "@/app/actions";

export default async function Invitation({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const next = `/convite/${token}`;
  return (
    <main className="invite-screen">
      <div className="card invite-card">
        <img src="/logo.png" alt="Agendix" className="invite-logo" />
        <div className="empty-illustration">✉</div>
        <h1>Você recebeu um convite!</h1>
        <p>
          Use sua conta Agendix para participar de um estabelecimento. Por
          segurança, o convite só poderá ser aceito pela conta com o e-mail
          convidado.
        </p>
        {user ? (
          <form action={acceptInvitation}>
            <input type="hidden" name="token" value={token} />
            <SubmitButton pendingLabel="Aceitando...">
              Aceitar convite
            </SubmitButton>
          </form>
        ) : (
          <Link
            className="btn primary inline-btn"
            href={`/login?next=${encodeURIComponent(next)}`}
          >
            Entrar ou criar conta
          </Link>
        )}
      </div>
    </main>
  );
}
