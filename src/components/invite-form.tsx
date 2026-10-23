"use client";
import { useActionState, useState } from "react";
import { inviteMember } from "@/app/actions";
export function InviteForm({ isOwner }: { isOwner: boolean }) {
  const [state, action, pending] = useActionState(inviteMember, {});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyInvite() {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(state.inviteUrl!);
      setCopied(true);
    } catch {
      setCopyError(
        "Não foi possível copiar. Selecione o link e copie manualmente.",
      );
    }
  }

  return (
    <form
      action={(form) => {
        setCopied(false);
        setCopyError("");
        action(form);
      }}
      aria-busy={pending}
      className="form-stack"
    >
      <label>
        E-mail do convidado
        <input
          type="email"
          name="email"
          required
          placeholder="profissional@email.com"
        />
      </label>
      <label>
        Perfil
        <select name="role" defaultValue="professional">
          <option value="professional">Profissional</option>
          <option value="receptionist">Recepção</option>
          {isOwner && <option value="admin">Administrador</option>}
        </select>
      </label>
      {state.error && (
        <p role="alert" className="alert error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="alert success">
          {state.success}
        </p>
      )}
      {state.inviteUrl && (
        <div className="invite-link">
          <input
            readOnly
            aria-label="Link do convite"
            value={state.inviteUrl}
          />
          <button type="button" className="btn secondary" onClick={copyInvite}>
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      )}
      {copyError && (
        <p role="alert" className="alert error">
          {copyError}
        </p>
      )}
      {copied && (
        <p role="status" className="subtle-text">
          Link copiado para a área de transferência.
        </p>
      )}
      <button className="btn primary" disabled={pending}>
        {pending ? "Criando..." : "Gerar convite"}
      </button>
    </form>
  );
}
