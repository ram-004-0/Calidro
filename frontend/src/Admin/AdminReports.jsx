import React from "react";
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
    <div className="min-h-screen bg-[#433633] flex flex-col">
      <AdminHeader />
      <section className="relative pb-2 w-full">
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] p-6 flex flex-col">
          <h1 className="text-2xl font-bold text-[#4a3733] mb-3 uppercase">
            Reports
          </h1>

          <div className="flex flex-1 gap-6">
            {/* LEFT COLUMN */}
            <div className="flex-[0.45] flex flex-col gap-6">
              {/* Star Rating Panel */}
              <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-white/50">
                <div className="space-y-2">
                  {starRatings.map((rating, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            fill={index < rating.stars ? "#facc15" : "none"}
                            stroke={
                              index < rating.stars ? "#facc15" : "#d1d5db"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-8">
                        {rating.percent}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <Star size={110} fill="#facc15" stroke="#facc15" />
                    <span className="absolute text-2xl font-black text-[#4a3733] pb-1">
                      4.6
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#4a3733] mt-2 uppercase tracking-wide">
                    Avg. Star Rating
                  </p>
                </div>
              </div>

              {/* Total Reviews Panel */}
              <div className="bg-white rounded-3xl p-8 flex-1 flex flex-col items-center justify-center shadow-sm border border-white/50">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Total Reviews
                </h2>
                <span className="text-7xl font-black text-[#4a3733] tracking-tighter">
                  1024
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN - Bar Chart */}
            <div className="flex-[0.55] bg-white rounded-3xl p-8 shadow-sm border border-white/50 flex flex-col">
              <h2 className="text-sm font-bold text-[#4a3733] mb-8 uppercase tracking-widest">
                No. of Events
              </h2>
              <div className="flex-1 w-full bg-white rounded-2xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
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
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      angle={-90}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis hide domain={[0, 25]} />
                    <Tooltip cursor={{ fill: "#f9fafb" }} />
                    <Bar
                      dataKey="value"
                      fill="#4e79a7"
                      radius={[4, 4, 0, 0]}
                      barSize={35}
                      label={{
                        position: "top",
                        fill: "#4a3733",
                        fontSize: 12,
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
