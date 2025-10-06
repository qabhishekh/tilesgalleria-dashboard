import React, { useState } from "react";
import axios from "axios";

const AddCustomer = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    abnNo: "",
    address: "",
  });

  const token = localStorage.getItem("token"); // auth token

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/customers", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("✅ Customer Saved!");
      console.log("Saved Customer:", res.data);

      // reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        abnNo: "",
        address: "",
      });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("❌ Failed to save customer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow border p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Customer</h2>

        <form onSubmit={handleSubmit}>
          <h3 className="text-base font-semibold text-purple-900 mb-4">
            Basic Details
          </h3>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name / Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Name"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter Email Address"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ABN No
              </label>
              <input
                type="text"
                name="abnNo"
                value={form.abnNo}
                onChange={handleChange}
                placeholder="Enter ABN No"
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter Address"
                rows="2"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <hr className="my-6" />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setForm({ name: "", email: "", phone: "", abnNo: "", address: "" })}
              className="px-6 py-2 rounded border text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
