import ShippingAddress from "../models/ShippingAddress.js";
import Customer from "../models/Customer.js"; 


import mongoose from "mongoose";

export const createAddress = async (req, res) => {
  try {
    const { customerId, shippingAddress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: "Invalid customerId" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const newAddr = new ShippingAddress({
      customer: customerId,
      customerName: customer.name,
      shippingAddress,
    });

    await newAddr.save();
    await newAddr.populate("customer", "name");

    res.status(201).json(newAddr);
  } catch (err) {
    console.error("❌ Create shipping error:", err);
    res.status(500).json({ error: err.message || "Failed to create shipping address" });
  }
};



// ✅ Get All with Customer Name
export const getAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.find()
      .populate("customer", "name") // only bring `name`
      .sort({ createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipping addresses" });
  }
};

// ✅ Get Single
export const getAddressById = async (req, res) => {
  try {
    const addr = await ShippingAddress.findById(req.params.id);
    if (!addr) return res.status(404).json({ error: "Not found" });
    res.json(addr);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch address" });
  }
};


// ✅ Update
export const updateAddress = async (req, res) => {
  try {
    const { customerName, shippingAddress } = req.body;
    const addr = await ShippingAddress.findByIdAndUpdate(
      req.params.id,
      { customerName, shippingAddress },
      { new: true }
    );
    if (!addr) return res.status(404).json({ error: "Not found" });
    res.json(addr);
  } catch (err) {
    res.status(500).json({ error: "Failed to update shipping address" });
  }
};

// ✅ Delete
export const deleteAddress = async (req, res) => {
  try {
    const addr = await ShippingAddress.findByIdAndDelete(req.params.id);
    if (!addr) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete shipping address" });
  }
};
