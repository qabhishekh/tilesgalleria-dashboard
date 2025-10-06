import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCustomer = () => {
  const { id } = useParams(); // URL से id लो
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    abnNo: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Customer Details
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (err) {
        console.error("Failed to fetch customer", err);
        alert("❌ Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🔹 Update Customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/customers/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("✅ Customer updated successfully");
      navigate("/customers"); // वापस list page पर भेजो
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
      alert("❌ Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow border p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Customer</h2>

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
                value={form.abnNo || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                rows="2"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <hr className="my-6" />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/customers")}
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

export default EditCustomer;
