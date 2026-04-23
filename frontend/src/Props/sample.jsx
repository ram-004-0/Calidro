import React, { useState } from "react";
//images
import image1 from "../assets/Images/wedding.JPG";
import image2 from "../assets/Images/16.png";
import image3 from "../assets/Images/big star event.JPG";
import image4 from "../assets/Images/lilith.JPG";
import image5 from "../assets/Images/debut.JPG";

const cards = [
  {
    id: 0,
    title: "Leni's Signing",
    description:
      "Former Vice President Leni Robredo delivered an engaging talk, sharing her insights and experiences, followed by a book signing afterwards.",
    image: image2,
  },
  {
    id: 1,
    title: "Wedding",
    description:
      "Two souls, one promise. An elegant celebration of love, from heartfelt vows to the final dance, marking the beginning of a lifetime together.",
    image: image1,
  },
  {
    id: 2,
    title: "Big Star Event",
    description:
      "A night of prestige and brilliance. We honor excellence and groundbreaking achievement under the glow of the spotlight.",
    image: image3,
  },
  {
    id: 3,
    title: "Lilith in ONEderland",
    description:
      "A whimsical realm of magic and dreams. We’re celebrating Lilith’s first chapter with a pastel-filled wonderland of joy and enchantment.",
    image: image4,
  },
  {
    id: 4,
    title: "Sofia's Debut",
    description:
      "A milestone of grace and poise. Join us as she steps into adulthood in a sophisticated night of tradition, charm, and new beginnings.",
    image: image5,
  },
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
    <div className="py-15 p-10">
      <div className="relative flex justify-center items-center h-[400px] overflow-hidden">
        {cards.map((card, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={card.id}
              className={`absolute w-95 h-75 rounded-lg shadow-lg overflow-hidden transition-all duration-800 ease-in-out flex flex-col justify-end p-4 ${getCardStyle(index)}`}
            >
              {/* The image is now using the imported variable from your array */}
              <img
                src={card.image}
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

      {/* Adjusted container to fixed height */}
      <div className="mt-6 h-24 flex justify-center items-center px-10">
        <p
          key={activeIndex}
          className="
      text-center text-white text-md leading-relaxed 
      max-w-2xl
      animate-fade-in
      line-clamp-3
    "
        >
          {cards[activeIndex].description}
        </p>
      </div>
    </div>
  );
};

export default Carousel;
