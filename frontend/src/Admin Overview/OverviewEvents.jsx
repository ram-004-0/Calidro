import React, { useRef, useState, useEffect } from "react";
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
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const addCard = () => {
    const newCard = {
      events_overview_id: null, // Temporary ID
      title: "",
      description: "",
      image_url: null,
    };
    setCards([newCard, ...cards]);
    setEditingCardIndex(0); // Set the newly added card to be ready for editing
  };

  const deleteCard = async (cardId, index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 event cards required.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this card?")) return;

    if (cardId) {
      try {
        await fetch(`${API_URL}/api/settings/event-cards/${cardId}`, {
          method: "DELETE",
        });
        fetchCards(); // Refresh from DB
      } catch (err) {
        console.error("Delete failed:", err);
      }
    } else {
      // If it wasn't saved yet, just remove from UI
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
        Events Overview
      </h1>
      <button
        onClick={addCard}
        className="px-6 py-2 bg-[#f4dfba] hover:bg-[#e9d1a8] rounded-full font-bold text-[#4a3733] shadow-md transition-all mb-4"
      >
        + Add Event Card
      </button>

      <div className="relative w-full">
        <div
          ref={galleryRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-10 py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {cards.map((card, index) => (
            <OverviewEventCard
              key={card.events_overview_id || `new-${index}`}
              cardData={card}
              onDelete={() => deleteCard(card.events_overview_id, index)}
              onRefresh={fetchCards}
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
