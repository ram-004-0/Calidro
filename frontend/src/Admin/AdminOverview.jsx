import React, { useState } from "react";
import AdminHeader from "../Components/AdminHeader";
import OverviewVirtualTour from "../Admin Overview/OverviewVirtualTour";
import OverviewAboutUs from "../Admin Overview/OverviewAboutUs";
import OverviewEvents from "../Admin Overview/OverviewEvents";
import OverviewBook from "../Admin Overview/OverviewBook";
import OverviewContact from "../Admin Overview/OverviewContact";
import { ChevronDown, ChevronUp } from "lucide-react";

const AdminOverview = () => {
  const [activeTab, setActiveTab] = useState("overview-virtualTour");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMobileView = () => {
    return window.innerWidth < 1024;
  };

  const tabLabels = {
    "overview-virtualTour": "Virtual Tour",
    "overview-aboutUs": "About Us",
    "overview-events": "Previous Events",
    "overview-book": "Book",
    "overview-contact": "Contact",
  };

  const getButtonClass = (tabName) => {
    const baseClass = isMobileView()
      ? "text-left px-4 py-3 rounded-xl transition font-semibold uppercase text-sm w-full"
      : "text-left px-4 py-3 rounded-xl transition font-semibold uppercase text-sm";

    const activeClass = "bg-[#4a3733] text-white";
    const inactiveClass = "text-[#4a3733] hover:bg-[#e7d8cf]";

    return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col">
      <AdminHeader />

      <section
        className={`relative pb-2 w-full ${isMobileView() ? "px-4" : ""}`}
      >
        <div
          className={`max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl flex ${
            isMobileView()
              ? "flex-col h-[600px] relative"
              : "h-[600px] overflow-hidden"
          }`}
        >
          {/* ---------------- SIDE BAR ---------------- */}
          <div
            className={`bg-[#efe7e3] p-6 flex flex-col shrink-0 ${
              isMobileView()
                ? "w-full border-b border-[#e7d8cf] z-20 rounded-t-3xl"
                : "w-64 rounded-tl-3xl rounded-bl-3xl"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer select-none`}
              onClick={() => isMobileView() && setIsSidebarOpen(!isSidebarOpen)}
            >
              <h2
                className={`font-bold text-[#4a3733] tracking-wide ${isMobileView() ? "text-lg" : "text-2xl mb-6"}`}
              >
                {isMobileView()
                  ? `OVERVIEW: ${tabLabels[activeTab]}`
                  : "OVERVIEW"}
              </h2>

              {isMobileView() && (
                <div className="text-[#4a3733]">
                  {isSidebarOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              )}
            </div>

            {/* Mobile Dropdown Overlay */}
            {isMobileView() && isSidebarOpen && (
              <div className="absolute top-[72px] left-0 w-full bg-[#efe7e3] p-4 border-b border-[#e7d8cf] shadow-xl z-50 rounded-b-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col gap-2">
                  {Object.keys(tabLabels).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={getButtonClass(tab)}
                    >
                      {tabLabels[tab]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Sidebar Always Visible */}
            {!isMobileView() && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("overview-virtualTour")}
                  className={getButtonClass("overview-virtualTour")}
                >
                  Virtual Tour
                </button>
                <button
                  onClick={() => setActiveTab("overview-aboutUs")}
                  className={getButtonClass("overview-aboutUs")}
                >
                  About Us
                </button>
                <button
                  onClick={() => setActiveTab("overview-events")}
                  className={getButtonClass("overview-events")}
                >
                  Previous Events
                </button>
                <button
                  onClick={() => setActiveTab("overview-book")}
                  className={getButtonClass("overview-book")}
                >
                  Book
                </button>
                <button
                  onClick={() => setActiveTab("overview-contact")}
                  className={getButtonClass("overview-contact")}
                >
                  Contact
                </button>
              </div>
            )}
          </div>

          {/* ---------------- CONTENT AREA ---------------- */}
          <div
            className={`flex-1 ${isMobileView() ? "p-4 overflow-y-auto" : "p-8 overflow-y-auto"}`}
          >
            {activeTab === "overview-virtualTour" && <OverviewVirtualTour />}
            {activeTab === "overview-aboutUs" && <OverviewAboutUs />}
            {activeTab === "overview-events" && <OverviewEvents />}
            {activeTab === "overview-book" && <OverviewBook />}
            {activeTab === "overview-contact" && <OverviewContact />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;
