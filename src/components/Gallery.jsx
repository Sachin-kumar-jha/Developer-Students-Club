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
    ? allMedia.filter((m) => !m.url.includes("video")).slice(0, 6)
    : [];

  if (error) return <p className="text-center text-red-400 mt-10">{error}</p>;

  return (
    <section id="gallery" className="py-20 px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semibold text-left mb-12">Gallery</h2>
      </FadeInSection>

      {/* Skeleton or Images */}
      {loading ? (
        <GallerySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {images.map((media, i) => (
            <FadeInSection key={media._id || i}>
              <div className="aspect-square bg-gray-600 rounded-xl overflow-hidden">
                <img
                  src={media.url}
                  alt={media.title || "Gallery Image"}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInSection>
          ))}
        </div>
      )}

      {/* See More Link */}
      {!loading && images.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/gallery"
            className="text-white bg-[#1E293B] hover:bg-[#374151] px-6 py-2 rounded-lg font-medium transition-colors"
          >
            See More
          </Link>
        </div>
      )}
    </section>
  );
}
