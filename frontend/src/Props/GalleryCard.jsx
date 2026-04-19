const GalleryCard = ({ image, title, description }) => {
  return (
    <div className="">
      <div className="grid grid-cols-[60%_40%] bg-white border border-white gap-4 p-4 rounded-lg shadow-lg h-80 w-140">
        <div className="rounded-2xl ">{image}</div>
        <div>
          <h1 className="text-[#4a3733] font-semibold uppercase">{title}</h1>
          <div className="text-[#4a3733]">{description}</div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
