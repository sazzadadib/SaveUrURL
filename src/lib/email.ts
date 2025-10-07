// lib/email.ts

import { transporter, sender } from "@/config/nodemailer";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "@/lib/email-templates";

interface EmailResponse {
  success: boolean;
  error?: string;
}

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  userName: string
): Promise<EmailResponse> => {
  try {
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const sendWelcomeEmail = async (
  email: string,
  userName: string
): Promise<EmailResponse> => {
  try {
    const loginUrl = `${process.env.NEXTAUTH_URL}/signin`;

    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Our Platform!",
      html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", userName).replace(
        "{loginUrl}",
        loginUrl
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetCode: string,
  userName: string
): Promise<EmailResponse> => {
  try {
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetCode}",
        resetCode
      ).replace("{userName}", userName),
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const sendResetSuccessEmail = async (
  email: string
): Promise<EmailResponse> => {
  try {
    const loginUrl = `${process.env.NEXTAUTH_URL}/signin`;

    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{loginUrl}", loginUrl),
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};