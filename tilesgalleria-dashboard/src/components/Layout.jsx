import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import logo from "../assets/logos/tiles-logo.png";

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else if (localStorage.getItem("justLoggedIn") === "true") {
      const user = JSON.parse(localStorage.getItem("user"));
      toast.success(`Welcome back, ${user?.name || "User"} 🎉`, {
        position: "top-right",
      });
      localStorage.removeItem("justLoggedIn");
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
        {/* Topbar */}
        <div className="flex justify-between items-center bg-white p-4 shadow-md sticky top-0 z-20">
          {/* Toggle Button */}
          <button
            className="bg-amber-600 text-white p-2 rounded-md hover:bg-amber-700 transition"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(!mobileOpen);
              } else {
                setOpen(!open);
              }
            }}
          >
            {window.innerWidth < 768
              ? mobileOpen
                ? <FaTimes size={18} />
                : <FaBars size={18} />
              : open
              ? <FaTimes size={18} />
              : <FaBars size={18} />}
          </button>

          {/* Right User Info */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="font-medium text-gray-700">{user?.name || "User"}</span>
            <img
              src={user?.avatar || logo}
              alt="user"
              className="w-10 h-10 rounded-full border shadow-sm object-cover"
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
