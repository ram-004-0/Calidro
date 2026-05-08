import { useState, useEffect } from "react";
import UserHeader from "../Components/UserHeader";
import Carousel from "../Props/sample.jsx";
import UserRatingCard from "../Props/UserRatingCard.jsx";

const API_URL = "https://calidro-production.up.railway.app";

const UserHome = () => {
  const [homeCards, setHomeCards] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  // 3. FETCH CAROUSEL DATA ONLY
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both Carousel and Reviews
        const [cardRes, reviewRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/home-cards`),
          fetch(`${API_URL}/api/all-ratings`),
        ]);

        const cardData = await cardRes.json();
        const reviewData = await reviewRes.json();

        setHomeCards(cardData);
        setReviews(reviewData);
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

  // Calculate stats for the bars (5 star, 4 star, etc.)
  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percent =
      totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%";
    return { label: `${star} star`, count, percent };
  });

  // Filtering Logic
  const filteredReviews =
    activeFilter === "All"
      ? reviews
      : reviews.filter((rev) => rev.rating === parseInt(activeFilter));

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col">
      <UserHeader />

      {/* Dynamic Carousel using home_card database data */}
      {loadingCards ? (
        <div className="h-[400px] flex items-center justify-center text-white">
          Loading Highlights...
        </div>
      ) : (
        <Carousel data={homeCards} />
      )}

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

      {/* --- Ratings Section (Back to Static) --- */}
      <section className="relative py-20 w-full bg-[#f1f1f1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-14">
            <h1 className="text-2xl font-bold text-[#4a3733] mb-10 uppercase tracking-widest">
              Ratings
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-16 mb-12 pb-12 border-b border-gray-100">
              <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-8">
                <span className="text-8xl font-bold text-[#4a3733]">5.0</span>
                <div className="text-yellow-500 text-2xl my-3">★★★★★</div>
                <p className="text-gray-400 text-sm font-semibold uppercase">
                  67 Ratings
                </p>
              </div>

              <div className="space-y-4 flex flex-col justify-center">
                {ratingStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-6">
                    <span className="text-sm font-bold text-[#4a3733] w-16">
                      {stat.label}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4a3733]"
                        style={{ width: stat.percent }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 w-10">
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Filter Buttons --- */}
            <div className="flex flex-wrap gap-4 mb-12">
              {["All", "5", "4", "3", "2", "1"].map((star) => (
                <button
                  key={star}
                  onClick={() => setActiveFilter(star)}
                  className={`px-6 py-2 rounded-full border text-sm font-bold transition-all duration-300 ${
                    activeFilter === star
                      ? "bg-[#4a3733] text-white border-[#4a3733] shadow-lg scale-105"
                      : "bg-white text-[#4a3733] border-gray-200 hover:border-[#4a3733]"
                  }`}
                >
                  {star === "All" ? "All Reviews" : `${star} Star`}
                </button>
              ))}
            </div>

            {/* --- Filtered Review Cards (Static) --- */}
            <div className="space-y-8">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <UserRatingCard
                    key={rev.id}
                    name={rev.user_name}
                    date={rev.created_at}
                    rating={rev.rating}
                    comment={rev.comment}
                    images={rev.review_images}
                  />
                ))
              ) : (
                <div className="py-20 text-center text-gray-400 italic text-lg">
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
