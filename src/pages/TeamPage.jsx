import { motion } from "framer-motion";
import image from "../assets/club-map.jpg"
export default function TeamPage() {
  // Variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-[#0F1A24] min-h-screen text-gray-200 px-6 py-16">
      {/* Intro */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 tracking-normal text-white">
          Meet the Team
        </h1>
        <p className="text-gray-300 leading-relaxed mb-12 text-lg">
          Our team is the driving force behind Developer Students Club. 
          We’re a group of passionate students dedicated to fostering a vibrant 
          tech community on campus. From organizing workshops to leading projects, 
          we work together to make a positive impact.
        </p>
      </motion.section>

      {/* Core Team */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-semibold tracking-tighter mb-6">Our Core Team</h2>
        <motion.div
          variants={container}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-16"
        >
          {[
            { name: "Ethan Carter", role: "President" },
            { name: "Olivia Bennett", role: "Vice President" },
            { name: "Noah Thompson", role: "Technical Lead" },
            { name: "Ava Harper", role: "Marketing Lead" },
            { name: "Liam Foster", role: "Outreach Coordinator" },
            { name: "Isabella Hayes", role: "Community Manager" },
          ].map((person, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="flex flex-col items-center text-center"
            >
              <div className="w-30 h-30 rounded-full bg-gray-700 mb-3 overflow-hidden">
                <img
                src={image}
                alt="ADVISOR IMAGE"
                className="w-full h-full object-cover"
              />
              </div>
              <h3 className="font-semibold">{person.name}</h3>
              <p className="text-sm text-gray-400">{person.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Advisors */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6">Our Advisors</h2>
        <div className="grid md:grid-cols-2  mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 rounded-full bg-gray-700 mb-4 overflow-hidden">
                <img
                src={image}
                alt="ADVISOR IMAGE"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold">Dr. Eleanor Reed</h3>
            <p className="text-sm text-gray-400">Faculty Advisor</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
              <img
                src={image}
                alt="ADVISOR IMAGE"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold">Prof. Samuel Walker</h3>
            <p className="text-sm text-gray-400">Mentor</p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-left"
      >
        <h2 className="text-xl font-semibold mb-4">Join the Team</h2>
        <p className="text-gray-300 mb-6 text-lg">
          Interested in joining our team? We’re always looking for enthusiastic 
          students to help us grow our community. Check out our open positions 
          or contact us to learn more about how you can get involved.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#positions"
          className="inline-block px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition"
        >
          View Open Positions
        </motion.a>
      </motion.section>
    </div>
  );
}
