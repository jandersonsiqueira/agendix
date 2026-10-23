"use client";
import { useActionState } from "react";
import { createOrganization } from "@/app/actions";
export function OrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, {});
  return (
    <form action={action} className="form-stack">
      <label>
        Nome do estabelecimento
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Ex.: Barbearia do João"
        />
      </label>
      {state.error && (
        <p role="alert" className="alert error">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn primary">
        {pending ? "Criando..." : "Criar estabelecimento"}
      </button>
    </form>
  );
}
