import { Resend } from "resend";

const DEFAULT_FROM = "no-reply@example.com";
const APP_URL_FALLBACK = "http://localhost:3000";

const vercelUrl = process.env.VERCEL_URL
  ? process.env.VERCEL_URL.startsWith("http")
    ? process.env.VERCEL_URL
    : `https://${process.env.VERCEL_URL}`
  : undefined;

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  vercelUrl ??
  APP_URL_FALLBACK;

const emailFrom = process.env.EMAIL_FROM ?? DEFAULT_FROM;
const resendApiKey = process.env.RESEND_API_KEY;

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${appBaseUrl?.replace(/\/$/, "") || APP_URL_FALLBACK}/verify-email?token=${token}`;

  if (!resendApiKey) {
    console.info(
      `[Email Verification] RESEND_API_KEY fehlt. Verifizierungslink für ${email}: ${verifyUrl}`
    );
    return;
  }

  const resend = new Resend(resendApiKey);

  const result = await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: "Bitte bestätige deine E-Mail-Adresse",
    html: getEmailHtml(verifyUrl),
  });

  if (result.error) {
    console.error(
      `[Email Verification] Versand fehlgeschlagen (${email}): ${result.error.message}`
    );
    throw new Error("Verifizierungs-E-Mail konnte nicht gesendet werden.");
  }
}

function getEmailHtml(verifyUrl: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family: Arial, sans-serif;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" width="600" role="presentation" style="max-width:600px;width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <h1 style="font-size:20px;margin-bottom:16px;color:#0f172a;">E-Mail-Adresse bestätigen</h1>
                <p style="font-size:14px;line-height:1.6;color:#1e293b;margin-bottom:24px;">
                  Danke für deine Registrierung. Bitte bestätige deine E-Mail-Adresse, um dein Konto freizuschalten.
                </p>
                <p style="text-align:center;margin-bottom:24px;">
                  <a href="${verifyUrl}" style="background-color:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
                    E-Mail bestätigen
                  </a>
                </p>
                <p style="font-size:12px;line-height:1.6;color:#475569;">
                  Falls der Button nicht funktioniert, kopiere folgenden Link in deinen Browser:<br />
                  <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
