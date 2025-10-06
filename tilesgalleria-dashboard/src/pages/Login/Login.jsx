import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE } from "../../config/api";

export default function Login() {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("✅ Login Successful!");
      window.location.href = "/dashboard"; 
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Glass Card */}
      <div className="w-full max-w-md backdrop-blur-lg bg-white/50 border border-white/30 rounded-3xl shadow-2xl p-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/assets/logos/tiles-logo.png"
            alt="Company Logo"
            className="h-45 w-45 object-contain  drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-black drop-shadow">
            Welcome Back
          </h2>
          <p className="text-black text-sm">Login to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Username or Email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-200 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-white/80 hover:text-white underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
