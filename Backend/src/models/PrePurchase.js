import mongoose from "mongoose";

const prePurchaseSchema = new mongoose.Schema({
  vendor_name: { type: String, required: true },
  amount: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model("PrePurchase", prePurchaseSchema);
