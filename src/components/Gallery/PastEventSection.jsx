import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PastEventsSection({ media }) {
  const navigate = useNavigate();

  //  Group media by eventId
  const groupedByEvent = media.reduce((acc, item) => {
    const eventId = item.eventId;
    if (!acc[eventId]) acc[eventId] = [];
    acc[eventId].push(item);
    return acc;
  }, {});

  //Extract representative media for each event (e.g., first image)
  
  const representativeMedia = Object.values(groupedByEvent).map((items) => {
    const event = items[0];
    return {
      eventId: event.eventId,
      title: event.title,
      url: items.find((i) => i.url && !i.url.includes("video"))?.url || items[0].url,
      eventDate: event.eventDate || event.date || event.createdAt,
    };
  });

  const mediaByYear = representativeMedia.reduce((acc, item) => {
    const year = new Date(item.eventDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const years = Object.keys(mediaByYear).sort((a, b) => b - a);
  const [year, setYear] = useState(years[0] || new Date().getFullYear());

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Past Events</h2>

      {/* Year Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-700">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`relative -mb-[1px] pb-2 text-sm font-medium transition-colors ${
              year === y
                ? "border-b border-gray-400 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {mediaByYear[year] && mediaByYear[year].length > 0 ? (
          mediaByYear[year].map((item, index) => (
            <motion.div
              key={item.eventId || index}
              className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/gallery/highlights/${item.eventId}`)}
            >
              {item.url.includes("video") ? (
                <video className="w-full h-28 object-cover" src={item.url} />
              ) : (
                <img
                  src={item.url}
                  alt={item.title || "Event Media"}
                  className="w-full h-28 object-cover"
                />
              )}
              <p className="p-3 text-sm text-center">{item.title || "Untitled"}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-400 col-span-full text-center">No past events for this year.</p>
        )}
      </div>
    </section>
  );
}
