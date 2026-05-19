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

  // Mobile View Detection Utility Function
  const isMobileView = () => {
    return window.innerWidth < 1024; // 1024px matches Tailwind's lg breakpoint
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
              ? "flex-col h-auto" // Removes fixed heights on mobile so it expands naturally
              : "h-[600px] overflow-hidden" // Exact original layout desktop rules
          }`}
        >
          {/* ---------------- SIDE BAR ---------------- */}
          {/* Kept normal block placement on mobile so it pushes content below it when expanded */}
          <div
            className={`bg-[#efe7e3] p-6 flex flex-col shrink-0 ${
              isMobileView()
                ? "w-full border-b border-[#e7d8cf] gap-3 rounded-t-3xl"
                : "w-64"
            }`}
          >
            <div
              className={`flex items-center justify-between ${isMobileView() ? "cursor-pointer select-none" : ""}`}
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

            {(!isMobileView() || isSidebarOpen) && (
              <div className="flex flex-col gap-2 transition-all duration-200">
                <button
                  onClick={() => handleTabClick("overview-virtualTour")}
                  className={getButtonClass("overview-virtualTour")}
                >
                  Virtual Tour
                </button>

                <button
                  onClick={() => handleTabClick("overview-aboutUs")}
                  className={getButtonClass("overview-aboutUs")}
                >
                  About Us
                </button>

                <button
                  onClick={() => handleTabClick("overview-events")}
                  className={getButtonClass("overview-events")}
                >
                  Previous Events
                </button>

                <button
                  onClick={() => handleTabClick("overview-book")}
                  className={getButtonClass("overview-book")}
                >
                  Book
                </button>

                <button
                  onClick={() => handleTabClick("overview-contact")}
                  className={getButtonClass("overview-contact")}
                >
                  Contact
                </button>
              </div>
            )}
          </div>

          {/* ---------------- CONTENT AREA ---------------- */}
          {/* Placed relative and static underneath the sidebar block flow on mobile viewports */}
          <div
            className={`flex-1 ${isMobileView() ? "p-4 h-auto" : "p-8 overflow-y-auto"}`}
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
