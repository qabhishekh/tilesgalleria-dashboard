import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quoNo: { type: String, required: true, unique: true },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: { type: Number, default: 0 },
        boxes: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, default: 0 },

        // 🔹 extra fields from product
        productType: { type: String },
        texture: { type: String },
        size: { type: String },
        image: { type: String },
      },
    ],

    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    amountAfterDiscount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "delivery_note",
        "edited_delivery_note",
        "email_sent"
      ],
      default: "draft",
    },


    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;
