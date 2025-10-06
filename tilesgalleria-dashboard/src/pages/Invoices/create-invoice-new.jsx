import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const BOX_COVERAGE = 2.1;

export default function CreateInvoiceNew() {
  const [quotations, setQuotations] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [categories, setCategories] = useState([]);

  // ✅ Client Info
  const [clientInfo, setClientInfo] = useState({
    companyName: "",
    manualShipTo: "",
  });

  // ✅ State first
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

  // ✅ Then addRow function
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
        gstRate: 10,
        total: 0,
      },
    ]);
  };




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
  const token = localStorage.getItem("token");

  // categories get
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setCategories(res.data.categories || res.data || [])
      )
      .catch((err) => console.error("Failed to load categories", err));
  }, [token]);

  // 🔹 Fetch quotations
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/quotations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuotations(res.data))
      .catch((err) => console.error("Failed to load quotations", err));
  }, [token]);

  // 🔹 Fetch shipping addresses
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/shipping", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setShippingAddresses(res.data))
      .catch((err) => console.error("Failed to load addresses", err));
  }, [token]);

  // 🔹 Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err));
  }, [token]);

  // 🔹 When Quotation is selected → Auto-load data
  const handleQuotationChange = (quotationId) => {
    setSelectedQuotation(quotationId);
    const q = quotations.find((qt) => qt._id === quotationId);
    if (q) {
      setClientInfo({
        companyName: q.customer?.name || "",

      });

      setRows(
        q.items.map((item) => ({
          checked: false,
          product: item.product?._id || "",
          productName: item.product?.name || "",
          image: item.image || "",
          productType: item.productType || "",
          texture: item.texture || "",
          size: item.size || "",
          qty: item.qty,
          boxes: item.boxes,
          price: item.price,
          gstRate: item.gst,
          total: item.total,
        }))
      );

      setTotals({
        subTotal: q.subTotal,
        discount: q.discount,
        afterDiscount: q.amountAfterDiscount,
        gst: q.gstAmount,
        shipping: q.shippingCharge,
        grandTotal: q.grandTotal,
      });

      setNotes(q.notes || "");
    }
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


  const handleTotalsChange = (field, value) => {
    const parsed = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    const nextTotals = { ...totals, [field]: parsed };
    setTotals(nextTotals);
    calculateTotals(rows, nextTotals);
  };

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
        invoiceNo: `INV-${Date.now()}`,
        customer: selectedCustomerId,
        customerName: clientInfo.companyName,
        shippingAddress: {
          name: clientInfo.companyName || "N/A",
          addressLine: clientInfo.manualShipTo || "",
        },
        items: itemsData,
        subTotal: totals.subTotal,
        taxTotal: totals.gst,
        grandTotal: totals.grandTotal,
        status: "unpaid",
        notes,
      };

      await axios.post("http://localhost:8080/api/invoices", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Invoice saved successfully!");
    } catch (err) {
      console.error("Save invoice failed", err.response?.data || err.message);
      alert("❌ Failed to save invoice");
    }
  };

  // Remove selected rows
  const removeRows = () => {
    const remaining = rows.filter((r) => !r.checked);
    if (remaining.length === rows.length) {
      alert("⚠️ Please select at least one row to delete!");
      return;
    }
    setRows(remaining);
    setCheckAll(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">🧾 Create Invoice</h2>

      {/* Sales Order Basic Info */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">
          Sales Order&apos;s Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Quotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Quotation No.*
            </label>
            <Select
              options={quotations.map((q) => ({
                value: q._id,
                label: `${q.quoNo} (${q.customer?.name || "Unknown"})`,
              }))}
              value={
                selectedQuotation
                  ? quotations.find((q) => q._id === selectedQuotation)
                    ? {
                      value: selectedQuotation,
                      label: `${quotations.find((q) => q._id === selectedQuotation)?.quoNo} (${quotations.find((q) => q._id === selectedQuotation)?.customer?.name || "Unknown"
                        })`,
                    }
                    : null
                  : null
              }
              onChange={(opt) => handleQuotationChange(opt?.value || "")}
              isSearchable
              placeholder="Select Quotation..."
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: 36 }),
              }}
              menuPortalTarget={document.body}
            />

          </div>

          {/* Ship To Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship To Address*
            </label>
            <Select
              options={shippingAddresses.map((s) => ({
                value: s._id,
                label: s.customerName,
              }))}
              onChange={(opt) => {
                const selectedId = opt?.value || "";
                setSelectedCustomerId(selectedId);
                const selectedCustomer = shippingAddresses.find((s) => s._id === selectedId);
                if (selectedCustomer) {
                  setClientInfo({
                    ...clientInfo,
                    manualShipTo: selectedCustomer.shippingAddress,
                  });
                }
              }}
              isSearchable
              placeholder="Select Shipping Address..."
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: 36 }),
              }}
              menuPortalTarget={document.body}
            />

          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date*
            </label>
            <input
              type="text"
              value="Due in 7 days (04-10-2025)"
              className="w-full border rounded-lg px-3 py-2"
              readOnly
            />
          </div>

          {/* Manual Ship To Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Ship To Address*
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={1}
              value={clientInfo.manualShipTo}
              onChange={(e) =>
                setClientInfo({ ...clientInfo, manualShipTo: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">
          Sales Order&apos;s Client Information
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name / Contact Person
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
      </div>

      {/* Products Table */}
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
                        ? { value: row.product, label: products.find((p) => p._id === row.product)?.name || "" }
                        : null
                    }
                    onChange={(opt) => {
                      const productId = opt?.value;
                      const product = products.find((p) => p._id === productId);
                      if (product) {
                        handleRowChange(i, "product", product._id);
                        handleRowChange(i, "productName", product.name);
                        handleRowChange(i, "image", product.image);
                        handleRowChange(i, "price", product.price);
                        handleRowChange(i, "productType", product.productType || "");
                        handleRowChange(i, "texture", product.texture || "");
                        handleRowChange(i, "size", product.size || "");
                        handleRowChange(i, "category", product.category?.name || product.category || "");
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
                    onChange={(e) => handleRowChange(i, "boxes", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-2 w-24 text-right"
                    value={row.price}
                    onChange={(e) => handleRowChange(i, "price", e.target.value)}
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
        <button onClick={addRow} className="bg-green-600 text-white px-4 py-2 rounded">
          + Add More
        </button>
        <button onClick={removeRows} className="bg-red-600 text-white px-4 py-2 rounded">
          - Delete
        </button>
      </div>

      {/* Totals */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div>
          <label>Sub Total</label>
          <input className="w-full border p-2 bg-gray-100" value={totals.subTotal} readOnly />
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
          <input className="w-full border p-2 bg-gray-100" value={totals.afterDiscount} readOnly />
        </div>
        <div>
          <label>GST</label>
          <input className="w-full border p-2 bg-gray-100" value={totals.gst} readOnly />
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
          <input className="w-full border p-2 bg-gray-100" value={totals.grandTotal} readOnly />
        </div>
      </div>

      {/* Notes */}
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

      {/* Save */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSaveInvoice}
          className="bg-indigo-700 text-white px-6 py-3 rounded shadow"
        >
          Save Invoice
        </button>
      </div>
    </div>
  );
}
