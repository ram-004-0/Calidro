import { useRef } from "react";
import GalleryCard from "../Props/GalleryCard";
import RatingCard from "../Props/RatingCard";
//images
import image1 from "../assets/Images/wedding.JPG";
import image2 from "../assets/Images/15.png";
import image3 from "../assets/Images/big star event.JPG";
import image4 from "../assets/Images/lilith.JPG";
import image5 from "../assets/Images/debut.JPG";
import image6 from "../assets/Images/review1.JPG";
import image7 from "../assets/Images/review2.JPG";
import image8 from "../assets/Images/review3.jpg";
import image9 from "../assets/Images/review4.JPG";

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
              image={
                <img
                  src={image2}
                  alt="Wedding"
                  className="w-full h-full object-cover rounded-xl"
                />
              }
              title="Leni's Signing"
              description="Former Vice President Leni Robredo delivered an engaging talk, sharing her insights and experiences, followed by a book signing."
            />
            <GalleryCard
              image={
                <img
                  src={image1}
                  alt="Wedding"
                  className="w-full h-full object-cover rounded-xl"
                />
              }
              title="Wedding"
              description="Two souls, one promise. An elegant celebration of love, from heartfelt vows to the final dance, marking the beginning of a lifetime together."
            />
            <GalleryCard
              image={
                <img
                  src={image3}
                  alt="Wedding"
                  className="w-full h-full object-cover rounded-xl"
                />
              }
              title="Big Star Event"
              description="A night of prestige and brilliance. We honor excellence and groundbreaking achievement under the glow of the spotlight."
            />
            <GalleryCard
              image={
                <img
                  src={image4}
                  alt="Wedding"
                  className="w-full h-full object-cover rounded-xl"
                />
              }
              title="Lilith in ONEderland"
              description="A whimsical realm of magic and dreams. We’re celebrating Lilith’s first chapter with a pastel-filled wonderland of joy and enchantment."
            />
            <GalleryCard
              image={
                <img
                  src={image5}
                  alt="Wedding"
                  className="w-full h-full object-cover rounded-xl"
                />
              }
              title="Sofia's Debut"
              description="A milestone of grace and poise. Join us as she steps into adulthood in a sophisticated night of tradition, charm, and new beginnings."
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
                  alt="Rochi"
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
                  alt="Rochi"
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
                  alt="Rochi"
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
