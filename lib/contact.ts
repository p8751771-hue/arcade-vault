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

export type ContactError = "invalid" | "config" | "send";

/** 200 → { ok: true }; 400 → { error: "invalid" }; 500 → { error: "config" | "send" }. */
export type ContactResponse = { ok: true } | { error: ContactError };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida el body (ya parseado). Devuelve los campos recortados o `null` si no es válido. */
export function parseContactRequest(body: unknown): ContactRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, msg } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof msg !== "string") {
    return null;
  }
  const input = { name: name.trim(), email: email.trim(), msg: msg.trim() };
  if (!input.name || !input.email || !input.msg) return null;
  if (
    input.name.length > CONTACT_LIMITS.name ||
    input.email.length > CONTACT_LIMITS.email ||
    input.msg.length > CONTACT_LIMITS.msg
  ) {
    return null;
  }
  if (!EMAIL_RE.test(input.email)) return null;
  return input;
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
): Promise<{ ok: true } | { error: "config" | "send" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contacto] falta RESEND_API_KEY o CONTACT_TO_EMAIL");
    return { error: "config" };
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
      return { error: "send" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contacto] fallo al llamar a Resend:", err instanceof Error ? err.message : err);
    return { error: "send" };
  }
}
