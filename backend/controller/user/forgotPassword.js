const generateOtp = require('../../helpers/otpGenerator');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Function to generate OTP
const bcrypt = require('bcryptjs');
const userModel = require('../../models/userModel');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_APP_PASSWORD,
    },
});

let otpStore = {}; // Temporary store for OTP and email

// Function to send OTP to the user's email
const sendingOtp =async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log("otp:", otp)
    otpStore[email] = otp; // Store OTP temporarily (consider adding expiration logic)

    const mailOptions = {
        from: `Ram Shop <${process.env.NODEMAILER_USERNAME}>`,
        to: email,
        subject: 'Your OTP Code for Password Reset',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e88e5; font-size: 24px; margin: 0;">Ram Shop</h2>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">Your one time password</p>
        </div>
        <div style="padding: 15px; text-align: center;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 10px;">Your OTP Code for Password Reset</h3>
          <p style="font-size: 16px; color: #555;">Use the code below to reset your password:</p>
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


    // Send the email with the OTP
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send OTP', error });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
    });
};

// Function to verify the OTP provided by the user
const verifyingOtp = (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email]; // OTP is verified, remove it from the store
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};

// Function to reset the user's password
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({
            message: err.message || 'An error occurred while resetting the password',
            error: true,
            success: false,
        });
    }
};

// Export the functions to use in routes
module.exports = {
    sendingOtp,
    verifyingOtp,
    resetPassword,
};
