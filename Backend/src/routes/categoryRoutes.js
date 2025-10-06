import express from "express";
import upload from "../middleware/upload.js";
import { createCategory, getCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.get("/", getCategories);

export default router;
