import React from "react";

const UserGalleryCard = ({ event }) => {
  if (!event) return null;

  return (
    /* RESPONSIVE FIX: 
       1. Added 'overflow-x-auto' so the card content doesn't break on small screens.
       2. Added 'min-w-[600px] md:min-w-full' to ensure the 4 columns have enough room to breathe.
    */
    <div className="overflow-x-auto no-scrollbar rounded-lg shadow-lg">
      <div className="grid grid-cols-4 bg-white border border-white gap-4 p-4 h-80 flex-shrink-0 min-w-[750px] md:min-w-full transition-all">
        {/* Column 1: Info */}
        <div className="flex flex-col space-y-2">
          <p className="text-sm md:text-base">
            <strong className="text-[#4a3733]">{event.title}</strong>
          </p>
          <p className="text-xs md:text-sm">
            Date: <span className="font-semibold">{event.date}</span>
          </p>
          <p className="text-xs md:text-sm">
            Type of Event: <span className="font-semibold">{event.type}</span>
          </p>
          <p className="text-xs md:text-sm">
            Description:{" "}
            <span className="text-[10px] md:text-xs italic text-gray-500 block mt-1">
              {event.description}
            </span>
          </p>
        </div>

        {/* Columns 2, 3, 4: Images */}
        {/* Added 'h-full' to the wrapper and fixed image sizing to ensure 
           they fill your h-80 card perfectly. 
        */}
        {event.images.map((img, j) => (
          <div
            key={j}
            className="bg-white border border-gray-100 p-2 rounded-lg shadow-inner flex items-center justify-center overflow-hidden h-full"
          >
            {img.includes("/") || img.includes("blob:") ? (
              <img
                src={img}
                alt={`event-${j}`}
                className="w-full h-full object-cover rounded shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-gray-300 text-[10px] uppercase mb-1">
                  Preview
                </span>
                <span className="text-gray-400 text-sm font-medium">{img}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserGalleryCard;
