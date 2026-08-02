import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // STUB: no newsletter provider wired up yet. Swap this for a real call to
  // your provider (Buttondown, ConvertKit, Mailchimp, ...) before launch.
  console.log("[newsletter] signup:", email);

  return NextResponse.json({ ok: true });
}
