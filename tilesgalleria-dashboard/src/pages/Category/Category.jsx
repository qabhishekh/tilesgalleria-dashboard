import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../config/api";

const Category = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Submit new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !image) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    try {
      await axios.post(`${API_BASE}/api/categories`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      setName("");
      setImage(null);
      setShowModal(false);
      setMessage("✅ Category Added Successfully!");
      fetchCategories();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding category:", err);
      setMessage("❌ Error adding category!");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          📦 Category
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold shadow"
        >
          ➕ Add Category
        </button>
      </div>

      {/* Message */}
      {message && (
        <p className="mb-3 font-semibold text-green-600">{message}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              <th className="px-4 py-3 text-left text-sm font-bold">#</th>
              <th className="px-4 py-3 text-left text-sm font-bold">
                CATEGORY NAME
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold">IMAGE</th>
              <th className="px-4 py-3 text-left text-sm font-bold">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <tr
                  key={cat._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
                  <td className="px-4 py-3">
                    <img
                      src={`${API_BASE}${cat.image}`}
                      alt={cat.name}
                      className="w-12 h-12 rounded-md object-cover border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-600 hover:text-black text-xl">
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-4 text-sm"
                >
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add Category</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                required
                className="w-full"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
