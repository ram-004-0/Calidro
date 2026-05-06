import React, { useState, useEffect } from "react";
import axios from "axios";
import UserHeader from "../Components/UserHeader";
import UserGalleryCard from "../Props/UserGalleryCard";

const API_URL = "https://calidro-production.up.railway.app";

const UserGallery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search n Filter Bar States
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [eventsData, setEventsData] = useState([]);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/previous-events`);

      // Ensure data is an array before setting state
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setEvents([]); // Fallback to empty list on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredAndSortedEvents = (events || []) // Ensure events isn't null
    .filter((event) => {
      if (!event) return false; // Skip null entries

      const matchesType = eventType === "" || event.type === eventType;
      // Use optional chaining and fallback for search
      const matchesSearch = (event.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      // Use 'date' because that is the alias you set in your SQL query
      // Fallback to 0 if the date is missing
      const dateA = new Date(a?.date || 0).getTime();
      const dateB = new Date(b?.date || 0).getTime();

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full overflow-x-hidden">
      <UserHeader />

      <section className="relative pb-10 w-full flex-1 px-4 md:px-0">
        <div className="w-full max-w-[1460px] mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[597px] flex flex-col transition-all">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Previous Events
          </h1>

          {/* Search/Filter Bar */}
          <div className="overflow-x-auto no-scrollbar mb-4 flex-shrink-0">
            <div className="grid grid-cols-3 gap-6 md:gap-10 min-w-[700px] lg:min-w-full">
              <select
                className="bg-white border border-gray-300 rounded-full p-3 outline-none cursor-pointer text-sm md:text-base"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="" disabled>
                  Select an event type
                </option>

                <optgroup label="Social Events">
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Debut">Debut (18th Birthday)</option>
                  <option value="Wedding Ceremony">Wedding Ceremony</option>
                  <option value="Wedding Reception">Wedding Reception</option>
                  <option value="Anniversary">Anniversary Celebration</option>
                </optgroup>

                <optgroup label="Family Milestones">
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Gender Reveal">Gender Reveal</option>
                  <option value="Baptism">Baptism / Christening</option>
                  <option value="Graduation Party">Graduation Party</option>
                </optgroup>

                <optgroup label="Corporate Events">
                  <option value="Corporate Meeting">Corporate Meeting</option>
                  <option value="Seminar">Seminar / Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Team Building">Team Building Event</option>
                  <option value="Company Party">Company Party</option>
                </optgroup>

                <optgroup label="Creative / Others">
                  <option value="Exhibit">Exhibit / Art Showcase</option>
                  <option value="Pop-up Market">Pop-up Market / Bazaar</option>
                  <option value="Photoshoot">Photoshoot / Studio Rental</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>

              <input
                className="bg-white border border-gray-300 rounded-full p-3 outline-none text-sm md:text-base"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="bg-white border border-gray-300 rounded-full p-3 outline-none cursor-pointer text-sm md:text-base"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest to Oldest</option>
                <option value="oldest">Oldest to Newest</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4 pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-full text-[#4a3733] font-bold animate-pulse uppercase">
                Loading Previous Events...
              </div>
            ) : filteredAndSortedEvents.length > 0 ? (
              /* We map over the filtered list so the UI updates when you type or filter */
              filteredAndSortedEvents.map((event, i) => (
                <UserGalleryCard key={event.id || i} event={event} />
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 italic">
                {searchTerm || eventType
                  ? "No events match your search criteria."
                  : "No events found."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserGallery;
