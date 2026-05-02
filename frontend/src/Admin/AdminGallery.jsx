import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../Components/AdminHeader";
import AdminGalleryCard from "../Props/AdminGalleryCard";

const API_URL = "https://calidro-production.up.railway.app";

const AdminGallery = () => {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NEW: State for the dynamic Add Form ---
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({
    user_id: 1, // Ensure this exists in your 'user' table
    title: "",
    event_date: "",
    event_type: "Wedding",
    description: "",
    images: [],
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery/all`);
      const formattedEvents = response.data.map((ev) => ({
        id: ev.previous_events_id,
        title: ev.title,
        date: ev.event_date ? ev.event_date.split("T")[0] : "",
        type: ev.event_type,
        description: ev.description,
        images: ev.images || [],
      }));
      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- DYNAMIC ADD LOGIC ---
  const handleSaveNewEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      alert("Title and Date are required!");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/gallery/add`, newEvent);
      if (response.data.success) {
        setIsAdding(false);
        setNewEvent({
          user_id: 1,
          title: "",
          event_date: "",
          event_type: "Wedding",
          description: "",
          images: [],
        });
        fetchEvents(); // Refresh list
      }
    } catch (error) {
      alert(
        "Error adding event: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleDelete = async () => {
    if (
      selectedId &&
      window.confirm("Are you sure you want to delete this event?")
    ) {
      try {
        await axios.delete(`${API_URL}/api/gallery/delete/${selectedId}`);
        setEvents(events.filter((item) => item.id !== selectedId));
        setSelectedId(null);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  // --- PLACEHOLDERS FOR FUTURE LOGIC ---
  const handleUpdateEvent = async (id, updatedData) => {
    // You can expand this to call axios.put(`${API_URL}/api/gallery/update/${id}`, updatedData)
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updatedData } : ev)),
    );
  };

  const handleImageUpload = (eventId, files) => {
    // In a real flow, upload to Cloudinary here, then send URLs to DB
    const newPhotoUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, images: [...ev.images, ...newPhotoUrls] }
          : ev,
      ),
    );
  };

  const handleRemoveImage = (eventId, index) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const updated = [...ev.images];
          updated.splice(index, 1);
          return { ...ev, images: updated };
        }
        return ev;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col overflow-x-hidden">
      <AdminHeader />
      <section className="flex-1 flex flex-col items-center p-4 md:p-0">
        <div className="w-full max-w-[1460px] bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[700px] flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Previous Events
          </h1>

          {/* Controls */}
          <div className="overflow-x-auto no-scrollbar mb-6 flex-shrink-0">
            <div className="grid grid-cols-4 gap-4 md:gap-6 min-w-[800px] lg:min-w-full">
              <select className="bg-white border rounded-full p-3 outline-none cursor-pointer">
                <option>Type</option>
              </select>
              <input
                className="bg-white border rounded-full p-3 outline-none"
                placeholder="Search..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex-1 bg-[#f4dfba] hover:bg-[#e9d1a8] py-2 rounded-full font-bold transition"
                >
                  + Add New
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className={`flex-1 py-2 rounded-full font-bold transition ${selectedId ? "bg-red-400 text-white" : "bg-gray-300 text-gray-500"}`}
                >
                  Delete
                </button>
              </div>
              <select className="bg-white border rounded-full p-3 outline-none cursor-pointer">
                <option>Sort</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 scrollbar-thin scrollbar-thumb-[#4a3733]">
            {/* DYNAMIC ADD FORM SECTION */}
            {isAdding && (
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-[#4a3733] grid grid-cols-4 gap-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    New Event Details
                  </p>
                  <input
                    className="border p-2 rounded text-sm"
                    placeholder="Title"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="border p-2 rounded text-sm"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_date: e.target.value })
                    }
                  />
                  <select
                    className="border p-2 rounded text-sm"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_type: e.target.value })
                    }
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea
                    className="border p-2 rounded text-sm h-20"
                    placeholder="Description"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNewEvent}
                      className="flex-1 bg-green-600 text-white py-2 rounded font-bold text-xs"
                    >
                      SAVE TO DB
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="flex-1 bg-gray-400 text-white py-2 rounded font-bold text-xs"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-center border rounded bg-gray-50 text-gray-400 italic">
                  Save the event first to begin adding photos.
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-center text-[#4a3733] font-bold">
                Loading Events...
              </p>
            ) : (
              events.map((item) => (
                <AdminGalleryCard
                  key={item.id}
                  event={item}
                  isSelected={selectedId === item.id}
                  onSelect={(id) =>
                    setSelectedId(id === selectedId ? null : id)
                  }
                  onImageUpload={handleImageUpload}
                  onUpdate={handleUpdateEvent}
                  onRemoveImage={handleRemoveImage}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminGallery;
