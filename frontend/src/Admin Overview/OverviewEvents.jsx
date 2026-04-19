import React, { useRef, useState } from "react";
import OverviewEventCard from "../Props/OverviewEventCard";

const OverviewEvents = () => {
  const galleryRef = useRef(null);
  const [cards, setCards] = useState([1, 2, 3]); // initial cards
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const scrollLeft = () => {
    galleryRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    galleryRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const addCard = () => {
    const newCardId = Date.now(); // unique id
    setCards([...cards, newCardId]);
  };

  const deleteCard = (index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 event cards required.");
      return;
    }
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
        Events Overview
      </h1>

      {/* Add Card Button */}
      <div className="flex gap-4 mb-3">
        <button
          onClick={addCard}
          className="px-6 py-2 bg-[#f4dfba] hover:bg-[#e9d1a8] rounded-full font-bold text-[#4a3733] shadow-md transition-all"
        >
          + Add Event Card
        </button>
      </div>

      {/* Gallery / Cards */}
      <div className="relative w-full">
        {/* Scroll Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"
        >
          ‹
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"
        >
          ›
        </button>

        <div
          ref={galleryRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-10 py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {cards.map((card, index) => (
            <OverviewEventCard
              key={card}
              onDelete={() => deleteCard(index)}
              isEditing={editingCardIndex === index}
              setEditingCard={(editing) =>
                setEditingCardIndex(editing ? index : null)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewEvents;
