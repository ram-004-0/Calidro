import React, { useState, useEffect } from "react";

const RatingCard = ({ image, name, comment, stars }) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex-shrink-0 p-2">
      <div
        className={`grid gap-4 p-6 rounded-lg shadow-lg transition-all duration-300 bg-white border border-gray-100 overflow-hidden
          ${
            isMobileView
              ? "grid-cols-1 w-[300px] h-[480px]" // Fixed Mobile Height
              : "grid-cols-[60%_40%] w-[560px] h-80" // Desktop Side-by-Side
          }`}
      >
        {/* Image Container */}
        <div
          className={`rounded-2xl overflow-hidden shrink-0 ${
            isMobileView ? "h-40" : "h-full"
          }`}
        >
          {image}
        </div>

        {/* Text/Rating Container */}
        <div
          className={`flex flex-col overflow-hidden ${
            isMobileView ? "justify-start mt-2" : "justify-center"
          }`}
        >
          {/* Name Area: Fixed height */}
          <div className="h-8 mb-1 flex items-center">
            <h1 className="text-[#4a3733] font-bold text-base md:text-lg uppercase tracking-wide truncate w-full">
              {name}
            </h1>
          </div>

          {/* Comment Area: Fixed height with line clamp */}
          <div className={`${isMobileView ? "h-32" : "h-32"} overflow-hidden`}>
            <p className="text-[#4a3733] text-sm leading-relaxed italic line-clamp-5 md:line-clamp-5">
              "{comment}"
            </p>
          </div>

          {/* Stars Area: Fixed height at bottom */}
          <div className="h-8 mt-auto flex items-center">
            <span className="text-yellow-500 text-lg font-bold">{stars}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingCard;
