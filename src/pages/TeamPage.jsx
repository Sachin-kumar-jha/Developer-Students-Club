import { motion } from "framer-motion";
import image from "../assets/club-map.jpg"
import axios from "axios";
import { useEffect, useState } from "react";

const fallbackTeam = [
  { name: "Ethan Carter", role: "President", profileImage: image, year: "4" },
  { name: "Olivia Bennett", role: "Vice President", profileImage: image, year: "4" },
  { name: "Noah Thompson", role: "Technical Lead", profileImage: image, year: "3" },
  { name: "Ava Harper", role: "Marketing Lead", profileImage: image, year: "3" },
  { name: "Liam Foster", role: "Outreach Coordinator", profileImage: image, year: "2" },
  { name: "Isabella Hayes", role: "Community Manager", profileImage: image, year: "2" },
];

const getYearLabel = (year) => {
  if (!year) return "Core Members / Coordinators";
  const yr = year.toString().toLowerCase().trim();
  if (yr.includes("4") || yr.includes("fourth") || yr.includes("final")) {
    return "Final Year (4th Year)";
  }
  if (yr.includes("3") || yr.includes("third") || yr.includes("pre-final") || yr.includes("pre final")) {
    return "Pre-Final Year (3rd Year)";
  }
  if (yr.includes("2") || yr.includes("second")) {
    return "Second Year (2nd Year)";
  }
  if (yr.includes("1") || yr.includes("first")) {
    return "First Year (1st Year)";
  }
  return `Year ${year}`;
};

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

  // Group members by year
  const groupedMembers = teamMembers.reduce((groups, member) => {
    const yearLabel = getYearLabel(member.year);
    if (!groups[yearLabel]) {
      groups[yearLabel] = [];
    }
    groups[yearLabel].push(member);
    return groups;
  }, {});

  // Define the display order for groups
  const groupOrder = [
    "Final Year (4th Year)",
    "Pre-Final Year (3rd Year)",
    "Second Year (2nd Year)",
    "First Year (1st Year)",
    "Core Members / Coordinators"
  ];

  // Sort the keys based on our defined order
  const sortedGroupKeys = Object.keys(groupedMembers).sort((a, b) => {
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

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
        <h2 className="text-2xl font-semibold tracking-tighter mb-8">Our Core Team</h2>
        
        {sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="mb-12">
            <h3 className="text-lg font-semibold text-teal-400 mb-6 border-b border-gray-800 pb-2 uppercase tracking-wider">
              {groupKey}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
              {groupedMembers[groupKey].map((person, idx) => (
                <div
                  key={person._id || idx}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-32 h-32 rounded-full bg-gray-700 mb-3 overflow-hidden border-2 border-transparent group-hover:border-teal-400 shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <img
                      src={person.profileImage || image}
                      alt={person.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-400">{person.role}</p>
                  {person.branch && (
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase">
                      {person.branch}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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
