"use client";

import Link from "next/link";

export default function InvitationError({ reset }: { reset: () => void }) {
  return (
    <main className="invite-screen">
      <section className="card invite-card" role="alert">
        <h1>Não foi possível aceitar o convite</h1>
        <p>
          Confira se você está usando a conta com o e-mail convidado. O convite
          também pode ter expirado ou já ter sido utilizado. Se precisar, peça
          um novo link ao responsável.
        </p>
        <button className="btn primary" onClick={reset}>
          Tentar novamente
        </button>
        <p className="auth-footer">
          <Link href="/app">Ir para minha conta</Link>
        </p>
      </section>
    </main>
  );
}
