import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function PrePurchases() {
  const [prePurchases, setPrePurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    vendor_name: "",
    amount: "",
    advance: "",
    description: "",
  });

  const navigate = useNavigate();

  // 🔹 Fetch all Pre Purchases
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/prepurchases`);
        setPrePurchases(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle form submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentId) {
        // Update
        const res = await axios.put(
          `${API_BASE}/api/prepurchases/${currentId}`,
          form
        );
        setPrePurchases((prev) =>
          prev.map((p) => (p._id === currentId ? res.data : p))
        );
        alert("✅ Pre Purchase updated successfully");
      } else {
        // Create
        const res = await axios.post(`${API_BASE}/api/prepurchases`, form);
        setPrePurchases([...prePurchases, res.data]);
        alert("✅ Pre Purchase added successfully");
      }

      setShowModal(false);
      setEditMode(false);
      setCurrentId(null);
      setForm({ vendor_name: "", amount: "", advance: "", description: "" });
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save pre purchase");
    }
  };

  // 🔹 Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Pre Purchase?")) return;

    try {
      await axios.delete(`${API_BASE}/api/prepurchases/${id}`);
      setPrePurchases((prev) => prev.filter((p) => p._id !== id));
      alert("✅ Pre Purchase deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete");
    }
  };

  // 🔹 Open Edit Modal
  const openEditModal = (purchase) => {
    setEditMode(true);
    setCurrentId(purchase._id);
    setForm({
      vendor_name: purchase.vendor_name,
      amount: purchase.amount,
      advance: purchase.advance,
      description: purchase.description,
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* 🔹 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-3xl font-extrabold text-indigo-900">
            🛒 Pre Purchases
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/add-purchases")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
            >
              <FaPlus /> New Purchase
            </button>

            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setForm({ vendor_name: "", amount: "", advance: "", description: "" });
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
            >
              <FaPlus /> Add Pre Purchase
            </button>
          </div>
        </div>


        {/* 🔹 Table */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                {[
                  "Sr. No.",
                  "Vendor Name",
                  "Total",
                  "Advance",
                  "Description",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-semibold uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prePurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No data available in table
                  </td>
                </tr>
              ) : (
                prePurchases.map((p, i) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{p.vendor_name}</td>
                    <td className="px-4 py-2 text-green-700 font-semibold">
                      AU$ {p.amount}
                    </td>
                    <td className="px-4 py-2 text-indigo-700 font-semibold">
                      AU$ {p.advance}
                    </td>
                    <td className="px-4 py-2">{p.description}</td>
                    <td className="px-4 py-2 flex gap-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-2xl w-3/4 max-w-2xl p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-indigo-800 mb-6 border-b pb-2">
              {editMode ? "✏️ Edit Pre Purchase" : "➕ Add Pre Purchase"}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Vendor Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="vendor_name"
                  value={form.vendor_name}
                  onChange={handleChange}
                  placeholder="Enter Vendor Name"
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter Amount"
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <input
                  type="number"
                  name="advance"
                  value={form.advance}
                  onChange={handleChange}
                  placeholder="Enter Advance"
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block mb-1 font-medium">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Description"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow transition"
                >
                  {editMode ? "Update" : "Add"} Pre Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
