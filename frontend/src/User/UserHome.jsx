import { useState } from "react";
import UserHeader from "../Components/UserHeader";
import Sample from "../Props/sample.jsx";
import UserRatingCard from "../Props/UserRatingCard.jsx";
const UserHome = () => {
  const staticReviews = [
    {
      id: 1,
      user_name: "Rochi",
      rating: 5,
      comment:
        "The venue is absolutely stunning. Perfect for our wedding! The staff was very helpful.",
      created_at: "2 weeks ago",
      review_images: [
        "https://via.placeholder.com/150",
        "https://via.placeholder.com/150",
      ],
    },
    {
      id: 2,
      user_name: "Ella",
      rating: 4,
      comment:
        "Great place, but the parking was a bit tight. Overall 10/10 service and beautiful lights.",
      created_at: "1 month ago",
      review_images: [],
    },
    {
      id: 3,
      user_name: "Bautista",
      rating: 3,
      comment:
        "The place is okay, but it was a bit hot inside during the afternoon.",
      created_at: "2 months ago",
      review_images: [],
    },
    {
      id: 4,
      user_name: "Mark",
      rating: 5,
      comment:
        "Amazing experience! The virtual tour was exactly like the real thing.",
      created_at: "3 days ago",
      review_images: ["https://via.placeholder.com/150"],
    },
  ];

  // 2. STATE FOR FILTERING
  const [activeFilter, setActiveFilter] = useState("All");

  // 3. FILTERING LOGIC
  const filteredReviews =
    activeFilter === "All"
      ? staticReviews
      : staticReviews.filter((rev) => rev.rating === parseInt(activeFilter));

  // 4. CHART DATA (Static for now)
  const ratingStats = [
    { label: "5 star", count: 44, percent: "85%" },
    { label: "4 star", count: 12, percent: "15%" },
    { label: "3 star", count: 7, percent: "8%" },
    { label: "2 star", count: 3, percent: "3%" },
    { label: "1 star", count: 1, percent: "1%" },
  ];

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col">
      <UserHeader />
      <Sample />

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

      <section className="relative py-20 w-full bg-[#f1f1f1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-14">
            <h1 className="text-2xl font-bold text-[#4a3733] mb-10 uppercase tracking-widest">
              Ratings
            </h1>

            {/* --- Summary Chart --- */}
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

            {/* --- Filtered Review Cards --- */}
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
