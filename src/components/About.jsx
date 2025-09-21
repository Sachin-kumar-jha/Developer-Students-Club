import FadeInSection from "./FadeInsection.jsx";
import { Code, Smartphone, Cloud, Brain } from "lucide-react";
import { motion } from "framer-motion";
export default function About() {
  const features = [
    {
      icon: <Code className="w-6 h-6 text-teal-400" />,
      title: "Web Development",
    },
    {
      icon: <Smartphone className="w-6 h-6 text-teal-400" />,
      title: "App Development",
    },
    {
      icon: <Cloud className="w-6 h-6 text-teal-400" />,
      title: "Cloud Computing",
    },
    {
      icon: <Brain className="w-6 h-6 text-teal-400" />,
      title: "Artificial Intelligence",
    },
  ];

  return (
    <section
      id="about"
      className="h-full w-full bg-white/2 py-20 mt-10 mb-10 px-6"
    >
      <FadeInSection>
        <h2 className="text-4xl font-semibold text-center md:text-left tracking-tighter mb-6">
          About Us
        </h2>
      </FadeInSection>

      <FadeInSection>
      <p className="text-gray-300 text-center md:text-left text-justify leading-relaxed text-lg mb-10 w-full max-w-6xl">
  Developer Students Club is a community-driven initiative by students for
  students, focused on fostering a collaborative learning environment in
  technology. Our mission is to bridge the gap between theoretical knowledge
  and practical application, empowering students to become proficient
  developers and innovators. We achieve this by organizing workshops,
  hackathons, and collaborative projects that cover a wide range of
  technologies, including web development, mobile app development, cloud
  computing, and machine learning. Our club is not just about coding; it's
  about building a supportive community where students can share ideas, learn
  from each other, and grow together. We believe in the power of collaboration
  and innovation, and we strive to create a space where every member can thrive
  and contribute to meaningful projects
</p>
    </FadeInSection>

      {/* Feature Cards with Motion */}
      <FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 15px rgba(45, 212, 191, 0.4)", // teal glow
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-700 bg-[#0F1A24]/60 cursor-pointer"
            >
              {feature.icon}
              <h3 className="font-semibold text-gray-100">{feature.title}</h3>
            </motion.div>
          ))}
        </div>
      </FadeInSection>
    </section>
  );
}
