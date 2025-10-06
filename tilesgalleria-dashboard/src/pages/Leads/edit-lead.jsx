import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditLead() {
  const { id } = useParams(); // URL से leadId लेना
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Lead Data
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (err) {
        alert("❌ Failed to load lead");
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id, token]);

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      await axios.patch(`http://localhost:8080/api/leads/${id}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Lead updated successfully");
      navigate("/leads");
    } catch (err) {
      console.error("Update lead error", err.response?.data || err.message);
      alert("❌ Failed to update lead");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
          ✏️ Edit Lead
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Company / Customer Name"
              required
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Mobile No."
              required
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              name="altPhone"
              value={form.altPhone || ""}
              onChange={handleChange}
              placeholder="Alternate Mobile No."
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Customer Email"
              className="border rounded-lg px-3 py-2"
            />
            <textarea
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Customer Address"
              className="border rounded-lg px-3 py-2 md:col-span-2"
            />
            <select
              name="status"
              value={form.status}
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
            value={form.notes || ""}
            onChange={handleChange}
            rows="4"
            placeholder="Description / Notes"
            className="w-full border rounded-lg px-3 py-2"
          />

          <div>
            <label className="block font-medium mb-1">Attachment</label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
            {form.attachment && typeof form.attachment === "string" && (
              <p className="text-sm text-blue-600 mt-1">
                Current:{" "}
                <a
                  href={`http://localhost:8080/uploads/${form.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Attachment
                </a>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
