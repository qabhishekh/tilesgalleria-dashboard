import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const BOX_COVERAGE = 2.1;

export default function CreateManualInvoice() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gstType, setGstType] = useState({ value: "exclusive", label: "Exclusive of GST (10%)" }); // ✅ new state
  const [rows, setRows] = useState([
    {
      checked: false,
      product: "",
      category: "",
      productName: "",
      image: "",
      productType: "",
      texture: "",
      size: "",
      qty: 0,
      boxes: 0,
      price: 0,
      gstRate: 10,
      total: 0,
    },
  ]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    discount: 0,
    afterDiscount: 0,
    gst: 0,
    shipping: 0,
    grandTotal: 0,
  });
  const [checkAll, setCheckAll] = useState(false);
  const [notes, setNotes] = useState("");
  const [clientInfo, setClientInfo] = useState({
    companyName: "",
    billToAddress: "",
    shipToAddress: "",
    dueDate: "",
  });

  const token = localStorage.getItem("token");

  // ✅ Auto-set due date (7 days from today)
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formatted = nextWeek.toISOString().split("T")[0];
    setClientInfo((prev) => ({ ...prev, dueDate: formatted }));
  }, []);

  // 🔹 Fetch Products
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err));
  }, [token]);

  // 🔹 Fetch Categories
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.categories || res.data || []))
      .catch((err) => console.error("Failed to load categories", err));
  }, [token]);

  // ✅ Add Row
  const addRow = () => {
    setRows([
      ...rows,
      {
        checked: false,
        product: "",
        productName: "",
        image: "",
        productType: "",
        texture: "",
        size: "",
        qty: 0,
        boxes: 0,
        price: 0,
        gstRate: gstType.value === "inclusive" ? 0 : 10,
        total: 0,
      },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    const row = newRows[index];

    if (["qty", "boxes", "price"].includes(field)) {
      row[field] = value === "" ? "" : parseFloat(value);
    } else {
      row[field] = value;
    }

    // ✅ When qty changes → auto calc boxes
    if (field === "qty") {
      const qty = parseFloat(row.qty) || 0;
      row.boxes = qty > 0 ? Math.ceil(qty / BOX_COVERAGE) : 0;
    }

    // ✅ When GST dropdown changes
    if (field === "gstOption") {
      if (value === "Inclusive of GST") {
        row.gstRate = 0;
      } else {
        row.gstRate = 10;
      }
    }

    const qty = parseFloat(row.qty) || 0;
    const price = parseFloat(row.price) || 0;
    row.total = qty * price;

    newRows[index] = row;
    setRows(newRows);
    calculateTotals(newRows, totals);
  };


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

    // ✅ Calculate GST only for rows with gstRate > 0
    const gstNum = rowsData.reduce((sum, r) => {
      if (r.gstRate > 0) {
        return sum + (r.total * r.gstRate) / 100;
      }
      return sum;
    }, 0);

    const grandTotal = afterDiscount + gstNum + shippingNum;

    setTotals({
      ...base,
      subTotal,
      afterDiscount,
      gst: Math.round(gstNum),
      grandTotal: Math.round(grandTotal),
    });
  };


  // ✅ GST Type Change (recalculate everything)
  const handleGstTypeChange = (selected) => {
    setGstType(selected);
    const newRows = rows.map((r) => ({
      ...r,
      gstRate: selected.value === "inclusive" ? 0 : 10,
    }));
    setRows(newRows);
    calculateTotals(newRows, totals);
  };

  // ✅ Handle Totals Change
  const handleTotalsChange = (field, value) => {
    const parsed = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    const nextTotals = { ...totals, [field]: parsed };
    setTotals(nextTotals);
    calculateTotals(rows, nextTotals);
  };

  // ✅ Remove Selected Rows
  const removeRows = () => {
    const remaining = rows.filter((r) => !r.checked);
    if (remaining.length === rows.length) {
      alert("⚠️ Please select at least one row to delete!");
      return;
    }
    setRows(remaining);
    setCheckAll(false);
  };

  // ✅ Save Manual Invoice
  const handleSaveInvoice = async () => {
    try {
      const itemsData = rows.map((r) => ({
        product: r.product,
        qty: r.qty,
        price: r.price,
        taxRate: r.gstRate,
        gstOption: r.gstOption,
        total: r.total,
        productType: r.productType,
        texture: r.texture,
        size: r.size,
        image: r.image,
        category: r.category,
      }));


      const payload = {
        invoiceNo: `MAN-${Date.now()}`,
        customerName: clientInfo.companyName,
        billToAddress: clientInfo.billToAddress,
        shipToAddress: clientInfo.shipToAddress,
        dueDate: clientInfo.dueDate,
        items: itemsData,
        subTotal: totals.subTotal,
        taxTotal: totals.gst,
        grandTotal: totals.grandTotal,
        notes,
        status: "unpaid",
        gstType: gstType.value, // ✅ send to backend if you want
      };

      await axios.post("http://localhost:8080/api/manualinvoices", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Manual Invoice Saved Successfully!");
    } catch (err) {
      console.error("Save failed", err.response?.data || err.message);
      alert("❌ Failed to save manual invoice");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        🧾 Create Manual Invoice
      </h2>

      {/* ===== Top Section (Same) ===== */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company / Contact Person
          </label>
          <input
            type="text"
            value={clientInfo.companyName}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, companyName: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bill To Address
          </label>
          <input
            type="text"
            value={clientInfo.billToAddress}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, billToAddress: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ship To Address
          </label>
          <input
            type="text"
            value={clientInfo.shipToAddress}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, shipToAddress: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={clientInfo.dueDate}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, dueDate: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* ===== Product Table + Totals ===== */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={() => {
                    const newVal = !checkAll;
                    setRows(rows.map((r) => ({ ...r, checked: newVal })));
                    setCheckAll(newVal);
                  }}
                />
              </th>
              <th className="p-2 text-left">Product Description</th>
              <th className="p-2 text-center">Category</th>
              <th className="p-2 text-center">Product Image</th>
              <th className="p-2 text-right">Product QTY</th>
              <th className="p-2 text-right">No. of Boxes</th>
              <th className="p-2 text-right">Product Price</th>
              <th className="p-2 text-right">GST</th>
              <th className="p-2 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b text-center">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => {
                      const newRows = [...rows];
                      newRows[i].checked = !newRows[i].checked;
                      setRows(newRows);
                      setCheckAll(newRows.every((r) => r.checked));
                    }}
                  />
                </td>
                <td className="p-2">
                  <Select
                    options={products.map((p) => ({
                      value: p._id,
                      label: p.name,
                    }))}
                    value={
                      row.product
                        ? {
                          value: row.product,
                          label:
                            products.find((p) => p._id === row.product)?.name ||
                            "",
                        }
                        : null
                    }
                    onChange={(opt) => {
                      const productId = opt?.value;
                      const product = products.find((p) => p._id === productId);
                      if (product) {
                        const updatedRows = [...rows];
                        updatedRows[i] = {
                          ...updatedRows[i],
                          product: product._id,
                          productName: product.name,
                          image: product.image || "",
                          price: product.price || 0,
                          productType: product.productType || "",
                          texture: product.texture || "",
                          size: product.size || "",
                          category: product.category?.name || product.category || "",
                        };
                        setRows(updatedRows);
                        calculateTotals(updatedRows, totals);
                      }
                    }}


                    isSearchable
                    placeholder="Select Product..."
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    menuPortalTarget={document.body}
                  />
                </td>

                <td className="p-2">
                  <Select
                    options={categories.map((c) => ({
                      value: c.name,
                      label: c.name,
                    }))}
                    value={
                      row.category
                        ? { value: row.category, label: row.category }
                        : null
                    }
                    onChange={(opt) => handleRowChange(i, "category", opt.value)}
                    isSearchable
                    placeholder="Select category..."
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    menuPortalTarget={document.body}
                  />
                </td>

                <td className="p-2">
                  {row.image ? (
                    <img
                      src={
                        row.image.startsWith("http")
                          ? row.image
                          : `http://localhost:8080/uploads/${row.image}`
                      }
                      alt="product"
                      className="w-12 h-12 mx-auto object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-20 text-right"
                    value={row.qty}
                    onChange={(e) => handleRowChange(i, "qty", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="any"
                    className="border rounded p-2 w-20 text-right"
                    value={row.boxes}
                    onChange={(e) =>
                      handleRowChange(i, "boxes", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-24 text-right"
                    value={row.price}
                    onChange={(e) =>
                      handleRowChange(i, "price", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <select
                    className="border rounded p-2 w-28"
                    value={row.gstOption}
                    onChange={(e) => handleRowChange(i, "gstOption", e.target.value)}
                  >
                    <option value="10%">10%</option>
                    <option value="Inclusive of GST">Inclusive of GST</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-24 text-right bg-gray-100"
                    value={row.total.toFixed(2)}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={addRow}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add More
        </button>
        <button
          onClick={removeRows}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          - Delete
        </button>
      </div>

      {/* ===== Totals ===== */}
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
          <label>Discount (in amount)</label>
          <input
            type="number"
            className="w-full border p-2"
            value={totals.discount}
            onChange={(e) => handleTotalsChange("discount", e.target.value)}
          />
        </div>
        <div>
          <label>Amount After Discount</label>
          <input
            className="w-full border p-2 bg-gray-100"
            value={totals.afterDiscount}
            readOnly
          />
        </div>
        <div>
          <label>GST</label>
          <input
            className="w-full border p-2 bg-gray-100"
            value={totals.gst}
            readOnly
          />
        </div>
        <div>
          <label>Shipping Charge</label>
          <input
            type="number"
            className="w-full border p-2"
            value={totals.shipping}
            onChange={(e) => handleTotalsChange("shipping", e.target.value)}
          />
        </div>
        <div>
          <label>Total</label>
          <input
            className="w-full border p-2 bg-gray-100"
            value={totals.grandTotal}
            readOnly
          />
        </div>
      </div>

      {/* ===== Notes ===== */}
      <div className="mt-6">
        <label className="block font-semibold mb-1">Notes</label>
        <textarea
          rows="4"
          className="w-full border rounded p-2"
          placeholder="Enter invoice notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* ===== Save ===== */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSaveInvoice}
          className="bg-indigo-700 text-white px-6 py-3 rounded shadow"
        >
          Save Manual Invoice
        </button>
      </div>
    </div>
  );
}
