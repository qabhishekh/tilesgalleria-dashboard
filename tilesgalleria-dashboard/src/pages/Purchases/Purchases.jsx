import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaEye,
  FaTimesCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlus,
} from "react-icons/fa";

export default function Purchases() {
  const [openModal, setOpenModal] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Pre Purchase form state
  const [preForm, setPreForm] = useState({
    vendor_name: "",
    amount: "",
    advance: "",
    description: "",
    productType: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch purchases from backend
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/purchases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPurchases(res.data);
      } catch (err) {
        console.error("Error fetching purchases", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [token]);

  // 🔹 Delete purchase
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases((prev) => prev.filter((p) => p._id !== id));
      alert("✅ Purchase deleted successfully!");
    } catch (err) {
      console.error("Delete error", err.response?.data || err.message);
      alert("❌ Failed to delete purchase");
    }
  };

  // 🔹 Handle Pre Purchase input
  const handlePreChange = (e) => {
    setPreForm({ ...preForm, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Pre Purchase submit
  const handlePreSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/prepurchases",
        preForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Pre Purchase added successfully!");
      setPreForm({
        vendor_name: "",
        amount: "",
        advance: "",
        description: "",
        productType: "",
      });
      setOpenModal(null);
      console.log("Saved Pre Purchase:", res.data);
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert("❌ Failed to save pre purchase");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
        <h2 className="text-2xl font-bold text-indigo-900">🛒 Purchases</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/add-purchases")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow transition text-sm sm:text-base"
          >
            <FaPlus /> New Purchase
          </button>

          <button
            onClick={() => setOpenModal("prePurchase")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition text-sm sm:text-base"
          >
            <FaPlus /> Add Pre Purchase
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <tr>
              {[
                "Sr. No.",
                "Purchase No.",
                "Vendor/Company",
                "Product Type", // ✅ Added
                "Total",
                "Paid",
                "Balance",
                "Invoice Date",
                "Attachment",
                "Status",
                "Action",
              ].map((head, i) => (
                <th key={i} className="px-4 py-2 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="text-center text-purple-900 py-6 font-medium"
                >
                  No data available in table
                </td>
              </tr>
            ) : (
              purchases.map((p, i) => (
                <tr key={p._id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{p.purchaseNo || "-"}</td>
                  <td className="px-4 py-2">{p.vendor?.name || "-"}</td>
                  <td className="px-4 py-2">
                    {p.productType || (p.items && p.items.length > 0 ? p.items[0].productType : "-")}
                  </td>

                  <td className="px-4 py-2 text-center font-medium text-green-700">
                    AU$ {p.grandTotal}
                  </td>
                  <td className="px-4 py-2 text-center">AU$ {p.advance}</td>
                  <td className="px-4 py-2 text-center">AU$ {p.balance}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.attachFile ? (
                      <a
                        href={`http://localhost:8080/uploads/${p.attachFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${p.balance === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {p.balance === 0 ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center relative">
                    <div className="inline-block">
                      {/* 3 Dots Button */}
                      <button
                        onClick={() =>
                          setOpenModal(openModal === p._id ? null : p._id)
                        }
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        ⋮
                      </button>

                      {/* Dropdown */}
                      {openModal === p._id && (
                        <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-50 w-max min-w-[150px]">
                          <ul className="py-1 text-sm text-gray-700">
                            <li>
                              <button
                                onClick={() =>
                                  navigate(`/edit-purchase/${p._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaEdit className="text-indigo-600" /> Edit
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  navigate(`/view-purchase/${p._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaEye className="text-blue-600" /> View
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left"
                              >
                                <FaTimesCircle className="text-red-600" /> Cancel
                              </button>
                            </li>
                            <li>
                              <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left">
                                <FaCheckCircle className="text-green-600" /> Paid
                              </button>
                            </li>
                            <li>
                              <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left">
                                <FaHourglassHalf className="text-yellow-600" /> Due
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

      {/* 🔹 Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 mt-3">
        <span>
          Showing {purchases.length > 0 ? 1 : 0} to {purchases.length} of{" "}
          {purchases.length} entries
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-100">
            Previous
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>

      {/* 🔹 Add Pre Purchase Modal */}
      {openModal === "prePurchase" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center bg-gray-50 border-b px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                Add Pre Purchase
              </h3>
              <button
                onClick={() => setOpenModal(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handlePreSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    name="vendor_name"
                    value={preForm.vendor_name}
                    onChange={handlePreChange}
                    placeholder="Enter Vendor Name"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={preForm.amount}
                    onChange={handlePreChange}
                    placeholder="Enter Amount"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Product Type
                  </label>
                  <input
                    type="text"
                    name="productType"
                    value={preForm.productType}
                    onChange={handlePreChange}
                    placeholder="Enter Product Type"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Advance
                  </label>
                  <input
                    type="number"
                    name="advance"
                    value={preForm.advance}
                    onChange={handlePreChange}
                    placeholder="Enter Advance"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={preForm.description}
                  onChange={handlePreChange}
                  rows="5"
                  placeholder="Description"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700"
                >
                  Add Pre Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
