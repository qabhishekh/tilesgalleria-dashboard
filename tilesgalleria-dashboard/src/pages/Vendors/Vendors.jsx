import { useState, useEffect } from "react";
import { FaPlus, FaBuilding, FaEllipsisV } from "react-icons/fa";
import axios from "axios";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null); // ✅ track which dropdown is open

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    abnNo: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  // 🔹 Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 🔹 Form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Open Add Modal
  const openAddModal = () => {
    setEditMode(false);
    setForm({ name: "", email: "", phone: "", abnNo: "", address: "" });
    setShowModal(true);
  };

  // 🔹 Open Edit Modal
  const openEditModal = (vendor) => {
    setEditMode(true);
    setCurrentId(vendor._id);
    setForm({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      abnNo: vendor.abnNo,
      address: vendor.address,
    });
    setShowModal(true);
    setOpenDropdownId(null); // close dropdown
  };

  // 🔹 Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:8080/api/vendors/${currentId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:8080/api/vendors", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      console.error("Failed to save vendor", err.response?.data || err.message);
    }
  };

  // 🔹 Delete vendor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    } catch (err) {
      console.error("Failed to delete vendor", err.response?.data || err.message);
    }
    setOpenDropdownId(null); // close dropdown
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          <FaBuilding /> Vendors
        </h2>
        <button
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition"
          onClick={openAddModal}
        >
          <FaPlus /> Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Vendor Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">ABN</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  🏢 No vendors added yet
                </td>
              </tr>
            ) : (
              vendors.map((vendor, i) => (
                <tr
                  key={vendor._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{vendor.name}</td>
                  <td className="px-4 py-3">{vendor.email}</td>
                  <td className="px-4 py-3">{vendor.phone}</td>
                  <td className="px-4 py-3">{vendor.abnNo}</td>
                  <td className="px-4 py-3">{vendor.address}</td>
                  <td className="px-4 py-3 text-center relative">
                    {/* Dropdown Button */}
                    <button
                      className="p-2 rounded-full hover:bg-gray-200"
                      onClick={() =>
                        setOpenDropdownId(openDropdownId === vendor._id ? null : vendor._id)
                      }
                    >
                      <FaEllipsisV />
                    </button>

                    {/* Dropdown Content → now relative, pushes row height */}
                    {openDropdownId === vendor._id && (
                      <div className="mt-2 w-32 bg-white border rounded shadow-lg">
                        <button
                          onClick={() => openEditModal(vendor)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-indigo-700 mb-6">
              {editMode ? "✏️ Edit Vendor" : "➕ Add Vendor"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Vendor Name"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="abnNo"
                value={form.abnNo}
                onChange={handleChange}
                placeholder="ABN No"
                className="border p-2 rounded"
              />
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                rows="3"
                className="border p-2 rounded md:col-span-2"
              />
              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  {editMode ? "Update Vendor" : "Add Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
