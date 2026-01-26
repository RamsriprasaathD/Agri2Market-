import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  NEXT_PUBLIC_APP_URL,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
  throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in the environment variables.');
}

if (!NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not defined. Please add it to your environment configuration.');
}

export const mailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const smtpFromAddress = String(SMTP_FROM);

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendMail({ to, subject, html }: SendMailOptions) {
  await mailTransporter.sendMail({
    from: smtpFromAddress,
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: 'Reset your Oilseed Marketplace password',
    html: `
      <div style="font-family: Arial, sans-serif; color: var(--oilseed-char);">
        <h2 style="color:var(--oilseed-forest);">Oilseed Marketplace Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to set a new password. This link is valid for the next 60 minutes.</p>
        <p style="margin: 32px 0;">
          <a href="${resetUrl}" style="background:var(--oilseed-forest);color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a>
        </p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="margin-top:24px;color:var(--oilseed-stem);">Thank you,<br/>Oilseed Marketplace Support</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await sendMail({
    to: email,
    subject: 'Verify your Agri2Market+ email address',
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2 style="color:#0ea5e9;">Welcome to Agri2Market+</h2>
        <p>Hello,</p>
        <p>We are excited to have you join Agri2Market+. Please verify your email address so we can activate your account.</p>
        <p style="margin: 32px 0;">
          <a href="${verifyUrl}" style="background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Verify Email</a>
        </p>
        <p style="margin-top:24px;color:#475569;">We are committed to making oilseed by-product trading transparent and data-driven.</p>
      </div>
    `,
  });
}

export async function sendNewProductAlert(farmerName: string, productTitle: string) {
  await sendMail({
    to: smtpFromAddress,
    subject: `New product listed by ${farmerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2 style="color:#16a34a;">New Listing Alert</h2>
        <p>${farmerName} just published <strong>${productTitle}</strong> on Agri2Market+.</p>
        <p>Log in as admin to review the listing and ensure quality compliance.</p>
      </div>
    `,
  });
}
