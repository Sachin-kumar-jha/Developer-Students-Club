import { useState } from "react";

export default function MediaCard({ media }) {
  const [isOpen, setIsOpen] = useState(false);
  const mediaUrl = media?.url || "";
  const isVideo = mediaUrl.includes("video");

  if (!mediaUrl) return null;

  return (
    <>
      {/* Media Card */}
      <div
        className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {isVideo ? (
          <video
            src={mediaUrl}
            controls
            className="w-full h-36 object-cover"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={media.title || "Media"}
            className="w-full h-36 object-cover"
          />
        )}
      </div>

      {/* Modal / Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
              className="absolute top-2 right-10 text-white text-2xl font-bold z-50 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          <div className="relative max-w-3xl w-full p-4">
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={media.title || "Media"}
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
