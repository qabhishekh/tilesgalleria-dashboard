import mongoose from "mongoose";
import ManualQuotation from "../models/manualQuotation.js";
import Product from "../models/Product.js";

// ============================================================
// 📦 CREATE MANUAL QUOTATION — auto-deduct product quantity
// ============================================================
export const createManualQuotation = async (req, res) => {
  try {
    const {
      quoNo,
      customer,
      items,
      subTotal,
      discount,
      amountAfterDiscount,
      gstAmount,
      shippingCharge,
      grandTotal,
      notes,
    } = req.body;

    // 🧮 Deduct stock for each item
    for (const item of items || []) {
      if (item.product && item.qty > 0) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        const newQty = Math.max(0, (product.quantity || 0) - item.qty);
        product.quantity = newQty;
        await product.save();
      }
    }

    // 🧾 Create manual quotation record
    const quotation = await ManualQuotation.create({
      quoNo,
      customer,
      items,
      subTotal,
      discount,
      amountAfterDiscount,
      gstAmount,
      shippingCharge,
      grandTotal,
      notes,
      status: "draft",
    });

    res.status(201).json({
      success: true,
      message: "✅ Manual quotation created successfully & stock updated",
      quotation,
    });
  } catch (err) {
    console.error("❌ Manual quotation save failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// 📋 GET ALL MANUAL QUOTATIONS
// ============================================================
export const getQuotations = async (req, res) => {
  try {
    const quotations = await ManualQuotation.find()
      .populate("items.product", "name size texture productType image price")
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};

// ============================================================
// 🔍 GET SINGLE MANUAL QUOTATION BY ID
// ============================================================
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await ManualQuotation.findById(req.params.id)
      .populate("items.product", "name size texture productType image price");

    if (!quotation) {
      return res.status(404).json({ message: "Manual quotation not found" });
    }

    res.json(quotation);
  } catch (err) {
    console.error("❌ Fetch by ID error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// ✏️ UPDATE MANUAL QUOTATION
// ============================================================
export const updateQuotation = async (req, res) => {
  try {
    const quotation = await ManualQuotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quotation)
      return res.status(404).json({ error: "Quotation not found" });

    res.json({
      success: true,
      message: "✅ Manual quotation updated successfully",
      quotation,
    });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: "Failed to update quotation" });
  }
};

// ============================================================
// 🗑️ DELETE MANUAL QUOTATION — auto-restore product quantity
// ============================================================
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await ManualQuotation.findById(req.params.id);
    if (!quotation)
      return res.status(404).json({ error: "Quotation not found" });

    // 🔁 Restore product stock
    for (const item of quotation.items || []) {
      if (item.product && item.qty > 0) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity = (product.quantity || 0) + item.qty;
          await product.save();
        }
      }
    }

    await quotation.deleteOne();

    res.json({
      success: true,
      message: "🗑️ Manual quotation deleted & stock restored",
    });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete quotation" });
  }
};
