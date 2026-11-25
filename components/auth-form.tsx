"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/components/session-provider";
import { login, register } from "@/lib/api";

type AuthTab = "login" | "register";

const EMAIL_PATTERN = /.+@.+\..+/;

const TAB_BASE =
  "cursor-pointer border-2 px-1.5 py-3.5 font-pixel text-[9px] leading-[1.6]";
const FIELD_LABEL = "flex flex-col gap-2 text-[15px] font-bold text-crt-ink-2";
const SOCIAL_BUTTON =
  "cursor-pointer border-2 border-crt-line bg-transparent p-3 text-base font-bold text-crt-ink transition-all duration-[120ms] hover:border-crt-ink hover:text-crt-ink active:scale-95";

export function AuthForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [tab, setTab] = useState<AuthTab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isRegister = tab === "register";

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setError("");
  };

  const finish = (name: string) => {
    signIn(name);
    router.push("/biblioteca");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    if (!username.trim() || password.length < 4) {
      setError("Introduce tu usuario y una contraseña de al menos 4 caracteres.");
      return;
    }
    if (isRegister && !EMAIL_PATTERN.test(email)) {
      setError("Introduce un correo electrónico válido.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const account = isRegister
        ? await register(username.trim(), email, password)
        : await login(username.trim(), password);
      finish(account.name);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="panel-crt flex w-full max-w-[440px] flex-col gap-[22px] px-[26px] py-[30px]">
      <div className="animate-flicker text-center font-pixel text-xl leading-normal text-crt-ink">
        ARCADE
        <br />
        <span className="text-crt-ink">
          VAULT
        </span>
      </div>

      <div role="tablist" aria-label="Acceso" className="grid grid-cols-2">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegister}
          onClick={() => switchTab("login")}
          className={`${TAB_BASE} border-crt-ink ${!isRegister ? "bg-crt-ink text-crt-invert" : "bg-transparent text-crt-ink"}`}
        >
          INICIAR SESIÓN
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegister}
          onClick={() => switchTab("register")}
          className={`${TAB_BASE} border-crt-ink ${isRegister ? "bg-crt-ink text-crt-invert" : "bg-transparent text-crt-ink"}`}
        >
          CREAR CUENTA
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <label className={FIELD_LABEL}>
          Usuario
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="input-crt"
          />
        </label>
        {isRegister && (
          <label className={FIELD_LABEL}>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="input-crt"
            />
          </label>
        )}
        <label className={FIELD_LABEL}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="input-crt"
          />
        </label>
        {error && (
          <div
            role="alert"
            className="border border-l-4 border-crt-err bg-crt-surface px-3 py-2.5 text-[15px] text-crt-ink"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-crt-solid mt-1 disabled:cursor-wait disabled:opacity-70"
        >
          {isRegister ? "CREAR CUENTA" : "ENTRAR"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-crt-ink-2">
        <span className="h-px flex-1 bg-crt-line" />
        O CONTINÚA CON
        <span className="h-px flex-1 bg-crt-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => finish("JUGADOR_GOOGLE")} className={SOCIAL_BUTTON}>
          Google
        </button>
        <button type="button" onClick={() => finish("JUGADOR_GITHUB")} className={SOCIAL_BUTTON}>
          GitHub
        </button>
      </div>

      <button
        type="button"
        onClick={() => router.push("/biblioteca")}
        className="cursor-pointer border-2 border-dashed border-crt-ink bg-transparent p-3.5 font-pixel text-[10px] text-crt-ink transition-all duration-[120ms] hover:bg-crt-ink/15 active:scale-95"
      >
        JUGAR COMO INVITADO
      </button>
      <p className="m-0 text-center text-sm leading-normal text-crt-ink-2">
        Como invitado tus puntuaciones solo se guardan en este dispositivo.
      </p>
    </div>
  );
}
