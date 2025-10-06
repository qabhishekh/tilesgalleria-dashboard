import mongoose from "mongoose";

const manualQuotationSchema = new mongoose.Schema(
  {
    quoNo: { type: String, required: true, unique: true },

    // Manual customer info or linked customer
    customer: {
      type: mongoose.Schema.Types.Mixed,
      required: true, // e.g. { name, phone, address }
    },

    // Products / Items
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        description: { type: String },
        category: { type: String },
        qty: { type: Number, default: 0 },
        boxes: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, default: 0 },

        // Optional product details
        productType: { type: String },
        texture: { type: String },
        size: { type: String },
        image: { type: String },
      },
    ],

    // Totals
    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    amountAfterDiscount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    notes: { type: String },

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected"],
      default: "draft",
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ManualQuotation = mongoose.model(
  "ManualQuotation",
  manualQuotationSchema
);

export default ManualQuotation;
