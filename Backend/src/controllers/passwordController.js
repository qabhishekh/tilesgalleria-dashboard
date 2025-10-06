import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// setup mail transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Forgot Password (testing mode)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  // ✅ Testing: just log and return
  console.log("🔗 Reset Password URL:", resetUrl);

  res.json({ message: "Password reset link generated", resetUrl });
});



// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password } = req.body;
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});
