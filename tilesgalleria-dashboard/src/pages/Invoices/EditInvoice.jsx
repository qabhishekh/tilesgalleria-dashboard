import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditInvoice({ type = "normal" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [invoice, setInvoice] = useState(null);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    discount: 0,
    afterDiscount: 0,
    gst: 0,
    shipping: 0,
    grandTotal: 0,
  });

  // ✅ Base URL depends on type
  const baseUrl =
    type === "manual"
      ? "http://localhost:8080/api/manualinvoices"
      : "http://localhost:8080/api/invoices";

  // 🔹 Fetch invoice details by ID
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${baseUrl}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(res.data);
        setRows(res.data.items || []);
        setTotals({
          subTotal: res.data.subTotal,
          discount: 0,
          afterDiscount: res.data.subTotal,
          gst: res.data.taxTotal,
          shipping: 0,
          grandTotal: res.data.grandTotal,
        });
      } catch (err) {
        console.error("❌ Failed to load invoice", err);
      }
    };
    fetchInvoice();
  }, [id, token, baseUrl]);

  // 🔹 Handle row changes
  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    if (["qty", "price"].includes(field)) {
      newRows[index][field] = value === "" ? "" : parseFloat(value);
    } else {
      newRows[index][field] = value;
    }

    const qty = parseFloat(newRows[index].qty) || 0;
    const price = parseFloat(newRows[index].price) || 0;
    newRows[index].total = qty * price;

    setRows(newRows);
    calculateTotals(newRows, totals);
  };

  // 🔹 Totals Calculation
  const calculateTotals = (rowsData, overrideTotals) => {
    const base = overrideTotals ?? totals;
    const subTotal = rowsData.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0),
      0
    );

    const discountNum = parseFloat(base.discount) || 0;
    const shippingNum = parseFloat(base.shipping) || 0;
    let afterDiscount = subTotal - discountNum;
    if (afterDiscount < 0) afterDiscount = 0;

    const gstNum = Math.round(afterDiscount * 0.1);
    const grandTotal = afterDiscount + gstNum + shippingNum;

    setTotals({
      ...base,
      subTotal,
      afterDiscount,
      gst: gstNum,
      grandTotal,
    });
  };

  // 🔹 Save Update
  const handleUpdateInvoice = async () => {
    try {
      const payload = {
        ...invoice,
        items: rows,
        subTotal: totals.subTotal,
        taxTotal: totals.gst,
        grandTotal: totals.grandTotal,
      };

      await axios.put(`${baseUrl}/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Invoice updated successfully!");
      navigate("/invoices");
    } catch (err) {
      console.error("❌ Update failed", err);
      alert("❌ Failed to update invoice");
    }
  };

  if (!invoice) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        ✏️ Edit {type === "manual" ? "Manual" : "Normal"} Invoice {invoice.invoiceNo}
      </h2>

      {/* Customer Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Customer Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={invoice.customerName}
          onChange={(e) =>
            setInvoice({ ...invoice, customerName: e.target.value })
          }
        />
      </div>

      {/* Shipping Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Shipping Address</label>
        <textarea
          rows={2}
          className="w-full border rounded px-3 py-2"
          value={invoice.shippingAddress?.addressLine || ""}
          onChange={(e) =>
            setInvoice({
              ...invoice,
              shippingAddress: {
                ...invoice.shippingAddress,
                addressLine: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto border rounded-lg mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b text-center">
                <td className="p-2">{row.productType || "Item"}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-20"
                    value={row.qty}
                    onChange={(e) => handleRowChange(i, "qty", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-24"
                    value={row.price}
                    onChange={(e) => handleRowChange(i, "price", e.target.value)}
                  />
                </td>
                <td className="p-2">{(row.total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div>
          <label>Sub Total</label>
          <input
            className="w-full border p-2 bg-gray-100"
            value={totals.subTotal}
            readOnly
          />
        </div>
        <div>
          <label>Discount</label>
          <input
            type="number"
            className="w-full border p-2"
            value={totals.discount}
            onChange={(e) =>
              calculateTotals(rows, { ...totals, discount: e.target.value })
            }
          />
        </div>
        <div>
          <label>Grand Total</label>
          <input
            className="w-full border p-2 bg-gray-100"
            value={totals.grandTotal}
            readOnly
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleUpdateInvoice}
          className="bg-indigo-700 text-white px-6 py-3 rounded shadow"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
