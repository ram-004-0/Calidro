import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed: npm install axios
import AdminHeader from "../Components/AdminHeader";
import AdminGalleryCard from "../Props/AdminGalleryCard";

const API_URL = "https://calidro-production.up.railway.app";

const AdminGallery = () => {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM DATABASE ---
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery/all`);
      // Map database field names to your frontend prop names if they differ
      const formattedEvents = response.data.map((ev) => ({
        id: ev.previous_events_id,
        title: ev.title,
        date: ev.event_date.split("T")[0], // Formats YYYY-MM-DD
        type: ev.event_type,
        description: ev.description,
        images: ev.images, // This is the array from the backend
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

  // --- UPDATE EVENT DETAILS ---
  const handleUpdateEvent = async (id, updatedData) => {
    try {
      // Logic for backend update call would go here
      // For now, updating local state:
      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, ...updatedData } : ev)),
      );
      // await axios.put(`http://localhost:5000/api/gallery/update/${id}`, updatedData);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // --- REMOVE SPECIFIC PHOTO ---
  const handleRemoveImage = (eventId, imageIndex) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const updatedImages = [...ev.images];
          updatedImages.splice(imageIndex, 1);
          return { ...ev, images: updatedImages };
        }
        return ev;
      }),
    );
    // Note: You would typically call an API here to delete from previous_events_images table
  };

  // --- ADD NEW EVENT ---
  const handleAdd = async () => {
    const newEventData = {
      user_id: 1, // Example ID
      created_by: "Admin",
      title: "New Event Title",
      event_date: new Date().toISOString().split("T")[0],
      event_type: "Other",
      description: "New event description...",
      images: [],
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/gallery/add`,
        newEventData,
      );
      // Refresh list or add the returned object with its new DB ID
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // --- DELETE EVENT ---
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

  // --- IMAGE UPLOAD ---
  const handleImageUpload = (eventId, files) => {
    // In a real app, you'd use FormData to upload to Cloudinary/S3
    // and then save the resulting URL to your previous_events_images table.
    const newPhotoUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );

    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id === eventId
          ? { ...ev, images: [...ev.images, ...newPhotoUrls] }
          : ev,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col overflow-x-hidden">
      <AdminHeader />
      <section className="flex-1 flex flex-col items-center p-4 md:p-0">
        <div className="w-full max-w-[1460px] bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[600px] flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Previous Events
          </h1>

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
                  onClick={handleAdd}
                  className="flex-1 bg-[#f4dfba] hover:bg-[#e9d1a8] py-2 rounded-full font-bold transition active:scale-95"
                >
                  + Add
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className={`flex-1 py-2 rounded-full font-bold transition active:scale-95 ${
                    selectedId
                      ? "bg-red-400 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  Delete
                </button>
              </div>
              <select className="bg-white border rounded-full p-3 outline-none cursor-pointer">
                <option>Sort</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 scrollbar-thin scrollbar-thumb-[#4a3733] scrollbar-track-transparent">
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
