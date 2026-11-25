"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { ContactError, ContactResponse } from "@/lib/contact";

// Formulario de contacto de references/home-about/about.jsx (.contact-form, .field).
// `text-[14px] tracking-[0.01em]`: los campos heredan el cuerpo de esa referencia
// (14 px), no los 16 px del resto de la app. El resultado no usa la terminal de la
// referencia sino una tarjeta en lenguaje de usuario (spec 03, ampliación del paso 11).

type Fields = { name: string; email: string; msg: string };
const EMPTY: Fields = { name: "", email: "", msg: "" };

// Errores que ve el visitante: los de la API (salvo bad_request, que se muestra como
// "unexpected") más los del propio navegador.
type ClientError = Exclude<ContactError, "bad_request"> | "network" | "unexpected";

// Estados del spec 03: la referencia solo tiene formulario y éxito.
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; error: ClientError; code: string };

type Tone = "success" | "warn" | "error";

// Un mensaje por causa (spec 03, ampliación del paso 11). "warn": el visitante corrige
// sus datos; "error": el envío falló por algo que no depende de él.
const ERRORS: Record<
  ClientError,
  { tone: Exclude<Tone, "success">; title: string; text: string; action: string; code?: string }
> = {
  empty: {
    tone: "warn",
    title: "DATOS INCOMPLETOS",
    text: "Rellena tu nombre, tu correo y el mensaje para poder enviarlo.",
    action: "CORREGIR DATOS",
    code: "CONTACT-400-EMPTY",
  },
  email: {
    tone: "warn",
    title: "CORREO NO VÁLIDO",
    text: "Revisa tu dirección de correo: debe tener el formato nombre@dominio.com.",
    action: "CORREGIR DATOS",
    code: "CONTACT-400-EMAIL",
  },
  too_long: {
    tone: "warn",
    title: "TEXTO DEMASIADO LARGO",
    text: "El nombre admite hasta 60 caracteres y el mensaje hasta 2000. Acórtalos y vuelve a enviarlo.",
    action: "CORREGIR DATOS",
    code: "CONTACT-400-LENGTH",
  },
  rate_limited: {
    tone: "error",
    title: "DEMASIADOS ENVÍOS",
    text: "Se han enviado muchos mensajes seguidos. Espera un minuto y vuelve a intentarlo.",
    action: "REINTENTAR",
    code: "CONTACT-429",
  },
  unavailable: {
    tone: "error",
    title: "SERVICIO NO DISPONIBLE",
    text: "Nuestro servicio de correo no está disponible ahora mismo. Inténtalo más tarde; tu texto sigue guardado.",
    action: "REINTENTAR",
    code: "CONTACT-500",
  },
  network: {
    tone: "error",
    title: "SIN CONEXIÓN",
    text: "No pudimos conectar con Arcade Vault. Comprueba tu conexión a internet e inténtalo de nuevo.",
    action: "REINTENTAR",
    code: "CONTACT-NET",
  },
  // El código depende de la respuesta (CONTACT-400-JSON, CONTACT-{estado} o CONTACT-UNKNOWN).
  unexpected: {
    tone: "error",
    title: "ALGO SALIÓ MAL",
    text: "Ocurrió un error inesperado al enviar tu mensaje. Inténtalo de nuevo en unos minutos.",
    action: "REINTENTAR",
  },
};

const isClientError = (value: unknown): value is Exclude<ClientError, "network" | "unexpected"> =>
  value === "empty" ||
  value === "email" ||
  value === "too_long" ||
  value === "rate_limited" ||
  value === "unavailable";

const fail = (error: ClientError, code = ERRORS[error].code ?? "CONTACT-UNKNOWN"): Status => ({
  kind: "error",
  error,
  code,
});

const LABEL = "font-mono text-[10px] tracking-[0.16em] text-home-faint uppercase";
const CONTROL =
  "border border-home-line bg-void text-home-ink outline-0 transition-[border-color,box-shadow] duration-[140ms] placeholder:text-home-faint focus:border-neon-cyan focus:shadow-[0_0_12px_rgb(0_245_255/0.35)]";
const GHOST_BTN =
  "btn-cut border-home-faint text-home-dim hover:border-home-dim hover:text-home-ink hover:shadow-none";

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
    let res: Response;
    try {
      // Sin tiempo máximo, una red colgada dejaría el botón en "TRANSMITIENDO…".
      res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      setStatus(fail("network"));
      return;
    }
    const data = (await res.json().catch(() => null)) as ContactResponse | null;
    if (res.ok && data && "ok" in data) {
      setStatus({ kind: "sent", name });
    } else if (data && "error" in data && isClientError(data.error)) {
      setStatus(fail(data.error));
    } else if (data && "error" in data && data.error === "bad_request") {
      setStatus(fail("unexpected", "CONTACT-400-JSON"));
    } else {
      setStatus(fail("unexpected", `CONTACT-${res.status}`));
    }
  };

  // "ENVIAR OTRO MENSAJE": formulario vacío. "CORREGIR DATOS" / "REINTENTAR": conserva lo escrito.
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
        <ResultCard
          tone="success"
          title="¡MENSAJE ENVIADO!"
          text={
            <>
              Gracias, {status.name}. Te responderemos en{" "}
              <span className="whitespace-nowrap">24-48 h</span> en tu correo.
            </>
          }
          actionLabel="ENVIAR OTRO MENSAJE"
          onAction={reset}
        />
      ) : status.kind === "error" ? (
        <ResultCard
          tone={ERRORS[status.error].tone}
          title={ERRORS[status.error].title}
          text={ERRORS[status.error].text}
          code={status.code}
          actionLabel={ERRORS[status.error].action}
          onAction={retry}
        />
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
            className="btn-cut btn-cut-xl w-full disabled:cursor-wait active:[transform:translateY(3px)_scale(0.99)] active:shadow-[inset_0_0_6px_rgb(0_245_255/0.2)]"
          >
            {sending ? "▶  TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </fieldset>
      )}
    </form>
  );
}

// Tarjeta de resultado (sustituye a .terminal-success de la referencia).
// Éxito: role="status"; errores: role="alert", para que se anuncien al momento.
const TONE: Record<Tone, { color: string; glow: string; text: string }> = {
  success: {
    color: "text-home-green",
    glow: "[filter:drop-shadow(0_0_8px_#00ff88)]",
    text: "[text-shadow:0_0_8px_rgb(0_255_136/0.5)]",
  },
  warn: {
    color: "text-neon-yellow",
    glow: "[filter:drop-shadow(0_0_8px_#f5ff00)]",
    text: "[text-shadow:0_0_8px_rgb(245_255_0/0.45)]",
  },
  error: {
    color: "text-[#ff5f56]",
    glow: "[filter:drop-shadow(0_0_8px_#ff5f56)]",
    text: "[text-shadow:0_0_8px_rgb(255_95_86/0.5)]",
  },
};

// Iconos pixel de 16×16: ✓, ! y ✕ con cuadros de 2×2.
const ICON_CELLS: Record<Tone, [number, number, number, number][]> = {
  success: [[1, 8, 2, 2], [3, 10, 2, 2], [5, 12, 2, 2], [7, 10, 2, 2], [9, 8, 2, 2], [11, 6, 2, 2], [13, 4, 2, 2]],
  warn: [[7, 1, 2, 9], [7, 12, 2, 2]],
  error: [[3, 3, 2, 2], [5, 5, 2, 2], [7, 7, 2, 2], [9, 9, 2, 2], [11, 11, 2, 2], [11, 3, 2, 2], [9, 5, 2, 2], [5, 9, 2, 2], [3, 11, 2, 2]],
};

function ResultCard({
  tone,
  title,
  text,
  code,
  actionLabel,
  onAction,
}: {
  tone: Tone;
  title: string;
  text: ReactNode;
  code?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const t = TONE[tone];
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className="animate-fade-up flex flex-col items-center gap-4 py-6 text-center"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={`h-10 w-10 [image-rendering:pixelated] ${t.color} ${t.glow}`}
      >
        <g fill="currentColor">
          {ICON_CELLS[tone].map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
          ))}
        </g>
      </svg>
      <h3
        className={`m-0 font-pixel text-[14px] leading-[1.5] font-normal tracking-[0.12em] ${t.color} ${t.text}`}
      >
        {title}
      </h3>
      <p className="m-0 max-w-[40ch] leading-[1.7] text-home-dim">{text}</p>
      {code && (
        <p className="m-0 font-pixel text-[8px] tracking-[0.16em] text-home-faint">
          Código: {code}
        </p>
      )}
      <button type="button" onClick={onAction} className={`mt-2 ${GHOST_BTN}`}>
        {actionLabel}
      </button>
    </div>
  );
}
