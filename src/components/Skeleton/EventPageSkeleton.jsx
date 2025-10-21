// src/components/Skeleton/EventPageSkeleton.jsx

export default function EventPageSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center mb-10 animate-pulse">
      <div>
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded w-32"></div>
      </div>
      <div className="h-52 bg-gray-700 rounded-xl shadow-lg"></div>
    </div>
  );
}
