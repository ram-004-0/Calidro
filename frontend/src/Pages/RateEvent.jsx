import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Camera, X } from "lucide-react";

const API_URL = "https://calidro-production.up.railway.app";

const RateEvent = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [hover, setHover] = useState(0);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData because we are sending files (images)
    const formData = new FormData();
    formData.append("booking_id", bookingId);
    formData.append("rating", rating);
    formData.append("comment", comment);
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`${API_URL}/api/rate`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Thank you for your review!");
        navigate("/userhome");
      }
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-8 h-fit">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 mb-6 block"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-2">Rate your experience</h2>
        <p className="text-gray-500 mb-8">
          How was the event? Your feedback helps others!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STAR RATING */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={32}
                  fill={(hover || rating) >= star ? "#fbbf24" : "none"}
                  color={(hover || rating) >= star ? "#fbbf24" : "#d1d5db"}
                />
              </button>
            ))}
          </div>

          {/* COMMENT */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-xl p-3 h-32 focus:ring-2 focus:ring-yellow-400 outline-none"
              placeholder="Tell us what you liked or disliked..."
              required
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Add Photos
            </label>
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <Camera size={24} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={rating === 0}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              rating === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
            }`}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default RateEvent;
