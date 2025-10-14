const nodemailer = require('nodemailer');
require('dotenv').config();

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, verificationToken } = req.body;

  // Validate request
  if (!email || !verificationToken) {
    return res.status(400).json({ message: 'Email and verificationToken are required' });
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

  const verificationUrl = `https://handoff-backend.onrender.com/verify/${verificationToken}`;

  const mailOptions = {
    from: `"HandOff Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your HandOff account',
    html: `
      <p>Hello,</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Thank you,<br>HandOff Team</p>
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