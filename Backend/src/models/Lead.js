import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    altPhone: { type: String },   // Alternate mobile no.
    address: { type: String },    // Address
    status: { 
      type: String, 
      enum: ["new lead", "hot lead", "sale closed", "not interested"], 
      default: "new lead"          // ✅ default value enum से match
    },
    notes: { type: String },
    attachment: { type: String }, // file name
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
