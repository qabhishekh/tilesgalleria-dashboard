import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddProducts() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    type: "",  // 🔹 पहले Tiles default था, अब dynamic आएगा
    texture: "",
    size: "",
    price: "",
    qty: "",
    boxes: "",
    image: null,
  });

  const [categories, setCategories] = useState([]); // 🔹 category list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // 🔑 token from login

  // 🔹 Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await axios.post("http://localhost:8080/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Product added: " + res.data.name);
      navigate("/products");
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "❌ Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
          Add Products
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <h3 className="text-xl font-semibold text-purple-700 border-l-4 border-purple-600 pl-3">
            Basic Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Name */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Product Name"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Product Type - Dropdown from categories */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Product Category <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Texture */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Texture <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="texture"
                value={form.texture}
                onChange={handleChange}
                placeholder="Enter Texture"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Size <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="Enter Size"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter Price"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="qty"
                value={form.qty}
                onChange={handleChange}
                placeholder="Enter Quantity"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Boxes */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                No. of Boxes <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="boxes"
                value={form.boxes}
                onChange={handleChange}
                placeholder="Enter No. of boxes"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block mb-1 font-medium text-gray-700">
                Product Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-red-600 font-medium">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              } text-white px-6 py-2 rounded-lg shadow-md transition`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
