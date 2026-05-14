import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Headset, Menu, X, Users } from "lucide-react";
import { useChat } from "../context/ChatContext";
import AdminChat from "./AdminChat";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [selectedNotifs, setSelectedNotifs] = useState([]);

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

  const handleToggleNotifications = () => {
    setIsNotifyOpen(!isNotifyOpen);
    setIsAccountOpen(false);
    if (!isNotifyOpen) {
      setHasAdminUnread(false);
    }
  };

  const handleSelectNotif = (notifId) => {
    if (selectedNotifs.includes(notifId)) {
      setSelectedNotifs(selectedNotifs.filter((id) => id !== notifId));
    } else {
      setSelectedNotifs([...selectedNotifs, notifId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifs.length === adminNotifications.length) {
      setSelectedNotifs([]);
    } else {
      const allIds = adminNotifications.map((n) => n.notif_id || n.id);
      setSelectedNotifs(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifs.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/notifications/delete-selected`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { notifIds: selectedNotifs },
      });

      const remainingNotifs = adminNotifications.filter(
        (n) => !selectedNotifs.includes(n.notif_id || n.id),
      );

      setAdminNotifications(remainingNotifs);
      setSelectedNotifs([]);

      const hasUnread = remainingNotifs.some(
        (n) => n.is_read === 0 || n.is_read === false,
      );
      setHasAdminUnread(hasUnread);

      alert("Notifications updated successfully!");
    } catch (err) {
      console.error("Failed to delete notifications:", err);
      alert("Failed to sync deletion with server.");
    }
  };

  // Fetch Logic (Matches UserHeader pattern)
  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        // Adjust endpoint if admin notifications use a different path
        const response = await axios.get(`${API_URL}/api/notifications/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(response.data) ? response.data : [];
        setAdminNotifications(data);

        const hasUnread = data.some(
          (n) => n.is_read === 0 || n.is_read === false,
        );
        setHasAdminUnread(hasUnread);
      } catch (err) {
        console.error("Error fetching admin notifications:", err);
      }
    };

    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 5000);
    return () => clearInterval(interval);
  }, [setAdminNotifications, setHasAdminUnread]);

  const baseStyle =
    "block rounded-2xl px-3 py-2 text-base uppercase font-medium whitespace-nowrap transition-colors";
  const activeStyle = "bg-white/80 text-[#4a3733]";
  const inactiveStyle = "hover:bg-white/80 hover:text-[#4a3733]";

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
            <div className="relative">
              <Headset
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`cursor-pointer transition-transform hover:scale-110 ${isChatOpen ? "text-white" : ""}`}
              />
            </div>

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
                <div className="absolute right-0 mt-4 w-72 bg-white shadow-xl rounded-2xl p-4 text-[#4a3733] z-50">
                  <div className="flex flex-col gap-2 border-b pb-2 mb-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm uppercase tracking-wider">
                        Notifications
                      </h3>
                      {selectedNotifs.length > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded"
                        >
                          <Trash2 size={10} /> DELETE ({selectedNotifs.length})
                        </button>
                      )}
                    </div>
                    {adminNotifications.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
                        <input
                          type="checkbox"
                          checked={
                            adminNotifications.length > 0 &&
                            selectedNotifs.length === adminNotifications.length
                          }
                          onChange={handleSelectAll}
                          className="accent-[#433633] cursor-pointer"
                        />
                        <span>Select All</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                    {adminNotifications.length > 0 ? (
                      adminNotifications.map((n) => (
                        <div
                          key={n.notif_id || n.id}
                          className={`p-2 rounded-xl border-b last:border-0 transition flex items-start gap-2.5 ${
                            n.is_read ? "bg-white" : "bg-blue-50/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNotifs.includes(
                              n.notif_id || n.id,
                            )}
                            onChange={() =>
                              handleSelectNotif(n.notif_id || n.id)
                            }
                            className="mt-1 accent-[#433633] cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-[11px] leading-tight">
                              {n.message || n.text}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {n.time ||
                                (n.created_at
                                  ? new Date(n.created_at).toLocaleDateString()
                                  : "")}
                            </p>
                          </div>
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
