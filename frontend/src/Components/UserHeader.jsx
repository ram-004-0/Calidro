import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Headset, Menu, X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import UserChatbot from "./UserChatbot";
import axios from "axios";

const API_URL =
  "https://calidro-production.up.railway.app" || "http://localhost:5000";

const UserHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    address: "",
  });

  // Pulling Notification and Chat state from Context
  const {
    setIsChatOpen,
    isChatOpen,
    // Assuming these are in your ChatContext. If not, we define them below.
    adminNotifications = [],
    setAdminNotifications,
    hasAdminUnread,
    setHasAdminUnread,
  } = useChat();

  // Handle opening/closing notifications
  const handleToggleNotifications = () => {
    setIsNotifyOpen(!isNotifyOpen);
    if (!isNotifyOpen) {
      // Mark as read when opening the panel
      setHasAdminUnread(false);
    }
  };

  const handleOpenEditModal = async () => {
    setIsAccountOpen(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        username: res.data.username || "",
        email: res.data.email || "",
        phone_number: res.data.phone_number || "",
        address: res.data.address || "",
      });
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/user/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  const baseStyle =
    "block rounded-2xl px-3 py-2 text-base uppercase font-medium whitespace-nowrap transition-colors";
  const activeStyle = "bg-white/80 text-[#4a3733]";
  const inactiveStyle = "hover:bg-white/80 hover:text-[#4a3733]";

  const navLinks = [
    { path: "/userhome", label: "home" },
    { path: "/user-virtual-tour", label: "virtual tour" },
    { path: "/usergallery", label: "gallery" },
    { path: "/userbook", label: "book" },
  ];

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#433633] text-[#f4dfba] px-4 md:px-10">
        <div className="flex items-center justify-between h-20 md:h-24">
          <h2 className="text-3xl md:text-5xl font-imperialscript shrink-0">
            Calidro
          </h2>

          <div className="hidden lg:flex space-x-4 xl:space-x-10 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <Headset
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`cursor-pointer transition-transform hover:scale-110 ${isChatOpen ? "text-white" : ""}`}
            />

            {/* --- NOTIFICATION BELL --- */}
            <div className="relative">
              <div
                className="relative cursor-pointer transition-transform hover:scale-110"
                onClick={handleToggleNotifications}
              >
                <Bell size={24} />
                {hasAdminUnread && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#433633]" />
                )}
              </div>

              {isNotifyOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white shadow-xl rounded-2xl p-4 text-[#4a3733] z-50">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider">
                      Admin Alerts
                    </h3>
                    <button
                      onClick={() => setAdminNotifications([])}
                      className="text-[10px] text-gray-400 hover:text-red-500 font-bold"
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                    {adminNotifications.length > 0 ? (
                      adminNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="text-xs hover:bg-gray-50 p-2 rounded-lg cursor-default transition border-b border-gray-50 last:border-0"
                        >
                          <p className="font-medium">{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {n.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-center py-4 text-gray-400">
                        No new alerts
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- ACCOUNT ICON --- */}
            <div className="relative">
              <CircleUserRound
                className="cursor-pointer transition-transform hover:scale-110"
                size={24}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              />
              {isAccountOpen && (
                <div className="absolute right-0 mt-4 w-40 bg-white shadow-xl rounded-2xl p-3 text-sm z-50 text-[#4a3733]">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition font-medium"
                    onClick={handleOpenEditModal}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition font-medium text-red-600"
                    onClick={() => navigate("/login")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              className="lg:hidden p-1 text-[#f4dfba]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#433633] border-t border-white/10 p-5 space-y-4 shadow-2xl z-50">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#4a3733]">
                Edit Profile
              </h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleUpdateProfile}>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f4dfba] text-[#4a3733]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f4dfba] text-[#4a3733]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                    Phone (PH)
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f4dfba] text-[#4a3733]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f4dfba] text-[#4a3733] resize-none"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-wider hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-[#433633] text-[#f4dfba] rounded-2xl font-bold uppercase tracking-wider hover:bg-[#5a4a46] transition-all shadow-lg active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <UserChatbot />
    </>
  );
};

export default UserHeader;
