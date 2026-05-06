import React from "react";
const API_URL = "https://calidro-production.up.railway.app";
const UserGalleryCard = ({ event }) => {
  if (!event) return null;

  return (
    <div className="overflow-x-auto no-scrollbar rounded-lg shadow-lg">
      <div className="grid grid-cols-4 bg-white border border-white gap-4 p-4 h-80 flex-shrink-0 min-w-[750px] md:min-w-full transition-all">
        {/* Column 1: Info */}
        <div className="flex flex-col space-y-2 overflow-y-auto pr-1">
          <p className="text-sm md:text-base">
            <strong className="text-[#4a3733]">{event.title}</strong>
          </p>
          <p className="text-xs md:text-sm">
            Date:{" "}
            <span className="font-semibold">
              {event.date || event.event_date}
            </span>
          </p>
          <p className="text-xs md:text-sm">
            Type of Event: <span className="font-semibold">{event.type}</span>
          </p>
          <div className="text-xs md:text-sm">
            Description:
            <span className="text-[10px] md:text-xs italic text-gray-500 block mt-1 leading-relaxed">
              {event.description}
            </span>
          </div>
        </div>

        {[0, 1, 2].map((index) => {
          const imgPath = index === 0 ? event?.image : null;

          // FIX: Check if path is already a full URL (http), if not, prefix it
          const fullImgUrl = imgPath?.startsWith("http")
            ? imgPath
            : `${API_URL}/${imgPath}`;

          return (
            <div
              key={index}
              className="bg-white border border-gray-100 p-2 rounded-lg shadow-inner flex items-center justify-center overflow-hidden h-full"
            >
              {imgPath ? (
                <img
                  src={fullImgUrl}
                  alt={`event-${index}`}
                  className="w-full h-full object-cover rounded shadow-sm"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=Image+Not+Found";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center opacity-20">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-300">?</span>
                  </div>
                  <span className="text-gray-300 text-[10px] uppercase mt-2">
                    No Image
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserGalleryCard;
