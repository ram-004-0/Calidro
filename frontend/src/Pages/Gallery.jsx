import { useRef } from "react";
import GalleryCard from "../Props/GalleryCard";
import RatingCard from "../Props/RatingCard";

const Gallery = () => {
  const eventsRef = useRef(null);
  const ratingsRef = useRef(null);

  const slide = (ref, direction) => {
    if (!ref.current) return;

    const cardWidth = ref.current.firstChild.offsetWidth;
    ref.current.scrollBy({
      left: direction * (cardWidth + 24), // includes gap
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

        {/* Buttons */}
        <button
          onClick={() => slide(eventsRef, -1)}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg"
        >
          ‹
        </button>
        <button
          onClick={() => slide(eventsRef, 1)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-[#4a3733] text-white p-3 rounded-full shadow-lg"
        >
          ›
        </button>

        {/* Slider */}
        <div className="p-10 py-4">
          <div
            ref={eventsRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth px-5"
          >
            <GalleryCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              title="Leni's Signing"
              description="Former Vice President Leni Robredo delivered an engaging talk, sharing her insights and experiences, followed by a book signing."
            />
            <GalleryCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              title="Sophia's Debut"
              description="The debutante marked her special day with a magical garden-themed celebration."
            />
            <GalleryCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              title="Event Title"
              description="Event Description"
            />
            <GalleryCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              title="Event Title"
              description="Event Description"
            />
            <GalleryCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              title="Event Title"
              description="Event Description"
            />
          </div>
        </div>
      </section>

      {/* ================= Ratings ================= */}
      <section className="relative">
        <h1 className="px-10 text-3xl font-bold text-[#4a3733] mb-4">
          Ratings
        </h1>

        {/* Buttons */}
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

        {/* Slider */}
        <div className="p-10 py-4">
          <div
            ref={ratingsRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth px-5"
          >
            <RatingCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              name="Name"
              comment="Comment about the event experience."
              stars="★★★★★"
            />
            <RatingCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              name="Name"
              comment="Comment about the event experience."
              stars="★★★★☆"
            />
            <RatingCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              name="Name"
              comment="Comment about the event experience."
              stars="★★★★★"
            />
            <RatingCard
              image={<div className="bg-gray-300 w-full h-full rounded-xl" />}
              name="Name"
              comment="Comment about the event experience."
              stars="★★★★★"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
