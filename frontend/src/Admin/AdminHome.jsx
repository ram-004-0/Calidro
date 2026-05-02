import React, { useRef, useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";
import AdminHomeCard from "../Props/AdminHomeCard";

const API_URL = "https://calidro-production.up.railway.app";

const AdminHome = () => {
  const scrollRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/home-cards`);
      const data = await response.json();
      setCards(data);
    } catch (err) {
      console.error("Failed to load home cards:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const addCard = () => {
    const newCard = {
      home_id: null,
      title: "",
      description: "",
      image_url: null,
    };
    setCards([newCard, ...cards]);
    setEditingCardIndex(0);
  };

  const deleteCard = async (homeId, index) => {
    if (cards.length <= 3) {
      alert("Minimum of 3 cards required.");
      return;
    }
    if (!window.confirm("Are you sure?")) return;

    if (homeId) {
      try {
        await fetch(`${API_URL}/api/settings/home-cards/${homeId}`, {
          method: "DELETE",
        });
        fetchCards();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    } else {
      setCards(cards.filter((_, i) => i !== index));
      setEditingCardIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full">
      <AdminHeader />
      <section className="relative pb-2 w-full">
        {/* Consistent Container Wrapper */}
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] flex overflow-hidden">
          {/* Inner Content Wrapper with Padding */}
          <div className="p-6 flex flex-col w-full h-full">
            <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
              Home Overview
            </h1>
            <div className="flex-shrink-0">
              <button
                onClick={addCard}
                className="w-fit px-6 py-2 bg-[#f4dfba] hover:bg-[#e9d1a8] rounded-full font-bold text-[#4a3733] shadow-md transition-all mb-4"
              >
                + Add Home Card
              </button>
            </div>

            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth"
              >
                {cards.map((card, index) => (
                  <AdminHomeCard
                    key={card.home_id || `new-${index}`}
                    cardData={card}
                    onDelete={() => deleteCard(card.home_id, index)}
                    onRefresh={fetchCards}
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
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
