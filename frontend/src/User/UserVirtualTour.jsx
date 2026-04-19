import UserHeader from "../Components/UserHeader";
import uservtbg from "../assets/UserVTbG.jpg";

const UserVirtualTour = () => {
  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#4a3733] flex flex-col h-full">
      <UserHeader />
      <section className="relative h-150 overflow-hidden justify-center">
        <div className="relative w-full h-full">
          <img
            src={uservtbg}
            alt="Virtual Tour Preview"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
      <section className="relative mt-10 px-6 pb-10">
        <div className="max-w-365 mx-auto bg-white rounded-3xl shadow-xl p-10">
          <div className="grid md:grid-cols-2 gap-10 text-[#4a3733] leading-relaxed">
            <div className="space-y-5 text-justify">
              <p>
                Welcome to <strong>Calidro Events Place</strong>, where every
                corner is crafted to make your celebration unforgettable. As you
                step inside, you’re greeted by a spacious, open-air layout that
                blends elegance with a natural, calming atmosphere. Soft, warm
                lighting guides you through the venue, highlighting the modern
                rustic details—wooden textures, earth-tone accents, and
                thoughtfully arranged décor that sets the perfect mood for
                intimate gatherings or grand celebrations.
              </p>
              <p>
                Move a little further and you’ll find the{" "}
                <strong>main hall</strong> an expansive area designed to adapt
                to your event’s theme. Its high ceilings and clean,
                sophisticated backdrop make it easy to transform the space for
                weddings, birthdays, corporate functions, and any special
                occasion. The hall flows seamlessly toward the outdoor section,
                giving guests the freedom to enjoy both indoor comfort and fresh
                air.
              </p>
              <p>
                Just outside, the <strong>garden area</strong> offers a
                refreshing view view—lush greenery, beautifully maintained
                pathways, and charming spotlights that bring the place to life
                at night. This space is perfect for photoshoots, cocktail hours,
                or simply letting your guests relax in a serene environment.
              </p>
            </div>

            <div className="space-y-3 text-justify">
              <p>
                <strong>Venue Name:</strong> Calidro Events Place
              </p>
              <p>
                <strong>Capacity:</strong> Up to 200 pax
              </p>
              <p>
                <strong>Venue Type:</strong> Indoor Events Venue
              </p>
              <p>
                <strong>Main Hall:</strong> Fully enclosed
              </p>
              <p>
                <strong>Design Style:</strong> Modern rustic
              </p>
              <p>
                <strong>Lighting:</strong> Warm ambient lighting
              </p>
              <p>
                <strong>Layout:</strong> Flexible and customizable
              </p>
              <p>
                <strong>Parking:</strong> Available for guests
              </p>
              <p>
                <strong>Accessibility:</strong> Easy guest flow; convenient
                entrance and exit points
              </p>
              <p>
                <strong>Atmosphere:</strong> Comfortable, intimate, and
                celebration-ready
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserVirtualTour;
