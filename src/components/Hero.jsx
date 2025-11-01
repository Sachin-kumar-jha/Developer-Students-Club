import { motion} from "framer-motion";
import { Code2, Sparkles, Zap, Users, Cpu, Terminal, Rocket, Binary, GitBranch, Braces, Database, Cloud } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [codeLines, setCodeLines] = useState([]);
  const [terminalText, setTerminalText] = useState("");

  // Generate random code snippets
  useEffect(() => {
    const snippets = [
      "const innovate = () => { ",
      "function buildFuture() {",
      "class Developer {",
      "import React from 'react'",
      "async function code() {",
      "export default Student;",
      "npm install success",
      "git commit -m 'innovation'",
      "docker run community",
      "kubectl apply -f dream.yaml",
    ];
    
    const newLines = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      text: snippets[Math.floor(Math.random() * snippets.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setCodeLines(newLines);

    // Terminal typing effect
    const text = "> Initializing Developer Students Club...";
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setTerminalText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Track mouse movement
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const techIcons = [
    { Icon: Code2, x: "12%", y: "15%", delay: 0, color: "text-green-400" },
    { Icon: Terminal, x: "88%", y: "20%", delay: 1, color: "text-blue-400" },
    { Icon: Cpu, x: "8%", y: "75%", delay: 2, color: "text-purple-400" },
    { Icon: GitBranch, x: "92%", y: "70%", delay: 1.5, color: "text-orange-400" },
    { Icon: Database, x: "50%", y: "10%", delay: 0.5, color: "text-cyan-400" },
    { Icon: Cloud, x: "25%", y: "85%", delay: 0.8, color: "text-indigo-400" },
    { Icon: Braces, x: "75%", y: "88%", delay: 1.2, color: "text-pink-400" },
  ];

  return (
    <motion.section
      id="home"
      className="relative min-h-screen w-full  p-10  flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onMouseMove={handleMouseMove}
    >
      {/* Matrix-style Binary Rain */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-teal-400 font-mono text-xs"
            style={{
              left: `${(i * 5) % 100}%`,
              top: -20,
            }}
            animate={{
              y: ["0vh", "120vh"],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.div>
        ))}
      </div>

      {/* Code Snippet Background */}
      {codeLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute text-teal-500/20 font-mono text-xs whitespace-nowrap"
          style={{
            left: `${line.x}%`,
            top: `${line.y}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            delay: line.delay,
            ease: "easeInOut",
          }}
        >
          {line.text}
        </motion.div>
      ))}

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent h-40"
        animate={{
          y: ["0%", "100%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Grid Background with Perspective */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a620_1px,transparent_1px),linear-gradient(to_bottom,#14b8a620_1px,transparent_1px)] bg-[size:3rem_3rem]"
        style={{
          transform: "perspective(1000px) rotateX(60deg)",
          transformOrigin: "center bottom",
        }}
      />

      {/* Glowing Orbs with Circuit-like Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <motion.g
  style={{ transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)` }}
>
  <circle cx="20%" cy="30%" r="150" fill="url(#gradient1)" opacity="0.3" />
  <circle cx="20%" cy="30%" r="150" fill="url(#gradient2)" opacity="0.3" />
</motion.g>
        <defs>
          <radialGradient id="gradient1">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gradient2">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Interactive Tech Icons */}
      {techIcons.map(({ Icon, x, y, delay, color }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color} opacity-20 hover:opacity-80 transition-opacity duration-300`}
          style={{ left: x, top: y }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
          }}
          whileHover={{
            scale: 1.3,
            rotate: 180,
            opacity: 1,
            transition: { duration: 0.3 },
          }}
        >
          <Icon size={50} strokeWidth={1.5} />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-20 text-center px-6 max-w-6xl">
        {/* Terminal-style Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 bg-black/80 border border-teal-500/30 rounded font-mono text-teal-400 text-sm mb-8 shadow-lg shadow-teal-500/20"
        >
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ▸
          </motion.span>
          {terminalText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-teal-400 ml-1"
          />
        </motion.div>

        {/* Main Heading with Glitch Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight relative"
        >
          <motion.div
            className="relative inline-block"
            whileHover={{
              textShadow: [
                "0 0 8px #14b8a6, 0 0 20px #14b8a6",
                "2px 2px 0 #f0f, -2px -2px 0 #0ff",
                "0 0 8px #14b8a6, 0 0 20px #14b8a6",
              ],
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent font-black">
              DEVELOPER
            </span>
          </motion.div>
          <br />
          <motion.div
            className="relative inline-block"
            animate={{
              textShadow: [
                "0 0 10px #14b8a6",
                "0 0 20px #14b8a6, 0 0 30px #06b6d4",
                "0 0 10px #14b8a6",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white font-black">STUDENTS</span>
            <span className="text-teal-400 font-black"> CLUB</span>
          </motion.div>
        </motion.h1>

        {/* Subheading with Typing Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-mono"
        >
          <motion.p className="mb-2">
            <span className="text-teal-400">$</span> echo "Code. Collaborate. Create."
          </motion.p>
          <motion.p className="text-gray-500">
            <span className="text-cyan-400">&gt;&gt;</span> Empowering the next generation of tech innovators
          </motion.p>
        </motion.div>

        {/* CTA Buttons with Terminal Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.a
            href="#contact"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(20, 184, 166, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded font-bold overflow-hidden font-mono uppercase tracking-wider"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Terminal size={20} />
              ./join_community.sh
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          
          <motion.a
            href="#events"
            whileHover={{ 
              scale: 1.05,
              borderColor: "#14b8a6",
              boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-black border-2 border-teal-500/50 text-teal-400 rounded font-bold font-mono uppercase tracking-wider hover:bg-teal-500/10 transition-all"
          >
            ls ./events
          </motion.a>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { number: "500+", label: "Members", icon: Users, color: "teal" },
            { number: "50+", label: "Events", icon: Rocket, color: "cyan" },
            { number: "100+", label: "Projects", icon: Code2, color: "green" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                scale: 1.08,
                y: -5,
              }}
              className="relative group"
            >
              <div className="relative p-6 bg-black/60 backdrop-blur-sm border border-teal-500/30 rounded overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-teal-400"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-teal-400"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-teal-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-teal-400"></div>
                
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-teal-400 group-hover:scale-110 transition-transform" />
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-teal-400 mb-2 font-mono"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
                
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Scan Line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.section>
  );
}