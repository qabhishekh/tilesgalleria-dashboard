import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaFileInvoice,
  FaClipboardList,
  FaBoxes,
  FaTruck,
  FaShoppingCart,
  FaCog,
  FaSignOutAlt,
  FaAddressBook,
  FaPeopleArrows,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Sidebar({ open, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("✅ Logged out successfully 👋");
    setShowLogoutModal(false);
    navigate("/");
  };

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: <FaClipboardList />, color: "text-blue-600" },
    { name: "Quotations", path: "/quotations", icon: <FaFileInvoice />, color: "text-green-600" },
    { name: "Delivery Note", path: "/delivery-note", icon: <FaTruck />, color: "text-orange-600" },
    { name: "Invoices", path: "/invoices", icon: <FaFileInvoice />, color: "text-purple-600" },
    { name: "Purchases", path: "/purchases", icon: <FaShoppingCart />, color: "text-pink-600" },
    { name: "Pre Purchases", path: "/pre-purchases", icon: <FaShoppingCart />, color: "text-yellow-600" },
    { name: "Inventory", path: "/inventory", icon: <FaBoxes />, color: "text-indigo-600" },
    { name: "Category", path: "/category", icon: <FaBoxes />, color: "text-indigo-600" },
    { name: "Customers", path: "/customers", icon: <FaUser />, color: "text-red-600" },
    { name: "Shipping Address", path: "/shipping-address", icon: <FaAddressBook />, color: "text-sky-600" },
    { name: "Vendors", path: "/vendors", icon: <FaTruck />, color: "text-teal-600" },
    { name: "Expenses", path: "/expenses", icon: <FaClipboardList />, color: "text-lime-600" },
    { name: "Leads", path: "/leads", icon: <FaPeopleArrows />, color: "text-rose-600" },
    { name: "Settings", path: "/settings", icon: <FaCog />, color: "text-gray-700" },
    { name: "Logout", icon: <FaSignOutAlt />, color: "text-black" },
  ];

  return (
    <>
      {/* 🖥️ Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col h-screen bg-gradient-to-b from-[#fff8e1] via-[#ffe082] to-[#ffb300]
        p-2 duration-300 ${open ? "w-64" : "w-16"}`}
      >
        {/* 🔹 Logo Section with Soft Shadow */}
        <div className="flex items-center justify-center my-4">
          <div
            className={`rounded-full p-1 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.35)] transition-all duration-300 ${
              open ? "w-24 h-24" : "w-12 h-12"
            } flex items-center justify-center`}
          >
            <img
              src="/images/logos/tiles-logo.png"
              alt="logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* 🔹 Menu Section */}
        <ul className="text-gray-800 flex-1 space-y-1.5 px-1">
          {menus.map((menu, i) => (
            <li key={i}>
              {menu.name === "Logout" ? (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-3 p-2 w-full text-left rounded-md hover:bg-[#fff3cd] hover:shadow-md text-gray-700 transition-all"
                >
                  <span className={menu.color}>{menu.icon}</span>
                  {open && <span className="text-sm font-medium">{menu.name}</span>}
                </button>
              ) : (
                <Link
                  to={menu.path}
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-all
                    ${
                      location.pathname === menu.path
                        ? "bg-[#ffecb3] shadow-md text-[#f57f17]"
                        : "hover:bg-[#fff3cd] hover:shadow-md text-gray-700"
                    }`}
                >
                  <span className={menu.color}>{menu.icon}</span>
                  {open && <span>{menu.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 📱 Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#fff8e1] via-[#ffe082] to-[#ffb300]
        p-3 pt-6 duration-300 flex flex-col z-40
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.35)] p-1">
            <img
              src="/images/logos/tiles-logo.png"
              alt="logo"
              className="w-16 h-16 rounded-full object-contain"
            />
          </div>
          <button
            className="bg-[#fff3cd] p-2 rounded-md"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        <ul className="text-gray-800 flex-1 space-y-1.5">
          {menus.map((menu, i) => (
            <li key={i}>
              {menu.name === "Logout" ? (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-3 p-2 w-full text-left rounded-md hover:bg-[#fff3cd] hover:shadow-md text-gray-700 transition-all"
                >
                  <span className={menu.color}>{menu.icon}</span>
                  <span className="text-sm font-medium">{menu.name}</span>
                </button>
              ) : (
                <Link
                  to={menu.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-all
                    ${
                      location.pathname === menu.path
                        ? "bg-[#ffecb3] shadow-md text-[#f57f17]"
                        : "hover:bg-[#fff3cd] hover:shadow-md text-gray-700"
                    }`}
                >
                  <span className={menu.color}>{menu.icon}</span>
                  <span>{menu.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 🚪 Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure you want to logout?
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              You will be redirected to the login page.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
