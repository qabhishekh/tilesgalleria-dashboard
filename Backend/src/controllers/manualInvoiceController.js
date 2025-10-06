import mongoose from "mongoose";
import ManualInvoice from "../models/ManualInvoice.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

// ============================================================
// 🧾 CREATE MANUAL INVOICE → decrease product stock automatically
// ============================================================
export const createManualInvoice = asyncHandler(async (req, res) => {
  try {
    // 🔹 Prepare items with product names & categories
    const itemsWithNames = await Promise.all(
      req.body.items.map(async (item) => {
        if (item.product) {
          const prod = await Product.findById(item.product);
          if (prod) {
            // 🔹 Decrease product stock
            const newQty = Math.max(0, (prod.quantity || 0) - item.qty);
            prod.quantity = newQty;
            await prod.save();

            return {
              ...item,
              productName: prod.name || "Unnamed Product",
              category:
                prod.category?.name ||
                (typeof prod.category === "string" ? prod.category : item.category),
            };
          }
        }
        return item;
      })
    );

    // 🔹 Create manual invoice
    const invoice = await ManualInvoice.create({
      ...req.body,
      items: itemsWithNames,
    });

    // 🔹 Populate product info
    const populated = await invoice.populate(
      "items.product",
      "name price image productType category"
    );

    res.status(201).json({
      success: true,
      message: "✅ Manual invoice created & stock updated successfully",
      invoice: populated,
    });
  } catch (err) {
    console.error("❌ Manual invoice creation failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// 📋 LIST ALL MANUAL INVOICES
// ============================================================
export const listManualInvoices = asyncHandler(async (req, res) => {
  const invoices = await ManualInvoice.find()
    .populate("items.product", "name price image productType category")
    .sort({ createdAt: -1 });

  res.json(invoices);
});

// ============================================================
// 🔍 GET SINGLE MANUAL INVOICE
// ============================================================
export const getManualInvoice = asyncHandler(async (req, res) => {
  const invoice = await ManualInvoice.findById(req.params.id).populate(
    "items.product",
    "name price image productType category"
  );

  if (!invoice) return res.status(404).json({ message: "Not found" });
  res.json(invoice);
});

// ============================================================
// ✏️ UPDATE MANUAL INVOICE
// ============================================================
export const updateManualInvoice = asyncHandler(async (req, res) => {
  const invoice = await ManualInvoice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("items.product", "name price image productType category");

  if (!invoice) {
    return res.status(404).json({ message: "Manual invoice not found" });
  }

  res.json({
    success: true,
    message: "✅ Manual invoice updated successfully",
    invoice,
  });
});

// ============================================================
// 🗑️ DELETE MANUAL INVOICE → restore product stock automatically
// ============================================================
export const deleteManualInvoice = asyncHandler(async (req, res) => {
  const invoice = await ManualInvoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: "Manual invoice not found" });
  }

  // 🔁 Restore product stock
  for (const item of invoice.items || []) {
    if (item.product && item.qty > 0) {
      const prod = await Product.findById(item.product);
      if (prod) {
        prod.quantity = (prod.quantity || 0) + item.qty;
        await prod.save();
      }
    }
  }

  await invoice.deleteOne();

  res.json({
    success: true,
    message: "🗑️ Manual invoice deleted & stock restored successfully",
  });
});
