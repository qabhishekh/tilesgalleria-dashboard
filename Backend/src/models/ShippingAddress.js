import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", 
      required: true,
    },
    customerName: {  
      type: String,
      required: true,
      trim: true,
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ShippingAddress = mongoose.model("ShippingAddress", shippingAddressSchema);
export default ShippingAddress;
