import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true },  // Reference No
    amount: { type: Number, required: true },     // Expense Amount
    expenseBy: { type: String },                  // Person Name
    paymentMode: { 
      type: String, 
      enum: ["Cash", "Bank", "Cheqe"], 
      default: "Cash" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["Paid", "Pending", "Cancelled"], 
      default: "Pending" 
    },
    description: { type: String },                // Notes / Details
    attachment: { type: String },                 // File name (multer upload)
  },
  { timestamps: true }                            // createdAt + updatedAt
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
