import asyncHandler from "express-async-handler";
import PurchaseOrder from "../models/Purchase.js";
import Product from "../models/Product.js";

// ===========================================================
// 🔹 Helper: Generate Next Purchase Number
// ===========================================================
async function generatePurchaseNo() {
  const lastOrder = await PurchaseOrder.findOne()
    .sort({ createdAt: -1 })
    .select("purchaseNo");

  if (!lastOrder || !lastOrder.purchaseNo) return "PO-0001";

  const lastNo = parseInt(lastOrder.purchaseNo.replace("PO-", "")) || 0;
  const nextNo = (lastNo + 1).toString().padStart(4, "0");
  return `PO-${nextNo}`;
}

// ===========================================================
// 📋 List All Purchase Orders
// ===========================================================
export const list = asyncHandler(async (req, res) => {
  const orders = await PurchaseOrder.find()
    .populate("vendor")
    .populate("items.product")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// ===========================================================
// 🧾 Create Purchase Order → Stock Decrease (❌ minus stock)
// ===========================================================
export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) body.attachFile = req.file.filename;

  if (body.items && typeof body.items === "string") {
    try {
      body.items = JSON.parse(body.items);
    } catch {
      return res.status(400).json({ message: "Invalid items format" });
    }
  }

  const numericFields = [
    "subTotal",
    "discount",
    "amountAfterDiscount",
    "gst",
    "shippingCharge",
    "grandTotal",
    "advance",
    "balance",
  ];
  numericFields.forEach((f) => {
    if (body[f] !== undefined) body[f] = Number(body[f]) || 0;
  });

  if (!body.purchaseNo) body.purchaseNo = await generatePurchaseNo();

  // ✅ Create record
  const order = await PurchaseOrder.create(body);

  // 🔹 Minus stock from Product collection
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      if (item.product && item.qty) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: -item.qty, boxes: -(item.boxes || 0) } }, // ❌ MINUS stock
          { new: true }
        );
      }
    }
  }

  res.status(201).json({
    success: true,
    message: "✅ Purchase order created & stock deducted",
    order,
  });
});

// ===========================================================
// 🔍 Get One Purchase Order
// ===========================================================
export const getOne = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("vendor")
    .populate("items.product");

  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});

// ===========================================================
// ✏️ Update Purchase Order → rollback + minus again
// ===========================================================
export const update = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) body.attachFile = req.file.filename;

  if (body.items && typeof body.items === "string") {
    try {
      body.items = JSON.parse(body.items);
    } catch {
      return res.status(400).json({ message: "Invalid items format" });
    }
  }

  const numericFields = [
    "subTotal",
    "discount",
    "amountAfterDiscount",
    "gst",
    "shippingCharge",
    "grandTotal",
    "advance",
    "balance",
  ];
  numericFields.forEach((f) => {
    if (body[f] !== undefined) body[f] = Number(body[f]) || 0;
  });

  // 1️⃣ Rollback old stock (add back previous deducted qty)
  const oldOrder = await PurchaseOrder.findById(req.params.id);
  if (oldOrder && oldOrder.items.length > 0) {
    for (const item of oldOrder.items) {
      if (item.product && item.qty) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.qty, boxes: item.boxes || 0 } }, // ✅ add back old stock
          { new: true }
        );
      }
    }
  }

  // 2️⃣ Update purchase record
  const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  // 3️⃣ Minus new stock
  if (order && order.items.length > 0) {
    for (const item of order.items) {
      if (item.product && item.qty) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: -item.qty, boxes: -(item.boxes || 0) } }, // ❌ deduct new stock
          { new: true }
        );
      }
    }
  }

  res.json({
    success: true,
    message: "✅ Purchase order updated & stock recalculated (minus)",
    order,
  });
});

// ===========================================================
// 🗑️ Delete Purchase → add back stock (rollback deduction)
// ===========================================================
export const deletePurchase = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });

  // Rollback stock (add back what was deducted)
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      if (item.product && item.qty) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.qty, boxes: item.boxes || 0 } },
          { new: true }
        );
      }
    }
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: "🗑️ Purchase order deleted & stock restored",
  });
});
