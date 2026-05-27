import { motion } from "framer-motion";
import {
  Code,
  Smartphone,
  Cloud,
  Brain,
  Users,
  Lightbulb,
  BookOpen,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  // Variants for animation
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="bg-[#0F1A24] min-h-screen text-gray-200 px-6 md:px-16 lg:px-24 py-16">
      {/* Hero Header */}
      <motion.section
        className="py-16 max-w-4xl text-left"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
          About Developer Students Club
        </h1>
        <p className="text-lg leading-relaxed text-gray-300 text-justify font-light">
          Developer Students Club is a community-driven initiative by students for students,
          focused on fostering a collaborative learning environment in technology.
          Our mission is to bridge the gap between theoretical knowledge and practical application,
          empowering students to become proficient developers and innovators.
        </p>
        <p className="text-base leading-relaxed text-gray-400 text-justify mt-4 font-light">
          We achieve this by organizing workshops, hackathons, and collaborative projects that cover a wide range of technologies,
          including web development, mobile app development, cloud computing, and machine learning.
          Our club is not just about coding; it's about building a supportive community where students can share ideas, learn from each other, and grow together. We believe in the power of collaboration and innovation,
          and we strive to create a space where every member can thrive and contribute to
          meaningful projects.
        </p>
      </motion.section>

      {/* What We Offer */}
      <motion.section
        className="max-w-6xl mx-auto py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <h2 className="text-2xl font-bold mb-8 text-left text-white border-b border-gray-800 pb-3">What We Offer</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[ 
            { icon: <Code className="w-6 h-6 text-teal-400" />, title: "Web Development", desc: "Build responsive and interactive websites using modern frameworks." },
            { icon: <Smartphone className="w-6 h-6 text-teal-400" />, title: "Mobile App Development", desc: "Create native and cross-platform mobile applications for various platforms." },
            { icon: <Cloud className="w-6 h-6 text-teal-400" />, title: "Cloud Computing", desc: "Learn to deploy and manage applications on cloud platforms." },
            { icon: <Brain className="w-6 h-6 text-teal-400" />, title: "Machine Learning", desc: "Explore the world of AI and machine learning algorithms." },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#0F1A24]/40 border border-gray-800 rounded-2xl hover:border-teal-500/30 transition-all duration-300 shadow-xl flex flex-col items-start text-left group"
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
            >
              <div className="p-3 bg-teal-500/10 rounded-xl w-fit mb-4 border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:border-teal-400/30 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">{item.title}</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        className="max-w-6xl mx-auto py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <h2 className="text-2xl font-bold mb-8 text-left text-white border-b border-gray-800 pb-3">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Users className="w-6 h-6 text-teal-400" />, title: "Collaboration", desc: "We believe in the power of teamwork and shared knowledge." },
            { icon: <Lightbulb className="w-6 h-6 text-teal-400" />, title: "Innovation", desc: "We encourage creative thinking and problem-solving." },
            { icon: <BookOpen className="w-6 h-6 text-teal-400" />, title: "Learning", desc: "We are committed to continuous learning and skill development." },
            { icon: <Heart className="w-6 h-6 text-teal-400" />, title: "Community", desc: "We foster a supportive and inclusive community for all members." },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#0F1A24]/40 border border-gray-800 rounded-2xl hover:border-teal-500/30 transition-all duration-300 shadow-xl flex flex-col items-start text-left group"
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
            >
              <div className="p-3 bg-teal-500/10 rounded-xl w-fit mb-4 border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:border-teal-400/30 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">{item.title}</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-16 max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block"
        >
          <Link
            to="/contact"
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl font-bold font-mono uppercase tracking-wider hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300"
          >
            Become a Member
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
