import { useState, useRef } from "react";
import { Ellipsis, X } from "lucide-react";
import image1 from "../assets/Images/savt.JPG";

const OverviewVirtualTour = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const category = "virtual_tour"; // Backend folder

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `http://localhost:5000/api/images/upload?category=${category}`,
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log("Uploaded image URL:", response.imageUrl);

        setUploadedImage(response.imageUrl);

        setUploading(false);
        setShowModal(false);
        setSelectedFile(null);
        setPreview(null);
        setProgress(0);
      } else {
        console.error("Upload failed");
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      console.error("Upload error");
      setUploading(false);
    };

    xhr.send(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
        Virtual Tour
      </h1>

      <div className="flex gap-6 items-start">
        <div className="relative bg-white rounded-2xl shadow-md p-4 w-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {uploadedImage
                ? uploadedImage.split("/").pop()
                : "default-virtualtour.jpg"}
            </span>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-200 transition"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Ellipsis size={18} />
            </button>
          </div>

          {showMenu && (
            <div className="absolute right-4 top-10 bg-white border border-[#4a3733] rounded shadow-lg w-42">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setShowModal(true);
                  setShowMenu(false);
                }}
              >
                Upload New Photo
              </button>
            </div>
          )}

          <img
            src={uploadedImage || preview || image1}
            alt="Virtual Tour"
            className="rounded-xl w-full h-50 object-cover"
          />
        </div>

        {showModal && (
          <div
            className="bg-white p-6 rounded-2xl shadow-md w-80 shrink-0 relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4">Upload New Photo</h2>

            <div
              className="border-2 border-dashed border-gray-400 p-6 text-center mb-4 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto rounded mb-2 max-h-48 object-cover"
                />
              ) : (
                <p className="text-gray-500">
                  Drag & drop an image here, or click to select
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
              className={`mt-2 w-full px-4 py-2 rounded text-white ${
                selectedFile
                  ? "bg-[#4a3733] hover:bg-[#3a2c28]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {uploading && (
              <div className="mt-4 bg-gray-200 h-2 rounded overflow-hidden">
                <div
                  className="bg-[#4a3733] h-2"
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

export default OverviewVirtualTour;
