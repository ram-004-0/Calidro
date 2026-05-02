import React, { useState, useEffect } from "react";

const GalleryCard = ({ image, title, description }) => {
  // 1. Initialize state with the current window width
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // 2. Set up a listener to update state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the listener when the component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex-shrink-0 p-2">
      <div
        className={`grid gap-4 p-4 rounded-lg shadow-lg transition-all duration-300 bg-white border border-white
          ${
            isMobileView
              ? "grid-cols-1 w-[300px] h-auto" // Stacked for mobile
              : "grid-cols-[60%_40%] w-[560px] h-80" // Side-by-side for desktop
          }`}
      >
        {/* Container for the image */}
        <div
          className={`rounded-2xl overflow-hidden ${isMobileView ? "h-48" : "h-full"}`}
        >
          {image}
        </div>

        {/* Container for text */}
        <div
          className={`flex flex-col justify-center overflow-hidden ${isMobileView ? "pb-2" : ""}`}
        >
          {/* Title area */}
          <div
            className={`${isMobileView ? "h-auto mb-1" : "h-14 flex items-end mb-2"}`}
          >
            <h1 className="text-[#4a3733] font-bold text-base md:text-lg uppercase line-clamp-2">
              {title}
            </h1>
          </div>

          {/* Description area */}
          <div className={`${isMobileView ? "h-auto" : "h-32"}`}>
            <p className="text-[#4a3733] text-xs md:text-sm leading-relaxed line-clamp-4 md:line-clamp-5">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
