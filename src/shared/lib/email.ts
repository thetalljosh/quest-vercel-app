import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) {
    return;
  }

  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
