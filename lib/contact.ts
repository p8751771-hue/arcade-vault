import { Resend } from "resend";

// Contacto de "Acerca de" (spec 03). Solo lo importa app/api/contact/route.ts:
// lee RESEND_API_KEY, que nunca debe llegar al navegador. El cliente importa
// únicamente tipos (`import type`), que se borran al compilar.
//
// Plan gratuito de Resend sin dominio verificado: el remitente es
// onboarding@resend.dev y solo entrega al correo de la cuenta dueña de la API key.

export const CONTACT_LIMITS = { name: 60, email: 254, msg: 2000 } as const;

/** Body JSON de POST /api/contact. */
export interface ContactRequest {
  name: string;
  email: string;
  msg: string;
}

/** Un código por causa (spec 03, ampliación del paso 11). */
export type ContactError =
  | "bad_request" // 400: el body no es JSON o algún campo no es texto
  | "empty" // 400: nombre, correo o mensaje vacío tras trim
  | "email" // 400: correo sin formato válido o de más de 254 caracteres
  | "too_long" // 400: nombre > 60 o mensaje > 2000 caracteres
  | "rate_limited" // 429: Resend respondió rate_limit_exceeded
  | "unavailable"; // 500: faltan variables o Resend falló por otra causa

export const CONTACT_STATUS: Record<ContactError, number> = {
  bad_request: 400,
  empty: 400,
  email: 400,
  too_long: 400,
  rate_limited: 429,
  unavailable: 500,
};

/** 200 → { ok: true }; 400 / 429 / 500 → { error } (ver CONTACT_STATUS). */
export type ContactResponse = { ok: true } | { error: ContactError };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ParseResult = { ok: true; input: ContactRequest } | { ok: false; error: ContactError };

/** Valida el body (ya parseado). Devuelve los campos recortados o el código del error. */
export function parseContactRequest(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "bad_request" };
  const { name, email, msg } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof msg !== "string") {
    return { ok: false, error: "bad_request" };
  }
  const input = { name: name.trim(), email: email.trim(), msg: msg.trim() };
  if (!input.name || !input.email || !input.msg) return { ok: false, error: "empty" };
  if (input.email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(input.email)) {
    return { ok: false, error: "email" };
  }
  if (input.name.length > CONTACT_LIMITS.name || input.msg.length > CONTACT_LIMITS.msg) {
    return { ok: false, error: "too_long" };
  }
  return { ok: true, input };
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

function buildHtml({ name, email, msg }: ContactRequest): string {
  const body = escapeHtml(msg).replace(/\r?\n/g, "<br>");
  return [
    `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Correo:</strong> ${escapeHtml(email)}</p>`,
    `<p>${body}</p>`,
  ].join("\n");
}

/** Envía el mensaje con Resend. No registra la API key ni el contenido del mensaje. */
export async function sendContactEmail(
  input: ContactRequest,
): Promise<{ ok: true } | { error: "rate_limited" | "unavailable" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contacto] falta RESEND_API_KEY o CONTACT_TO_EMAIL");
    return { error: "unavailable" };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "onboarding@resend.dev",
      to,
      replyTo: input.email,
      subject: `[Arcade Vault] Mensaje de ${input.name}`,
      html: buildHtml(input),
    });
    if (error) {
      console.error("[contacto] Resend respondió con error:", error.name, error.message);
      return { error: error.name === "rate_limit_exceeded" ? "rate_limited" : "unavailable" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contacto] fallo al llamar a Resend:", err instanceof Error ? err.message : err);
    return { error: "unavailable" };
  }
}
