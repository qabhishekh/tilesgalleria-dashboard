// controllers/customerController.js
import { Customer } from "../models/Customer.js";

// 📌 List all customers
export const list = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get single customer
export const getOne = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Create customer
export const create = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Update customer
export const update = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Delete customer
export const remove = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Add address
export const addAddress = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { address } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    customer.addresses.push({ address });
    await customer.save();

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update address
export const updateAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    const { address } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const addr = customer.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    addr.address = address;
    await customer.save();

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const addr = customer.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    addr.deleteOne();
    await customer.save();

    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
