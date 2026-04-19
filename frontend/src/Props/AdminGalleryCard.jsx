import React, { useRef, useState, useEffect } from "react";

const AdminGalleryCard = ({
  event,
  isSelected,
  onSelect,
  onImageUpload,
  onUpdate,
  onRemoveImage,
}) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...event });

  // Keep local state in sync with external data
  useEffect(() => {
    setEditData({ ...event });
  }, [event]);

  if (!event) return null;

  const handleSave = (e) => {
    e.stopPropagation();
    onUpdate(event.id, editData); // This now has the function from the parent
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditData({ ...event });
    setIsEditing(false);
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  return (
    <div
      onClick={() => !isEditing && onSelect(event.id)}
      className={`grid grid-cols-4 gap-4 p-4 rounded-lg shadow-lg cursor-pointer transition-all border-2 flex-shrink-0 min-h-[280px] ${
        isSelected
          ? "border-[#4a3733] bg-[#fdfdfd] scale-[1.01]"
          : "border-transparent bg-white hover:border-gray-200"
      }`}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={(e) => onImageUpload(event.id, e.target.files)}
        className="hidden"
        accept="image/*"
      />

      <div className="flex flex-col gap-2 text-sm">
        <p className="uppercase text-[10px] font-bold text-gray-400">
          Event Details
        </p>

        {isEditing ? (
          <div
            className="flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              className="border p-1 rounded w-full"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="Title"
            />
            <input
              type="date"
              className="border p-1 rounded w-full text-xs"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
            <select
              className="border p-1 rounded w-full text-xs"
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value })
              }
            >
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Corporate">Corporate</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              className="border p-1 rounded w-full text-xs h-20 resize-none"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="Description"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white py-1 rounded text-[10px] font-bold uppercase"
              >
                SAVE
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-400 text-white py-1 rounded text-[10px] font-bold uppercase"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>
              Title: <strong>{event.title}</strong>
            </p>
            <p>
              Date: <span className="font-semibold">{event.date}</span>
            </p>
            <p>
              Type: <span className="font-semibold">{event.type}</span>
            </p>
            <p className="text-xs italic text-gray-500 line-clamp-3">
              {event.description}
            </p>
            {isSelected && (
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="bg-[#f4dfba] hover:bg-[#e9d1a8] py-1 rounded font-bold text-[10px] uppercase"
                >
                  EDIT DETAILS
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 uppercase">
                  <span className="animate-pulse">●</span> Selected
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Columns with Remove Function */}
      {event.images?.map((img, j) => (
        <div
          key={j}
          className="relative group bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center h-40 shadow-inner overflow-hidden"
        >
          {img.includes("/") || img.includes("blob:") ? (
            <img src={img} alt="event" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">{img}</span>
          )}

          {/* REMOVE BUTTON: Only visible when card is selected */}
          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(event.id, j);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {isSelected && !isEditing && (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 hover:bg-gray-50 text-gray-400 cursor-pointer"
        >
          <span className="text-xl">+</span>
          <span className="text-[10px]">Add Photo</span>
        </div>
      )}
    </div>
  );
};

export default AdminGalleryCard;
