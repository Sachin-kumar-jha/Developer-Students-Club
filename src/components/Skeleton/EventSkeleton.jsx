// src/components/Skeleton/EventSkeleton.jsx

export default function EventSkeleton() {
  return (
    <div className="mb-10 relative animate-pulse">
      {/* Dot */}
      <span className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-gray-700 border-2 border-[#0F1A24]" />

      {/* Title */}
      <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>

      {/* Description */}
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-3"></div>

      {/* Date Section */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}
