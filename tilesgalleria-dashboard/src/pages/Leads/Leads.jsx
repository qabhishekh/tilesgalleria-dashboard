import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    altPhone: "",
    email: "",
    address: "",
    status: "new lead",
    notes: "",
    attachment: null,
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch Leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/leads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads(res.data);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      }
    };
    fetchLeads();
  }, [token]);

  // Handle Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // Submit Lead
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      await axios.post(`${API_BASE}/api/leads`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Lead added");
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Add lead error", err.response?.data || err.message);
      alert("❌ Failed to add lead");
    }
  };

  // Delete Lead
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`${API_BASE}/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(leads.filter((l) => l._id !== id));
      alert("✅ Lead deleted");
    } catch (err) {
      console.error("Delete error", err);
      alert("❌ Failed to delete lead");
    }
  };

 const handleStatusChange = async (id, newStatus) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/api/leads/${id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLeads(leads.map((l) => (l._id === id ? res.data : l)));
  } catch (err) {
    console.error("Status update error:", err.response?.data || err.message);
    alert("❌ Failed to update status");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-900">📋 Leads</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Lead
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                {[
                  "#",
                  "Customer/Company Name",
                  "Mobile No",
                  "Description",
                  "Email",
                  "Attachment",
                  "Status",
                  "Update Status",
                  "Action",
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
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <tr
                    key={lead._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{lead.name}</td>
                    <td className="px-4 py-2">{lead.phone}</td>
                    <td className="px-4 py-2">{lead.notes}</td>
                    <td className="px-4 py-2">{lead.email}</td>

                    {/* Attachment */}
                    <td className="px-4 py-2">
                      {lead.attachment ? (
                        lead.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <a
                            href={`${API_BASE}/uploads/${lead.attachment}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={`${API_BASE}/uploads/${lead.attachment}`}
                              alt="attachment"
                              className="w-12 h-12 object-cover rounded shadow"
                            />
                          </a>
                        ) : (
                          <a
                            href={`${API_BASE}/uploads/${lead.attachment}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            view attachment
                          </a>
                        )
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Current Status */}
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          lead.status === "new lead"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "hot lead"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "sale closed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* Update Status Dropdown */}
                    <td className="px-4 py-2">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead._id, e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option>new lead</option>
                        <option>hot lead</option>
                        <option>sale closed</option>
                        <option>not interested</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/edit-lead/${lead._id}`)}
                          className="px-3 py-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-8 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-indigo-800 mb-6 border-b pb-2">
              ➕ Add Lead
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  placeholder="Company / Customer Name"
                  required
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  name="phone"
                  onChange={handleChange}
                  placeholder="Mobile No."
                  required
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  name="altPhone"
                  onChange={handleChange}
                  placeholder="Alternate Mobile No."
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Customer Email"
                  className="border rounded-lg px-3 py-2"
                />
                <textarea
                  name="address"
                  onChange={handleChange}
                  placeholder="Customer Address"
                  className="border rounded-lg px-3 py-2 md:col-span-2"
                />
                <select
                  name="status"
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                >
                  <option>new lead</option>
                  <option>hot lead</option>
                  <option>sale closed</option>
                  <option>not interested</option>
                </select>
              </div>

              <textarea
                name="notes"
                onChange={handleChange}
                rows="4"
                placeholder="Description / Notes"
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="file"
                name="attachment"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />

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
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow transition"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
