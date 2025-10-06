import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import image from "../../assets/logos/tiles-logo.png";
import { API_BASE } from "../../config/api";

export default function ViewQuotation() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        // Try normal quotation
        let res = await axios.get(`${API_BASE}/api/quotations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuotation({ ...res.data, type: "auto" });
      } catch {
        try {
          // Fallback to manual
          let res = await axios.get(`${API_BASE}/api/manualquotations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQuotation({ ...res.data, type: "manual" });
        } catch (err) {
          console.error("❌ Failed to fetch quotation", err);
          setQuotation(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, token]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!quotation) return <div className="p-6 text-red-600">Quotation not found!</div>;

  // 🧾 Debug: print structure
  console.log("Quotation Items:", quotation.items);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-center gap-4 mb-6 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
        >
          🖨 Print Quotation
        </button>
      </div>

      <div id="print-root" className="invoice-container bg-white rounded-lg shadow p-6">
        <header className="flex justify-between items-start border-b pb-4">
          <div className="logo">
            <img src={image} alt="Logo" style={{ maxWidth: "150px" }} />
          </div>
          <div className="text-right">
            <p className="font-bold">TILES GALLERIA AUSTRALIA PTY LTD</p>
            <p>33 First Avenue Kilkenny, SA 5009</p>
            <p>ABN No: 91 672 836 038</p>
          </div>
        </header>

        {/* Info */}
        <section className="mt-6 flex justify-between">
          <div>
            <p className="font-semibold">
              Quotation {quotation.type === "manual" && "(Manual)"}
            </p>
            <p><strong>Quotation #:</strong> {quotation.quoNo || "-"}</p>
            <p>Date: {new Date(quotation.createdAt).toLocaleDateString("en-GB")}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Customer Address:</p>
            <p>{quotation.customer?.name || "-"}</p>
            <p>{quotation.customer?.address || "-"}</p>
          </div>
        </section>

        {/* Items Table */}
        <section className="mt-6">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Description</th>
                <th className="border p-2 text-center">Product Type</th>
                <th className="border p-2 text-center">Qty</th>
                <th className="border p-2 text-center">Unit Price</th>
                <th className="border p-2 text-center">GST</th>
                <th className="border p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.length > 0 ? (
                quotation.items.map((item, i) => {
                  const description =
                    item.description ||
                    item.product?.name ||
                    item.product?.description ||
                    item.name ||
                    item.productName ||
                    "-";

                  return (
                    <tr key={i}>
                      <td className="border p-2 font-medium text-gray-800">
                        {description}
                        {item.size && (
                          <span className="text-gray-500 text-sm"> × {item.size}</span>
                        )}
                      </td>
                      <td className="border p-2 text-center">
                        {item.productType || item.product?.productType || "-"}
                      </td>
                      <td className="border p-2 text-center">{item.qty || 0}</td>
                      <td className="border p-2 text-center">
                        {item.price?.toFixed(2) || "0.00"}
                      </td>
                      <td className="border p-2 text-center">
                        {item.gst ? `${item.gst}%` : "Inclusive"}
                      </td>
                      <td className="border p-2 text-right">
                        {item.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <div className="flex justify-between mt-6">
          <div>
            <p className="mt-2 font-semibold">Please pay to:</p>
            <p>TILES GALLERIA AUSTRALIA PTY LTD</p>
            <p>BSB No: 162095161</p>
            <p>Account No: 015356</p>
          </div>
          <table className="text-right border-collapse">
            <tbody>
              <tr><td className="px-4 py-1">Sub Total:</td><td>{quotation.subTotal?.toFixed(2)}</td></tr>
              <tr><td className="px-4 py-1">Discount:</td><td>- {quotation.discount?.toFixed(2)}</td></tr>
              <tr><td className="px-4 py-1">After Discount:</td><td>{quotation.amountAfterDiscount?.toFixed(2)}</td></tr>
              <tr><td className="px-4 py-1">GST:</td><td>{quotation.gstAmount?.toFixed(2)}</td></tr>
              <tr><td className="px-4 py-1">Shipping Charge:</td><td>{quotation.shippingCharge?.toFixed(2)}</td></tr>
              <tr className="font-bold border-t"><td className="px-4 py-1">Total:</td><td>{quotation.grandTotal?.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
