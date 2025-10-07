// config/nodemailer.ts

import nodemailer from 'nodemailer';

export const sender = {
  email: process.env.GMAIL_USER as string,
  name: "SaveUrURL.ME",
};

export const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Use App Password, not regular Gmail password
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});