import { motion } from "framer-motion";
import FadeInSection from "./FadeInSection";


const team = [
  { name: "Alice Johnson", role: "President", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
  { name: "Bob Smith", role: "Vice President", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg"},
  { name: "Charlie Lee", role: "Event Coordinator", img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
  { name: "Diana Patel", role: "Designer",img: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg" },
];

export default function Team() {
  return (
    <section id="team" className="py-20 max-w-6xl mx-auto text-left px-6">
      <FadeInSection>
        <h2 className="text-4xl font-semibold tracking-tighter leading-relax mb-12">Our Team</h2>
      </FadeInSection>

    <div className="flex  flex-start flex-wrap justify-around">
        {team.map((member, index) => (
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
                src={member.img}
                alt={member.name}
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
