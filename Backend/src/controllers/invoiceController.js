import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

// ============================================================
// 🧾 CREATE INVOICE → decrease product stock automatically
// ============================================================
export const createInvoice = asyncHandler(async (req, res) => {
  try {
    console.log("📩 Incoming Invoice Payload:", req.body);

    const items = req.body.items || [];

    // 🔹 Deduct stock for each product
    for (const item of items) {
      if (item.product && item.qty > 0) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        const newQty = Math.max(0, (product.quantity || 0) - item.qty);
        product.quantity = newQty;
        await product.save();
      }
    }

    // 🔹 Create invoice
    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      message: "✅ Invoice created successfully & stock updated",
      invoice,
    });
  } catch (err) {
    console.error("❌ Invoice save failed:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// 📋 GET ALL INVOICES
// ============================================================
export const listInvoices = asyncHandler(async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer", "name email phone category")
      .populate("items.product", "name productType image price")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    console.error("❌ Failed to fetch invoices:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// 🔍 GET SINGLE INVOICE BY ID
// ============================================================
export const getInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer", "name email phone category")
      .populate("items.product", "name productType price image");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("❌ Failed to get invoice:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// ✏️ UPDATE INVOICE
// ============================================================
export const updateInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name email phone category")
      .populate("items.product", "name productType price image");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      success: true,
      message: "✅ Invoice updated successfully",
      invoice,
    });
  } catch (err) {
    console.error("❌ Failed to update invoice:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// 🗑️ DELETE INVOICE → restore product stock automatically
// ============================================================
export const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 🔁 Restore product quantities
    for (const item of invoice.items || []) {
      if (item.product && item.qty > 0) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity = (product.quantity || 0) + item.qty;
          await product.save();
        }
      }
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: "🗑️ Invoice deleted & stock restored successfully",
    });
  } catch (err) {
    console.error("❌ Invoice delete failed:", err.message);
    res.status(500).json({ message: err.message });
  }
});
