import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productType: { type: String },    
    texture: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 },
    boxes: { type: Number, default: 0 },
    price: { type: Number, required: true },
    image: { type: String },           
    taxRate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
