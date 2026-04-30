import { useState } from "react";
import { Ellipsis, Minus } from "lucide-react";

const OverviewEventCard = ({
  cardData,
  onDelete,
  onRefresh,
  isEditing,
  setEditingCard,
}) => {
  // Use props to initialize state
  const [title, setTitle] = useState(cardData.title || "");
  const [description, setDescription] = useState(cardData.description || "");
  const [image, setImage] = useState(cardData.image_url || null);
  const [selectedFile, setSelectedFile] = useState(null); // The actual file for Cloudinary
  const [uploading, setUploading] = useState(false);

  const handleFile = (file) => {
    setSelectedFile(file); // Keep the file object
    setImage(URL.createObjectURL(file)); // Keep the preview URL
    setShowUploadModal(false);
  };

  const saveEdit = async () => {
    setUploading(true);
    let finalUrl = image;

    try {
      // 1. Upload image if it's new
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const res = await fetch(
          `${API_URL}/api/images/upload?category=events`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await res.json();
        finalUrl = data.imageUrl;
      }

      // 2. Save to MySQL
      const res = await fetch(`${API_URL}/api/settings/event-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardData.events_overview_id, // Pass existing ID or null
          title,
          description,
          imageUrl: finalUrl,
          userId: 1,
        }),
      });

      if (res.ok) {
        setEditingCard(false);
        onRefresh(); // Reload the list from DB to get the new ID
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file) => {
    const preview = URL.createObjectURL(file);
    setImage(preview);
    setShowUploadModal(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const startEdit = () => {
    setLocalEditing(true);
    setEditingCard(true);
    setShowMenu(false);
  };

  const saveEdit = () => {
    setLocalEditing(false);
    setEditingCard(false);
  };

  const cancelEdit = () => {
    setLocalEditing(false);
    setEditingCard(false);
  };

  const editingActive = isEditing && localEditing;

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl shadow-md p-4 w-65 shrink-0 transition-all duration-300
          ${editingActive ? "ring-4 ring-[#4a3733]" : ""}
          ${isEditing && !localEditing ? "opacity-50" : "opacity-100"}
        `}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">event card</span>

          <div className="flex gap-2">
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-200 transition"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Ellipsis size={18} />
            </button>

            <button
              type="button"
              className="p-1 rounded-full hover:bg-red-100 transition text-red-600"
              onClick={onDelete}
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute right-4 top-10 bg-white border border-[#4a3733] rounded shadow-lg w-42 z-10">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={startEdit}
            >
              Edit
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setShowUploadModal(true);
                setShowMenu(false);
              }}
            >
              Upload New Photo
            </button>
          </div>
        )}

        {/* Image */}
        <img
          src={image}
          alt="Event"
          className="rounded-xl w-full h-40 object-cover mb-2"
        />

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!editingActive}
          placeholder="Event Title:"
          className={`w-full mb-2 px-3 py-2 rounded-lg outline-none transition
            ${editingActive ? "bg-white border" : "bg-gray-100 cursor-not-allowed"}
          `}
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!editingActive}
          placeholder="Event Description:"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg outline-none resize-none transition
            ${editingActive ? "bg-white border" : "bg-gray-100 cursor-not-allowed"}
          `}
        />

        {/* Save / Cancel Buttons */}
        {editingActive && (
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="px-4 py-2 bg-[#4a3733] text-white rounded-lg hover:bg-[#3a2c28] text-sm"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-md p-6 w-95 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black transition"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-[#4a3733] mb-4">
              Upload Event Photo
            </h2>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#4a3733] hover:bg-gray-50 transition"
            >
              <p className="text-sm text-gray-600 font-medium">
                Drag & Drop Photo Here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                or click to browse files
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="event-upload"
                onChange={handleFileSelect}
              />

              <label
                htmlFor="event-upload"
                className="inline-block mt-4 px-4 py-2 bg-[#4a3733] text-white text-sm rounded-lg cursor-pointer hover:bg-[#3a2c28] transition"
              >
                Select Photo
              </label>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverviewEventCard;
