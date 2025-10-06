import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function EditPurchases() {
  const { id } = useParams(); // /edit-purchase/:id
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [suppInvoiceSerialNo, setSuppInvoiceSerialNo] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    discount: 0,
    afterDiscount: 0,
    gst: 0,
    shipping: 0,
    grandTotal: 0,
    advance: 0,
    balance: 0,
  });

  // 🔹 Fetch vendors, products & purchase
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, pRes, purchaseRes] = await Promise.all([
          axios.get(`${API_BASE}/api/vendors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/purchases/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setVendors(vRes.data);
        setProducts(pRes.data);

        const purchase = purchaseRes.data;
        setSelectedVendor(purchase.vendor?._id || "");
        setSuppInvoiceSerialNo(purchase.suppInvoiceSerialNo || "");
        setNotes(purchase.notes || "");

        setRows(
          purchase.items.map((item) => ({
            product: item.product?._id || "",
            productType: item.product?.productType || "",
            image: item.product?.image || "",
            sellingPrice: item.sellingPrice || 0,
            qty: item.qty || 0,
            boxes: item.boxes || 0,
            purchasePrice: item.purchasePrice || 0,
            total: item.total || 0,
          }))
        );

        setTotals({
          subTotal: purchase.subTotal || 0,
          discount: purchase.discount || 0,
          afterDiscount: purchase.amountAfterDiscount || 0,
          gst: purchase.gst || 0,
          shipping: purchase.shippingCharge || 0,
          grandTotal: purchase.grandTotal || 0,
          advance: purchase.advance || 0,
          balance: purchase.balance || 0,
        });
      } catch (err) {
        console.error("Fetch error", err);
        alert("❌ Failed to fetch purchase");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, token]);

  // 🔹 Handle row change
  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    if (field === "qty" || field === "purchasePrice") {
      const qty = parseFloat(newRows[index].qty) || 0;
      const price = parseFloat(newRows[index].purchasePrice) || 0;
      const sqmPerBox = newRows[index].productType === "Tiles" ? 2.1 : 1;
      const noOfBoxes = Math.ceil(qty / sqmPerBox);
      newRows[index].boxes = noOfBoxes;
      newRows[index].total = Math.round(qty * price);
    }

    setRows(newRows);
    calculateTotals(newRows, totals);
  };

  // 🔹 Totals calculation
  const calculateTotals = (rowsData, overrideTotals) => {
    const base = overrideTotals ?? totals;
    const subTotal = rowsData.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0),
      0
    );

    const discountNum = parseFloat(base.discount) || 0;
    const shippingNum = parseFloat(base.shipping) || 0;
    const advanceNum = parseFloat(base.advance) || 0;

    let afterDiscount = subTotal - discountNum;
    if (afterDiscount < 0) afterDiscount = 0;

    const gstNum = Math.round(afterDiscount * 0.1);

    const grandTotal = afterDiscount + gstNum + shippingNum;
    const balance = grandTotal - advanceNum;

    setTotals({
      ...base,
      subTotal: Math.round(subTotal),
      afterDiscount: Math.round(afterDiscount),
      gst: gstNum,
      grandTotal: Math.round(grandTotal),
      balance: Math.round(balance),
    });
  };

  const handleTotalsChange = (field, value) => {
    const parsed =
      value === "" ? "" : isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    const nextTotals = { ...totals, [field]: parsed };
    setTotals(nextTotals);
    calculateTotals(rows, nextTotals);
  };

  // 🔹 Save Update
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("vendor", selectedVendor);
      formData.append("suppInvoiceSerialNo", suppInvoiceSerialNo);
      formData.append("notes", notes);

      if (uploadedFile) {
        formData.append("attachFile", uploadedFile);
      }

      formData.append("items", JSON.stringify(rows));
      formData.append("subTotal", totals.subTotal);
      formData.append("discount", totals.discount);
      formData.append("amountAfterDiscount", totals.afterDiscount);
      formData.append("gst", totals.gst);
      formData.append("shippingCharge", totals.shipping);
      formData.append("grandTotal", totals.grandTotal);
      formData.append("advance", totals.advance);
      formData.append("balance", totals.balance);

      await axios.put(`${API_BASE}/api/purchases/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Purchase updated successfully!");
      navigate("/purchases");
    } catch (err) {
      console.error("Update error", err.response?.data || err.message);
      alert("❌ Failed to update purchase");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h3 className="text-3xl font-bold text-indigo-700 mb-8 border-b pb-2 flex items-center gap-2">
        ✏️ <span>Edit Purchase</span>
      </h3>

      {/* Vendor Select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Vendor
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2.5"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Supplier Invoice Serial No.
          </label>
          <input
            type="text"
            value={suppInvoiceSerialNo}
            onChange={(e) => setSuppInvoiceSerialNo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left">Product</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Boxes</th>
              <th className="px-3 py-3 text-right">Purchase Price</th>
              <th className="px-3 py-3 text-right">Selling Price</th>
              <th className="px-3 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-3">
                  <select
                    className="border rounded p-2 w-full"
                    value={row.product}
                    onChange={(e) => {
                      const productId = e.target.value;
                      const product = products.find((p) => p._id === productId);
                      if (product) {
                        handleRowChange(i, "product", product._id);
                        handleRowChange(i, "productType", product.productType);
                        handleRowChange(i, "purchasePrice", product.price);
                        handleRowChange(i, "image", product.image);
                      }
                    }}
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => handleRowChange(i, "qty", e.target.value)}
                    className="w-20 border rounded p-2 text-right"
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={row.boxes}
                    readOnly
                    className="w-20 border rounded p-2 text-right bg-gray-100"
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={row.purchasePrice}
                    onChange={(e) =>
                      handleRowChange(i, "purchasePrice", e.target.value)
                    }
                    className="w-24 border rounded p-2 text-right"
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={row.sellingPrice}
                    onChange={(e) =>
                      handleRowChange(i, "sellingPrice", e.target.value)
                    }
                    className="w-24 border rounded p-2 text-right"
                  />
                </td>
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    value={row.total}
                    readOnly
                    className="w-24 border rounded p-2 text-right bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div>
          <label>Sub Total</label>
          <input
            value={totals.subTotal}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label>Discount</label>
          <input
            type="number"
            value={totals.discount}
            onChange={(e) => handleTotalsChange("discount", e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>GST (10%)</label>
          <input
            value={totals.gst}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label>Grand Total</label>
          <input
            value={totals.grandTotal}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label>Advance</label>
          <input
            type="number"
            value={totals.advance}
            onChange={(e) => handleTotalsChange("advance", e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Balance</label>
          <input
            value={totals.balance}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Notes + File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <label>Notes</label>
          <textarea
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>
        <div>
          <label>Replace File</label>
          <input
            type="file"
            onChange={(e) => setUploadedFile(e.target.files[0])}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Save */}
      <div className="mt-10 flex justify-center gap-4">
        <button
          onClick={() => navigate("/purchases")}
          className="bg-gray-200 px-6 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
