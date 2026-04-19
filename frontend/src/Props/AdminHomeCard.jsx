import { useState } from "react";
import { Ellipsis, Minus } from "lucide-react";

const AdminHomeCard = ({ onDelete, isEditing, setEditingCard }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [localEditing, setLocalEditing] = useState(false);
  const [image, setImage] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  // Logic: Dim this specific card if SOMEONE ELSE is being edited
  const isDimmed = isEditing && !localEditing;

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl shadow-md p-4 w-65 shrink-0 transition-all duration-300
          ${localEditing ? "ring-4 ring-[#4a3733]" : ""}
          ${isDimmed ? "opacity-50 pointer-events-none" : "opacity-100"}
        `}
      >
        {/* Top Bar */}
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

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-4 top-10 bg-white border border-[#4a3733] rounded shadow-lg w-40 z-30">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={startEdit}
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

        {/* Image Area */}
        <img
          src={image}
          className="rounded-xl w-full h-40 object-cover mb-3"
          alt="Home"
        />

        {/* Inputs */}
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

        {/* Save/Cancel Buttons */}
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
              className="px-3 py-1 bg-[#4a3733] text-white rounded-lg text-xs font-bold"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
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
              onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
              className="text-sm w-full"
            />
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-6 w-full bg-[#4a3733] text-white py-2 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHomeCard;
