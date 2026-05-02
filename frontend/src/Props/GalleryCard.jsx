import React, { useState, useEffect } from "react";

const GalleryCard = ({ image, title, description }) => {
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
        className={`grid gap-4 p-4 rounded-lg shadow-lg transition-all duration-300 bg-white border border-white overflow-hidden
          ${
            isMobileView
              ? "grid-cols-1 w-[300px] h-[480px]" // Fixed height for Mobile (480px)
              : "grid-cols-[60%_40%] w-[560px] h-80" // Side-by-side for Desktop
          }`}
      >
        {/* Container for the image */}
        <div
          className={`rounded-2xl overflow-hidden shrink-0 ${
            isMobileView ? "h-48" : "h-full"
          }`}
        >
          {image}
        </div>

        {/* Container for text */}
        <div
          className={`flex flex-col overflow-hidden ${
            isMobileView ? "justify-start" : "justify-center"
          }`}
        >
          {/* Title area */}
          <div
            className={`flex items-end mb-2 ${isMobileView ? "h-12" : "h-14"}`}
          >
            <h1 className="text-[#4a3733] font-bold text-base md:text-lg uppercase line-clamp-2">
              {title}
            </h1>
          </div>

          {/* Description area */}
          <div className={`${isMobileView ? "h-44" : "h-32"}`}>
            <p className="text-[#4a3733] text-xs md:text-sm leading-relaxed line-clamp-6 md:line-clamp-5">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
