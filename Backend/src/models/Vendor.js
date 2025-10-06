import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    abnNo: { type: String },                  
    address: { type: String }
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
