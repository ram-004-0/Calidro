const UserRatingCard = ({ name, date, rating, comment, images }) => {
  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div className="w-12 h-12 bg-[#4a3733] rounded-full flex items-center justify-center text-white text-lg font-bold">
            {name ? name.charAt(0) : "U"}
          </div>
          <div>
            <h4 className="font-bold text-[#4a3733] text-lg leading-none">
              {name}
            </h4>
            <p className="text-xs text-gray-400 mt-1">{date}</p>
          </div>
        </div>

        {/* Star Display */}
        <div className="flex text-yellow-500 text-sm">
          {[...Array(5)].map((_, i) => (
            <span key={i}>{i < rating ? "★" : "☆"}</span>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-[#4a3733] text-sm leading-relaxed mb-4">{comment}</p>

      {/* Image Thumbnails (The boxes at the bottom of your sketch) */}
      {images && images.length > 0 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 cursor-pointer transition"
            >
              <img
                src={img}
                alt="review"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRatingCard;
