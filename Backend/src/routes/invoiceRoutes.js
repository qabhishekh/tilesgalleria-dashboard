import express from "express";
import {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/", createInvoice);    
router.get("/", listInvoices);       
router.get("/:id", getInvoice);      
router.put("/:id", updateInvoice);   
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice); 

export default router;
