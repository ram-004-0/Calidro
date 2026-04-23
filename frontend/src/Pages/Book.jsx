import { Link } from "react-router-dom";
import bookbg from "../assets/Images/sabook.JPG";

const Book = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      <img
        src={bookbg}
        alt="Event Hall"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <Link
        to="/login"
        className="absolute bottom-15 left-1/2 -translate-x-1/2 z-10
                   bg-white/80 text-black px-6 py-3 rounded-lg
                   hover:bg-white transition font-medium uppercase"
      >
        Book Now!
      </Link>
    </section>
  );
};

export default Book;
