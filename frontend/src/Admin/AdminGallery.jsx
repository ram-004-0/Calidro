import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../Components/AdminHeader";
import AdminGalleryCard from "../Props/AdminGalleryCard";

const API_URL = "https://calidro-production.up.railway.app";

const AdminGallery = () => {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const displayEvents = events
    .filter(
      (ev) =>
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

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

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (sortOrder === "newest") {
      return dateB - dateA; // Recent dates first
    } else {
      return dateA - dateB; // Older dates first
    }
  });

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
    try {
      const response = await axios.put(`${API_URL}/api/gallery/update/${id}`, {
        title: updatedData.title,
        event_date: updatedData.date, // Card uses .date, DB uses event_date
        event_type: updatedData.type,
        description: updatedData.description,
      });

      if (response.data.success) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === id ? { ...ev, ...updatedData } : ev)),
        );
        alert("Database updated!");
      }
    } catch (error) {
      alert("Failed to update database.");
    }
  };

  const handleImageUpload = async (eventId, files) => {
    const fileArray = Array.from(files);

    // Set loading state if you have one, or show a toast
    console.log(`Starting upload for ${fileArray.length} files...`);

    try {
      // Process each file
      for (const file of fileArray) {
        // 1. Prepare FormData for Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "gallery_unsigned"); // Required by Cloudinary

        // 2. Upload to Cloudinary API
        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/da4fp4fsr/image/upload",
          formData,
        );

        const secureUrl = cloudRes.data.secure_url;

        // 3. Save the permanent URL to your MySQL database
        await axios.post(`${API_URL}/api/gallery/add-image/${eventId}`, {
          image_url: secureUrl,
        });
      }

      // 4. Refresh the UI once all images are saved
      alert("Images uploaded and saved successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("An error occurred during the upload process.");
    }
  };

  const handleRemoveImage = async (eventId, imageId, imageUrl) => {
    // 1. Confirmation check
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      // 2. Call backend with the data wrapped in the 'data' key
      // This is required by Axios for DELETE requests to send a body
      await axios.delete(`${API_URL}/api/gallery/delete-image`, {
        data: {
          eventId: eventId,
          imageUrl: imageUrl,
        },
      });

      // 3. Update local state for immediate feedback
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id === eventId) {
            const updated = ev.images.filter((img) => img !== imageUrl);
            return { ...ev, images: updated };
          }
          return ev;
        }),
      );

      alert("Image removed successfully.");

      // 4. Re-fetch to ensure the state matches the DB exactly
      fetchEvents();
    } catch (error) {
      console.error(
        "Failed to remove image:",
        error.response?.data || error.message,
      );
      alert("Could not delete the image from the database.");
    }
  };

  return (
    <div className="min-h-screen bg-[#433633] flex flex-col overflow-x-hidden">
      <AdminHeader />

      <section className="relative pb-2 w-full flex-1 flex flex-col items-center px-4 mt-6">
        <div className="max-w-[1460px] w-full mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] flex flex-col overflow-hidden p-6">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <select
                className="bg-white border rounded-full p-3 outline-none cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest to Oldest</option>
                <option value="oldest">Oldest to Newest</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 scrollbar-thin scrollbar-thumb-[#4a3733]">
            {isAdding && (
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-[#4a3733] grid grid-cols-4 gap-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    New Event Details
                  </p>
                  <input
                    value={newEvent.title}
                    className="border p-2 rounded text-sm"
                    placeholder="Title"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                  <input
                    value={newEvent.event_date}
                    type="date"
                    className="border p-2 rounded text-sm"
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_date: e.target.value })
                    }
                  />
                  <select
                    value={newEvent.event_type}
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
                    value={newEvent.description}
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
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4a3733] mb-2"></div>
                <p className="text-center text-[#4a3733] font-bold">
                  Loading Events...
                </p>
              </div>
            ) : sortedEvents.length > 0 ? (
              // Use sortedEvents (or displayEvents if you added search logic)
              sortedEvents.map((item) => (
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
            ) : (
              <div className="text-center py-10 text-gray-500 italic">
                No events found. Click "+ Add New" to create one!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminGallery;
