import Expense from "../models/Expense.js";
import asyncHandler from "express-async-handler";

// 📌 List all expenses
export const list = asyncHandler(async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 });
  res.json(expenses);
});

// 📌 Get one expense
export const getOne = asyncHandler(async (req, res) => {
  const item = await Expense.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

// 📌 Create expense
export const create = asyncHandler(async (req, res) => {
  const { reference, amount, expenseBy, paymentMode, paymentStatus, description } = req.body;

  if (!reference || !amount) {
    return res.status(400).json({ message: "Reference and Amount are required" });
  }

  const expense = await Expense.create({
    reference,
    amount,
    expenseBy,
    paymentMode,
    paymentStatus,
    description,
    attachment: req.file ? req.file.path : null,
  });

  res.status(201).json(expense);
});

// 📌 Update expense
export const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.attachment = req.file.filename;

  const expense = await Expense.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!expense) return res.status(404).json({ message: "Not found" });
  res.json(expense);
});

// 📌 Delete expense
export const remove = asyncHandler(async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
