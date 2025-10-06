import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";
import Quotation from "../models/Quotation.js";

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
  customerName: "Rajit",
  shippingAddress: {
    name: "Rajit",
    addressLine: "123 Test Street, Test City"
  },
  items: [ { 
    product: products[0]._id, 
    name: products[0].name, 
    qty: 1, 
    price: 2100, 
    taxRate: 0, 
    total: 2100,
    productType: products[0].productType,
    texture: products[0].texture,
    size: products[0].size,
    image: products[0].image
  } ],
  subTotal: 2100,
  taxTotal: 0,
  grandTotal: 2100,
  status: "paid"
});

await Quotation.create({
  quoNo: 4,
  customer: cust._id,
  quotationDate: new Date("2025-07-22"),
  amount: 2100,
  status: "sent",
  grandTotal: 2100,
  items: [ { 
    product: products[1]._id, 
    name: products[1].name, 
    qty: 1, 
    price: 2100, 
    gst: 0, 
    total: 2100,
    productType: products[1].productType,
    texture: products[1].texture,
    size: products[1].size,
    image: products[1].image
  } ]
});

console.log("✅ Seeded admin (admin/admin123) + sample data.");
process.exit(0);
