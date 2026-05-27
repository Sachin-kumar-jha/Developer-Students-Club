import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMedia } from "../redux/slices/mediaSlice";
import FadeInSection from "./FadeInsection.jsx";
import { Link } from "react-router-dom";
import GallerySkeleton from "./Gallery/GallerySkeleton.jsx";

export default function Gallery() {
  const dispatch = useDispatch();
  const { allMedia, loading, error } = useSelector((state) => state.media);

  useEffect(() => {
    dispatch(fetchAllMedia());
  }, [dispatch]);

  // Take first 6 images (ignore videos)
  const images = allMedia
    ? allMedia.filter((m) => m.url && !m.url.includes("video")).slice(0, 6)
    : [];

  if (error) return <p className="text-center text-red-400 mt-10">{error}</p>;

  return (
    <section id="gallery" className="py-24 max-w-6xl mx-auto px-6 text-left">
      <FadeInSection>
        <div className="mb-12">
          <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase mb-3 block">
            VISUAL RECAP
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">
            Gallery
          </h2>
        </div>
      </FadeInSection>

      {/* Skeleton or Images */}
      {loading ? (
        <GallerySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {images.map((media, i) => (
            <FadeInSection key={media._id || i}>
              <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden relative group shadow-lg border border-transparent hover:border-teal-500/30 transition-all duration-500">
                <img
                  src={media.url}
                  alt={media.title || "Gallery Image"}
                  className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                />
                {/* Dynamic Gradient Title Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A24] via-[#0F1A24]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <p className="text-white text-xs font-semibold font-mono tracking-wider truncate w-full">
                    {media.title || "DSC Event Highlight"}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      )}

      {/* See More Link */}
      {!loading && images.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-block px-8 py-3 bg-black border-2 border-teal-500/50 hover:bg-teal-500/10 text-teal-400 rounded-xl font-bold font-mono uppercase tracking-wider hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all duration-300"
          >
            view_gallery.sh
          </Link>
        </div>
      )}
    </section>
  );
}
