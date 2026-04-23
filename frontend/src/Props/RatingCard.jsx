const RatingCard = ({ image, name, comment, stars }) => {
  return (
    // Added flex-shrink-0 so the card doesn't squish in the slider
    <div className="flex-shrink-0">
      <div className="grid grid-cols-[60%_40%] bg-white border border-gray-100 gap-4 p-6 rounded-lg shadow-lg h-80 w-[560px]">
        {/* Image Container */}
        <div className="rounded-2xl overflow-hidden h-full">{image}</div>

        {/* Text/Rating Container */}
        <div className="flex flex-col justify-center space-y-3">
          <h1 className="text-[#4a3733] font-bold text-lg uppercase tracking-wide">
            {name}
          </h1>
          <p className="text-[#4a3733] text-sm leading-relaxed italic">
            "{comment}"
          </p>
          <span className="text-yellow-500 text-lg font-bold">{stars}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingCard;
