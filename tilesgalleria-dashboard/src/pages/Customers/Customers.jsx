import React, { useEffect, useState } from "react";
import { FaPlus, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null); // ✅ Track open dropdown

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [token]);

  // 🔹 Delete Customer
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await axios.delete(`${API_BASE}/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customers.filter((c) => c._id !== id));
      alert("✅ Deleted successfully");
    } catch (err) {
      console.error("Delete failed", err.response?.data || err.message);
      alert("❌ Failed to delete");
    }
    setOpenDropdownId(null);
  };

  // 🔹 Filtered Data
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>

          <button
            onClick={() => navigate("/add-customer")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition text-sm sm:text-base w-full sm:w-auto"
          >
            <FaPlus /> Add Customer
          </button>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select className="border rounded px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-sm w-full sm:w-auto">
            <label className="whitespace-nowrap">Search:</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded-lg text-sm flex-1 sm:flex-none"
              placeholder="Search..."
            />
          </div>
        </div>


        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Company Name / Person Name
                </th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, i) => (
                  <tr
                    key={cust._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{cust.name}</td>
                    <td className="px-4 py-2">{cust.phone || "-"}</td>
                    <td className="px-4 py-2">{cust.email || "-"}</td>
                    <td className="px-4 py-2 text-center relative">
                      {/* Dropdown Button */}
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === cust._id ? null : cust._id
                          )
                        }
                      >
                        <FaEllipsisV />
                      </button>

                      {/* Dropdown → row expand karega */}
                      {openDropdownId === cust._id && (
                        <div className="mt-2 w-32 bg-white border rounded-lg shadow-md text-left">
                          <button
                            onClick={() =>
                              navigate(`/edit-customer/${cust._id}`)
                            }
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cust._id)}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                          >
                            <FaTrash className="inline mr-1" /> Delete
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

        {/* Pagination (static for now) */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Showing {filteredCustomers.length} of {customers.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded bg-gray-100">
              Previous
            </button>
            <button className="px-3 py-1 border rounded bg-purple-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border rounded bg-gray-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
