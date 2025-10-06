import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      unique: true,
      required: true,
    },

    product: { type: String },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    productType: { type: String }, 

    suppInvoiceSerialNo: { type: String },
    notes: { type: String },
    attachFile: { type: String },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: { type: Number, default: 0 },
        boxes: { type: Number, default: 0 },
        purchasePrice: { type: Number, default: 0 },
        sellingPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },

        productType: { type: String },
        texture: { type: String },
        size: { type: String },
        image: { type: String },
      },
    ],

    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    amountAfterDiscount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "unpaid", "paid", "overdue"],
      default: "unpaid",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseOrderSchema);
export default Purchase;
