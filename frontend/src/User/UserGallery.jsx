import React, { useState, useEffect } from "react";
import axios from "axios";
import UserHeader from "../Components/UserHeader";
import UserGalleryCard from "../Props/UserGalleryCard";

const API_URL = "https://calidro-production.up.railway.app";

const UserGallery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM DATABASE ---
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/gallery/all`);

      // Mapping database fields to the frontend state structure
      const formattedData = response.data.map((ev) => ({
        id: ev.previous_events_id,
        title: ev.title,
        date: ev.event_date ? ev.event_date.split("T")[0] : "No Date",
        type: ev.event_type,
        description: ev.description,
        images: ev.images || [], // The array of URLs from the backend
      }));

      setEvents(formattedData);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full overflow-x-hidden">
      <UserHeader />

      <section className="relative pb-10 w-full flex-1 px-4 md:px-0">
        <div className="w-full max-w-[1460px] mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[596px] flex flex-col transition-all">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Previous Events
          </h1>

          {/* Search/Filter Bar */}
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

          {/* Events List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4 pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-full text-[#4a3733] font-bold animate-pulse uppercase">
                Loading Previous Events...
              </div>
            ) : events.length > 0 ? (
              events.map((event, i) => (
                <UserGalleryCard key={event.id || i} event={event} />
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 italic">
                No events found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserGallery;
