import { useState, useRef, useEffect } from "react";
import { Ellipsis, X } from "lucide-react";
import image1 from "../assets/Images/sabook.JPG";

const API_URL = "https://calidro-production.up.railway.app";

const OverviewBook = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const category = "book";

  // 1. Fetch current image from MySQL on component mount
  useEffect(() => {
    const fetchBookImage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/book-asset`);
        const data = await response.json();
        if (data.imageUrl) setUploadedImage(data.imageUrl);
      } catch (err) {
        console.error("Error loading book image:", err);
      }
    };
    fetchBookImage();
  }, []);

  // 2. Handle File Selection
  const handleFileChange = (file) => {
    if (!file) return;

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type.");
      return;
    }

    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  // 3. Handle Upload (Cloudinary + MySQL)
  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setUploading(true);
    const xhr = new XMLHttpRequest();

    // Step A: Cloudinary Upload
    xhr.open("POST", `${API_URL}/api/images/upload?category=book`);

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const newCloudinaryUrl = response.imageUrl;

        // Step B: Save to MySQL specifically for 'book_image'
        try {
          const dbResponse = await fetch(`${API_URL}/api/settings/book-asset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: newCloudinaryUrl,
              adminId: 1,
            }),
          });

          if (dbResponse.ok) {
            setUploadedImage(newCloudinaryUrl);
            alert("Book asset updated!");
          }
        } catch (err) {
          console.error("DB Sync Error:", err);
        } finally {
          setUploading(false);
          setShowModal(false);
        }
      }
    };
    xhr.send(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">Book</h1>

      <div className="flex gap-6 items-start">
        {/* Image Card */}
        <div className="relative bg-white rounded-2xl shadow-md p-4 w-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {uploadedImage ? "Live Book Cover" : "bookbg.jpg"}
            </span>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-200 transition"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Ellipsis size={18} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-4 top-10 z-10 bg-white border border-[#4a3733] rounded shadow-lg w-42">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                onClick={() => {
                  setShowModal(true);
                  setShowMenu(false);
                }}
              >
                Upload New Photo
              </button>
            </div>
          )}

          {/* Main Image */}
          <img
            src={uploadedImage || image1}
            alt="Book Overview"
            className="rounded-xl w-full h-50 object-cover bg-gray-100"
          />
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div
            className="bg-white p-6 rounded-2xl shadow-md w-80 shrink-0 relative border border-gray-100"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              onClick={() => {
                setShowModal(false);
                setPreview(null);
                setSelectedFile(null);
              }}
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-[#4a3733]">
              Upload New Photo
            </h2>

            <div
              className="border-2 border-dashed border-gray-400 p-6 text-center mb-4 cursor-pointer rounded-xl bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto rounded mb-2 max-h-48 object-cover"
                />
              ) : (
                <p className="text-gray-500 text-sm">
                  Drag & drop an image here, or{" "}
                  <span className="font-bold text-[#4a3733]">browse</span>
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`mt-2 w-full px-4 py-2 rounded text-white font-semibold transition ${
                selectedFile && !uploading
                  ? "bg-[#4a3733] hover:bg-[#3a2c28]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading ? "Saving..." : "Upload"}
            </button>

            {uploading && (
              <div className="mt-4 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4a3733] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewBook;
