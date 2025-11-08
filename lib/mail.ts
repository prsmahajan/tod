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
