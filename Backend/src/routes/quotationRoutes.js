import express from "express";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
} from "../controllers/quotationController.js";

const router = express.Router();

router.post("/", createQuotation);
router.get("/", getQuotations);
router.get("/:id", getQuotationById);
router.put("/:id", updateQuotation);
router.delete("/:id", deleteQuotation);

// 🔹 PATCH for status only
router.patch("/:id/status", updateQuotationStatus);

export default router;
