const GalleryCard = ({ image, title, description }) => {
  return (
    <div className="flex-shrink-0">
      <div className="grid grid-cols-[60%_40%] bg-white border border-white gap-4 p-4 rounded-lg shadow-lg h-80 w-[560px]">
        {/* Container for the image - fixed by grid span */}
        <div className="rounded-2xl overflow-hidden h-full">{image}</div>

        {/* Container for text - centered vertically */}
        <div className="flex flex-col justify-center overflow-hidden">
          {/* Title: Fixed height area to prevent shifting */}
          <div className="h-14 flex items-end mb-2">
            <h1 className="text-[#4a3733] font-bold text-lg uppercase line-clamp-2">
              {title}
            </h1>
          </div>

          {/* Description: Fixed height area with line clamp */}
          <div className="h-32">
            <p className="text-[#4a3733] text-sm leading-relaxed line-clamp-5">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
