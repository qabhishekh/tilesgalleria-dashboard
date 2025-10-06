import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import csvParser from "csv-parser";
import fs from "fs";
import { Parser } from "json2csv";


// 📌 Get all products
export const list = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// 📌 Get single product
export const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// 📌 Create new product
export const create = asyncHandler(async (req, res) => {
  console.log("📩 Incoming body:", req.body);
  console.log("📩 Incoming file:", req.file);

  let { name, type, texture, size, price, qty, boxes, taxRate } = req.body;

  price = parseFloat(price);
  qty = parseInt(qty) || 0;
  boxes = parseInt(boxes) || 0;
  taxRate = parseFloat(taxRate) || 0;

  if (!name || isNaN(price)) {
    return res.status(400).json({ message: "❌ Name and Price are required" });
  }

  const product = await Product.create({
    name,
    productType: type || "General",
    texture: texture || "",
    size: size || "",
    price,
    quantity: qty,
    boxes,
    taxRate,
    image: req.file ? req.file.filename : null,
  });

  res.status(201).json({
    message: "✅ Product created successfully",
    product,
  });
});

// 📌 Update product
export const update = asyncHandler(async (req, res) => {
  try {
    const updateData = { ...req.body };

    // 🖼️ Update image if provided
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // 🔢 Parse numeric fields safely
    if (updateData.price !== undefined)
      updateData.price = parseFloat(updateData.price);

    if (updateData.quantity !== undefined)
      updateData.quantity = parseInt(updateData.quantity);

    if (updateData.boxes !== undefined)
      updateData.boxes = parseInt(updateData.boxes);

    if (updateData.taxRate !== undefined)
      updateData.taxRate = parseFloat(updateData.taxRate);

    console.log("Updating Product:", req.params.id, updateData);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.json({
      message: "✅ Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "❌ Update failed", error: err.message });
  }
});

// 📌 Delete product
export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "❌ Product not found" });
  }
  res.json({ message: "🗑 Product deleted successfully" });
});

// 📥 Bulk Import (CSV)
export const bulkImport = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "❌ CSV file is required" });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      try {
        console.log("📦 CSV Rows Parsed:", results.length);

        const products = results.map((r) => ({
          name: r["Product Name"]?.trim(),
          size: r["Size"] || "",
          texture: r["Texture"] || "",
          productType: r["Area of Usage"] || "General",
          quantity: parseInt(r["Quantity"]) || 0,
          price: parseFloat(r["Price"]) || 0,
          boxes: parseInt(r["Boxes"]) || 0,
          taxRate: parseFloat(r["Tax Rate"]) || 0,
          image: r["Image"] || null,
        }));

        await Product.insertMany(products);
        fs.unlinkSync(req.file.path);
        res.json({
          message: "✅ Bulk import success",
          count: products.length,
        });
      } catch (err) {
        console.error("❌ Bulk Import Error:", err);
        res.status(500).json({
          message: "❌ Bulk import failed",
          error: err.message,
        });
      }
    });
});

// 📤 Bulk Export (CSV)
export const bulkExport = asyncHandler(async (req, res) => {
  const products = await Product.find().lean();
  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products to export" });
  }

  const fields = [
    "name",
    "productType",
    "texture",
    "size",
    "quantity",
    "price",
    "boxes",
    "taxRate",
    "image",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(products);

  res.header("Content-Type", "text/csv");
  res.attachment("products_export.csv");
  return res.send(csv);
});
