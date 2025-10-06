import express from "express";
import { auth } from "../middleware/auth.js";
import { profile, updateUser } from "../controllers/authController.js";

const router = express.Router();

// Get current user
router.get("/me", auth(), profile);

// Update current user
router.put("/update", auth(), updateUser);

export default router;
