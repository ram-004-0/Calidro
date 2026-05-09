import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";
import { Star } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AdminReports = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const barData = [
    { name: "January", value: 10 },
    { name: "February", value: 14 },
    { name: "March", value: 19 },
    { name: "April", value: 9 },
    { name: "May", value: 21 },
    { name: "June", value: 15 },
    { name: "July", value: 7 },
    { name: "August", value: 4 },
    { name: "September", value: 1 },
    { name: "December", value: 1 },
  ];

  const starRatings = [
    { stars: 5, percent: "65%" },
    { stars: 4, percent: "28%" },
    { stars: 3, percent: "5%" },
    { stars: 2, percent: "1%" },
    { stars: 1, percent: "1%" },
  ];

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col h-full relative">
      <AdminHeader />

      <section className="flex-1 flex flex-col items-center p-4 md:p-6 lg:p-10">
        {/* Main Dashboard Container */}
        <div className="w-full max-w-[1460px] bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 min-h-[600px] flex flex-col overflow-y-auto">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 md:mb-6 uppercase">
            Reports
          </h1>

          {/* Conditional Layout: flex-col for mobile, flex-row for desktop */}
          <div
            className={`flex flex-1 gap-4 md:gap-6 ${isMobileView ? "flex-col" : "flex-row"}`}
          >
            {/* LEFT COLUMN (or Top on Mobile) */}
            <div
              className={`${isMobileView ? "w-full" : "flex-[0.45]"} flex flex-col gap-4 md:gap-6`}
            >
              {/* Star Rating Panel */}
              <div className="bg-white rounded-3xl p-4 md:p-6 flex items-center justify-between shadow-sm border border-white/50">
                <div className="space-y-1 md:space-y-2">
                  {starRatings.map((rating, i) => (
                    <div key={i} className="flex items-center gap-2 md:gap-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={isMobileView ? 12 : 16}
                            fill={index < rating.stars ? "#facc15" : "none"}
                            stroke={
                              index < rating.stars ? "#facc15" : "#d1d5db"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-gray-500 w-6 md:w-8">
                        {rating.percent}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <Star
                      size={isMobileView ? 80 : 110}
                      fill="#facc15"
                      stroke="#facc15"
                    />
                    <span
                      className={`absolute font-black text-[#4a3733] pb-1 ${isMobileView ? "text-xl" : "text-2xl"}`}
                    >
                      4.6
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-[#4a3733] mt-1 md:mt-2 uppercase tracking-wide text-center">
                    Avg. Star Rating
                  </p>
                </div>
              </div>

              {/* Total Reviews Panel */}
              <div className="bg-white rounded-3xl p-6 md:p-8 flex-1 flex flex-col items-center justify-center shadow-sm border border-white/50 min-h-[150px]">
                <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-4">
                  Total Reviews
                </h2>
                <span
                  className={`font-black text-[#4a3733] tracking-tighter ${isMobileView ? "text-5xl" : "text-7xl"}`}
                >
                  1024
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN - Bar Chart (or Bottom on Mobile) */}
            <div
              className={`${isMobileView ? "w-full min-h-[400px]" : "flex-[0.55]"} bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-white/50 flex flex-col`}
            >
              <h2 className="text-xs md:text-sm font-bold text-[#4a3733] mb-6 md:mb-8 uppercase tracking-widest">
                No. of Events
              </h2>
              <div className="flex-1 w-full bg-white rounded-2xl p-2 md:p-4 shadow-inner min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 10, left: -30, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#9ca3af",
                        fontSize: isMobileView ? 9 : 10,
                      }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis hide domain={[0, 25]} />
                    <Tooltip cursor={{ fill: "#f9fafb" }} />
                    <Bar
                      dataKey="value"
                      fill="#4e79a7"
                      radius={[4, 4, 0, 0]}
                      barSize={isMobileView ? 20 : 35}
                      label={{
                        position: "top",
                        fill: "#4a3733",
                        fontSize: isMobileView ? 10 : 12,
                        fontWeight: "bold",
                      }}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#5a84ae" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
