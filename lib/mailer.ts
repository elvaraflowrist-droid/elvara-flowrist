import nodemailer from "nodemailer";

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const DEFAULT_RECEIVER = "elvaraflowrist@gmail.com";

function getSmtpConfig() {
  const user = process.env.SMTP_USER?.trim() || DEFAULT_RECEIVER;
  const pass = process.env.SMTP_PASS?.trim();
  const to = process.env.CONTACT_RECEIVER_EMAIL?.trim() || DEFAULT_RECEIVER;
  return { user, pass, to };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends a contact inquiry email via Gmail SMTP when SMTP_PASS is configured.
 * Returns true if the email was delivered, false if SMTP is not configured.
 */
export async function sendContactInquiryEmail(
  payload: ContactEmailPayload
): Promise<boolean> {
  const { user, pass, to } = getSmtpConfig();

  if (!pass) {
    console.warn(
      "[Mailer] SMTP_PASS is not set in environment; skipping email delivery (inquiry saved to database)."
    );
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: `"Elvara Florist Website" <${user}>`,
    to,
    replyTo: `"${payload.name}" <${payload.email}>`,
    subject: `[Elvara Inquiry] ${payload.subject} — ${payload.name}`,
    text: [
      `New Contact Inquiry from Elvara Florist`,
      ``,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      ``,
      `Message:`,
      payload.message,
    ].join("\n"),
    html: `
      <div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="margin: 0 0 12px; font-size: 20px;">New Atelier Inquiry</h2>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p style="margin: 0 0 16px; font-size: 14px;"><strong>Topic:</strong> ${safeSubject}</p>
        <div style="padding: 16px; background: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4; font-size: 14px; line-height: 1.6;">
          ${safeMessage}
        </div>
        <p style="margin: 16px 0 0; font-size: 12px; color: #78716c;">
          Reply directly to this email to respond to ${safeName}.
        </p>
      </div>
    `,
  });

  return true;
}

