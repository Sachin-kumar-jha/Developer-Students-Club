import { motion } from "framer-motion";
import image from "../assets/club-map.jpg"
import axios from "axios";
import { useEffect, useState } from "react";

const fallbackTeam = [
  { name: "Ethan Carter", role: "President", profileImage: image },
  { name: "Olivia Bennett", role: "Vice President", profileImage: image },
  { name: "Noah Thompson", role: "Technical Lead", profileImage: image },
  { name: "Ava Harper", role: "Marketing Lead", profileImage: image },
  { name: "Liam Foster", role: "Outreach Coordinator", profileImage: image },
  { name: "Isabella Hayes", role: "Community Manager", profileImage: image },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(fallbackTeam);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/team`);
        if (response.data?.data?.length) {
          setTeamMembers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

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
        transition={{ duration: 0.5 }}
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

      {/* Advisors */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6">Our Advisors</h2>
        <div className="flex justify-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 rounded-full bg-gray-700 mb-4 overflow-hidden">
                <img
                src={image}
                alt="Faculty Advisor"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-lg">Dr. Nirmala Sharma</h3>
            <p className="text-sm text-gray-400">Faculty Coordinator</p>
          </motion.div>
        </div>
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
        <motion.div key={teamMembers.length} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-16">
          {teamMembers.map((person, idx) => (
            <div
              key={person._id || idx}
              className="flex flex-col items-center text-center"
              style={{ opacity: 1 }}
            >
              <div className="w-32 h-32 rounded-full bg-gray-700 mb-3 overflow-hidden">
                <img
                src={person.profileImage || image}
                alt={person.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              </div>
              <h3 className="font-semibold">{person.name}</h3>
              <p className="text-sm text-gray-400">{person.role}</p>
            </div>
          ))}
        </motion.div>
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
