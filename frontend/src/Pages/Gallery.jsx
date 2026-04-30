import { useRef, useState, useEffect } from "react";
import GalleryCard from "../Props/GalleryCard";
import RatingCard from "../Props/RatingCard";

// Keep rating images as they are static for now
import image6 from "../assets/Images/review1.JPG";
import image7 from "../assets/Images/review2.JPG";
import image8 from "../assets/Images/review3.jpg";
import image9 from "../assets/Images/review4.JPG";

const API_URL = "https://calidro-production.up.railway.app";

const Gallery = () => {
  const eventsRef = useRef(null);
  const ratingsRef = useRef(null);

  // 1. Setup state for your database cards
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the data when the component loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/event-cards`);
        const data = await response.json();
        setDbEvents(data);
      } catch (error) {
        console.error("Error fetching gallery events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const slide = (ref, direction) => {
    if (!ref.current || !ref.current.firstChild) return;
    const cardWidth = ref.current.firstChild.offsetWidth;
    ref.current.scrollBy({
      left: direction * (cardWidth + 24),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative bg-[#f1f1f1] space-y-16">
      {/* ================= Previous Events ================= */}
      <section className="relative">
        <h1 className="px-10 text-3xl font-bold text-[#4a3733] mb-4">
          Previous Events
        </h1>

        {/* Navigation Buttons */}
        <button
          onClick={() => slide(eventsRef, -1)}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg hover:bg-[#3a2c28] transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => slide(eventsRef, 1)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg hover:bg-[#3a2c28] transition-colors"
        >
          ›
        </button>

        {/* Slider */}
        <div className="p-10 py-4">
          <div
            ref={eventsRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth px-5"
          >
            {loading ? (
              <p className="text-[#4a3733] animate-pulse">Loading events...</p>
            ) : dbEvents.length > 0 ? (
              // 3. Map through the database events
              dbEvents.map((event) => (
                <GalleryCard
                  key={event.events_overview_id}
                  title={event.title}
                  description={event.description}
                  image={
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  }
                />
              ))
            ) : (
              <p className="text-gray-500 italic">No events found.</p>
            )}
          </div>
        </div>
      </section>

      {/* ================= Ratings (Keep as is) ================= */}
      <section className="relative">
        <h1 className="px-10 text-3xl font-bold text-[#4a3733] mb-4">
          Ratings
        </h1>

        <button
          onClick={() => slide(ratingsRef, -1)}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg"
        >
          ‹
        </button>
        <button
          onClick={() => slide(ratingsRef, 1)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg"
        >
          ›
        </button>

        <div className="p-10 py-4">
          <div
            ref={ratingsRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth px-5"
          >
            <RatingCard
              image={
                <img
                  src={image6}
                  alt="Rochi"
                  className="w-full h-full object-cover"
                />
              }
              name="Rochi"
              comment="The venue is absolutely stunning. Perfect for our wedding! The staff was very helpful."
              stars="★★★★★"
            />
            <RatingCard
              image={
                <img
                  src={image7}
                  alt="Mark"
                  className="w-full h-full object-cover"
                />
              }
              name="Mark"
              comment="Amazing experience! The virtual tour was exactly like the real thing."
              stars="★★★★★"
            />
            <RatingCard
              image={
                <img
                  src={image8}
                  alt="Ella"
                  className="w-full h-full object-cover"
                />
              }
              name="Ella"
              comment="Great place, but the parking was a bit tight. Overall 10/10 service and beautiful lights."
              stars="★★★★☆"
            />
            <RatingCard
              image={
                <img
                  src={image9}
                  alt="Bautista"
                  className="w-full h-full object-cover"
                />
              }
              name="Bautista"
              comment="The place is okay, but it was a bit hot inside during the afternoon."
              stars="★★★☆☆"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
