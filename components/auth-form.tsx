"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/components/session-provider";
import { login, register } from "@/lib/api";

type AuthTab = "login" | "register";

const EMAIL_PATTERN = /.+@.+\..+/;

const TAB_BASE =
  "cursor-pointer border-2 px-1.5 py-3.5 font-pixel text-[9px] leading-[1.6]";
const FIELD_LABEL = "flex flex-col gap-2 text-[15px] font-bold text-ink-soft";
const SOCIAL_BUTTON =
  "cursor-pointer border-2 border-line bg-transparent p-3 text-base font-bold text-ink transition-all duration-[120ms] hover:border-neon-yellow hover:text-neon-yellow active:scale-95";

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
    <div className="panel-crt flex w-full max-w-[440px] flex-col gap-[22px] px-[26px] py-[30px] shadow-glow-cyan-lg">
      <div className="animate-flicker text-center font-pixel text-xl leading-normal text-neon-cyan [text-shadow:0_0_8px_#00f5ff,0_0_24px_rgb(0_245_255/0.7)]">
        ARCADE
        <br />
        <span className="text-neon-pink [text-shadow:0_0_8px_#ff006e,0_0_24px_rgb(255_0_110/0.7)]">
          VAULT
        </span>
      </div>

      <div role="tablist" aria-label="Acceso" className="grid grid-cols-2">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegister}
          onClick={() => switchTab("login")}
          className={`${TAB_BASE} border-neon-cyan ${!isRegister ? "bg-neon-cyan text-void" : "bg-transparent text-neon-cyan"}`}
        >
          INICIAR SESIÓN
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegister}
          onClick={() => switchTab("register")}
          className={`${TAB_BASE} border-neon-pink ${isRegister ? "bg-neon-pink text-void" : "bg-transparent text-neon-pink"}`}
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
            className="border border-neon-pink bg-neon-pink/[0.08] px-3 py-2.5 text-[15px] text-[#ff5c9a]"
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

      <div className="flex items-center gap-3 text-[13px] text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        O CONTINÚA CON
        <span className="h-px flex-1 bg-line" />
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
        className="cursor-pointer border-2 border-dashed border-neon-pink bg-transparent p-3.5 font-pixel text-[10px] text-neon-pink transition-all duration-[120ms] hover:bg-neon-pink/15 hover:shadow-[0_0_18px_rgb(255_0_110/0.5)] active:scale-95"
      >
        JUGAR COMO INVITADO
      </button>
      <p className="m-0 text-center text-sm leading-normal text-ink-muted">
        Como invitado tus puntuaciones solo se guardan en este dispositivo.
      </p>
    </div>
  );
}
