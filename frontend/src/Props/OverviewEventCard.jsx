import { useState, useEffect } from "react";
import { Ellipsis, Minus } from "lucide-react";

const API_URL = "https://calidro-production.up.railway.app";

const OverviewEventCard = ({
  cardData,
  onDelete,
  onRefresh,
  isEditing,
  setEditingCard,
}) => {
  // State initialization
  const [title, setTitle] = useState(cardData.title || "");
  const [description, setDescription] = useState(cardData.description || "");
  const [image, setImage] = useState(cardData.image_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [localEditing, setLocalEditing] = useState(false);

  // Sync state if cardData changes (important for the "Refresh" logic)
  useEffect(() => {
    setTitle(cardData.title || "");
    setDescription(cardData.description || "");
    setImage(cardData.image_url || null);
  }, [cardData]);

  const handleFile = (file) => {
    setSelectedFile(file); // Save actual file for upload
    setImage(URL.createObjectURL(file)); // Save preview for UI
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

  const cancelEdit = () => {
    setLocalEditing(false);
    setEditingCard(false);
    // Reset to original data
    setTitle(cardData.title || "");
    setDescription(cardData.description || "");
    setImage(cardData.image_url || null);
  };

  // THE MAIN SAVE LOGIC
  const saveEdit = async () => {
    setUploading(true);
    let finalUrl = image;

    try {
      // 1. Upload to Cloudinary if a new file was picked
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
          id: cardData.events_overview_id,
          title,
          description,
          imageUrl: finalUrl,
          userId: 1,
        }),
      });

      if (res.ok) {
        setLocalEditing(false);
        setEditingCard(false);
        onRefresh(); // Tell parent to get fresh data
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save card.");
    } finally {
      setUploading(false);
    }
  };

  const editingActive = isEditing && localEditing;

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl shadow-md p-4 w-65 shrink-0 transition-all duration-300
          ${editingActive ? "ring-4 ring-[#4a3733]" : ""}
          ${isEditing && !localEditing ? "opacity-50" : "opacity-100"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">event card</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <Ellipsis size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-full hover:bg-red-100 text-red-600"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

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

        <img
          src={image || "https://via.placeholder.com/150"}
          alt="Event"
          className="rounded-xl w-full h-40 object-cover mb-2"
        />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!editingActive}
          placeholder="Event Title:"
          className={`w-full mb-2 px-3 py-2 rounded-lg outline-none ${editingActive ? "bg-white border" : "bg-gray-100"}`}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!editingActive}
          placeholder="Event Description:"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg outline-none resize-none ${editingActive ? "bg-white border" : "bg-gray-100"}`}
        />

        {editingActive && (
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={uploading}
              className="px-4 py-2 bg-[#4a3733] text-white rounded-lg text-sm"
            >
              {uploading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal logic stays the same as your code */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-95 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Upload Event Photo</h2>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="event-upload"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="event-upload"
                className="cursor-pointer bg-[#4a3733] text-white px-4 py-2 rounded-lg"
              >
                Select Photo
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverviewEventCard;
