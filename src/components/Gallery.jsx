import FadeInSection from "./FadeInSection";

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semibold text-left mb-12">Gallery</h2>
      </FadeInSection>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <FadeInSection key={i}>
            <div className="aspect-square bg-gray-600 rounded-xl"></div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}
