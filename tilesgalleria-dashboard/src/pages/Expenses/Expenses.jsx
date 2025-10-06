import { useState, useEffect } from "react";
import { FaPlus, FaEllipsisV, FaTrash, FaEdit, FaFileImage } from "react-icons/fa";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [form, setForm] = useState({
    reference: "",
    amount: "",
    expenseBy: "",
    paymentMode: "Cash",
    paymentStatus: "Pending",
    description: "",
    attachment: null,
  });

  const token = localStorage.getItem("token");

  // 🔹 Fetch Expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      }
    };
    fetchExpenses();
  }, [token]);

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // 🔹 Open Add Modal
  const openAddModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      reference: "",
      amount: "",
      expenseBy: "",
      paymentMode: "Cash",
      paymentStatus: "Pending",
      description: "",
      attachment: null,
    });
    setShowModal(true);
  };

  // 🔹 Open Edit Modal
  const openEditModal = (exp) => {
    setEditMode(true);
    setCurrentId(exp._id);
    setForm({
      reference: exp.reference,
      amount: exp.amount,
      expenseBy: exp.expenseBy,
      paymentMode: exp.paymentMode,
      paymentStatus: exp.paymentStatus,
      description: exp.description,
      attachment: null, // file reset
    });
    setShowModal(true);
    setOpenDropdownId(null);
  };

  // 🔹 Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, v);
      });

      if (editMode && currentId) {
        // ✅ Update
        const res = await axios.put(
          `${API_BASE}/api/expenses/${currentId}`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setExpenses(
          expenses.map((ex) => (ex._id === currentId ? res.data : ex))
        );
        alert("✅ Expense updated");
      } else {
        // ✅ Add
        const res = await axios.post(`${API_BASE}/api/expenses`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setExpenses([res.data, ...expenses]);
        alert("✅ Expense added");
      }

      setShowModal(false);
    } catch (err) {
      console.error("Expense save error", err.response?.data || err.message);
      alert("❌ Failed to save expense");
    }
  };

  // 🔹 Delete Expense
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`${API_BASE}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((e) => e._id !== id));
      alert("✅ Deleted");
    } catch (err) {
      alert("❌ Failed to delete",err);
    }
    setOpenDropdownId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-3xl font-extrabold text-gray-800">💰 Expenses</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* 🔹 Search Box */}
            <input
              type="text"
              placeholder="Search by Reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full sm:w-64"
            />
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition w-full sm:w-auto"
            >
              <FaPlus /> Add Expense
            </button>
          </div>
        </div>


        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                {[
                  "#",
                  "Reference",
                  "Amount",
                  "Expense By",
                  "Attachment",
                  "Payment Mode",
                  "Payment Status",
                  "Action",
                ].map((head, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left font-semibold uppercase tracking-wide"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center text-gray-500 py-8 italic"
                  >
                    No data available in table
                  </td>
                </tr>
              ) : (
                expenses
                  .filter((e) =>
                    e.reference.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((exp, i) => (
                    <tr
                      key={exp._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{exp.reference}</td>
                      <td className="px-4 py-2">AU$ {exp.amount}</td>
                      <td className="px-4 py-2">{exp.expenseBy || "-"}</td>
                      <td className="px-4 py-2">
                        {exp.attachment ? (
                          <a
                            href={`${API_BASE}/uploads/${exp.attachment}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <FaFileImage /> View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">{exp.paymentMode}</td>
                      <td className="px-4 py-2">{exp.paymentStatus}</td>
                      <td className="px-4 py-2 text-center relative">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100"
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === exp._id ? null : exp._id
                            )
                          }
                        >
                          <FaEllipsisV />
                        </button>

                        {openDropdownId === exp._id && (
                          <div className="mt-2 w-32 bg-white border rounded-lg shadow-md text-left">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              <FaEdit className="inline mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exp._id)}
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
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editMode ? "✏️ Edit Expense" : "➕ Add Expense"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              <input
                type="text"
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="Enter Reference No"
                required
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter Amount"
                required
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                name="expenseBy"
                value={form.expenseBy}
                onChange={handleChange}
                placeholder="Enter Expense By"
                className="border px-3 py-2 rounded-lg"
              />

              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg"
              >
                <option>Cash</option>
                <option>Bank</option>
                <option>Cheqe</option>
              </select>

              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg"
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>

              <div className="col-span-3">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Description"
                  className="w-full border px-3 py-2 rounded-lg"
                ></textarea>
              </div>

              <div className="col-span-3">
                <label className="block mb-1 font-medium text-gray-700">
                  Attachment
                </label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div className="col-span-3 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md transition"
                >
                  {editMode ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
