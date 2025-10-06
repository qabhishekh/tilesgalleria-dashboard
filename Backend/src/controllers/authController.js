import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

function sign(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

// 📌 Register
export const register = asyncHandler(async (req, res) => {
  const { name, email, username, password, role = "user" } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, username, role, passwordHash });

  res.json({
    token: sign(user),
    user: { id: user._id, name: user.name, role: user.role }
  });
});

// 📌 Login
export const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
  });

  if (!user) return res.status(401).json({ message: "User not found" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    token: sign(user),
    user: { id: user._id, name: user.name, role: user.role }
  });
});

// 📌 Profile
export const profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// 📌 Update user (self)
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Name combine karke save karo
  if (firstName || lastName) {
    user.name = `${firstName || ""} ${lastName || ""}`.trim();
  }

  if (email) user.email = email;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);

  await user.save();

  res.json({
    message: "✅ Account updated successfully",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// 📌 Admin update any user
export const adminUpdateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, username, role } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (email) user.email = email;
  if (username) user.username = username;
  if (role) user.role = role;

  await user.save();

  res.json({
    message: "✅ User updated successfully (admin)",
    user: { id: user._id, name: user.name, role: user.role }
  });
});
