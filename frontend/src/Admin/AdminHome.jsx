import React, { useRef, useState } from "react";
import AdminHeader from "../Components/AdminHeader";
import AdminHomeCard from "../Props/AdminHomeCard";

const AdminHome = () => {
  const scrollRef = useRef(null);
  // Initializing with unique keys for better React list handling
  const [cards, setCards] = useState([
    Date.now(),
    Date.now() + 1,
    Date.now() + 2,
  ]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const scroll = (offset) => {
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Logic to add a card
  const addCard = () => {
    setCards([...cards, Date.now()]);
  };

  // NEW: Logic to enforce minimum of 3 cards
  const deleteCard = (index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 cards required for the Home section.");
      return;
    }
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full">
      <AdminHeader />
      <section className="relative pb-2 w-full">
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
              Home
            </h1>
          </div>
          <div className="flex gap-4 mb-3">
            <button
              onClick={addCard}
              className="px-6 py-2 bg-[#f4dfba] hover:bg-[#e9d1a8] rounded-full font-bold text-[#4a3733] shadow-md transition-all"
            >
              + Add Home Card
            </button>
          </div>

          <div className="relative group">
            {/* Nav Buttons */}
            <button
              onClick={() => scroll(-300)}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition"
            >
              ‹
            </button>
            <button
              onClick={() => scroll(300)}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center hover:scale-110 transition"
            >
              ›
            </button>

            {/* THE LIST */}
            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {cards.map((card, index) => (
                <AdminHomeCard
                  key={card}
                  onDelete={() => deleteCard(index)}
                  // Logic remains: Dim if someone ELSE is being edited
                  isEditing={
                    editingCardIndex !== null && editingCardIndex !== index
                  }
                  setEditingCard={(editing) =>
                    setEditingCardIndex(editing ? index : null)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
