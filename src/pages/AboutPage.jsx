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
    <div className="bg-[#0F1A24] min-h-screen text-gray-200 px-15">
      {/* Hero Header */}
      <motion.section
        className="py-20 px-6 max-w-4xl text-left"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h1 className="text-4xl md:text-5xl text-left font-semibold tracking-tighter mb-6">
          About Developer Students Club
        </h1>
        <p className="text-lg leading-relaxed text-gray-300 text-justify">
          Developer Students Club is a community-driven initiative by students for students,
          focused on fostering a collaborative learning environment in technology.
          Our mission is to bridge the gap between theoretical knowledge and practical application,
          empowering students to become proficient developers and innovators.
          We achieve this by organizing workshops, hackathons, and collaborative projects that cover a wide range of technologies,
          including web development, mobile app development, cloud computing, and machine learning.
          Our club is not just about coding; it's about building a supportive community where students can share ideas, learn from each other, and grow together. We believe in the power of collaboration and innovation,
          and we strive to create a space where every member can thrive and contribute to
          meaningful projects. Our past projects have included developing community apps,
          participating in tech challenges, and contributing to open-source initiatives,
          making a tangible impact in our community and beyond.
        </p>
      </motion.section>

      {/* What We Offer */}
      <motion.section
        className="max-w-6xl mx-auto px-6 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <h2 className="text-2xl font-bold mb-8 text-left">What We Offer</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[ 
            { icon: <Code className="w-8 h-8 text-teal-400 mb-4" />, title: "Web Development", desc: "Build responsive and interactive websites using modern frameworks." },
            { icon: <Smartphone className="w-8 h-8 text-teal-400 mb-4" />, title: "Mobile App Development", desc: "Create native and cross-platform mobile applications for various platforms." },
            { icon: <Cloud className="w-8 h-8 text-teal-400 mb-4" />, title: "Cloud Computing", desc: "Learn to deploy and manage applications on cloud platforms." },
            { icon: <Brain className="w-8 h-8 text-teal-400 mb-4" />, title: "Machine Learning", desc: "Explore the world of AI and machine learning algorithms." },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#152633] rounded-xl border border-gray-700 hover:border-teal-400 transition"
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
            >
              {item.icon}
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        className="max-w-6xl mx-auto px-6 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <h2 className="text-2xl font-bold mb-8 text-left">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Users className="w-8 h-8 text-teal-400 mb-4" />, title: "Collaboration", desc: "We believe in the power of teamwork and shared knowledge." },
            { icon: <Lightbulb className="w-8 h-8 text-teal-400 mb-4" />, title: "Innovation", desc: "We encourage creative thinking and problem-solving." },
            { icon: <BookOpen className="w-8 h-8 text-teal-400 mb-4" />, title: "Learning", desc: "We are committed to continuous learning and skill development." },
            { icon: <Heart className="w-8 h-8 text-teal-400 mb-4" />, title: "Community", desc: "We foster a supportive and inclusive community for all members." },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#152633] rounded-xl border border-gray-700 hover:border-teal-400 transition"
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
            >
              {item.icon}
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-12 px-6 max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <motion.a
          href="#contact"
          className="px-6 py-3 bg-teal-400 text-black rounded-lg font-semibold hover:bg-teal-300 transition inline-block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Become a Member
        </motion.a>
      </motion.section>
    </div>
  );
}
