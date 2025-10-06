import mongoose from "mongoose";

const manualInvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },

    customerName: { type: String, required: true },
    billToAddress: { type: String },
    shipToAddress: { type: String },
    dueDate: { type: Date },

    items: [
      {
        description: { type: String },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        category: { type: String },
        qty: { type: Number, required: true },
        boxes: { type: Number },
        price: { type: Number, required: true },
        taxRate: { type: Number, default: 10 },
        total: { type: Number, required: true },
        image: { type: String },
      },
    ],

    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    afterDiscount: { type: Number },
    taxTotal: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    notes: { type: String },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ManualInvoice = mongoose.model("ManualInvoice", manualInvoiceSchema);
export default ManualInvoice;
