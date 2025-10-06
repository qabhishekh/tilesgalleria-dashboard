import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function ViewInvoice() {
  const { id } = useParams();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);
  const token = localStorage.getItem("token");

  const isManual = location.pathname.includes("manual");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const url = isManual
          ? `${API_BASE}/api/manualinvoices/${id}`
          : `${API_BASE}/api/invoices/${id}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(res.data);
      } catch (err) {
        console.error("❌ Failed to load invoice", err);
      }
    };
    fetchInvoice();
  }, [id, token, isManual]);

  if (!invoice) return <p className="p-6">Loading...</p>;

  return (
    <div>
      {/* ===== Buttons (not printed) ===== */}
      <div className="flex justify-center mb-4 gap-3 hide-in-print">
        <button
          onClick={() => window.print()}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          🖨 Print Invoice
        </button>
        <button
          onClick={() => alert("Send to email functionality here")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          ✉ Send To Email
        </button>
      </div>

      {/* ===== Invoice Content ===== */}
      <div id="print-root" className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
        {/* ===== Header ===== */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <img src="/images/logos/tiles-logo.png" alt="Company Logo" className="h-30 mb-2" />
            <p className="font-bold text-lg">TILES GALLERIA</p>
            <p>33 First Avenue Kilkenny, SA 5009</p>
            <p>ABN: 91 672 836 038</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-indigo-700">
              {isManual ? "Manual Invoice" : "Invoice"}
            </h2>
            <p>
              <strong>Invoice No:</strong> {invoice.invoiceNo}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {invoice.date ? new Date(invoice.date).toLocaleDateString() : "—"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {invoice.status}
              </span>
            </p>
          </div>
        </div>

        {/* ===== Addresses ===== */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold mb-2">Bill To:</h3>
            <p>{invoice.customerName || invoice.customer?.name || "—"}</p>
            {isManual ? (
              <>
                <p>{invoice.billToAddress || "—"}</p>
              </>
            ) : (
              <p>{invoice.shippingAddress?.addressLine || "—"}</p>
            )}
          </div>
          <div>
            <h3 className="font-bold mb-2">Ship To:</h3>
            {isManual ? (
              <>
                <p>{invoice.shipToAddress || "—"}</p>
              </>
            ) : (
              <>
                <p>{invoice.shippingAddress?.name || "—"}</p>
                <p>{invoice.shippingAddress?.addressLine || "—"}</p>
              </>
            )}
          </div>
        </div>

        {/* ===== Items Table ===== */}
        <table className="w-full border mb-6">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">GST</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => {
                const productName =
                  item.productName ||
                  item.product?.name ||
                  item.name ||
                  "—";

                const category =
                  item.category ||
                  item.product?.category ||
                  item.productType ||
                  "—";

                return (
                  <tr key={idx} className="border-t align-top">
                    {/* ✅ Product */}
                    <td className="p-2">
                      <div className="font-medium">{productName}</div>
                      {item.texture && (
                        <div className="text-xs text-gray-500">
                          Texture: {item.texture}
                        </div>
                      )}
                      {item.size && (
                        <div className="text-xs text-gray-500">
                          Size: {item.size}
                        </div>
                      )}
                    </td>

                    {/* ✅ Category */}
                    <td className="p-2 text-left text-gray-700">{category}</td>

                    {/* ✅ Qty / Price / GST / Total */}
                    <td className="p-2 text-right">{item.qty ?? 0}</td>
                    <td className="p-2 text-right">
                      AU$ {Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {item.taxRate !== undefined
                        ? `${item.taxRate}%`
                        : item.gst ?? "—"}
                    </td>
                    <td className="p-2 text-right">
                      AU$ {Number(item.total || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ===== Totals ===== */}
        <div className="text-right space-y-1">
          <p>Sub Total: AU$ {Number(invoice.subTotal || 0).toFixed(2)}</p>
          {invoice.discount !== undefined && (
            <p>Discount: AU$ {Number(invoice.discount || 0).toFixed(2)}</p>
          )}
          {invoice.afterDiscount !== undefined && (
            <p>After Discount: AU$ {Number(invoice.afterDiscount || 0).toFixed(2)}</p>
          )}
          <p>GST: AU$ {Number(invoice.taxTotal ?? invoice.gst ?? 0).toFixed(2)}</p>
          {invoice.shippingCharge !== undefined && (
            <p>Shipping: AU$ {Number(invoice.shippingCharge || 0).toFixed(2)}</p>
          )}
          <p className="font-bold text-lg">
            Grand Total: AU$ {Number(invoice.grandTotal || 0).toFixed(2)}
          </p>
        </div>

        {/* ===== Notes ===== */}
        {invoice.notes && (
          <div className="mt-6 bg-gray-50 p-4 rounded border text-sm">
            <strong>Notes:</strong>
            <p>{invoice.notes}</p>
          </div>
        )}

        {/* ===== Footer ===== */}
        <div className="mt-8 border-t pt-4 text-sm">
          <p>
            <strong>Due Date:</strong>{" "}
            {invoice.dueDate
              ? new Date(invoice.dueDate).toLocaleDateString()
              : "—"}
          </p>
          <p>
            <strong>Bank Details:</strong> BSB: 162095161 | Acc No: 015356
          </p>
        </div>
      </div>
    </div>
  );
}
