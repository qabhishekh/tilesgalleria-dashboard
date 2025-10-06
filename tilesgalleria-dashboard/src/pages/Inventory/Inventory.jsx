import { useState, useEffect } from "react";
import {
  FaPlus,
  FaUpload,
  FaFileImport,
  FaFileExport,
  FaEllipsisV,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        setError("❌ Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);


  // 🔹 Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      alert("✅ Product deleted");
    } catch (err) {
      alert("❌ Failed to delete product");
    }
  };

  // 🔹 Stock update open
  const openStockModal = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleStockUpdate = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const productId = form.get("productId");   // ✅ yahi id use karna hai
  const updateType = form.get("updateType");
  const qty = parseInt(form.get("qty") || 0);
  const boxes = parseInt(form.get("boxes") || 0);

  const product = products.find((p) => p._id === productId);
  if (!product) {
    alert("❌ Please select a product");
    return;
  }

  let newQty = product.quantity;
  let newBoxes = product.boxes;

  if (updateType === "add") {
    newQty += qty;
    newBoxes += boxes;
  } else if (updateType === "remove") {
    newQty -= qty;
    newBoxes -= boxes;
    if (newQty < 0) newQty = 0;
    if (newBoxes < 0) newBoxes = 0;
  }

  try {
    const res = await axios.put(
      `${API_BASE}/api/products/${productId}`,   // ✅ fixed
      { quantity: newQty, boxes: newBoxes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProducts(products.map((p) => (p._id === res.data._id ? res.data : p)));
    alert("✅ Stock updated");
    setShowStockModal(false);
  } catch (err) {
    console.error("Update error:", err.response?.data || err.message);
    alert("❌ Failed to update stock");
  }
};


  // 🔹 Bulk Import
  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("❌ Please upload CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile); // 👈 must match backend multer field name

    try {
      await axios.post(`${API_BASE}/api/products/bulk/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Products imported successfully");
      setShowImportModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Bulk Import Error:", err.response?.data || err.message);
      alert("❌ Bulk import failed");
    }
  };

  // 🔹 Bulk Export
  const handleBulkExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products/bulk/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("❌ Bulk export failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-3xl font-extrabold text-gray-800">📦 Inventory</h2>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/add-products")}
              className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow transition text-sm sm:text-base"
            >
              <FaPlus /> Add Tiles Product
            </button>

            <button
              onClick={() => {
                setSelectedProduct({ name: "Select Product", quantity: 0, boxes: 0 });
                setShowStockModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition text-sm sm:text-base"
            >
              <FaUpload /> Update Stock
            </button>


            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition text-sm sm:text-base"
            >
              <FaFileImport /> Bulk Import
            </button>

            <button
              onClick={handleBulkExport}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition text-sm sm:text-base"
            >
              <FaFileExport /> Bulk Export
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
                  "Product Name",
                  "Size",
                  "Texture",
                  "Product Type",
                  "Quantity",
                  "Price",
                  "Image",   // ✅ added image column
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
              {products.map((p, i) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.size}</td>
                  <td className="px-4 py-2">{p.texture || "-"}</td>
                  <td className="px-4 py-2 text-green-700 font-medium">
                    {p.productType}
                  </td>
                  <td className="px-4 py-2">{p.quantity}</td>
                  <td className="px-4 py-2">AU$ {p.price}</td>
                  {/* ✅ Image cell */}
                  <td className="px-4 py-2">
                    {p.image ? (
                      <img
                        src={p.image ? `${API_BASE}/uploads/${p.image}` : "https://placehold.co/35x35?text=No+Img"}
                        alt={p.name}
                        className="h-12 w-12 object-cover rounded"
                      />

                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center relative">
                    <details className="inline-block">
                      <summary className="list-none cursor-pointer p-2 hover:bg-gray-100 rounded-full inline-flex">
                        <FaEllipsisV />
                      </summary>
                      <div className="absolute right-6 mt-1 bg-white border rounded-lg shadow-md w-32 z-10">
                        <button
                          onClick={() => navigate(`/edit-product/${p._id}`)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          🗑 Delete
                        </button>
                        <button
                          onClick={() => openStockModal(p)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          📦 Stock
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowStockModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 border-b pb-2">
              📦 Update Stock
            </h2>

            <form onSubmit={handleStockUpdate} className="space-y-5">
              {/* Product Dropdown */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Select Product
                </label>
                <select
                  name="productId"
                  value={selectedProduct?._id || ""}
                  onChange={(e) => {
                    const product = products.find((p) => p._id === e.target.value);
                    setSelectedProduct(product || null);
                  }}
                  className="w-full border px-3 py-2 rounded-lg"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Update Type */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Stock Update Type
                </label>
                <select
                  name="updateType"
                  className="w-full border px-3 py-2 rounded-lg"
                  defaultValue="add"
                >
                  <option value="add">Add</option>
                  <option value="remove">Remove</option>
                </select>
              </div>

              {/* Current Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Current Quantity
                  </label>
                  <input
                    type="text"
                    value={selectedProduct?.quantity || 0}
                    readOnly
                    className="w-full border px-3 py-2 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Current Boxes
                  </label>
                  <input
                    type="text"
                    value={selectedProduct?.boxes || 0}
                    readOnly
                    className="w-full border px-3 py-2 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              {/* Update Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Update Quantity
                  </label>
                  <input
                    type="number"
                    name="qty"
                    defaultValue={0}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Update Boxes
                  </label>
                  <input
                    type="number"
                    name="boxes"
                    defaultValue={0}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
