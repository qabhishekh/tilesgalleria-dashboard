import express from "express";
import { createPrePurchase, listPrePurchases, deletePrePurchase, updatePrePurchase } from "../controllers/prePurchaseController.js";

const router = express.Router();

router.get("/", listPrePurchases);
router.post("/", createPrePurchase);
router.delete("/:id", deletePrePurchase);
router.put("/:id", updatePrePurchase);

export default router;
