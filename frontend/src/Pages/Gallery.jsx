import { useRef, useState, useEffect } from "react";
import GalleryCard from "../Props/GalleryCard";
import RatingCard from "../Props/RatingCard";

const API_URL = "https://calidro-production.up.railway.app";

const Gallery = () => {
  const eventsRef = useRef(null);
  const ratingsRef = useRef(null);

  // 1. Setup state for your database cards
  const [dbEvents, setDbEvents] = useState([]);
  const [dbRatings, setDbRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the data when the component loads
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const [eventsRes, ratingsRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/event-cards`),
          fetch(`${API_URL}/api/gallery-ratings`), // Fetch from new route
        ]);

        const eventsData = await eventsRes.json();
        const ratingsData = await ratingsRes.json();

        setDbEvents(eventsData);
        setDbRatings(ratingsData);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryData();
  }, []);

  const slide = (ref, direction) => {
    if (!ref.current || !ref.current.firstChild) return;
    const cardWidth = ref.current.firstChild.offsetWidth;
    ref.current.scrollBy({
      left: direction * (cardWidth + 24),
      behavior: "smooth",
    });
  };

  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

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

      {/* ================= Ratings ================= */}
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
            {loading ? (
              <p className="px-5">Loading reviews...</p>
            ) : dbRatings.length > 0 ? (
              dbRatings.map((rev) => (
                <RatingCard
                  key={rev.rating_id}
                  image={
                    <img
                      src={rev.first_image}
                      alt={rev.username}
                      className="w-full h-full object-cover"
                    />
                  }
                  name={rev.username}
                  comment={rev.comment}
                  stars={renderStars(rev.rating)}
                />
              ))
            ) : (
              <p className="px-5 text-gray-500">No photo reviews found.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
