import express from "express";
import { register, login, profile, updateUser, adminUpdateUser } from "../controllers/authController.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/profile", auth(), profile);

// User can update own profile
router.put("/update", auth(), updateUser);

// Example Admin route
router.get("/admin-data", auth(), adminOnly, (req, res) => {
  res.json({ secret: "This is admin-only data 🔑" });
});

export default router;
