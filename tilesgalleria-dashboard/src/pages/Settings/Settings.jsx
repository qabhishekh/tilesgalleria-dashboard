import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../config/api";
import {
  FaUserCog,
  FaBuilding,
  FaFileInvoice,
  FaUniversity,
} from "react-icons/fa";

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("account");

  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [company, setCompany] = useState({ companyName: "", companyEmail: "", phone: "", address: "" });
  const [invoice, setInvoice] = useState({ prefix: "", footerNote: "" });
  const [bank, setBank] = useState({ bankName: "", accountNumber: "", ifsc: "", branch: "" });

  // 🔐 redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  // Load settings
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    // Company / Invoice / Bank (already present)
    axios.get(`${API_BASE}/api/settings/company`, { headers })
      .then(res => setCompany(res.data || {})).catch(() => { });
    axios.get(`${API_BASE}/api/settings/invoice`, { headers })
      .then(res => setInvoice(res.data || {})).catch(() => { });
    axios.get(`${API_BASE}/api/settings/bank`, { headers })
      .then(res => setBank(res.data || {})).catch(() => { });

    // Load Account
    axios.get(`${API_BASE}/api/users/me`, { headers })
      .then(res => {
        const nameParts = (res.data.name || "").split(" ");
        setAccount({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: res.data.email || "",
          password: ""
        });
      })
      .catch(() => { });
  }, [token]);

  // Save helpers
  const saveAccount = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    await axios.put(`${API_BASE}/api/auth/update`, account, { headers });
    alert("✅ Account updated!");
  };

  const saveCompany = async () => {
    await axios.put(`${API_BASE}/api/settings/company`, company, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("✅ Company settings saved!");
  };

  const saveInvoice = async () => {
    await axios.put(`${API_BASE}/api/settings/invoice`, invoice, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("✅ Invoice settings saved!");
  };

  const saveBank = async () => {
    await axios.put(`${API_BASE}/api/settings/bank`, bank, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("✅ Bank settings saved!");
  };

  const menuItems = [
    { key: "account", label: "Account Settings", icon: <FaUserCog /> },
    { key: "company", label: "Company Settings", icon: <FaBuilding /> },
    { key: "invoice", label: "Invoice Settings", icon: <FaFileInvoice /> },
    { key: "bank", label: "Bank Settings", icon: <FaUniversity /> },
  ];

  return (
    <div className="p-6 flex gap-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg rounded-xl p-4">
        <h2 className="text-xl font-bold mb-6 text-gray-800">⚙️ Settings</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${activeTab === item.key
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-semibold border-l-4 border-purple-500"
                    : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white shadow-lg rounded-xl p-6">
        {/* Account Settings */}
        {activeTab === "account" && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-700">Account Settings</h3>

            {/* Upload Logo */}
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Upload new picture</label>
              <input type="file" accept=".jpg,.jpeg,.png,.svg" className="block w-full border rounded-lg p-2" />
              <p className="text-sm text-gray-500 mt-2">
                Logo should be minimum <b>152 × 152</b> | Supported formats: JPG, PNG, SVG
              </p>
            </div>

            {/* General Info */}
            <h4 className="text-md font-semibold text-purple-800 mb-4">General Information</h4>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name"
                value={account.firstName}
                onChange={(e) => setAccount({ ...account, firstName: e.target.value })}
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={account.lastName}
                onChange={(e) => setAccount({ ...account, lastName: e.target.value })}
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                className="border px-3 py-2 rounded-lg col-span-2"
              />
              <input
                type="password"
                placeholder="New Password (leave blank if unchanged)"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                className="border px-3 py-2 rounded-lg"
              />
            </form>

            {/* Buttons */}
            <div className="flex justify-end mt-6 gap-4">
              <button className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={saveAccount}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Company Settings */}
        {activeTab === "company" && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-700">🏢 Company Settings</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="companyName" value={company.companyName || ""} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} placeholder="Company Name" className="border px-3 py-2 rounded-lg" />
              <input name="companyEmail" value={company.companyEmail || ""} onChange={(e) => setCompany({ ...company, companyEmail: e.target.value })} placeholder="Company Email" className="border px-3 py-2 rounded-lg" />
              <input name="phone" value={company.phone || ""} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="Phone Number" className="border px-3 py-2 rounded-lg" />
              <input name="address" value={company.address || ""} onChange={(e) => setCompany({ ...company, address: e.target.value })} placeholder="Address" className="border px-3 py-2 rounded-lg col-span-2" />
            </form>
            <div className="flex justify-end mt-6">
              <button onClick={saveCompany} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
                Save Company
              </button>
            </div>
          </div>
        )}

        {/* Invoice Settings */}
        {activeTab === "invoice" && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-700">🧾 Invoice Settings</h3>
            <form className="space-y-4">
              <input name="prefix" value={invoice.prefix || ""} onChange={(e) => setInvoice({ ...invoice, prefix: e.target.value })} placeholder="Invoice Prefix" className="border px-3 py-2 rounded-lg w-full" />
              <input name="footerNote" value={invoice.footerNote || ""} onChange={(e) => setInvoice({ ...invoice, footerNote: e.target.value })} placeholder="Invoice Footer Note" className="border px-3 py-2 rounded-lg w-full" />
            </form>
            <div className="flex justify-end mt-6">
              <button onClick={saveInvoice} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
                Save Invoice
              </button>
            </div>
          </div>
        )}

        {/* Bank Settings */}
        {activeTab === "bank" && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-700">🏦 Bank Settings</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="bankName" value={bank.bankName || ""} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} placeholder="Bank Name" className="border px-3 py-2 rounded-lg" />
              <input name="accountNumber" value={bank.accountNumber || ""} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} placeholder="Account Number" className="border px-3 py-2 rounded-lg" />
              <input name="ifsc" value={bank.ifsc || ""} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} placeholder="IFSC Code" className="border px-3 py-2 rounded-lg" />
              <input name="branch" value={bank.branch || ""} onChange={(e) => setBank({ ...bank, branch: e.target.value })} placeholder="Branch Name" className="border px-3 py-2 rounded-lg" />
            </form>
            <div className="flex justify-end mt-6">
              <button onClick={saveBank} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
                Save Bank
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
