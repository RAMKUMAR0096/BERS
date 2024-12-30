const { otpStorage } = require('./emailVerification');  // Import otpStorage from emailVerification

// Function to verify OTP
const verifyOtp = (req, res) => {
  const { email: userEmail, otp } = req.body;

  // Check if OTP exists for the given email
  if (!otpStorage[userEmail]) {
    return res.status(400).send({ message: 'OTP not found or expired' });
  }

  const { otp: storedOtp, expiresAt } = otpStorage[userEmail];

  // Check if the OTP has expired
  if (Date.now() > expiresAt) {
    delete otpStorage[userEmail];  // Remove expired OTP
    return res.status(400).send({ message: 'OTP has expired' });
  }

  // Check if the provided OTP matches the stored OTP
  if (otp !== storedOtp) {
    return res.status(400).send({ message: 'Invalid OTP' });
  }

  // OTP is valid, proceed with your logic (e.g., account verification)
  delete otpStorage[userEmail];  // Remove OTP after successful verification
  res.status(200).send({ message: 'OTP verified successfully' });
};

module.exports = verifyOtp;
