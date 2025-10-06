import express from "express";
import {
  createManualQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} from "../controllers/manualQuotationController.js";

const router = express.Router();

// Manual Quotation routes
router.post("/manual", createManualQuotation);
router.get("/", getQuotations);
router.get("/:id", getQuotationById);
router.put("/:id", updateQuotation);
router.delete("/:id", deleteQuotation);

export default router;
