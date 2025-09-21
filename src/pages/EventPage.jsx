
import {motion} from "framer-motion";
const upcomingEvents = [
  {
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to build your first website.",
    image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg",
  },
  {
    title: "Data Science Fundamentals",
    description:
      "Explore the fundamentals of data science, including data analysis, visualization, and machine learning.",
     image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg",
  },
];

const pastEvents = [
  {
    title: "Mobile App Development Workshop",
    description: "A workshop on building mobile apps using React Native.",
  image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg",
  },
  {
    title: "Cloud Computing Basics",
    description: "An introductory session on cloud computing concepts and services.",
     image: "https://static.vecteezy.com/system/resources/previews/041/388/388/non_2x/ai-generated-concert-crowd-enjoying-live-music-event-photo.jpg",
  },
];

export default function EventsPage() {
  return (
    <div className="bg-[#0F1A24] min-h-screen text-white px-6 md:px-20 py-12">
      {/* Header */}
      <motion.div
        className="text-left mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-2">Events</h1>
        <p className="text-gray-400">
          Explore our upcoming and past events. Join us to learn, collaborate, and create!
        </p>
      </motion.div>

      {/* Upcoming Events */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Upcoming Events</h2>

        {upcomingEvents.map((event, index) => (
          <motion.div
            key={index}
            className="grid md:grid-cols-2 gap-8 items-center mb-10"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-400 rounded-lg shadow-md transition"
              >
                Register →
              </motion.button>
            </div>
            <motion.img
              src={event.image}
              alt={event.title}
              className="rounded-xl shadow-lg"
              whileHover={{ scale: 1.03 }}
            />
          </motion.div>
        ))}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Past Events</h2>

        {pastEvents.map((event, index) => (
          <motion.div
            key={index}
            className="grid md:grid-cols-2 gap-8 items-center mb-10"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-4">{event.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-md transition"
              >
                {event.title === "Cloud Computing Basics"
                  ? "View Recording →"
                  : "View Resources →"}
              </motion.button>
            </div>
            <motion.img
              src={event.image}
              alt={event.title}
              className="rounded-xl shadow-lg"
              whileHover={{ scale: 1.03 }}
            />
          </motion.div>
        ))}
      </section>
    </div>
  );
}
