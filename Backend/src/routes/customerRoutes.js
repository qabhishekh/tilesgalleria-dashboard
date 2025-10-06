import express from "express";
import {
  list,
  getOne,
  create,
  update,
  remove,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Address endpoints
router.post("/:customerId/addresses", addAddress);
router.put("/:customerId/addresses/:addressId", updateAddress);
router.delete("/:customerId/addresses/:addressId", deleteAddress);

export default router;
