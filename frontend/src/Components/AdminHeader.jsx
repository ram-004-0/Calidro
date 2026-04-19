import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Headset, Menu, X, Users } from "lucide-react";
import { useChat } from "../context/ChatContext";
import AdminChat from "./AdminChat";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  // Pull global state from ChatContext
  const {
    setIsChatOpen,
    isChatOpen,
    hasAdminUnread,
    setHasAdminUnread,
    adminNotifications = [],
    setAdminNotifications,
    userList = [],
    activeRoom,
    joinSupportRoom,
  } = useChat();

  const baseStyle =
    "block rounded-2xl px-3 py-2 text-base uppercase font-medium whitespace-nowrap transition-colors";
  const activeStyle = "bg-white/80 text-[#4a3733]";
  const inactiveStyle = "hover:bg-white/80 hover:text-[#4a3733]";

  // --- NEW: Toggle Notification Logic ---
  const handleToggleNotifications = () => {
    setIsNotifyOpen(!isNotifyOpen);
    setIsAccountOpen(false); // Close account menu if notifications are opened

    // Clear the unread red dot when the panel is opened
    if (!isNotifyOpen) {
      setHasAdminUnread(false);
    }
  };

  const navLinks = [
    { path: "/admin-overview", label: "overview" },
    { path: "/admin-home", label: "home" },
    { path: "/admin-gallery", label: "gallery" },
    { path: "/admin-book", label: "book" },
    { path: "/admin-reports", label: "reports" },
  ];

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#433633] text-[#f4dfba] px-4 md:px-10">
        <div className="flex items-center justify-between h-20 md:h-24">
          <h2 className="text-4xl md:text-5xl font-imperialscript shrink-0">
            Calidro
          </h2>

          <div className="hidden lg:flex space-x-4 xl:space-x-8 items-center">
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
            {/* 1. Chat/Headset Logic */}
            <div className="relative">
              <Headset
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`cursor-pointer transition-transform hover:scale-110 ${isChatOpen ? "text-white" : ""}`}
              />
              {/* Note: In ChatContext, ensure you have a separate check for Chat unread if desired */}
            </div>

            {/* 2. Notification Bell (Exactly like UserHeader) */}
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

            {/* 3. Account Settings */}
            <div className="relative">
              <CircleUserRound
                className="cursor-pointer transition-transform hover:scale-110"
                size={24}
                onClick={() => {
                  setIsAccountOpen(!isAccountOpen);
                  setIsNotifyOpen(false);
                }}
              />
              {isAccountOpen && (
                <div className="absolute right-0 mt-4 w-40 bg-white shadow-xl rounded-2xl p-3 text-sm z-50 text-[#4a3733]">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition font-medium text-red-600"
                    onClick={() => {
                      setIsAccountOpen(false);
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-1 text-[#f4dfba]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
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

      {/* Admin Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-5 right-5 z-[100] w-[350px] md:w-[450px] h-[550px] shadow-2xl rounded-3xl overflow-hidden border border-gray-200 bg-white flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-gray-50 border-b p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#4a3733] uppercase tracking-widest">
                <Users size={14} /> Active Inquiries
              </div>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                size={18}
                onClick={() => setIsChatOpen(false)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {userList.length > 0 ? (
                userList.map((id) => (
                  <button
                    key={id}
                    onClick={() => joinSupportRoom(id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border ${
                      activeRoom === id
                        ? "bg-[#4a3733] text-white border-[#4a3733]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    Client {id.substring(0, 4)}
                  </button>
                ))
              ) : (
                <span className="text-[10px] text-gray-400 italic">
                  Waiting for users...
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeRoom ? (
              <AdminChat />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 p-10 text-center">
                <Headset size={48} className="mb-4 opacity-10" />
                <p className="text-xs uppercase font-bold tracking-widest leading-relaxed">
                  Select a client session <br /> to begin support
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
