import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Render's network has unreliable outbound IPv6 routing, which makes
    // nodemailer hang and time out trying IPv6 first. Forcing IPv4 fixes it.
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"Doctor App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
