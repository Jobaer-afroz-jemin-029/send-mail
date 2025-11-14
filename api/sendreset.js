const nodemailer = require('nodemailer');
require('dotenv').config();

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, resetToken } = req.body;

  // Validate request
  if (!email || !resetToken) {
    return res.status(400).json({ message: 'Email and resetToken are required' });
  }

  // Validate API key (optional, for security)
  const apiKey = req.headers['x-api-key'];
  if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Gmail Transporter Setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  const resetUrl = `https://handoff-backend.onrender.com/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"HandOff Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your HandOff password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Use the reset code below or click the link:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Reset Code:</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #1e40af; letter-spacing: 2px; font-family: monospace;">${resetToken}</p>
        </div>
        
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all; font-size: 12px; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        
        <p style="color: #ef4444; font-size: 14px; margin-top: 20px;"><strong>⚠️ This code will expire in 1 hour.</strong></p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="margin-top: 30px;">Thank you,<br>HandOff Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Reset password email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

