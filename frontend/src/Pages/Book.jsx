import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bookbg from "../assets/Images/sabook.JPG"; // Local fallback

const API_URL = "https://calidro-production.up.railway.app";

const Book = () => {
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/book-asset`);
        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();
        if (data.imageUrl) {
          setBgImage(data.imageUrl);
        }
      } catch (err) {
        console.error("Error fetching background image:", err);
        // If it fails, the state remains null and we use the fallback in the src
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <img
        src={bgImage || bookbg} // Database image first, fallback second
        alt="Event Hall Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <Link
        to="/login"
        className="absolute bottom-15 left-1/2 -translate-x-1/2 z-10
                   bg-white/80 text-black px-6 py-3 rounded-lg
                   hover:bg-white transition font-medium uppercase shadow-lg"
      >
        Book Now!
      </Link>
    </section>
  );
};

export default Book;
