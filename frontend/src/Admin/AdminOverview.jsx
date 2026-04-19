import React, { useState } from "react";
import AdminHeader from "../Components/AdminHeader";
import OverviewVirtualTour from "../Admin Overview/OverviewVirtualTour";
import OverviewAboutUs from "../Admin Overview/OverviewAboutUs";
import OverviewEvents from "../Admin Overview/OverviewEvents";
import OverviewBook from "../Admin Overview/OverviewBook";
import OverviewContact from "../Admin Overview/OverviewContact";


const AdminOverview = () => {
  const [activeTab, setActiveTab] = useState("overview-virtualTour");

  // Helper function to keep the JSX clean
  const getButtonClass = (tabName) => {
    const baseClass = "text-left px-4 py-3 rounded-xl transition font-semibold uppercase text-sm";
    const activeClass = "bg-[#4a3733] text-white";
    const inactiveClass = "text-[#4a3733] hover:bg-[#e7d8cf]";
    
    return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col">
      <AdminHeader />

      <section className="relative pb-2 w-full">
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] flex overflow-hidden">
          
          {/* ---------------- SIDE BAR ---------------- */}
          <div className="w-64 bg-[#efe7e3] p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-[#4a3733] mb-6 tracking-wide">
              OVERVIEW
            </h2>

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
          </div>

          {/* ---------------- CONTENT AREA ---------------- */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === "overview-virtualTour" && <OverviewVirtualTour />}
            {activeTab === "overview-aboutUs" && <OverviewAboutUs />}
            {activeTab === "overview-events" && <OverviewEvents/>}
            {activeTab === "overview-book" && <OverviewBook/>}
            {activeTab === "overview-contact" && <OverviewContact/>}
          </div>

        </div>
      </section>
    </div>
  );
};

export default AdminOverview;