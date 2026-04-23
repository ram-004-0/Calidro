import React, { useState } from "react";
import AdminHeader from "../Components/AdminHeader";
import AdminGalleryCard from "../Props/AdminGalleryCard";
//static images
import image1 from "../assets/Images/16.png";
import image2 from "../assets/Images/15.png";
import image3 from "../assets/Images/debut.JPG";
const AdminGallery = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Leni Robredo's Signing",
      date: "2024-05-20",
      type: "Corporate",
      description:
        "Former Vice President Leni Robredo delivered an engaging talk, sharing her insights and experiences, followed by a book signing afterwards.",
      images: [image2, image1],
    },
    {
      id: 2,
      title: "Sofia's Debut",
      date: "2024-06-12",
      type: "Birthday",
      description: "18th birthday celebration at the grand ballroom.",
      images: [image3],
    },
  ]);

  const [selectedId, setSelectedId] = useState(null);

  // --- NEW: UPDATE EVENT DETAILS ---
  const handleUpdateEvent = (id, updatedData) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updatedData } : ev)),
    );
  };

  // --- NEW: REMOVE SPECIFIC PHOTO ---
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
  };

  const handleAdd = () => {
    const newEvent = {
      id: Date.now(),
      title: "New Event Title",
      date: new Date().toISOString().split("T")[0],
      type: "Other",
      description: "New event description...",
      images: [],
    };
    setEvents([newEvent, ...events]);
  };

  const handleDelete = () => {
    if (
      selectedId &&
      window.confirm("Are you sure you want to delete this event?")
    ) {
      setEvents(events.filter((item) => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleImageUpload = (eventId, files) => {
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
                  className={`flex-1 py-2 rounded-full font-bold transition active:scale-95 ${selectedId ? "bg-red-400 text-white" : "bg-gray-300 text-gray-500"}`}
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
            {events.map((item) => (
              <AdminGalleryCard
                key={item.id}
                event={item}
                isSelected={selectedId === item.id}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                onImageUpload={handleImageUpload}
                onUpdate={handleUpdateEvent} // Passed function
                onRemoveImage={handleRemoveImage} // Passed function
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminGallery;
