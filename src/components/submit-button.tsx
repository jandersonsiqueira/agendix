"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Aguarde...",
  className = "btn primary",
  title,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      title={title}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
