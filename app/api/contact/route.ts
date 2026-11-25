import {
  CONTACT_STATUS,
  parseContactRequest,
  sendContactEmail,
  type ContactError,
  type ContactResponse,
} from "@/lib/contact";

// POST /api/contact (spec 03): body JSON { name, email, msg }.
// 200 { ok: true } · 400 { error: "bad_request" | "empty" | "email" | "too_long" }
// · 429 { error: "rate_limited" } · 500 { error: "unavailable" }.
// Los POST no se cachean; no se exporta `runtime` (cacheComponents necesita Node.js).

function fail(error: ContactError) {
  return Response.json({ error } satisfies ContactResponse, { status: CONTACT_STATUS[error] });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("bad_request");
  }

  const parsed = parseContactRequest(body);
  if (!parsed.ok) return fail(parsed.error);

  const result = await sendContactEmail(parsed.input);
  if ("error" in result) return fail(result.error);
  return Response.json({ ok: true } satisfies ContactResponse);
}
