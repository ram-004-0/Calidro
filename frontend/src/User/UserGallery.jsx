import React, { useState } from "react";
import UserHeader from "../Components/UserHeader";
import UserGalleryCard from "../Props/UserGalleryCard";

const UserGallery = () => {
  const [events] = useState([
    {
      id: 1,
      title: "Leni Robredo's Signing",
      date: "2024-05-20",
      type: "Corporate",
      description: "Book signing and meet and greet event.",
      images: ["Image 1", "Image 2", "Image 3"],
    },
    {
      id: 2,
      title: "Sofia's Debut",
      date: "2024-06-12",
      type: "Birthday",
      description: "18th birthday celebration at the grand ballroom.",
      images: ["Image 1", "Image 2", "Image 3"],
    },
  ]);

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full overflow-x-hidden">
      <UserHeader />

      <section className="relative pb-10 w-full flex-1 px-4 md:px-0">
        {/* Maintained your exact h-149 and max-w-365. 
            Added 'w-full' and 'max-w-full' for mobile safety so it scales down on small screens. 
        */}
        <div className="w-full max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[596px] flex flex-col transition-all">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Previous Events
          </h1>

          {/* ================= Search (Responsive Grid) ================= */}
          {/* Wrapped the grid in an overflow-x-auto container. 
              This keeps your grid-cols-3 and gap-10 EXACTLY as designed.
              On mobile, the user simply swipes left/right to see all 3 filters.
          */}
          <div className="overflow-x-auto no-scrollbar mb-4 flex-shrink-0">
            <div className="grid grid-cols-3 gap-6 md:gap-10 min-w-[700px] lg:min-w-full">
              <select className="bg-white border border-gray-300 rounded-full p-3 outline-none cursor-pointer text-sm md:text-base">
                <option>Type of event</option>
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Corporate</option>
              </select>

              <input
                className="bg-white border border-gray-300 rounded-full p-3 outline-none text-sm md:text-base"
                placeholder="Search"
              />

              <select className="bg-white border border-gray-300 rounded-full p-3 outline-none cursor-pointer text-sm md:text-base">
                <option>Sort by</option>
                <option>Date</option>
                <option>Type</option>
              </select>
            </div>
          </div>

          {/* ================= Previous Events List ================= */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4 pr-2">
            {events.map((event, i) => (
              <UserGalleryCard key={event.id || i} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserGallery;
