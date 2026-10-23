"use client";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <section className="card empty-screen" role="alert">
      <h1>Não foi possível concluir esta ação</h1>
      <p>
        Tente novamente. Se o problema continuar, recarregue a página e confira
        sua conexão.
      </p>
      <button className="btn primary" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
