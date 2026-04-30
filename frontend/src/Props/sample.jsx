import React, { useState } from "react";

const mod = (n, m) => ((n % m) + m) % m;

const Carousel = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // If data is still loading or empty, don't render or show a fallback
  if (!data || data.length === 0) {
    return (
      <div className="py-15 p-10 h-[500px] flex items-center justify-center text-white italic">
        Loading highlights...
      </div>
    );
  }

  const getOffset = (index) => {
    const half = Math.floor(data.length / 2);
    let offset = index - activeIndex;

    if (offset > half) offset -= data.length;
    if (offset < -half) offset += data.length;

    return offset;
  };

  const getCardStyle = (index) => {
    const offset = getOffset(index);

    // Center card
    if (offset === 0) return "z-20 scale-110 opacity-100 translate-x-0 ";

    // Left card
    if (offset === -1)
      return "z-10 -translate-x-50 translate-y-5 scale-95 opacity-50";

    // Right card
    if (offset === 1)
      return "z-10 translate-x-50 translate-y-5 scale-95 opacity-50";

    // Hidden cards
    return "opacity-0 scale-75 pointer-events-none";
  };

  return (
    <div className="py-15 p-10">
      <div className="relative flex justify-center items-center h-[400px] overflow-hidden">
        {data.map((card, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={card.home_id || index}
              className={`absolute w-95 h-75 rounded-lg shadow-lg overflow-hidden transition-all duration-800 ease-in-out flex flex-col justify-end p-4 ${getCardStyle(index)}`}
            >
              {/* Using image_url from your database */}
              <img
                src={card.image_url}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <h3
                className={`relative z-10 text-lg font-semibold text-white transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
              >
                {card.title}
              </h3>
            </div>
          );
        })}

        <button
          onClick={() => setActiveIndex((i) => mod(i - 1, data.length))}
          className="absolute left-10 px-4 py-2 bg-white text-[#4a3733] rounded z-30 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          ‹
        </button>

        <button
          onClick={() => setActiveIndex((i) => mod(i + 1, data.length))}
          className="absolute right-10 px-4 py-2 bg-white text-[#4a3733] rounded z-30 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Description container below carousel */}
      <div className="mt-6 h-24 flex justify-center items-center px-10">
        <p
          key={activeIndex}
          className="text-center text-white text-md leading-relaxed max-w-2xl animate-fade-in line-clamp-3"
        >
          {data[activeIndex]?.description}
        </p>
      </div>
    </div>
  );
};

export default Carousel;
