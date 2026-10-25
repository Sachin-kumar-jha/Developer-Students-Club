import { motion } from "framer-motion";
import image from "../assets/club-map.jpg";
import divyanshuImg from "../assets/divyanshu_sharma.png";
import ashokImg from "../assets/ashok_dewasi.png";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Linkedin } from "lucide-react";

const fallbackTeam = [
  {
    name: "Divyanshu Sharma",
    role: "Senior Mentor (Alumni)",
    profileImage: divyanshuImg,
    year: "2026",
    branch: "Batch of 2026",
    order: 1,
  },
  {
    name: "Ashok Dewasi",
    role: "Senior Mentor (Alumni)",
    profileImage: ashokImg,
    year: "2026",
    branch: "Batch of 2026",
    order: 2,
  },
  { name: "Sachin Kumar Jha", role: "Coordinator", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1779862495/team_profiles/zjo4vzij1tz7lur9ejvl.jpg", year: "4", branch: "Information Technology" },
  { name: "Abhijeet Roy", role: "Technical Head", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1779897770/team_profiles/eiujjcg65z7oad96wxg1.jpg", year: "4", branch: "Civil Engineering" },
  { name: "Aditya Ladrecha", role: "Management and Graphics Head", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1780045286/team_profiles/mpfec22i3q9a9ldqxpwf.jpg", year: "4", branch: "Electrical Engineering" },
  { name: "Ashwary Kumawat", role: "Coordinator", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1792605966/team_profiles/nudusvrncimkz65mqmmg.jpg", year: "3", branch: "Information Technology" },
  { name: "Jiya Sharma", role: "Web Lead", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1779880597/team_profiles/umh81y1yjfrhodx44hgs.jpg", year: "3", branch: "CSE" },
  { name: "Basant Jangir", role: "Team Member", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1792856241/team_profiles/zwp8fk6pdq2e2oglarln.jpg", year: "2", branch: "Mechanical engineering" },
  { name: "Vikas Prajapat", role: "Team Member", profileImage: "https://res.cloudinary.com/djccuqbfk/image/upload/v1792857310/team_profiles/yeebeojmxvw6ngzpci9l.jpg", year: "2", branch: "Information technology" },
];

const isAlumniMember = (member) => {
  const yr = (member?.year || "").toString().toLowerCase().trim();
  return (
    yr.includes("2026") ||
    yr.includes("alumni") ||
    yr.includes("passout") ||
    yr.includes("pass-out") ||
    yr.includes("graduat") ||
    yr.includes("senior") ||
    (Number(yr) >= 2020 && Number(yr) <= 2026)
  );
};

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

const getMemberPhoto = (person) => {
  if (person.profileImage && person.profileImage !== image) {
    return person.profileImage;
  }
  const lowerName = (person.name || "").toLowerCase();
  if (lowerName.includes("divyanshu")) return divyanshuImg;
  if (lowerName.includes("ashok")) return ashokImg;
  return person.profileImage || image;
};

export default function TeamPage() {
  const navigate = useNavigate();
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
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Separate active students vs alumni seniors (2026 passout)
  const activeMembers = teamMembers.filter((m) => !isAlumniMember(m));
  const alumniMembers = teamMembers.filter((m) => isAlumniMember(m));

  // Group active members by year
  const groupedMembers = activeMembers.reduce((groups, member) => {
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
    "Core Members / Coordinators",
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
            <div className="w-48 h-48 rounded-full bg-gray-700 mb-4 overflow-hidden border-2 border-teal-500/20 shadow-xl">
              <img
                src={image}
                alt="Faculty Advisor"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-lg text-white">Dr. Nirmala Sharma</h3>
            <p className="text-sm text-gray-400">Faculty Coordinator</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Core Team (Active Students) */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto mb-16"
      >
        <h2 className="text-2xl font-semibold tracking-tighter mb-8 text-white">Our Core Team</h2>
        
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
                      src={getMemberPhoto(person)}
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
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-gray-400 hover:text-teal-400 transition"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.section>

      {/* Our Alumni & Senior Mentors (2026 Passout Seniors) */}
      {alumniMembers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-teal-400" />
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Our Alumni & Senior Mentors
                </h2>
                <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Batch of 2026
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Honoring our passed-out seniors who led, inspired, and built the foundation of Developer Students Club.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {alumniMembers.map((person, idx) => (
              <div
                key={person._id || idx}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-3">
                  <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden border-2 border-teal-500/50 group-hover:border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 transform group-hover:scale-105">
                    <img
                      src={getMemberPhoto(person)}
                      alt={person.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const lowerName = (person.name || "").toLowerCase();
                        if (lowerName.includes("divyanshu")) {
                          e.currentTarget.src = divyanshuImg;
                        } else if (lowerName.includes("ashok")) {
                          e.currentTarget.src = ashokImg;
                        } else {
                          e.currentTarget.src = image;
                        }
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-[#0F1A24] border border-teal-500/40 text-teal-300 p-1 rounded-full shadow">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mb-1.5 rounded-full bg-teal-500/10 text-[11px] font-medium text-teal-300 border border-teal-500/20">
                  Batch of 2026
                </div>

                <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-400">{person.role || "Senior Mentor"}</p>
                {person.branch && (
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase">
                    {person.branch}
                  </p>
                )}
                {person.linkedinUrl && (
                  <a
                    href={person.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-gray-400 hover:text-teal-400 transition"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/positions")}
          className="inline-block px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.3)]"
        >
          View Open Positions
        </motion.button>
      </motion.section>
    </div>
  );
}
