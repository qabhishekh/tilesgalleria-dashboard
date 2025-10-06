import PrePurchase from "../models/PrePurchase.js";

// ➕ Add Pre Purchase
export const createPrePurchase = async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);  // Debug line

    const purchase = new PrePurchase({
      vendor_name: req.body.vendor_name,
      amount: req.body.amount,
      advance: req.body.advance,
      description: req.body.description,
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// 📌 List all
export const listPrePurchases = async (req, res) => {
  try {
    const purchases = await PrePurchase.find();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePrePurchase = async (req, res) => {
  try {
    const updated = await PrePurchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ❌ Delete
export const deletePrePurchase = async (req, res) => {
  try {
    const deleted = await PrePurchase.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
