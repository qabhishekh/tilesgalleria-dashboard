import React, { useState, useEffect } from "react";
import { FaPlus, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

export default function ShippingAddress() {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // 🔹 for edit
  const [addresses, setAddresses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerId: "", shippingAddress: "" });
  const [editForm, setEditForm] = useState({ id: "", customerId: "", shippingAddress: "" });

  const token = localStorage.getItem("token");

  // Fetch Customers
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Failed to load customers", err));
  }, [token]);

  // Fetch Shipping Addresses
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/shipping", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAddresses(res.data))
      .catch((err) => console.error("Failed to load addresses", err));
  }, [token]);

  // Handle Add form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/shipping", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses([res.data, ...addresses]);
      setShowModal(false);
      setForm({ customerId: "", shippingAddress: "" });
      alert("✅ Shipping Address added!");
    } catch (err) {
      console.error("Failed to add address", err);
      alert("❌ Failed to add shipping address");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shipping address?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/shipping/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(addresses.filter((a) => a._id !== id));
      alert("✅ Deleted successfully");
    } catch (err) {
      console.error("Failed to delete", err);
      alert("❌ Failed to delete address");
    }
    setOpenDropdownId(null);
  };

  // Open Edit Modal with Prefill
  const openEdit = (addr) => {
    setEditForm({
      id: addr._id,
      customerId: addr.customer?._id || "",
      shippingAddress: addr.shippingAddress,
    });
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  // Handle Edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8080/api/shipping/${editForm.id}`,
        { customerId: editForm.customerId, shippingAddress: editForm.shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses(addresses.map((a) => (a._id === editForm.id ? res.data : a)));
      setShowEditModal(false);
      alert("✅ Shipping Address updated!");
    } catch (err) {
      console.error("Failed to update address", err);
      alert("❌ Failed to update shipping address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-2xl font-bold text-gray-800">Shipping Address</h2>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition text-sm sm:text-base w-full sm:w-auto"
          >
            <FaPlus /> Add Shipping Address
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Shipping Address</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr, i) => (
                <tr key={addr._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{addr.customer?.name || "-"}</td>
                  <td className="px-4 py-2">{addr.shippingAddress}</td>
                  <td className="px-4 py-2 text-center relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() =>
                        setOpenDropdownId(openDropdownId === addr._id ? null : addr._id)
                      }
                    >
                      <FaEllipsisV />
                    </button>

                    {openDropdownId === addr._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md text-left">
                        <button
                          onClick={() => openEdit(addr)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addr._id)}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add Shipping Address</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  placeholder="Enter Address"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Shipping Address</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                <select
                  value={editForm.customerId}
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editForm.shippingAddress}
                  onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                  placeholder="Enter Address"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
