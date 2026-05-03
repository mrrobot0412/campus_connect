const nodemailer = require("nodemailer");

// Create transporter once and reuse
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.gmail_user,
      pass: process.env.gmail_key,
    },
  });
};

const sendOtp = async ({ email, otp }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.gmail_user,
      to: email,
      subject: "Welcome to Thapar teacher connect",
      html: `Hello, Welcome to Thapar teacher connect. your otp is ${otp}`,
    });

    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (e) {
    console.error("Error sending OTP email:", e);
    return false;
  }
};

const sendPasswordResetEmail = async ({ email, resetToken, frontendUrl }) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const info = await transporter.sendMail({
      from: process.env.gmail_user,
      to: email,
      subject: "Campus Connect - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e293b;">Campus Connect Password Reset</h2>
          <p style="color: #475569; font-size: 16px;">
            You requested a password reset for your Campus Connect account.
          </p>
          <p style="color: #475569; font-size: 16px;">
            Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">
            Campus Connect - Faculty-Student Appointment System
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent:", info.messageId);
    return true;
  } catch (e) {
    console.error("Error sending password reset email:", e);
    throw e; // Re-throw so caller knows it failed
  }
};

module.exports = { sendOtp, sendPasswordResetEmail };