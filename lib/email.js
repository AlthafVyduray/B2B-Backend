import nodemailer from "nodemailer";
//toto
export async function sendResetEmail(toEmail, resetLink) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,           // smtp.example.com
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset. Click the link below to reset your password (valid 1 hour):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });

  return info;
}
