import FadeInSection from "./FadeInsection.jsx";

export default function Events() {
  const events = [
    { title: "Tech Talk: Future of Web", date: "July 15, 2024" },
    { title: "Mobile App Development Workshop", date: "August 20, 2024" },
  ];

  return (
    <section id="events" className="py-20">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tighter text-left mb-12 px-6">
          Upcoming Events
        </h2>
      </FadeInSection>

      <div className="max-w-4xl mx-auto px-6">
        <div className="relative border-l border-gray-600 pl-8">
          {events.map((e, i) => (
            <FadeInSection key={i}>
              <div className="mb-10 relative">
                {/* Dot aligned properly */}
                <span className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-teal-400 border-2 border-[#0F1A24]" />
                
                {/* Event Content */}
                <h3 className="text-lg font-semibold text-gray-200">
                  {e.title}
                </h3>
                <p className="text-gray-400 text-sm">{e.date}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
