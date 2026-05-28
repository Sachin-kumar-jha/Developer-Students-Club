import FadeInSection from "./FadeInsection.jsx";
import { Code, Smartphone, Cloud, Brain } from "lucide-react";
import { motion, useMotionValue, useTransform, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Count Up animation component
function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value, 10);
      if (isNaN(end)) return;
      if (start === end) return;

      const duration = 1500;
      const incrementTime = Math.max(Math.floor(duration / end), 15);
      
      const timer = setInterval(() => {
        start += Math.ceil(end / 60);
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// 3D Card Tilt component
function TiltCard({ children, className }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  function handleMouseMove(event) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

export default function About() {
  const features = [
    {
      icon: <Code className="w-6 h-6 text-teal-400" />,
      title: "Web Development",
      desc: "Building modern, responsive, and high-performance web applications using modern frameworks."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-teal-400" />,
      title: "App Development",
      desc: "Designing and developing cross-platform mobile apps that offer native experiences."
    },
    {
      icon: <Cloud className="w-6 h-6 text-teal-400" />,
      title: "Cloud Computing",
      desc: "Deploying and scaling secure applications in scalable cloud environments."
    },
    {
      icon: <Brain className="w-6 h-6 text-teal-400" />,
      title: "Artificial Intelligence",
      desc: "Exploring machine learning, deep learning, and smart algorithms to solve real problems."
    },
  ];

  return (
    <section id="about" className="py-24 max-w-6xl mx-auto px-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-20">
        {/* Left Column: Text & Stats */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <FadeInSection>
            <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase mb-3 block">
              WHO WE ARE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-tight text-white mb-6">
              Empowering Student Developers to Innovate and Build
            </h2>
          </FadeInSection>

          <FadeInSection>
            <p className="text-gray-300 leading-relaxed text-lg mb-4">
              Developer Students Club is a community-driven initiative by students for students, focused on fostering a collaborative learning environment in technology. Our mission is to bridge the gap between theoretical knowledge and practical application.
            </p>
            <p className="text-gray-400 leading-relaxed text-base font-light mb-8">
              We organize hands-on workshops, hackathons, and collaborative projects that cover modern development. It's a space where students share ideas, learn from one another, and build solutions that matter.
            </p>
          </FadeInSection>

          {/* Stats Row */}
          <FadeInSection>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
              <div>
                <h4 className="text-3xl font-extrabold text-teal-400">
                  <Counter value="500" suffix="+" />
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Active Members</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-teal-400">
                  <Counter value="20" suffix="+" />
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Workshops & Events</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-teal-400">
                  <Counter value="10" suffix="+" />
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Projects Built</p>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* Right Column: Interactive Code Visualizer Card */}
        <div className="md:col-span-5 relative">
          <FadeInSection>
            <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
              {/* Background gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-purple-500/10 rounded-3xl filter blur-xl opacity-60"></div>
              
              {/* Dev Mockup Terminal Card */}
              <div className="relative w-full h-full bg-[#0F1A24]/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
                {/* Mac buttons decoration */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/70 block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70 block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/70 block"></span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">aboutUs.js</span>
                </div>
                
                {/* Code syntax container */}
                <div className="my-8 font-mono text-xs md:text-sm text-left space-y-2.5 text-gray-300">
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">club</span> = <span className="text-yellow-300">"DSC RTU KOTA"</span>;</p>
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">purpose</span> = <span className="text-yellow-300">"Learn. Build. Grow."</span>;</p>
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">domains</span> = [<br/>
                    &nbsp;&nbsp;<span className="text-teal-300">"Web"</span>, <span className="text-teal-300">"App"</span>, <span className="text-teal-300">"Cloud"</span>, <span className="text-teal-300">"AI"</span><br/>
                  ];</p>
                  <p className="text-gray-500">// Connect the dots</p>
                  <p><span className="text-blue-400">club</span>.<span className="text-green-400">startInnovation</span>();</p>
                </div>
                
                {/* Bottom branding row */}
                <div className="flex items-center justify-between border-t border-gray-800/80 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 flex items-center justify-center font-bold text-black text-xs">
                      DSC
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">RTU Kota</h4>
                      <p className="text-[9px] text-gray-500">Student Chapter</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full font-medium border border-teal-500/20">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* Focus Areas Cards Grid */}
      <div className="mt-24">
        <FadeInSection>
          <div className="text-center md:text-left mb-10">
            <span className="text-teal-400 text-xs font-semibold tracking-widest uppercase">OUR FOCUS</span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-white mt-2">Core Domains We Explore</h3>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <TiltCard
                key={idx}
                className="flex flex-col p-6 rounded-2xl border border-gray-800 bg-[#0F1A24]/40 backdrop-blur-sm transition-all duration-300 cursor-pointer text-left group hover:border-teal-500/30 hover:shadow-[0px_12px_24px_-10px_rgba(45,212,191,0.2)]"
              >
                <div className="p-3 bg-teal-500/10 rounded-xl w-fit mb-4 border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:border-teal-400/30 transition-all duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  {feature.desc}
                </p>
              </TiltCard>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
