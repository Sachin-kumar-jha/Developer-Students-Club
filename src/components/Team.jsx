import { motion } from "framer-motion";
import FadeInSection from "./FadeInsection.jsx";
import axios from "axios";
import { useEffect, useState } from "react";

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

export default function Team() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/team`);
        if (response.data?.data?.length) {
          setMembers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  // Group members by year
  const groupedMembers = members.reduce((groups, member) => {
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
    <section id="team" className="py-20 max-w-6xl mx-auto text-left px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tighter leading-relax mb-12">Our Team</h2>
      </FadeInSection>

      {sortedGroupKeys.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No team members found.</p>
      ) : (
        sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="mb-16">
            <h3 className="text-xl font-semibold text-teal-400 mb-8 border-b border-gray-800 pb-3 uppercase tracking-wider">
              {groupKey}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
              {groupedMembers[groupKey].map((member, index) => (
                <motion.div
                  key={member._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Circular image with hover zoom effect and ring */}
                  <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-transparent group-hover:border-teal-400 shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <img
                      src={member.profileImage || "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg"}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name & Role */}
                  <h4 className="mt-4 text-base font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">
                    {member.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    {member.role}
                  </p>
                  {member.branch && (
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase">
                      {member.branch}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
