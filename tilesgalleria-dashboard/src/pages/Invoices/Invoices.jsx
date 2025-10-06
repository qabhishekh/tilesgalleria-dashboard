import { useState, useEffect } from "react";
import {
  FaEllipsisV,
  FaEdit,
  FaEye,
  FaEnvelope,
  FaWindowClose,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function Invoices() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔹 Fetch Both Invoices + ManualInvoices
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [normalRes, manualRes] = await Promise.all([
          axios.get(`${API_BASE}/api/invoices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/manualinvoices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Merge & mark type
        const merged = [
          ...normalRes.data.map((inv) => ({ ...inv, type: "normal" })),
          ...manualRes.data.map((inv) => ({ ...inv, type: "manual" })),
        ];

        // sort by date (latest first)
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAllInvoices(merged);
      } catch (err) {
        console.error("❌ Failed to load invoices", err);
      }
    };
    fetchAll();
  }, [token]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // 🔹 Update Invoice Status
  const updateStatus = async (id, status, type) => {
    try {
      const url =
        type === "manual"
          ? `${API_BASE}/api/manualinvoices/${id}`
          : `${API_BASE}/api/invoices/${id}`;

      await axios.put(
        url,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllInvoices(
        allInvoices.map((inv) =>
          inv._id === id ? { ...inv, status } : inv
        )
      );
    } catch (err) {
      console.error("❌ Failed to update status", err);
    }
  };

  const cancelInvoice = async (id, type) => {
    try {
      const url =
        type === "manual"
          ? `${API_BASE}/api/manualinvoices/${id}`
          : `${API_BASE}/api/invoices/${id}`;

      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });

      setAllInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("❌ Failed to cancel invoice", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        {/* 🔹 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
            📑 All Invoices
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/create-invoice")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow transition text-sm sm:text-base"
            >
              <FaPlus /> New Invoice
            </button>
            <button
              onClick={() => navigate("/create-invoice-manual")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow transition text-sm sm:text-base"
            >
              <FaPlus /> New Manual Invoice
            </button>
          </div>
        </div>


        {/* 🔹 Table */}
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                {[
                  "Sr. No",
                  "Invoice No",
                  "Customer",
                  "Product Name",
                  "Category",
                  "Type",
                  "Total",
                  "Invoice Date",
                  "Status",
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
              {allInvoices.map((inv, idx) => (
                <tr
                  key={inv._id}
                  className="border-t hover:bg-gray-50 transition relative"
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{inv.invoiceNo}</td>

                  {/* ✅ Customer */}
                  <td className="px-4 py-2">
                    {inv.customerName || inv.customer?.name || "N/A"}
                  </td>

                  {/* ✅ Product Name */}
                  <td className="px-4 py-2">
                    {inv.items?.length
                      ? inv.items
                        .map(
                          (it) =>
                            it.productName || it.product?.name || "—"
                        )
                        .join(", ")
                      : "—"}
                  </td>

                  {/* ✅ Category */}
                  <td className="px-4 py-2">
                    {inv.items?.[0]?.category ||
                      inv.items?.[0]?.product?.category ||
                      inv.items?.[0]?.productType ||
                      "—"}
                  </td>


                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${inv.type === "manual"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-green-700 font-semibold">
                    AU$ {inv.grandTotal?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() => toggleDropdown(inv._id)}
                    >
                      <FaEllipsisV />
                    </button>

                    {/* Dropdown */}
                    {openDropdown === inv._id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10">
                        <ul className="py-1 text-gray-700">
                          <li
                            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                inv.type === "manual"
                                  ? `/edit-manual-invoice/${inv._id}`
                                  : `/edit-invoice/${inv._id}`
                              );
                              setOpenDropdown(null);
                            }}
                          >
                            <FaEdit /> Edit
                          </li>


                          <li
                            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() =>
                              navigate(
                                inv.type === "manual"
                                  ? `/view-manual-invoice/${inv._id}`
                                  : `/view-invoice/${inv._id}`
                              )
                            }
                          >
                            <FaEye /> View
                          </li>
                          <li
                            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelInvoice(inv._id, inv.type);
                              setOpenDropdown(null);
                            }}
                          >
                            <FaWindowClose /> Cancel
                          </li>

                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => updateStatus(inv._id, "paid", inv.type)}
                          >
                            ✅ Paid
                          </li>
                          {inv.status !== "unpaid" && (
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => updateStatus(inv._id, "unpaid", inv.type)}
                            >
                              ⏳ Due
                            </li>
                          )}
                          <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer">
                            <FaEnvelope /> Send Email
                          </li>
                        </ul>
                      </div>
                    )}


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
