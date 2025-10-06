import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEye,
  FaEdit,
  FaTimesCircle,
  FaPaperPlane,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaFileInvoice,
  FaPenFancy,
  FaEnvelope,
  FaPlus,
} from "react-icons/fa";
import { API_BASE } from "../../config/api";

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch quotations (normal + manual)
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const [normalRes, manualRes] = await Promise.all([
          axios.get(`${API_BASE}/api/quotations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/manualquotations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Tag data with type
        const normalData = normalRes.data.map((q) => ({ ...q, type: "auto" }));
        const manualData = manualRes.data.map((q) => ({ ...q, type: "manual" }));

        // Merge results
        setQuotations([...normalData, ...manualData]);
      } catch (err) {
        console.error("Error fetching quotations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, [token]);

  // 🔹 Delete quotation
  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const url =
        type === "manual"
          ? `${API_BASE}/api/manualquotations/${id}`
          : `${API_BASE}/api/quotations/${id}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuotations((prev) => prev.filter((q) => q._id !== id));
      alert("✅ Quotation deleted successfully!");
    } catch (err) {
      console.error("Delete error", err.response?.data || err.message);
      alert("❌ Failed to delete quotation");
    }
  };

  // 🔹 Update Quotation Status
  const updateStatus = async (id, type, newStatus) => {
    try {
      const url =
        type === "manual"
          ? `${API_BASE}/api/manualquotations/${id}/status`
          : `${API_BASE}/api/quotations/${id}/status`;

      const { data } = await axios.patch(
        url,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update in state also
      setQuotations((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: data.status } : q))
      );

      alert(`✅ Status updated to "${newStatus}"`);
      setOpenModal(null);
    } catch (err) {
      console.error("Status update error", err.response?.data || err.message);
      alert("❌ Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-indigo-900">📑 Quotations</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/add-quotations")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow transition text-sm sm:text-base"
          >
            <FaPlus /> New Quotation
          </button>
          <button
            onClick={() => navigate("/add-quotations-manual")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition text-sm sm:text-base"
          >
            <FaPlus /> Manual Quotation
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[950px]">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <tr>
              {[
                "Sr. No.",
                "Customer / Company",
                "Product Type", // ✅ Added column
                "Total",
                "Discount",
                "Grand Total",
                "Date",
                "Status",
                "Action",
              ].map((head, i) => (
                <th
                  key={i}
                  className="px-2 sm:px-4 py-2 font-semibold whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-purple-900 py-6 font-medium"
                >
                  No data available in table
                </td>
              </tr>
            ) : (
              quotations.map((q, i) => (
                <tr
                  key={q._id}
                  className="border-t hover:bg-gray-50 transition text-xs sm:text-sm"
                >
                  <td className="px-2 sm:px-4 py-2">{i + 1}</td>

                  {/* Customer */}
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                    {q.customer?.name || "-"}{" "}
                    {q.type === "manual" && (
                      <span className="text-xs text-purple-600 font-semibold ml-1">
                        (Manual)
                      </span>
                    )}
                  </td>

                  {/* ✅ Product Type column */}
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                    {q.items && q.items.length > 0
                      ? q.items.map((item) => item.productType || "-").join(", ")
                      : "-"}
                  </td>

                  <td className="px-2 sm:px-4 py-2">AU$ {q.subTotal}</td>
                  <td className="px-2 sm:px-4 py-2">AU$ {q.discount}</td>
                  <td className="px-2 sm:px-4 py-2 font-semibold text-green-700">
                    AU$ {q.grandTotal}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs sm:text-sm ${
                        q.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : q.status === "sent"
                          ? "bg-blue-100 text-blue-700"
                          : q.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-2 sm:px-4 py-2 text-center relative">
                    <div className="inline-block">
                      <button
                        onClick={() =>
                          setOpenModal(openModal === q._id ? null : q._id)
                        }
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        ⋮
                      </button>
                      {openModal === q._id && (
                        <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-50 w-max min-w-[150px]">
                          <ul className="py-1 text-sm text-gray-700">
                            <li>
                              <button
                                onClick={() =>
                                  navigate(`/edit-quotation/${q._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaEdit className="text-indigo-600" /> Edit
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  navigate(`/view-quotation/${q._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaEye className="text-blue-600" /> View
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDelete(q._id, q.type)}
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaTimesCircle className="text-red-600" /> Delete
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "draft")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaClock className="text-yellow-600" /> Draft
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "sent")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaPaperPlane className="text-blue-600" /> Sent
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "accepted")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaCheckCircle className="text-green-600" /> Accepted
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "rejected")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaTimes className="text-red-600" /> Rejected
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "expired")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaClock className="text-gray-600" /> Expired
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "delivery_note")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaFileInvoice className="text-indigo-600" /> Delivery Note
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "edited_delivery_note")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaPenFancy className="text-purple-600" /> Edited Delivery Note
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  updateStatus(q._id, q.type, "email_sent")
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaEnvelope className="text-teal-600" /> Email Sent
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-gray-600 mt-3 gap-2">
        <span>
          Showing {quotations.length > 0 ? 1 : 0} to {quotations.length} of{" "}
          {quotations.length} entries
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-100 text-xs sm:text-sm">
            Previous
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100 text-xs sm:text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
