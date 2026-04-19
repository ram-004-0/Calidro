import { Link } from "react-router-dom";
import img from "../Assets/VTBg.jpg";

function Home() {
  return (
    <div className="flex flex-col  text-[#4a3733] min-h-screen">
      <section className="relative h-130 overflow-hidden justify-center">
        <div className="relative w-full h-full">
          <Link
            to="/login"
            className="absolute bottom-8 left-1/2 -translate-x-1/2
                       z-10 bg-white/80 text-black px-6 py-3 rounded-lg 
                       hover:bg-white transition font-medium uppercase"
          >
            LAUNCH VIRTUAL TOUR
          </Link>

          <img
            src={img}
            alt="Event Hall"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8 tracking-wide">
            ABOUT US
          </h2>

          <div className="max-w-4xl mx-auto text-[#4a3733] space-y-6 leading-relaxed">
            <p>
              <span className="font-semibold">Calidro Events Place</span> is
              owned and operated by{" "}
              <span className="font-semibold">
                Station C Creative Solutions, Inc.
              </span>
              , a full-service events agency with 20 years of experience in
              events management, video production, and television program
              production. The venue has been in operation since 2019, bringing
              professional expertise and creative flair to every event hosted.
            </p>

            <p>
              Nestled in a serene and accessible location, Calidro Events Place
              specializes in hosting a{" "}
              <span className="font-semibold">wide range of celebrations</span>,
              including weddings, debuts, corporate events, and private parties.
              Our venue combines elegance, versatility, and state-of-the-art
              facilities, creating the perfect setting for unforgettable
              experiences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
