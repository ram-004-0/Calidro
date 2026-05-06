import { useState, useEffect } from "react";
import { Ellipsis, Minus } from "lucide-react";

const API_URL = "https://calidro-production.up.railway.app";

const AdminHomeCard = ({
  cardData,
  onDelete,
  onRefresh,
  isEditing,
  setEditingCard,
}) => {
  const [title, setTitle] = useState(cardData.title || "");
  const [description, setDescription] = useState(cardData.description || "");
  const [image, setImage] = useState(cardData.image_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [localEditing, setLocalEditing] = useState(false);

  useEffect(() => {
    setTitle(cardData.title || "");
    setDescription(cardData.description || "");
    setImage(cardData.image_url || null);
  }, [cardData]);

  const saveEdit = async () => {
    setUploading(true);
    try {
      let finalUrl = image;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadRes = await fetch(
          `${API_URL}/api/images/upload?category=home`,
          {
            method: "POST",
            body: formData,
          },
        );
        const uploadData = await uploadRes.json();
        finalUrl = uploadData.imageUrl;
      }

      // 2. Save to home_card table
      const res = await fetch(`${API_URL}/api/settings/home-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardData.home_id, // Ensure this matches your DB column name
          title: title,
          description: description,
          imageUrl: finalUrl, // Sending 'imageUrl' to match the POST route
          userId: 1, // Ensure this user exists in your 'user' table
        }),
      });

      if (res.ok) {
        setLocalEditing(false);
        setEditingCard(false);
        onRefresh(); // Refresh the list in the parent
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const cancelEdit = () => {
    setLocalEditing(false);
    setEditingCard(false);
    setTitle(cardData.title || "");
    setDescription(cardData.description || "");
    setImage(cardData.image_url || null);
  };

  const isDimmed = isEditing && !localEditing;

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl shadow-md p-4 w-65 shrink-0 transition-all duration-300
          ${localEditing ? "ring-4 ring-[#4a3733]" : ""}
          ${isDimmed ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">home card</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <Ellipsis size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-50 text-red-600 rounded-full transition"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="absolute right-4 top-10 bg-white border border-[#4a3733] rounded shadow-lg w-40 z-30">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setLocalEditing(true);
                setEditingCard(true);
                setShowMenu(false);
              }}
            >
              Edit Details
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowUploadModal(true);
                setShowMenu(false);
              }}
            >
              Upload Photo
            </button>
          </div>
        )}

        <img
          src={image || "https://via.placeholder.com/150"}
          className="rounded-xl w-full h-40 object-cover mb-3"
          alt="Home"
        />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!localEditing}
          placeholder="Home Title:"
          className={`w-full mb-2 px-3 py-2 rounded-lg outline-none text-sm transition ${localEditing ? "bg-white border" : "bg-gray-50 cursor-not-allowed"}`}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!localEditing}
          placeholder="Home Description:"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg outline-none text-sm resize-none transition ${localEditing ? "bg-white border" : "bg-gray-50 cursor-not-allowed"}`}
        />

        {localEditing && (
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={uploading}
              className="px-3 py-1 bg-[#4a3733] text-white rounded-lg text-xs font-bold"
            >
              {uploading ? "..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 w-80 relative shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-2 right-4 text-xl"
            >
              ×
            </button>
            <h2 className="font-bold text-[#4a3733] mb-4 uppercase">
              Update Home Photo
            </h2>
            <input
              type="file"
              onChange={handleFile}
              className="text-sm w-full"
            />
            <button
              onClick={async () => {
                if (selectedFile) {
                  await saveEdit(); // This triggers the actual Cloudinary upload
                  setShowUploadModal(false);
                } else {
                  alert("Please select a file first");
                }
              }}
              disabled={uploading}
              className="mt-6 w-full bg-[#4a3733] text-white py-2 rounded-xl font-bold disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Upload & Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHomeCard;
