import UserHeader from "../Components/UserHeader";

const UserVirtualTour = () => {
  return (
    <div className="h-screen bg-[#f1f1f1] text-[#4a3733] flex flex-col overflow-hidden">
      <UserHeader />

      {/* Container restricted to viewport height */}
      <section className="flex-1 w-full px-6 py-6 flex items-center justify-center">
        {/* 'aspect-video' maintains the 16:9 ratio, 'rounded-2xl' clips the iframe corners */}
        <section className="w-full max-w-6xl aspect-video max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
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
