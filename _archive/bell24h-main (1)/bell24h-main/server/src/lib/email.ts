import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      ...options,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Email templates
export const emailTemplates = {
  verification: (name: string, verificationLink: string) => ({
    subject: 'Verify your email address',
    text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verificationLink}\n\nBest regards,\nThe Bell24H Team`,
    html: `
      <h1>Welcome to Bell24H!</h1>
      <p>Hi ${name},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verificationLink}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>Best regards,<br>The Bell24H Team</p>
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset your password',
    text: `Hi ${name},\n\nClick this link to reset your password: ${resetLink}\n\nBest regards,\nThe Bell24H Team`,
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetLink}</p>
      <p>Best regards,<br>The Bell24H Team</p>
    `,
  }),

  welcome: (name: string) => ({
    subject: 'Welcome to Bell24H!',
    text: `Hi ${name},\n\nWelcome to Bell24H! We're excited to have you on board.\n\nBest regards,\nThe Bell24H Team`,
    html: `
      <h1>Welcome to Bell24H!</h1>
      <p>Hi ${name},</p>
      <p>Welcome to Bell24H! We're excited to have you on board.</p>
      <p>Here are some things you can do to get started:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Browse available RFQs</li>
        <li>Connect with other businesses</li>
      </ul>
      <p>Best regards,<br>The Bell24H Team</p>
    `,
  }),

  notification: (name: string, message: string) => ({
    subject: 'New notification from Bell24H',
    text: `Hi ${name},\n\n${message}\n\nBest regards,\nThe Bell24H Team`,
    html: `
      <h1>New Notification</h1>
      <p>Hi ${name},</p>
      <p>${message}</p>
      <p>Best regards,<br>The Bell24H Team</p>
    `,
  }),
}; 