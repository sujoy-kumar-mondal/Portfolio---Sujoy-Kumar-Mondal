import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"SKM Portfolio Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Admin Login OTP',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; background: #111; color: #fff; border-radius: 12px; padding: 32px; border: 1px solid #333;">
        <h2 style="color: #00ffe1; margin-bottom: 8px;">Admin Login OTP</h2>
        <p style="color: #aaa;">Your one-time password for SKM Portfolio Admin:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #fff; background: #1f2667; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #aaa;">This OTP expires in <strong style="color:#fff">10 minutes</strong>.</p>
        <p style="color: #555; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendContactEmail(
  name: string,
  email: string,
  phone: string,
  message: string,
  recipient: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: recipient,
    replyTo: email,
    subject: `New Message from ${name} — SKM Portfolio`,
    html: `
      <div style="font-family: sans-serif; max-width: 540px; margin: auto; background: #111; color: #fff; border-radius: 12px; padding: 32px; border: 1px solid #333;">
        <h2 style="color: #ff6b6b; margin-bottom: 4px;">New Contact Message</h2>
        <p style="color: #555; margin-top: 0;">via SKM Portfolio</p>
        <hr style="border-color: #333; margin: 16px 0;" />
        <p><strong style="color: #aaa;">Name:</strong> ${name}</p>
        <p><strong style="color: #aaa;">Email:</strong> ${email}</p>
        <p><strong style="color: #aaa;">Phone:</strong> ${phone}</p>
        <p><strong style="color: #aaa;">Message:</strong></p>
        <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; color: #ddd; line-height: 1.6;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `,
  });
}

export default transporter;
