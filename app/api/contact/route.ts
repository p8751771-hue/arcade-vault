import { parseContactRequest, sendContactEmail, type ContactResponse } from "@/lib/contact";

// POST /api/contact (spec 03): body JSON { name, email, msg }.
// 200 { ok: true } · 400 { error: "invalid" } · 500 { error: "config" | "send" }.
// Los POST no se cachean; no se exporta `runtime` (cacheComponents necesita Node.js).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" } satisfies ContactResponse, { status: 400 });
  }

  const input = parseContactRequest(body);
  if (!input) {
    return Response.json({ error: "invalid" } satisfies ContactResponse, { status: 400 });
  }

  const result = await sendContactEmail(input);
  if ("error" in result) {
    return Response.json(result satisfies ContactResponse, { status: 500 });
  }
  return Response.json({ ok: true } satisfies ContactResponse);
}
