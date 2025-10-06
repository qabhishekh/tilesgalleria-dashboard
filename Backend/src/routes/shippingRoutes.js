import express from "express";
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/shippingController.js";

const router = express.Router();

router.get("/", getAddresses);
router.get("/:id", getAddressById);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
