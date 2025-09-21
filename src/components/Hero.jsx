import { motion } from "framer-motion";
import codingMockup from "../assets/coding.avif"; // 👉 make sure image is inside src/assets

export default function Hero() {
  return (
    <motion.section
      id="home"
      className="relative h-screen w-full flex items-center justify-center mt-2 rounded-md"
      initial={{ opacity: 0, scale: 0.95 }} // start slightly smaller & invisible
      animate={{ opacity: 1, scale: 1 }} // animate to full size & visible
      transition={{ duration: 0.8, ease: "easeOut" }} // smooth easing
      whileHover={{ scale: 1.02 }} // slight scale on hover for interactivity
    >
      {/* Background Image */}
      <img
        src={codingMockup}
        alt="Coding Mockup"
        className="absolute inset-0 w-full h-full object-cover rounded-md z-0"
      />

      {/* Overlay for dim effect */}
      <div className="absolute inset-0 bg-white/2 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-3xl rounded-md">
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl tracking-wider font-bold mb-6 text-white"
        >
          Welcome to{" "}
          <span className="text-teal-400">Developer Students Club</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg text-gray-200 mb-8"
        >
          Inspiring students through events, innovation, and collaboration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#contact"
            className="px-6 py-3 bg-teal-400 text-black rounded-xl font-semibold hover:bg-teal-300 transition"
          >
            Join Us
          </a>
          <a
            href="#events"
            className="px-6 py-3 border border-teal-400 text-teal-400 rounded-xl font-semibold hover:bg-teal-400 hover:text-black transition"
          >
            View Events
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
