import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const { modo } = await searchParams;
  return (
    <Suspense>
      <AuthForm
        key={modo === "cadastro" ? "signup" : "login"}
        mode={modo === "cadastro" ? "signup" : "login"}
      />
    </Suspense>
  );
}
