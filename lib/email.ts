// Minimal Resend sender (no SDK — just the REST API). No-ops with a log when
// RESEND_API_KEY is unset, so local dev never needs a key.
// ponytail: fire-and-forget from actions; failures are logged, never thrown.

const BRAND = "#7c6cff";

export async function sendEmail(mail: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Crewo <onboarding@resend.dev>";
  if (!key) {
    console.log(`[email:noop] to=${mail.to} · "${mail.subject}"`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html }),
    });
    if (!res.ok) console.error("[email] send failed", res.status, await res.text());
  } catch (e) {
    console.error("[email] error", e);
  }
}

/** Wrap body in a simple dark-friendly shell with a CTA button. */
export function emailLayout(heading: string, body: string, ctaText?: string, ctaUrl?: string) {
  const button =
    ctaText && ctaUrl
      ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:16px;padding:10px 18px;background:${BRAND};color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${ctaText}</a>`
      : "";
  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#18181b">
    <div style="font-weight:700;font-size:18px;margin-bottom:12px">Crewo</div>
    <h2 style="font-size:18px;margin:0 0 8px">${heading}</h2>
    <p style="color:#52525b;line-height:1.5;margin:0">${body}</p>
    ${button}
    <p style="color:#a1a1aa;font-size:12px;margin-top:24px">Crewo — form your crew.</p>
  </div>`;
}

export function appUrl(path = "") {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
