import { motion } from "framer-motion";
import FadeInSection from "./FadeInsection.jsx";
import axios from "axios";
import { useEffect, useState } from "react";


const team = [
  { name: "Alice Johnson", role: "President", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
  { name: "Bob Smith", role: "Vice President", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg"},
  { name: "Charlie Lee", role: "Event Coordinator", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
  { name: "Diana Patel", role: "Designer",img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
];

export default function Team() {
  const [members, setMembers] = useState(team);

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

  return (
    <section id="team" className="py-20 max-w-6xl mx-auto text-left px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tighter leading-relax mb-12">Our Team</h2>
      </FadeInSection>

    <div className="flex  flex-start flex-wrap justify-around">
        {members.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            {/* Circular image */}
            <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
              <img
                src={member.profileImage || member.img}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Role */}
            <h3 className="mt-4 text-xl font-semibold">{member.name}</h3>
            <p className="text-gray-400">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
