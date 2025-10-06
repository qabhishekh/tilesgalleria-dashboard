import mongoose from "mongoose";
import Quotation from "../models/Quotation.js";
import asyncHandler from "express-async-handler";

// ✅ Create new quotation (auto decreases product stock)
export const createQuotation = asyncHandler(async (req, res) => {
  try {
    const items = req.body.items || [];

    // 🔹 Loop through each item and reduce product quantity
    for (const item of items) {
      if (item.product && item.qty > 0) {
        const product = await mongoose.model("Product").findById(item.product);
        if (!product) continue;

        // Prevent negative stock
        const newQty = Math.max(0, (product.quantity || 0) - item.qty);
        product.quantity = newQty;

        // Optionally recalc boxes if needed:
        // product.boxes = Math.ceil(newQty / 2.1); // (optional)
        await product.save();
      }
    }

    // 🔹 Create quotation
    const quotation = await Quotation.create(req.body);

    res.status(201).json({
      message: "✅ Quotation created successfully & stock updated",
      quotation,
    });
  } catch (err) {
    console.error("❌ Save quotation failed", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all quotations
export const getQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find()
    .populate("customer")
    .populate("items.product");
  res.json(quotations);
});

// ✅ Get single quotation by ID
export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate("customer")
    .populate("items.product");

  if (!quotation) return res.status(404).json({ error: "Quotation not found" });
  res.json(quotation);
});

// ✅ Update quotation
export const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json(quotation);
});

// ✅ Delete quotation (auto restores stock)
export const deleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) return res.status(404).json({ error: "Quotation not found" });

  // 🔹 Restore product quantities when quotation is deleted
  for (const item of quotation.items || []) {
    if (item.product && item.qty > 0) {
      const product = await mongoose.model("Product").findById(item.product);
      if (product) {
        product.quantity = (product.quantity || 0) + item.qty;
        await product.save();
      }
    }
  }

  await quotation.deleteOne();
  res.json({ message: "🗑 Quotation deleted and product stock restored" });
});

// ✅ Update only quotation status
export const updateQuotationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const quotation = await Quotation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!quotation) return res.status(404).json({ error: "Quotation not found" });

  res.json(quotation);
});
