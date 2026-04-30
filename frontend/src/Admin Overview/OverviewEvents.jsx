import React, { useRef, useState } from "react";
import OverviewEventCard from "../Props/OverviewEventCard";

const API_URL = "https://calidro-production.up.railway.app";

const OverviewEvents = () => {
  const galleryRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/event-cards`);
      const data = await response.json();
      setCards(data); // data contains the rows from events_overview_card
    } catch (err) {
      console.error("Failed to load cards:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const scrollLeft = () => {
    galleryRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    galleryRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const addCard = () => {
    // Add a temporary "new" card to the UI
    const newCard = {
      events_overview_id: null, // null tells the child it's a NEW record
      title: "",
      description: "",
      image_url: null,
    };
    setCards([newCard, ...cards]);
    setEditingCardIndex(0); // Auto-focus the new card for editing
  };

  const deleteCard = async (cardId, index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 event cards required.");
      return;
    }

    if (!cardId) {
      // If it hasn't been saved to DB yet, just remove from UI
      setCards(cards.filter((_, i) => i !== index));
      return;
    }

    // Optional: Add a DELETE route in server.js and call it here
    // await fetch(`${API_URL}/api/settings/event-cards/${cardId}`, { method: 'DELETE' });

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

      <div className="relative w-full">
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
              key={card.events_overview_id || `new-${index}`}
              cardData={card} // Pass the whole object (id, title, desc, img)
              onDelete={() => deleteCard(card.events_overview_id, index)}
              onRefresh={fetchCards} // Allow child to trigger a refresh after saving
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
