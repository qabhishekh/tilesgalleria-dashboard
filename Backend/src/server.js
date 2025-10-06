import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"
import invoiceRoutes from "./routes/invoiceRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import manualquotationRoutes from "./routes/manualQuotationRoutes.js";
import manualInvoiceRoutes from "./routes/manualInvoiceRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import prePurchaseRoutes from "./routes/prePurchaseRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Allow CORS for static uploads
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads")));


app.get("/api/health", (req,res)=> res.json({ ok:true, app: process.env.APP_NAME || "API"}));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/prepurchases", prePurchaseRoutes);
app.use("/api/manualquotations", manualquotationRoutes);
app.use("/api/manualinvoices", manualInvoiceRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGODB_URI).then(()=>{
  app.listen(PORT, ()=> console.log(`🚀 ${process.env.APP_NAME||"API"} listening on :${PORT}`));
}).catch((e)=>{
  console.error("DB connection failed", e);
  process.exit(1);
});


