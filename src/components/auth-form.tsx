"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { safeNext } from "@/lib/redirect";

type Mode = "login" | "signup" | "forgot" | "reset";
const labels: Record<Mode, string> = {
  login: "Entre na sua conta",
  signup: "Crie sua conta",
  forgot: "Recupere seu acesso",
  reset: "Defina uma nova senha",
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const loginHref = `/login${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          router.replace(`/confirmar-email?next=${encodeURIComponent(next)}`);
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/redefinir-senha`,
        });
        if (error) throw error;
        setNotice(
          "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.",
        );
      } else {
        if (password.length < 8)
          throw new Error("Use uma senha de pelo menos 8 caracteres.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setNotice("Senha atualizada!");
        router.replace("/app");
        router.refresh();
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Ocorreu um erro. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível entrar com Google. Tente novamente.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <img src="/logo.png" alt="Agendix" className="auth-logo" />
        <h1>Seu tempo vale mais.</h1>
        <p>
          Uma experiência simples e inteligente para organizar os seus
          atendimentos e fazer seu negócio crescer.
        </p>
        <div className="intro-pills">
          <span>Agenda inteligente</span>
          <span>Seu negócio no controle</span>
          <span>Feito para você</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <img src="/logo.png" alt="Agendix" className="auth-mobile-logo" />
          <div className="eyebrow">BEM-VINDO AO AGENDIX</div>
          <h2>{labels[mode]}</h2>
          <p className="muted">
            {mode === "signup"
              ? "Uma conta para todos os seus estabelecimentos."
              : mode === "login"
                ? "Acesse seus estabelecimentos em um só lugar."
                : "Sua conta, com segurança e praticidade."}
          </p>
          {params.get("erro") && (
            <p role="alert" className="alert error">
              Não foi possível concluir a autenticação. Tente novamente.
            </p>
          )}
          <form onSubmit={submit} className="form-stack" aria-busy={busy}>
            <fieldset disabled={busy} className="form-stack form-fields">
              {mode === "signup" && (
                <label>
                  Seu nome
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como podemos chamar você?"
                  />
                </label>
              )}
              {mode !== "reset" && (
                <label>
                  E-mail
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </label>
              )}
              {mode !== "forgot" && (
                <label>
                  Senha
                  <input
                    required
                    type="password"
                    minLength={mode === "login" ? 1 : 8}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
              )}
              {mode === "login" && (
                <Link
                  className="right-link"
                  href={`/recuperar-senha?next=${encodeURIComponent(next)}`}
                >
                  Esqueceu sua senha?
                </Link>
              )}
              {error && (
                <p role="alert" className="alert error">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="alert success">
                  {notice}
                </p>
              )}
              <button className="btn primary" disabled={busy}>
                {busy
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar"
                    : mode === "signup"
                      ? "Criar minha conta"
                      : mode === "forgot"
                        ? notice
                          ? "Reenviar instruções"
                          : "Enviar instruções"
                        : "Salvar nova senha"}
              </button>
            </fieldset>
          </form>
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="separator">
                <span>ou</span>
              </div>
              <button
                className="btn google"
                onClick={googleLogin}
                disabled={busy}
              >
                <span className="google-g">G</span> Continuar com Google
              </button>
            </>
          )}
          <p className="auth-footer">
            {mode === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <Link
                  href={`/login?modo=cadastro${next !== "/app" ? `&next=${encodeURIComponent(next)}` : ""}`}
                >
                  Cadastre-se
                </Link>
              </>
            ) : mode === "signup" ? (
              <>
                Já tem uma conta? <Link href={loginHref}>Entrar</Link>
              </>
            ) : (
              <Link href={loginHref}>Voltar ao login</Link>
            )}
          </p>
        </div>
        <p className="auth-copyright">
          © {new Date().getFullYear()} Agendix · Feito para facilitar seu dia.
        </p>
      </section>
    </div>
  );
}
