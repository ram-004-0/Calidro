import React, { useState } from "react";

const mod = (n, m) => ((n % m) + m) % m;

const Carousel = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle empty state
  if (data.length === 0)
    return (
      <div className="h-[400px] flex items-center justify-center text-white italic">
        No highlights to show.
      </div>
    );

  const getOffset = (index) => {
    const half = Math.floor(data.length / 2);
    let offset = index - activeIndex;

    if (offset > half) offset -= data.length;
    if (offset < -half) offset += data.length;

    return offset;
  };

  const getCardStyle = (index) => {
    const offset = getOffset(index);

    if (offset === 0) return "z-20 scale-110 opacity-100 translate-x-0 ";
    if (offset === -1)
      return "z-10 -translate-x-50 translate-y-5 scale-95 opacity-50";
    if (offset === 1)
      return "z-10 translate-x-50 translate-y-5 scale-95 opacity-50";

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
              <img
                src={
                  card.image_url ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

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
          className="absolute left-10 px-4 py-2 bg-white text-[#4a3733] rounded z-30 hover:bg-gray-200 transition-colors"
        >
          ‹
        </button>

        <button
          onClick={() => setActiveIndex((i) => mod(i + 1, data.length))}
          className="absolute right-10 px-4 py-2 bg-white text-[#4a3733] rounded z-30 hover:bg-gray-200 transition-colors"
        >
          ›
        </button>
      </div>

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
