import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HighlightsSection({ highlights }) {
  const navigate = useNavigate();

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-6">Event Highlights</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {highlights.slice(0, 10).map((event, index) => (
          <motion.div
            key={event.eventId}
            className="bg-[#162330] rounded-xl shadow-md overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            viewport={{ once: true }}
            onClick={() => navigate(`/gallery/highlights/${event.eventId}`)}
          >
            {event.highlightImage ? (
              <img
                src={event.highlightImage.url}
                alt={event.title}
                className="w-full h-28 object-cover"
              />
            ) : (
              <div className="w-full h-28 bg-gray-700 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <p className="p-3 text-sm text-center">{event.title}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
