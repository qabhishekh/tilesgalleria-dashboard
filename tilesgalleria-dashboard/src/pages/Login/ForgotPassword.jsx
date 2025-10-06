import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/password/forgot`, { email });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Forgot Password?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          {msg && <p className="text-green-600 text-sm">{msg}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Remembered password?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
