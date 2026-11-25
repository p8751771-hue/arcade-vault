"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

// Formulario de contacto de references/home-about/about.jsx (.contact-form, .field,
// .terminal-success). `text-[14px] tracking-[0.01em]`: los campos heredan el cuerpo
// de esa referencia (14 px), no los 16 px del resto de la app.

type Fields = { name: string; email: string; msg: string };
const EMPTY: Fields = { name: "", email: "", msg: "" };

const LABEL = "font-mono text-[10px] tracking-[0.16em] text-home-faint uppercase";
const CONTROL =
  "border border-home-line bg-void text-home-ink outline-0 transition-[border-color,box-shadow] duration-[140ms] placeholder:text-home-faint focus:border-neon-cyan focus:shadow-[0_0_12px_rgb(0_245_255/0.35)]";
const GHOST_BTN =
  "btn-home border-home-faint text-home-dim hover:border-home-dim hover:text-home-ink hover:shadow-none";

export function ContactForm() {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [sent, setSent] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const update = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }
    setSent(form.name.trim());
  };

  const reset = () => {
    setSent(null);
    setForm(EMPTY);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`relative border border-home-line bg-home-bg2 p-7 text-[14px] tracking-[0.01em] transition-transform duration-[80ms] before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-[rgb(0_245_255/0.15)] before:content-[''] ${
        shake ? "animate-shake" : ""
      }`}
    >
      {sent === null ? (
        <>
          <div className="mb-3 flex flex-col gap-1.5">
            <label htmlFor="contact-name" className={LABEL}>
              NOMBRE
            </label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder="px_kai"
              className={`h-11 px-3 font-mono ${CONTROL}`}
            />
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label htmlFor="contact-email" className={LABEL}>
              CORREO ELECTRÓNICO
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="jugador@vault.gg"
              className={`h-11 px-3 font-mono ${CONTROL}`}
            />
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label htmlFor="contact-msg" className={LABEL}>
              MENSAJE
            </label>
            {/* La referencia no hereda la fuente en textarea: tamaño por defecto del navegador */}
            <textarea
              id="contact-msg"
              name="msg"
              rows={5}
              value={form.msg}
              onChange={update("msg")}
              placeholder="Cuéntanos qué tienes en mente…"
              className={`min-h-[110px] w-full resize-y p-3 font-mono text-[13.3333px] ${CONTROL}`}
            />
          </div>
          {/* .btn.xl.press */}
          <button
            type="submit"
            className="btn-home btn-home-xl neon-cyan w-full active:[transform:translateY(3px)_scale(0.99)] active:shadow-[inset_0_0_6px_rgb(0_245_255/0.2)]"
          >
            {"▶  ENVIAR MENSAJE"}
          </button>
        </>
      ) : (
        <Terminal tone="success" onAction={reset} actionLabel="ENVIAR OTRO MENSAJE">
          <div className="text-home-green">
            <span className="mr-2 text-neon-cyan">vault@arcade:~$</span>./send_message --to=team
          </div>
          <div className="text-home-dim">[OK] Conectando con servidor…</div>
          <div className="text-home-dim">[OK] Validando contenido…</div>
          <div className="text-home-dim">[OK] Transmitiendo paquete…</div>
          <div className="mt-3 font-bold whitespace-pre-wrap text-home-green [text-shadow:0_0_6px_rgb(0_255_136/0.45)]">
            &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {sent.toUpperCase()}.
            <span className="[animation:blink_1s_steps(1)_infinite]">_</span>
          </div>
        </Terminal>
      )}
    </form>
  );
}

// .terminal-success (+ variante de error del spec 03: borde y sombra #ff5f56)
function Terminal({
  tone,
  actionLabel,
  onAction,
  children,
}: {
  tone: "success" | "error";
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  const frame =
    tone === "success"
      ? "border-home-green shadow-[0_0_22px_rgb(0_255_136/0.25)]"
      : "border-[#ff5f56] shadow-[0_0_22px_rgb(255_95_86/0.25)]";
  return (
    <div role="status" className={`overflow-hidden border bg-black font-mono ${frame}`}>
      <div className="flex items-center gap-2 border-b border-home-line bg-void px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-pixel text-[9px] tracking-[0.14em] text-home-faint">
          VAULT-OS // TERMINAL
        </span>
      </div>
      <div className="px-[18px] pt-[18px] pb-[22px] text-[13px] leading-[1.8]">
        {children}
        <div className="mt-[18px]">
          <button type="button" onClick={onAction} className={GHOST_BTN}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
