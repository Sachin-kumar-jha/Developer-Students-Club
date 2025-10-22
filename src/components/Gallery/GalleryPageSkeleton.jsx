import { motion } from "framer-motion";

export default function GalleryPageSkeleton() {
  const dummyArray = [1, 2, 3, 4, 5]; // For highlights/past events placeholders

  return (
    <div className="bg-[#0F1A24] min-h-screen text-white px-6 md:px-20 py-12">
      {/* Header Skeleton */}
      <motion.div
        className="mb-12 h-10 w-48 bg-gray-700 animate-pulse rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Highlights Section Skeleton */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyArray.map((i) => (
          <div
            key={i}
            className="h-60 bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>

      {/* Featured Video Skeleton */}
      <div className="mb-12 h-[400px] md:h-[500px] lg:h-[550px] bg-gray-700 rounded-lg animate-pulse" />

      {/* Past Events Section Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
        {dummyArray.map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
