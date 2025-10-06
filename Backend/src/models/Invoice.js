import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },

    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Customer", 
      required: true 
    },
    customerName: { type: String, required: true },  
    
    shippingAddress: {
      name: { type: String, required: true },                        
      addressLine: { type: String, required: true },
    },
    
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        category: { type: String }, 
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        total: { type: Number, required: true } ,

        // 🔹 extra fields from product
        productType: { type: String },
        texture: { type: String },
        size: { type: String },
        image: { type: String }, 
      }
    ],

    subTotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
