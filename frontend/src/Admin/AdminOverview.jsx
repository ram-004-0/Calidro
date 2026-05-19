import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";
import OverviewVirtualTour from "../Admin Overview/OverviewVirtualTour";
import OverviewAboutUs from "../Admin Overview/OverviewAboutUs";
import OverviewEvents from "../Admin Overview/OverviewEvents";
import OverviewBook from "../Admin Overview/OverviewBook";
import OverviewContact from "../Admin Overview/OverviewContact";

const AdminOverview = () => {
  const [activeTab, setActiveTab] = useState("overview-virtualTour");

  // Mobile View Detection Logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getButtonClass = (tabName) => {
    const baseClass =
      "text-center lg:text-left px-4 py-3 rounded-xl transition font-semibold uppercase text-xs lg:text-sm whitespace-nowrap lg:whitespace-normal flex-1 lg:flex-initial";
    const activeClass = "bg-[#4a3733] text-white";
    const inactiveClass = "text-[#4a3733] hover:bg-[#e7d8cf]";

    return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col">
      <AdminHeader />

      <section className="relative pb-4 px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* Layout container updates dynamically from vertical rows on mobile to standard horizontal layout on desktop */}
        <div className="w-full max-w-7xl mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl min-h-[600px] lg:h-[600px] flex flex-col lg:flex-row overflow-hidden flex-1">
          {/* ---------------- SIDE BAR ---------------- */}
          <div className="w-full lg:w-64 bg-[#efe7e3] p-4 lg:p-6 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-[#e7d8cf]">
            <h2 className="text-xl lg:text-2xl font-bold text-[#4a3733] mb-4 lg:mb-6 tracking-wide text-center lg:text-left">
              OVERVIEW
            </h2>

            {/* Flex adjustments: horizontal scroll bar on mobile viewports, neat column blocks on large monitors */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 no-scrollbar">
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
          </div>

          {/* ---------------- CONTENT AREA ---------------- */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
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
