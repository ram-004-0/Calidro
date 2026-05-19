import { useState, useEffect } from "react";
import UserHeader from "../Components/UserHeader";
import Carousel from "../Props/sample.jsx";
import UserRatingCard from "../Props/UserRatingCard.jsx";

const API_URL = "https://calidro-production.up.railway.app";

const UserHome = () => {
  const [homeCards, setHomeCards] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardRes, reviewRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/home-cards`),
          fetch(`${API_URL}/api/all-ratings`),
        ]);

        const cardData = await cardRes.json();
        const reviewData = await reviewRes.json();

        // Safety: Ensure reviewData is actually an array before setting state
        setHomeCards(Array.isArray(cardData) ? cardData : []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DYNAMIC CALCULATION LOGIC ---
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percent =
      totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%";
    return { label: `${star} star`, count, percent };
  });

  const filteredReviews =
    activeFilter === "All"
      ? reviews
      : reviews.filter((rev) => rev.rating === parseInt(activeFilter));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#433633] flex items-center justify-center text-white">
        Loading Calidro...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col">
      <UserHeader />

      <Carousel data={homeCards} />

      {/* --- About Us Section --- */}
      <section className="py-10 bg-[#f1f1f1]">
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

      {/* --- Dynamic Ratings Section --- */}
      <section className="relative py-20 w-full bg-[#f1f1f1]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl p-5 md:p-14">
            <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-6 md:mb-10 uppercase tracking-widest text-center md:text-left">
              Ratings
            </h1>

            {/* Adjusted gap on mobile to shrink the overall footprint */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 md:gap-16 mb-8 md:mb-12 pb-8 md:pb-12 border-b border-gray-100">
              {/* Scaled text size down on mobile; changed side border to a bottom border on mobile */}
              <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                <span className="text-6xl md:text-8xl font-bold text-[#4a3733]">
                  {averageRating}
                </span>
                <div className="text-yellow-500 text-xl md:text-2xl my-2 md:my-3">
                  {"★".repeat(Math.round(parseFloat(averageRating)))}
                  {"☆".repeat(5 - Math.round(parseFloat(averageRating)))}
                </div>
                <p className="text-gray-400 text-xs md:text-sm font-semibold uppercase">
                  {totalReviews} Ratings
                </p>
              </div>

              {/* Progress bars: optimized spacing and heights for small screen displays */}
              <div className="space-y-2 md:space-y-4 flex flex-col justify-center">
                {ratingStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 md:gap-6"
                  >
                    <span className="text-xs md:text-sm font-bold text-[#4a3733] w-12 md:w-16 whitespace-nowrap">
                      {stat.label}
                    </span>
                    <div className="flex-1 h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4a3733]"
                        style={{ width: stat.percent }}
                      ></div>
                    </div>
                    <span className="text-xs md:text-sm text-gray-400 w-8 md:w-10 text-right">
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Filter Buttons with an elegant side-scroll path on mobile view --- */}
            <div className="flex flex-row md:flex-wrap gap-2 md:gap-4 mb-8 md:mb-12 overflow-x-auto md:overflow-visible pb-3 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x -mx-5 px-5 md:mx-0 md:px-0">
              {["All", "5", "4", "3", "2", "1"].map((star) => (
                <button
                  key={star}
                  onClick={() => setActiveFilter(star)}
                  className={`px-4 md:px-6 py-2 rounded-full border text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap snap-tight ${
                    activeFilter === star
                      ? "bg-[#4a3733] text-white border-[#4a3733] shadow-md md:shadow-lg scale-105"
                      : "bg-white text-[#4a3733] border-gray-200 hover:border-[#4a3733]"
                  }`}
                >
                  {star === "All" ? "All Reviews" : `${star} Star`}
                </button>
              ))}
            </div>

            {/* --- Filtered Review Cards --- */}
            <div className="space-y-6 md:space-y-8">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <UserRatingCard
                    key={rev.rating_id} // Use the DB rating_id
                    name={rev.username}
                    date={new Date(rev.created_at).toLocaleDateString()}
                    rating={rev.rating}
                    comment={rev.comment}
                    images={rev.review_images}
                  />
                ))
              ) : (
                <div className="py-12 md:py-20 text-center text-gray-400 italic text-base md:text-lg">
                  No {activeFilter} star ratings found for Calidro.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserHome;
