import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Customer } from "../models/Customer.js";
import { Product } from "../models/Product.js";
import { Invoice } from "../models/Invoice.js";
import { Quotation } from "../models/Quotation.js";

await connectDB(process.env.MONGODB_URI);

await User.deleteMany({});
await Customer.deleteMany({});
await Product.deleteMany({});
await Invoice.deleteMany({});
await Quotation.deleteMany({});

const admin = await User.create({
  name: "Admin",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  passwordHash: await bcrypt.hash("admin123", 10)
});

const cust = await Customer.create({ name: "Rajit", companyName: "Rajit", email: "r@x.com", mobile: "9999999999" });

const products = await Product.insertMany([
  { name: "COLORADO GOLD", productType: "Tiles", quantity: 20, boxes: 0, price: 0 },
  { name: "E-11", productType: "Tiles", quantity: 423.36, boxes: 0, price: 0 }
]);

await Invoice.create({
  invoiceNo: 100024,
  customer: cust._id,
  companyName: "Rajit",
  status: "paid",
  items: [ { product: products[0]._id, name: products[0].name, qty: 1, price: 2100, taxRate: 0, amount: 2100 } ],
  subtotal: 2100, tax: 0, total: 2100
});

await Quotation.create({
  quoNo: 4,
  customer: cust._id,
  quotationDate: new Date("2025-07-22"),
  amount: 2100,
  status: "sent",
  items: [ { product: products[1]._id, name: products[1].name, qty: 1, price: 2100, taxRate: 0, amount: 2100 } ]
});

console.log("✅ Seeded admin (admin/admin123) + sample data.");
process.exit(0);
