import React, { useState, useEffect } from "react";
import UserHeader from "../Components/UserHeader";

const UserVirtualTour = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen bg-[#f1f1f1] text-[#4a3733] flex flex-col overflow-hidden">
      <UserHeader />
      <section className="flex-1 w-full px-6 py-6 flex items-center justify-center">
        <section
          className={`w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl bg-gray-200 ${
            isMobileView
              ? "aspect-[3/4] max-h-[70vh]"
              : "aspect-video max-h-[65vh]"
          }`}
        >
          <iframe
            className="w-full h-full border-0"
            src="https://my.matterport.com/show/?m=nEBcwzP9rM7"
            title="Virtual Tour"
            allow="fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        </section>
      </section>
    </div>
  );
};

export default UserVirtualTour;
