const GalleryCard = ({ image, title, description }) => {
  return (
    <div className="flex-shrink-0">
      {" "}
      {/* Added to prevent shrinking in slider */}
      <div className="grid grid-cols-[60%_40%] bg-white border border-white gap-4 p-4 rounded-lg shadow-lg h-80 w-[560px]">
        {" "}
        {/* w-140 = 560px */}
        {/* Container for the image */}
        <div className="rounded-2xl overflow-hidden h-full">{image}</div>
        {/* Container for text */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[#4a3733] font-bold text-lg mb-2 uppercase">
            {title}
          </h1>
          <p className="text-[#4a3733] text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
export default GalleryCard;
