import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export default function ResetPassword() {
  return (
    <Suspense>
      <AuthForm mode="reset" />
    </Suspense>
  );
}
