import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function AddQuotation() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const token = localStorage.getItem("token");

  // 🔹 Conversion Factor → 25 Qty = 15 Boxes → 1 Qty = 0.6 Box
  const BOX_CONVERSION = 0.6;

  const [rows, setRows] = useState([
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
      gstOption: "10%",
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

  const [notes, setNotes] = useState("");
  const [checkAll, setCheckAll] = useState(false);

  // 🔹 Fetch Customers
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Customer fetch error", err));
  }, [token]);

  // 🔹 Fetch Products + Categories
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error", err));

    axios
      .get("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error("Category fetch error", err));
  }, [token]);

  // 🔹 Add Row
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
        gstOption: "10%",
        total: 0,
      },
    ]);
  };

  // 🔹 Customer select
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    const customer = customers.find((c) => c._id === customerId);
    setCustomerDetails(customer || null);
  };

  // 🔹 Save Quotation
  const handleSaveQuotation = async () => {
    try {
      const itemsData = rows.map((r) => {
        let gstRate = 0;
        if (r.gstOption === "10%") gstRate = 10;
        else if (r.gstOption === "Inclusive of GST") gstRate = 0;

        return {
          product: r.product,
          qty: r.qty,
          boxes: r.boxes,
          price: r.price,
          gst: gstRate,
          total: r.total,
          productType: r.productType,
          texture: r.texture,
          size: r.size,
          image: r.image,
        };
      });


      const payload = {
        quoNo: `QUO-${Date.now()}`,
        customer: selectedCustomer,
        items: itemsData,
        subTotal: totals.subTotal,
        discount: totals.discount,
        amountAfterDiscount: totals.afterDiscount,
        gstAmount: totals.gst,
        shippingCharge: totals.shipping,
        grandTotal: totals.grandTotal,
        notes: notes,
      };

      await axios.post("http://localhost:8080/api/quotations", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Quotation saved successfully!");
    } catch (err) {
      console.error("Save quotation failed", err.response?.data || err.message);
      alert("❌ Failed to save quotation");
    }
  };

  // 🔹 Remove Rows
  const removeRows = () => {
    const newRows = rows.filter((r) => !r.checked);
    setRows(newRows);
    setCheckAll(false);
    calculateTotals(newRows, totals);
  };

  // 🔹 Row Change
  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];

    if (["qty", "boxes", "price"].includes(field)) {
      newRows[index][field] = value === "" ? "" : parseFloat(value);
    } else {
      newRows[index][field] = value;
    }

    // ✅ Qty → Boxes auto
    if (field === "qty") {
      const qty = parseFloat(newRows[index].qty) || 0;
      if (!isNaN(qty) && qty >= 0) {
        newRows[index].boxes = Math.ceil(qty * BOX_CONVERSION);
      }
    }

    // ❌ Boxes change hone par Qty ko auto update mat karo

    // 🔹 Row Total (Qty × Price only)
    if (["qty", "price"].includes(field)) {
      const qty = parseFloat(newRows[index].qty) || 0;
      const price = parseFloat(newRows[index].price) || 0;
      newRows[index].total = qty * price;
    }

    setRows(newRows);
    calculateTotals(newRows, totals);
  };

  const calculateTotals = (rowsData, overrideTotals) => {
    const base = overrideTotals ?? totals;

    let subTotal = 0;
    let gstAmount = 0;

    rowsData.forEach((r) => {
      const total = parseFloat(r.total) || 0;
      subTotal += total;

      // ✅ only add GST if option is 10%
      if (r.gstOption === "10%") {
        gstAmount += total * 0.1; // 10% GST
      }
    });

    const subTotalNum = Number(subTotal);
    const discountNum = Number(base.discount);
    const shippingNum = Number(base.shipping);

    const afterDiscount = subTotalNum - discountNum;
    const grandTotal = afterDiscount + gstAmount + shippingNum;

    setTotals({
      ...base,
      subTotal: subTotalNum.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      gst: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    });
  };


  const handleTotalsChange = (field, value) => {
    const parsed = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    const nextTotals = { ...totals, [field]: parsed };
    setTotals(nextTotals);
    calculateTotals(rows, nextTotals);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">➕ Add Quotation</h2>

      {/* Customer Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Customer Name / Company Name
          </label>
          <Select
            options={customers.map((c) => ({ value: c._id, label: c.name }))}
            value={
              customers.find((c) => c._id === selectedCustomer)
                ? {
                  value: selectedCustomer,
                  label: customers.find((c) => c._id === selectedCustomer).name,
                }
                : null
            }
            onChange={(opt) => handleCustomerChange(opt.value)}
            placeholder="🔍 Search or select customer..."
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Customer Invoice Serial No.
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            placeholder="Enter Customer Invoice Serial No"
          />
        </div>
      </div>

      {/* Customer Details card */}
      {customerDetails && (
        <div className="mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md p-5">
          <h4 className="text-lg font-semibold text-purple-700 mb-4">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="font-medium text-gray-600 block mb-1">Customer Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={customerDetails.name || ""}
                onChange={(e) =>
                  setCustomerDetails({ ...customerDetails, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="font-medium text-gray-600 block mb-1">Phone</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={customerDetails.phone || ""}
                onChange={(e) =>
                  setCustomerDetails({ ...customerDetails, phone: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-medium text-gray-600 block mb-1">Address</label>
              <textarea
                rows="2"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={customerDetails.address || ""}
                onChange={(e) =>
                  setCustomerDetails({ ...customerDetails, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-center">✔</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-center">Image</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Boxes</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">GST</th>
              <th className="p-2 text-right">Total</th>
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
                    options={products.map((p) => ({ value: p._id, label: p.name }))}
                    value={
                      row.product
                        ? {
                          value: row.product,
                          label: products.find((p) => p._id === row.product)?.name,
                        }
                        : null
                    }
                    onChange={(opt) => {
                      const product = products.find((p) => p._id === opt.value);
                      if (product) {
                        handleRowChange(i, "product", product._id);
                        handleRowChange(i, "productName", product.name);
                        handleRowChange(i, "image", product.image);
                        handleRowChange(i, "price", product.price);
                        handleRowChange(i, "productType", product.productType || "");
                      }
                    }}
                    placeholder="Select product..."
                    isSearchable
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </td>

                <td className="p-2">
                  <Select
                    options={categories.map((c) => ({ value: c.name, label: c.name }))}
                    value={row.productType ? { value: row.productType, label: row.productType } : null}
                    onChange={(opt) => handleRowChange(i, "productType", opt.value)}
                    placeholder="Select category..."
                    isSearchable
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
                    value={Number(row.total || 0).toFixed(2)}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
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
          <label>Discount</label>
          <input
            type="number"
            className="w-full border p-2"
            value={totals.discount}
            onChange={(e) => handleTotalsChange("discount", e.target.value)}
          />
        </div>
        <div>
          <label>After Discount</label>
          <input className="w-full border p-2 bg-gray-100" value={totals.afterDiscount} readOnly />
        </div>
        <div>
          <label>GST</label>
          <input className="w-full border p-2 bg-gray-100" value={totals.gst} readOnly />
        </div>
        <div>
          <label>Shipping</label>
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
          placeholder="Enter quotation notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSaveQuotation}
          className="bg-indigo-700 text-white px-6 py-3 rounded shadow"
        >
          Save Quotation
        </button>
      </div>
    </div>
  );
}
