import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import ManualInvoice from "../models/ManualInvoice.js";
import Product from "../models/Product.js";
import Quotation from "../models/Quotation.js";
import ManualQuotation from "../models/manualQuotation.js";
import Purchase from "../models/Purchase.js";
import Lead from "../models/Lead.js";

export const getDashboardSummary = async (req, res) => {
  try {
    // 🔹 Counts
    const [
      customerCount,
      invoiceCount,
      manualInvoiceCount,
      productCount,
      quotationCount,
      manualQuotationCount,
      purchaseCount,
      leadCount,
    ] = await Promise.all([
      Customer.countDocuments(),
      Invoice.countDocuments(),
      ManualInvoice.countDocuments(),
      Product.countDocuments(),
      Quotation.countDocuments(),
      ManualQuotation.countDocuments(),
      Purchase.countDocuments(),
      Lead.countDocuments(),
    ]);

    // 🔹 Recents
    const [
      recentCustomers,
      recentInvoices,
      recentManualInvoices,
      recentProducts,
      autoQuotations,
      manualQuotations,
      recentPurchases,
      recentLeads,
    ] = await Promise.all([
      Customer.find().sort({ createdAt: -1 }).limit(5),

      Invoice.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name email"),

      ManualInvoice.find().sort({ createdAt: -1 }).limit(5),

      Product.find().sort({ createdAt: -1 }).limit(5),

      Quotation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name email"),

      ManualQuotation.find().sort({ createdAt: -1 }).limit(5),

      Purchase.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("vendor", "name email")
        .populate("items.product", "name productType size texture"),

      Lead.find().sort({ createdAt: -1 }).limit(5),
    ]);

    // 🔹 Merge & tag quotations
    const taggedQuotations = [
      ...autoQuotations.map((q) => ({ ...q.toObject(), type: "auto" })),
      ...manualQuotations.map((q) => ({ ...q.toObject(), type: "manual" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 🔹 Response
    res.json({
      counts: {
        customers: customerCount,
        invoices: invoiceCount,
        manualInvoices: manualInvoiceCount,
        products: productCount,
        quotations: quotationCount,
        manualQuotations: manualQuotationCount,
        totalQuotations: quotationCount + manualQuotationCount, // ✅ merged total
        purchases: purchaseCount,
        leads: leadCount,
      },
      recents: {
        customers: recentCustomers,
        invoices: recentInvoices,
        manualInvoices: recentManualInvoices,
        products: recentProducts,
        quotations: taggedQuotations, // ✅ merged & tagged
        purchases: recentPurchases,
        leads: recentLeads,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard summary failed", err);
    res.status(500).json({ message: err.message });
  }
};
