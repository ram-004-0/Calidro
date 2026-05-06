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
              onClick={() => onDelete(cardData.home_id)}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity">
          <div className="bg-white rounded-3xl p-8 w-[350px] relative shadow-2xl border border-gray-100">
            {/* Close Button */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              ×
            </button>

            <h2 className="font-bold text-[#4a3733] text-xl mb-6 text-center tracking-tight">
              UPDATE HOME PHOTO
            </h2>

            <div className="space-y-6">
              {/* Clickable Upload Area */}
              <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#4a3733] hover:bg-gray-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#4a3733]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium">
                    {selectedFile ? selectedFile.name : "Click to select photo"}
                  </p>
                </div>
                {/* THE HIDDEN INPUT: This is what opens your file explorer */}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFile}
                />
              </label>

              {/* Action Button */}
              <button
                onClick={async () => {
                  if (selectedFile) {
                    // This calls your saveEdit function to send the file to Cloudinary/Railway
                    await saveEdit();
                    setShowUploadModal(false);
                  } else {
                    alert("Please select a file first");
                  }
                }}
                disabled={uploading}
                className="w-full bg-[#4a3733] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 disabled:bg-gray-300 disabled:active:scale-100 transition-all"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Upload & Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHomeCard;
