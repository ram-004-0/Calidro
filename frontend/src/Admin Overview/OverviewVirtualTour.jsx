import { useState, useRef, useEffect } from "react";
import { Ellipsis, X } from "lucide-react";
import image1 from "../assets/Images/savt.JPG";

const API_URL = "https://calidro-production.up.railway.app";

const OverviewVirtualTour = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const category = "virtual_tour";

  // 1. Fetch current image from MySQL on component mount
  useEffect(() => {
    const fetchAvailableImage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/virtual-tour`);
        if (!response.ok) throw new Error("Server Error");
        const data = await response.json();

        if (data.imageUrl) {
          setUploadedImage(data.imageUrl);
        }
      } catch (err) {
        console.error("Could not fetch the available image:", err);
      }
    };

    fetchAvailableImage();
  }, []);

  // 2. Handle File Selection with Validation
  const handleFileChange = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("The image is too large. Please select a file smaller than 10MB.");
      return;
    }

    setSelectedFile(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const getOptimizedUrl = (url) => {
    if (!url || url.includes("blob:") || !url.includes("cloudinary"))
      return url;
    return url.replace("/upload/", "/upload/w_1000,c_limit,q_auto,f_auto/");
  };

  // 3. Handle Upload (Cloudinary + MySQL)
  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/images/upload?category=${category}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const newCloudinaryUrl = response.imageUrl;

          // Step B: Save URL to MySQL site_assets table
          const dbResponse = await fetch(
            `${API_URL}/api/settings/virtual-tour`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: newCloudinaryUrl,
                adminId: 1,
              }),
            },
          );

          if (dbResponse.ok) {
            if (preview) URL.revokeObjectURL(preview);
            setUploadedImage(newCloudinaryUrl);
            alert("Virtual Tour updated successfully!");
          } else {
            throw new Error("DB Save Failed");
          }
        } catch (err) {
          console.error("Save error:", err);
          alert("Upload successful but failed to update live view.");
        } finally {
          setUploading(false);
          setShowModal(false);
          setSelectedFile(null);
          setPreview(null);
          setProgress(0);
        }
      } else {
        console.error("Upload failed with status:", xhr.status);
        alert("Server error (500) during upload. Check backend logs.");
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

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="relative bg-white rounded-2xl shadow-md p-4 w-full lg:max-w-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 font-medium">
              {uploadedImage ? "Live Tour Image" : "Default View"}
            </span>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-200 transition shrink-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <ul className="list-none m-0 p-0">
                <Ellipsis size={18} />
              </ul>
            </button>
          </div>

          {showMenu && (
            <div className="absolute right-4 top-12 z-10 bg-white border border-[#4a3733] rounded shadow-lg w-40 overflow-hidden">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  setShowModal(true);
                  setShowMenu(false);
                }}
              >
                Update Photo
              </button>
            </div>
          )}

          <img
            src={getOptimizedUrl(uploadedImage) || preview || image1}
            alt="Virtual Tour"
            className="rounded-xl w-full h-auto aspect-video object-cover shadow-inner bg-gray-100"
          />
        </div>

        {showModal && (
          <div
            className="bg-white p-6 rounded-2xl shadow-xl w-full lg:w-80 border border-gray-100 relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowModal(false);
                setPreview(null);
                setSelectedFile(null);
              }}
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4 text-[#4a3733]">
              Change Tour Photo
            </h2>

            <div
              className="border-2 border-dashed border-gray-300 p-6 text-center mb-4 cursor-pointer hover:border-[#4a3733] transition bg-gray-50 rounded-xl"
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto rounded-lg mb-2 max-h-40 object-cover"
                />
              ) : (
                <p className="text-gray-500 text-xs">
                  Drag & drop image, or{" "}
                  <span className="text-[#4a3733] font-bold">browse</span>
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
              className={`w-full px-4 py-2 rounded-lg text-white font-semibold transition shadow-md ${
                selectedFile && !uploading
                  ? "bg-[#4a3733] hover:bg-[#3a2c28]"
                  : "bg-gray-300 cursor-not-allowed shadow-none"
              }`}
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>

            {uploading && (
              <div className="mt-4 bg-gray-100 h-1.5 rounded-full overflow-hidden">
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

export default OverviewVirtualTour;
