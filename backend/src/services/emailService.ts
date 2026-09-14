// Sends the verification-code email via Resend's REST API — no SDK
// dependency needed for a single endpoint. Falls back to logging the code
// server-side when RESEND_API_KEY isn't set, the same pattern the rest of
// this backend already uses for optional integrations (Gemini, OneSignal):
// the feature stays fully testable locally/in CI without a real key, and
// the console line is what a dev reads during that window.
const RESEND_API_URL = 'https://api.resend.com/emails';

// Resend's sandbox sender domain works without verifying a custom domain —
// fine for a hackathon-stage app; swap for a verified "from" address once
// one exists.
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'Rehearse <onboarding@resend.dev>';

export async function sendVerificationEmail(toEmail: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[emailService] RESEND_API_KEY not set — verification code for ${toEmail}: ${code}`);
    return;
  }

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="margin: 0 0 8px; color: #1a1a2e;">Confirm your email</h2>
      <p style="color: #555; font-size: 14px; line-height: 20px; margin: 0 0 24px;">
        Enter this code in Rehearse to verify ${toEmail}. It expires in 10 minutes.
      </p>
      <div style="background: #f4f4fb; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5B5FEF;">
        ${code}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [toEmail],
      subject: `${code} is your Rehearse verification code`,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
