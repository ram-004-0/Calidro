import React, { useRef, useState, useEffect } from "react";
import OverviewEventCard from "../Props/OverviewEventCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "https://calidro-production.up.railway.app";

const OverviewEvents = () => {
  const galleryRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  // --- NEW: Scroll Function ---
  const scroll = (direction) => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;

      galleryRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

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
    setEditingCardIndex(0);
    galleryRef.current.scrollTo({ left: 0, behavior: "smooth" });
  };

  const deleteCard = async (cardId, index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 event cards required.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this card?")) return;

    if (cardId) {
      try {
        // Change the URL to include /delete/ if your backend requires it
        const response = await fetch(
          `${API_URL}/api/settings/event-cards/delete/${cardId}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          fetchCards(); // Refresh from DB
        } else {
          console.error("Server returned an error:", response.status);
          alert("Delete failed on the server. Check backend routes.");
        }
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
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm border-2 border-[#4a3733] rounded-full shadow-lg hover:bg-[#f4dfba] transition-all -ml-4 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} className="text-[#4a3733]" />
        </button>
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
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm border-2 border-[#4a3733] rounded-full shadow-lg hover:bg-[#f4dfba] transition-all -mr-4 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} className="text-[#4a3733]" />
        </button>
      </div>
    </div>
  );
};

export default OverviewEvents;
