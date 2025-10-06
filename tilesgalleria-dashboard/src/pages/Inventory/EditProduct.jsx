import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProduct() {
  const { id } = useParams(); // product id from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    productType: "",
    size: "",
    texture: "",
    areaOfUsage: "",
    quantity: 0,
    boxes: 0,
    price: 0,
    taxRate: 0,
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch product by id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
        if (res.data.image) {
          setPreview(`http://localhost:8080/uploads/${res.data.image}`);
        }
      } catch (err) {
        setError("❌ Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });
      if (file) {
        formData.append("image", file);
      }

      await axios.put(`http://localhost:8080/api/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Product updated successfully");
      navigate("/inventory");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      alert("❌ Failed to update product");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">
          ✏️ Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Product Type</label>
              <input
                type="text"
                name="productType"
                value={form.productType}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Size</label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Texture</label>
              <input
                type="text"
                name="texture"
                value={form.texture}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Area of Usage</label>
              <input
                type="text"
                name="areaOfUsage"
                value={form.areaOfUsage}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Boxes</label>
              <input
                type="number"
                name="boxes"
                value={form.boxes}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price (AU$ )</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={form.taxRate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium">Product Image</label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded mb-3"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
