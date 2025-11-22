import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM!;

// -------------------- Verification Email --------------------
export async function sendVerificationEmail(to: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email",
    html: `
      <p>Thanks for signing up!</p>
      <p>Click the link below to verify your email (valid for 24 hours):</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  });

  // ❗ Add this check
  if (error) {
    console.error("Resend email error →", error);
    throw new Error(
      error.message || "Failed to send verification email. Check email settings."
    );
  }

  return data;
}

// -------------------- Password Reset Email --------------------
export async function sendPasswordResetEmail(to: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your password.</p>
      <p>Click the link below to set a new password (valid for 15 minutes):</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  // ❗ Same here — make it throw on failure
  if (error) {
    console.error("Resend email error →", error);
    throw new Error(
      error.message || "Failed to send password reset email. Check email settings."
    );
  }

  return data;
}

// -------------------- Magic Link Email --------------------
export async function sendMagicLinkEmail(to: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Sign in to The Open Draft",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">🔐 Sign In</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333; margin-top: 0;">
            Click the button below to sign in to your account. This link will expire in 15 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${url}"
              style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;"
            >
              Sign In →
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 0;">
            If you didn't request this link, you can safely ignore this email.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            This link expires in 15 minutes for security reasons.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error →", error);
    throw new Error(
      error.message || "Failed to send magic link email. Check email settings."
    );
  }

  return data;
}
