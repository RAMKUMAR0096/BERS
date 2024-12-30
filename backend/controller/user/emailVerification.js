const generateOtp = require('../../helpers/otpGenerator');  // OTP generator helper
const nodemailer = require('nodemailer');
require('dotenv').config();  // For environment variables

// Create a nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_USERNAME,
    pass: process.env.NODEMAILER_APP_PASSWORD,
  },
});

let otpStorage = {};  // Store OTPs temporarily

// Function to send OTP
const sendOtp =async (req, res) => {
  const { name, email: userEmail, password, confirmPassword } = req.body;

  // Validate input fields
  if (!name || !userEmail || !password || !confirmPassword) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).send({ message: 'Passwords do not match' });
  }

  const otp = generateOtp();  // Generate OTP
  console.log("otp:",otp)

  // Store OTP with expiration time (10 minutes)
  otpStorage[userEmail] = {
    otp: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,  // OTP expires in 10 minutes
  };

  // Email content for OTP
  const mailOptions = {
    from: `Ram Shop <${process.env.NODEMAILER_USERNAME}>`,
    to: userEmail,
    subject: 'Your OTP Code ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e88e5; font-size: 24px; margin: 0;">Ram Shop</h2>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">Your one time password</p>
        </div>
        <div style="padding: 15px; text-align: center;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 10px;">Your OTP Code for SignUp</h3>
          <p style="font-size: 16px; color: #555;">Use the code below to Sign Up</p>
          <div style="font-size: 24px; font-weight: bold; color: #1e88e5; margin: 15px 0;">${otp}</div>
          <p style="font-size: 14px; color: #777;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          If you did not request a password reset, please ignore this email or contact our support team.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} Ram Shop. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  

  // Send OTP email
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ message: 'Failed to send OTP' });
    }
    res.status(200).send({ message: 'OTP sent to your email' });
  });
};

module.exports = { sendOtp, otpStorage };  // Export sendOtp and otpStorage
