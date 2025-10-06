import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function AddPurchases() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filledFields, setFilledFields] = useState({});
  const [categories, setCategories] = useState([]);


  const token = localStorage.getItem("token");

  useEffect(() => {
    // Vendors
    axios
      .get("http://localhost:8080/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVendors(res.data))
      .catch((err) => console.error("Vendor fetch error", err));

    // Categories
    axios
      .get("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.categories || []))  // ✅ FIXED
      .catch((err) => console.error("Category fetch error", err));


    // Products
    axios
      .get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error", err));
  }, [token]);

  // Rows
  const [rows, setRows] = useState([
    {
      checked: false,
      productCode: "",
      productType: "",
      image: "",
      sellingPrice: 0,
      qty: 0,
      boxes: 0,
      purchasePrice: 0,
      total: 0,
    },
  ]);

  // Totals
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

  const [checkAll, setCheckAll] = useState(false);

  // 🔹 Vendor selection → show details
  const handleVendorChange = (vendorId) => {
    setSelectedVendor(vendorId);
    const v = vendors.find((x) => x._id === vendorId);
    setVendorDetails(v || null);
  };

  // 🔹 Add Row
  const addRow = () => {
    setRows([
      ...rows,
      {
        checked: false,
        productCode: "",
        productType: "",
        image: "",
        sellingPrice: 0,
        qty: 0,
        boxes: 0,
        purchasePrice: 0,
        total: 0,
      },
    ]);
  };

  // 🔹 Remove Selected Rows
  const removeRows = () => {
    const newRows = rows.filter((r) => !r.checked);
    setRows(newRows);
    setCheckAll(false);
    calculateTotals(newRows, totals);
  };

  // 🔹 Toggle row check
  const toggleRowCheck = (index) => {
    const newRows = [...rows];
    newRows[index].checked = !newRows[index].checked;
    setRows(newRows);
    setCheckAll(newRows.every((r) => r.checked));
  };

  // 🔹 Toggle all
  const toggleCheckAll = () => {
    const newVal = !checkAll;
    const newRows = rows.map((r) => ({ ...r, checked: newVal }));
    setRows(newRows);
    setCheckAll(newVal);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    // Agar qty ya purchasePrice change hua to auto-calc chalega
    if (field === "qty" || field === "purchasePrice") {
      const qty = parseFloat(newRows[index].qty) || 0;
      const price = parseFloat(newRows[index].purchasePrice) || 0;

      if (newRows[index].productType === "Tiles") {
        const sqmPerBox = 2.1;
        const noOfBoxes = Math.ceil(qty / sqmPerBox);
        newRows[index].boxes = noOfBoxes;   // ✅ sirf Tiles ke liye auto update
      }

      newRows[index].total = Math.round(qty * price);
    }

    // Agar directly boxes input change hua to wo user ka value store ho
    if (field === "boxes") {
      newRows[index].boxes = parseFloat(value) || 0;
    }

    setRows(newRows);

    setFilledFields((prev) => ({
      ...prev,
      [`row-${index}-${field}`]: value !== "" && value !== null,
    }));

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
    const advanceNum = parseFloat(base.advance) || 0;

    let afterDiscount = subTotal - discountNum;
    if (afterDiscount < 0) afterDiscount = 0;

    // ✅ Auto GST calculation (10%)
    const gstNum = Math.round(afterDiscount * 0.1);

    const grandTotal = afterDiscount + gstNum + shippingNum;
    const balance = grandTotal - advanceNum;

    setTotals({
      ...base,
      subTotal: Math.round(subTotal),
      afterDiscount: Math.round(afterDiscount),
      gst: gstNum, // always auto
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

  // 🔹 Save Purchase
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("vendor", selectedVendor);
      formData.append("suppInvoiceSerialNo", vendorDetails?.suppInvoiceSerialNo || "");
      formData.append("notes", vendorDetails?.notes || "");

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

      const res = await axios.post("http://localhost:8080/api/purchases", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Purchase saved successfully!");
      console.log(res.data);
    } catch (err) {
      console.error("Save error", err.response?.data || err.message);
      alert("❌ Failed to save purchase");
    }
  };

  const handleInputChange = (field, value) => {
    handleTotalsChange(field, value); // ya handleRowChange agar row input hai

    setFilledFields((prev) => ({
      ...prev,
      [field]: value !== "" && value !== null, // ✅ true if not empty
    }));
  };


  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br rounded-xl shadow-lg mt-8">
      <h3 className="text-3xl font-bold text-indigo-700 mb-8 border-b pb-2 flex items-center gap-2">
        🧾 <span>Purchase Invoice</span>
      </h3>

      {/* Vendor + Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Vendor Name / Company Name
          </label>
          <Select
            options={vendors.map((v) => ({
              value: v._id,
              label: v.name,
            }))}
            value={vendors.find((v) => v._id === selectedVendor) ? {
              value: selectedVendor,
              label: vendors.find((v) => v._id === selectedVendor).name,
            } : null}
            onChange={(opt) => handleVendorChange(opt.value)}
            placeholder="Select Vendor..."
            className="shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Supplier Invoice Serial No.
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            placeholder="Enter Supplier Invoice Serial No"
          />
        </div>
      </div>

      {/* ✅ Vendor Details card */}
      {vendorDetails && (
        <div className="mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md p-5">
          <h4 className="text-lg font-semibold text-purple-700 mb-4">
            Purchase Order's Vendor Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="font-medium text-gray-600 block mb-1">
                Vendor Name / Company Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={vendorDetails.name || ""}
                onChange={(e) =>
                  setVendorDetails({ ...vendorDetails, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="font-medium text-gray-600 block mb-1">
                Phone / Mobile No
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={vendorDetails.phone || ""}
                onChange={(e) =>
                  setVendorDetails({ ...vendorDetails, phone: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-medium text-gray-600 block mb-1">
                Company Address
              </label>
              <textarea
                rows="2"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                value={vendorDetails.address || ""}
                onChange={(e) =>
                  setVendorDetails({ ...vendorDetails, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={toggleCheckAll}
                />
              </th>
              <th className="px-3 py-3 text-left">Product Description</th>
              <th className="px-3 py-3 text-left">Product Category</th>
              <th className="px-3 py-3 text-center">Image</th>
              <th className="px-3 py-3 text-right">Selling Price</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Boxes</th>
              <th className="px-3 py-3 text-right">Purchase Price</th>
              <th className="px-3 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition text-center"
              >
                {/* Checkbox */}
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => toggleRowCheck(i)}
                  />
                </td>

                {/* Product dropdown */}
                <td className="px-3 py-3">
                  <Select
                    options={products.map((p) => ({
                      value: p._id,
                      label: p.name,
                    }))}
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
                        handleRowChange(i, "productType", product.productType);
                        handleRowChange(i, "texture", product.texture);
                        handleRowChange(i, "size", product.size);
                        handleRowChange(i, "purchasePrice", product.price);
                        handleRowChange(i, "image", product.image);
                      }
                    }}
                    placeholder="Select Product..."
                    className="text-left"
                    menuPortalTarget={document.body}   // ✅ Dropdown body me render hoga
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ✅ upar visible hoga
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />

                </td>


                <td className="px-3 py-3">
                  <Select
                    options={categories.map((c) => ({
                      value: c.name,
                      label: c.name,
                    }))}
                    value={
                      row.productType
                        ? { value: row.productType, label: row.productType }
                        : null
                    }
                    onChange={(opt) => handleRowChange(i, "productType", opt.value)}
                    placeholder="-- Select Category --"
                    className="text-left"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />

                </td>

                {/* Image */}
                <td className="px-3 py-3">
                  {row.image ? (
                    <div className="w-12 h-12 border rounded-lg overflow-hidden shadow-sm mx-auto">
                      <img
                        src={
                          row.image.startsWith("http")
                            ? row.image
                            : `http://localhost:8080/uploads/${row.image}`
                        }
                        alt="product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>

                {/* Selling Price */}
                <td className="px-3 py-3 text-right relative">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-2 w-24 text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm pr-6"
                    value={row.sellingPrice}
                    onChange={(e) =>
                      handleRowChange(i, "sellingPrice", e.target.value)
                    }
                  />
                  {filledFields[`row-${i}-sellingPrice`] && (
                    <span className="absolute right-1 top-2 text-blue-600">✔️</span>
                  )}
                </td>

                {/* Qty */}
                <td className="px-3 py-3 text-right relative">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-2 w-20 text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm pr-6"
                    value={row.qty}
                    onChange={(e) => handleRowChange(i, "qty", e.target.value)}
                  />
                  {filledFields[`row-${i}-qty`] && (
                    <span className="absolute right-1 top-2 text-blue-600">✔️</span>
                  )}
                </td>

                {/* Boxes */}
                <td className="px-3 py-3 text-right">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-2 w-20 text-right focus:ring-2 focus:ring-indigo-500"
                    value={row.boxes}
                    onChange={(e) => handleRowChange(i, "boxes", e.target.value)}
                  />
                </td>

                {/* Purchase Price */}
                <td className="px-3 py-3 text-right relative">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-2 w-24 text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm pr-6"
                    value={row.purchasePrice}
                    onChange={(e) =>
                      handleRowChange(i, "purchasePrice", e.target.value)
                    }
                  />
                  {filledFields[`row-${i}-purchasePrice`] && (
                    <span className="absolute right-1 top-2 text-blue-600">✔️</span>
                  )}
                </td>

                {/* Total */}
                <td className="px-3 py-3 text-right relative">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-2 w-24 text-right bg-gray-100 shadow-sm pr-6"
                    value={row.total}
                    readOnly
                  />
                  {row.total > 0 && (
                    <span className="absolute right-1 top-2 text-green-600">✔️</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>




      {/* Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
          onClick={addRow}
        >
          + Add More
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
          onClick={removeRows}
        >
          - Delete
        </button>
      </div>

      {/* ✅ Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Subtotal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Sub Total
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 shadow-sm"
            value={totals.subTotal}
            readOnly
          />
        </div>

        {/* Discount */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Discount
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2 pr-8 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={totals.discount}
            onChange={(e) => handleInputChange("discount", e.target.value)}
          />
          {filledFields["discount"] && (
            <span className="absolute right-2 top-9 text-blue-600">✔️</span>
          )}
        </div>

        {/* After Discount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            After Discount
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 shadow-sm"
            value={totals.afterDiscount}
            readOnly
          />
        </div>

        {/* GST */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            GST (Auto 10%)
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 shadow-sm"
            value={totals.gst}
            readOnly
          />
          {totals.gst > 0 && (
            <span className="absolute right-2 top-9 text-green-600">✔️</span>
          )}
        </div>

        {/* Shipping */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Shipping
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2 pr-8 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={totals.shipping}
            onChange={(e) => handleInputChange("shipping", e.target.value)}
          />
          {filledFields["shipping"] && (
            <span className="absolute right-2 top-9 text-blue-600">✔️</span>
          )}
        </div>

        {/* Grand Total */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Grand Total
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 shadow-sm"
            value={totals.grandTotal}
            readOnly
          />
        </div>

        {/* Advance */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Advance
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2 pr-8 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={totals.advance}
            onChange={(e) => handleInputChange("advance", e.target.value)}
          />
          {filledFields["advance"] && (
            <span className="absolute right-2 top-9 text-blue-600">✔️</span>
          )}
        </div>

        {/* Balance */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Balance
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 shadow-sm"
            value={totals.balance}
            readOnly
          />
        </div>
      </div>

      {/* ✅ Notes + File Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Notes:
          </label>
          <textarea
            rows="4"
            placeholder="Your Notes"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Attach file
          </label>
          <input
            type="file"
            onChange={(e) => setUploadedFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* ✅ Save Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleSave}
          className="bg-green-700 hover:bg-green-800 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition transform hover:scale-[1.02]"
        >
          Save Purchase
        </button>
      </div>
    </div>

  );
}
