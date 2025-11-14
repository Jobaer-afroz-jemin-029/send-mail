const nodemailer = require('nodemailer');
require('dotenv').config();

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, verificationCode } = req.body;

  // Validate request - support both old token format and new code format
  const code = verificationCode || req.body.verificationToken;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
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

  const mailOptions = {
    from: `"HandOff Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your HandOff Account Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Email Verification Code</h2>
        <p>Hello,</p>
        <p>Thank you for registering with HandOff! Enter this 6-digit code in the app to verify your email address:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid #1e40af;">
          <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: monospace;">${code}</p>
        </div>
        
        <p style="color: #ef4444; font-size: 14px; margin-top: 20px;"><strong>⚠️ This code will expire in 10 minutes.</strong></p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        <p style="margin-top: 30px;">Thank you,<br>HandOff Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
