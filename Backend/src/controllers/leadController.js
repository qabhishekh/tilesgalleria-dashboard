import Lead from "../models/Lead.js";
import asyncHandler from "express-async-handler";

// 📌 List all leads
export const list = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// 📌 Get single lead
export const getOne = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Not found" });
  res.json(lead);
});

// 📌 Create new lead
export const create = asyncHandler(async (req, res) => {
  const { name, email, phone, altPhone, address, status, notes } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  const lead = await Lead.create({
    name,
    email,
    phone,
    altPhone,
    address,
    status,
    notes,
    attachment: req.file ? req.file.filename : null,
  });

  res.status(201).json(lead);
});

// Update lead
export const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.attachment = req.file.filename;

  const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true, // ✅ Validation apply
  });

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json(lead);
});


// 📌 Delete lead
export const remove = asyncHandler(async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
