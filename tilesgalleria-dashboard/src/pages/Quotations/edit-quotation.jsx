import { useState, useEffect } from "react";

export default function EditQuotation() {
  const [formData, setFormData] = useState({
    customer_id: 3,
    company_name: "Rajit",
    mobile_no: "8087357431",
    company_address: "Test",
    productCode: "E-08",
    quantity: 100,
    no_of_boxes: 20,
    price: 20,
    gst_select: "Inclusive of GST",
    total: 2000,
    subTotal: 2000,
    discount: 0,
    amount_after_discount: 2000,
    gst: 0,
    shipping_charge: 100,
    grand_total: 2100,
    notes: "",
    order_id: 4,
  });

  // 🔹 Auto-calc totals whenever qty, price, gst, discount, shipping change
  useEffect(() => {
    const total = (formData.quantity || 0) * (formData.price || 0);
    const subTotal = total;
    const afterDiscount = subTotal - (parseFloat(formData.discount) || 0);
    const grandTotal =
      afterDiscount +
      (parseFloat(formData.gst) || 0) +
      (parseFloat(formData.shipping_charge) || 0);

    setFormData((prev) => ({
      ...prev,
      total,
      subTotal,
      amount_after_discount: afterDiscount,
      grand_total: grandTotal,
    }));
  }, [
    formData.quantity,
    formData.price,
    formData.discount,
    formData.gst,
    formData.shipping_charge,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Quotation Data:", formData);
    // 🚀 API call here
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🔹 Basic Information */}
        <div>
          <h5 className="text-xl font-bold text-indigo-700 mb-4 border-l-4 border-indigo-600 pl-2">
            Quotation Basic Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="0">Select customer</option>
                <option value="3">Rajit</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🔹 Customer Info */}
        <div>
          <h5 className="text-xl font-bold text-indigo-700 mb-4 border-l-4 border-indigo-600 pl-2">
            Customer Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              placeholder="Mobile No."
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              placeholder="Company Address"
              className="w-full border rounded px-3 py-2 md:col-span-2"
            />
          </div>
        </div>

        {/* 🔹 Product Table */}
        <div>
          <h5 className="text-xl font-bold text-indigo-700 mb-4 border-l-4 border-indigo-600 pl-2">
            Products
          </h5>
          <table className="w-full border rounded text-sm shadow">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-3 py-2">Select</th>
                <th className="px-3 py-2">Product Code</th>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Boxes</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">GST</th>
                <th className="px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border hover:bg-gray-50">
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <img
                    src="/logo192.png"
                    alt="Product"
                    className="w-12 h-12 border rounded mx-auto"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    name="no_of_boxes"
                    value={formData.no_of_boxes}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    name="gst_select"
                    value={formData.gst_select}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option>Inclusive of GST</option>
                    <option value="10">10%</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    readOnly
                    className="border rounded px-2 py-1 w-full bg-gray-100"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🔹 Totals */}
        <div>
          <h5 className="text-xl font-bold text-indigo-700 mb-4 border-l-4 border-indigo-600 pl-2">
            Totals
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg shadow-inner">
            {[
              { label: "Sub Total", name: "subTotal" },
              { label: "Discount", name: "discount" },
              { label: "Amount After Discount", name: "amount_after_discount" },
              { label: "GST", name: "gst" },
              { label: "Shipping Charge", name: "shipping_charge" },
              { label: "Grand Total", name: "grand_total" },
            ].map((field, i) => (
              <div key={i}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                  readOnly={["subTotal", "amount_after_discount", "grand_total"].includes(field.name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 Notes */}
        <div>
          <h5 className="text-xl font-bold text-indigo-700 mb-2 border-l-4 border-indigo-600 pl-2">
            Notes
          </h5>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* 🔹 Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            💾 Update Quotation
          </button>
        </div>
      </form>
    </div>
  );
}
