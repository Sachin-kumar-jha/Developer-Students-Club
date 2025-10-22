import FadeInSection from "../FadeInsection.jsx";

export default function GallerySkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <FadeInSection key={i}>
          <div className="aspect-square bg-gray-700 animate-pulse rounded-xl" />
        </FadeInSection>
      ))}
    </div>
  );
}
