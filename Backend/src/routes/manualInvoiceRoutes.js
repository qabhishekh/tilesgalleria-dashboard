import express from "express";
import {
  createManualInvoice,
  listManualInvoices,
  getManualInvoice,
  updateManualInvoice,
  deleteManualInvoice,
} from "../controllers/manualInvoiceController.js";

const router = express.Router();

// CRUD routes
router.post("/", createManualInvoice);          // Create
router.get("/", listManualInvoices);            // List all
router.get("/:id", getManualInvoice);           // Get one
router.put("/:id", updateManualInvoice);        // Update
router.delete("/:id", deleteManualInvoice);     // Delete

export default router;
