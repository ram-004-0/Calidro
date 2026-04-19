import React, { useState } from "react";

const cards = [
  { id: 0, title: "Card One", description: "This is the first card" },
  { id: 1, title: "Card Two", description: "This is the second card" },
  { id: 2, title: "Card Three", description: "This is the third card" },
  { id: 3, title: "Card Four", description: "This is the fourth card" },
  { id: 4, title: "Card Five", description: "This is the fifth card" },
];

const mod = (n, m) => ((n % m) + m) % m;

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getOffset = (index) => {
    const half = Math.floor(cards.length / 2);
    let offset = index - activeIndex;

    if (offset > half) offset -= cards.length;
    if (offset < -half) offset += cards.length;

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
    <div className="p-10">
      <div className="relative flex justify-center items-center h-80 overflow-hidden">
        {cards.map((card, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={card.id}
              className={`
            absolute w-95 h-75 rounded-lg bg-gray-200 shadow-lg 
            transition-all duration-800 ease-in-out
            flex flex-col justify-end p-4 
            ${getCardStyle(index)}
          `}
            >
              <h3
                className={`
              text-lg font-semibold transition-opacity duration-300
              ${isActive ? "opacity-100" : "opacity-0"}
            `}
              >
                {card.title}
              </h3>
            </div>
          );
        })}

        <button
          onClick={() => setActiveIndex((i) => mod(i - 1, cards.length))}
          className="absolute left-10 px-4 py-2 bg-white text-[#4a3733] rounded"
        >
          ‹
        </button>

        <button
          onClick={() => setActiveIndex((i) => mod(i + 1, cards.length))}
          className="absolute right-10 px-4 py-2 bg-white text-[#4a3733] rounded"
        >
          ›
        </button>
      </div>

      {/* OUTSIDE DESCRIPTION */}
      <div className="mt-6 h-10 flex justify-center items-center overflow-hidden">
        <p
          key={activeIndex}
          className="
      text-l text-white
      animate-description
    "
        >
          {cards[activeIndex].description}
        </p>
      </div>
    </div>
  );
};

export default Carousel;
