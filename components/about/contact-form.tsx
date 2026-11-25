"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ContactError, ContactResponse } from "@/lib/contact";

// Formulario de contacto de references/home-about/about.jsx (.contact-form, .field,
// .terminal-success). `text-[14px] tracking-[0.01em]`: los campos heredan el cuerpo
// de esa referencia (14 px), no los 16 px del resto de la app.

type Fields = { name: string; email: string; msg: string };
const EMPTY: Fields = { name: "", email: "", msg: "" };

// Estados del spec 03: la referencia solo tiene formulario y éxito.
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; error: ContactError };

const ERROR_TEXT: Record<ContactError, string> = {
  invalid: "[ERR] Datos no válidos. Revisa el correo y la longitud del mensaje.",
  config: "[ERR] Servidor de correo no configurado.",
  send: "[ERR] No se pudo transmitir el paquete. Inténtalo de nuevo.",
};

const LABEL = "font-mono text-[10px] tracking-[0.16em] text-home-faint uppercase";
const CONTROL =
  "border border-home-line bg-void text-home-ink outline-0 transition-[border-color,box-shadow] duration-[140ms] placeholder:text-home-faint focus:border-neon-cyan focus:shadow-[0_0_12px_rgb(0_245_255/0.35)]";
const GHOST_BTN =
  "btn-home border-home-faint text-home-dim hover:border-home-dim hover:text-home-ink hover:shadow-none";

export function ContactForm() {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const update = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }
    const name = form.name.trim();
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => null)) as ContactResponse | null;
      if (res.ok && data && "ok" in data) {
        setStatus({ kind: "sent", name });
      } else {
        const error = data && "error" in data ? data.error : "send";
        setStatus({ kind: "error", error: error in ERROR_TEXT ? error : "send" });
      }
    } catch {
      setStatus({ kind: "error", error: "send" });
    }
  };

  // "ENVIAR OTRO MENSAJE": formulario vacío. "REINTENTAR": conserva lo escrito.
  const reset = () => {
    setStatus({ kind: "idle" });
    setForm(EMPTY);
  };
  const retry = () => setStatus({ kind: "idle" });

  const sending = status.kind === "sending";

  return (
    <form
      onSubmit={onSubmit}
      className={`relative border border-home-line bg-home-bg2 p-7 text-[14px] tracking-[0.01em] transition-transform duration-[80ms] before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-[rgb(0_245_255/0.15)] before:content-[''] ${
        shake ? "animate-shake" : ""
      }`}
    >
      {status.kind === "sent" ? (
        <Terminal tone="success" onAction={reset} actionLabel="ENVIAR OTRO MENSAJE">
          <div className="text-home-green">
            <span className="mr-2 text-neon-cyan">vault@arcade:~$</span> ./send_message --to=team
          </div>
          <div className="text-home-dim">[OK] Conectando con servidor…</div>
          <div className="text-home-dim">[OK] Validando contenido…</div>
          <div className="text-home-dim">[OK] Transmitiendo paquete…</div>
          <div className="mt-3 font-bold whitespace-pre-wrap text-home-green [text-shadow:0_0_6px_rgb(0_255_136/0.45)]">
            &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {status.name.toUpperCase()}.
            <span className="[animation:blink_1s_steps(1)_infinite]">_</span>
          </div>
        </Terminal>
      ) : status.kind === "error" ? (
        <Terminal tone="error" onAction={retry} actionLabel="REINTENTAR">
          <div className="text-home-green">
            <span className="mr-2 text-neon-cyan">vault@arcade:~$</span> ./send_message --to=team
          </div>
          <div className="mt-3 font-bold whitespace-pre-wrap text-[#ff5f56] [text-shadow:0_0_6px_rgb(255_95_86/0.45)]">
            {ERROR_TEXT[status.error]}
          </div>
        </Terminal>
      ) : (
        <fieldset disabled={sending} className="m-0 min-w-0 border-0 p-0">
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
              className={`h-11 px-3 font-mono tracking-normal ${CONTROL}`}
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
              className={`h-11 px-3 font-mono tracking-normal ${CONTROL}`}
            />
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label htmlFor="contact-msg" className={LABEL}>
              MENSAJE
            </label>
            {/* La referencia no hereda la fuente en textarea (13,33 px, espaciado normal). Su interlineado
                "normal" con JetBrains Mono son 18 px: se fija para que 5 filas midan 116 px con Courier Prime. */}
            <textarea
              id="contact-msg"
              name="msg"
              rows={5}
              value={form.msg}
              onChange={update("msg")}
              placeholder="Cuéntanos qué tienes en mente…"
              className={`min-h-[110px] w-full resize-y p-3 font-mono text-[13.3333px] leading-[18px] tracking-normal ${CONTROL}`}
            />
          </div>
          {/* .btn.xl.press */}
          <button
            type="submit"
            className="btn-home btn-home-xl neon-cyan w-full disabled:cursor-wait active:[transform:translateY(3px)_scale(0.99)] active:shadow-[inset_0_0_6px_rgb(0_245_255/0.2)]"
          >
            {sending ? "▶  TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </fieldset>
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
