import { motion,AnimatePresence} from "framer-motion";
import { Code2, Sparkles, Zap, Users, Cpu, Terminal, Rocket, Binary, GitBranch, Braces, Database, Cloud } from "lucide-react";
import { createElement, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AuthModal from "./AuthModal";
export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [codeLines, setCodeLines] = useState([]);
  const [terminalText, setTerminalText] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("about");
  const [typedCode, setTypedCode] = useState("");

  const fileContents = {
    about: `{
  "name": "DSC RTU Kota",
  "domain": "RTU Student Chapter",
  "members": "500+ Active",
  "tracks": [
    "Web Dev",
    "App Dev",
    "Cloud",
    "GenAI"
  ],
  "motto": "Learn. Build. Grow."
}`,
    events: `// Active & Upcoming Events
const dscEvents = [
  {
    title: "DevFest RTU 2026",
    type: "Hackathon",
    status: "Planning"
  },
  {
    title: "Cloud Study Jam",
    type: "Hands-on Lab",
    status: "Upcoming"
  }
];

function register(event) {
  return community.join(event);
}`,
    terminal: `$ npm run start:community
> dsc-rtu-kota@1.0.0 start
> node index.js

[SYSTEM] Initializing club database...
[OK] Connected to RTU Server
[OK] Core modules loaded.
[READY] Join at ./join_community.sh
$`
  };

  useEffect(() => {
    setTypedCode("");
    let i = 0;
    const code = fileContents[activeTab];
    const interval = setInterval(() => {
      if (i < code.length) {
        setTypedCode(code.slice(0, i + 1));
        i += 3;
      } else {
        setTypedCode(code);
        clearInterval(interval);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [activeTab]);

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
    <>
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
          {createElement(Icon, { size: 50, strokeWidth: 1.5 })}
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-7 flex flex-col text-left justify-center">
          {/* Terminal-style Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-black/80 border border-teal-500/30 rounded font-mono text-teal-400 text-sm mb-8 shadow-lg shadow-teal-500/20 w-fit"
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
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight font-display"
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
            className="text-base md:text-lg text-gray-400 mb-10 font-mono"
          >
            <motion.p className="mb-2">
              <span className="text-teal-400">$</span> echo "Code. Collaborate. Create."
            </motion.p>
            <motion.p className="text-gray-500">
              <span className="text-cyan-400">&gt;&gt;</span> Empowering the next generation of tech innovators
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-start mb-6"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(20, 184, 166, 0.6)",
              }}
              onClick={() => setShowAuthModal(true)}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-black rounded-xl cursor-pointer font-bold overflow-hidden font-mono uppercase tracking-wider"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Terminal size={18} />
                {!user? "./join_community.sh":`Welcome ./${user?.name}`}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            <motion.a
              href="#events"
              whileHover={{ 
                scale: 1.05,
                borderColor: "#14b8a6",
                boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3.5 bg-black/60 border-2 border-teal-500/50 text-teal-400 rounded-xl font-bold font-mono uppercase tracking-wider hover:bg-teal-500/10 transition-all"
            >
              ls ./events
            </motion.a>
          </motion.div>
        </div>

        {/* Right Column: Interactive Mock IDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-5 hidden lg:block w-full"
        >
          <div className="relative w-full aspect-[4/3] bg-[#0A1118]/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Gradient background glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Title bar / Tab section */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-[#060B10] border-b border-gray-800/80">
              <div className="flex items-center gap-4">
                {/* Mac buttons decoration */}
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] block"></span>
                </div>
                {/* Tabs */}
                <div className="flex gap-1.5 ml-2">
                  {Object.keys(fileContents).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded font-mono text-[10px] font-medium border transition-all duration-300 cursor-pointer ${
                        activeTab === tab
                          ? "bg-[#0A1118] text-teal-400 border-gray-800"
                          : "bg-transparent text-gray-500 border-transparent hover:text-gray-300"
                      }`}
                    >
                      {tab === "about" ? "about.json" : tab === "events" ? "events.js" : "terminal.sh"}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">VSCode - DSC</span>
            </div>

            {/* Code Body */}
            <div className="relative z-10 flex-1 p-5 overflow-auto font-mono text-[11px] leading-relaxed text-gray-300 text-left bg-[#0A1118]/50">
              <pre className="whitespace-pre-wrap select-text">
                <code className="text-teal-300">
                  {typedCode}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-3 bg-teal-400 ml-0.5"
                  />
                </code>
              </pre>
            </div>

            {/* IDE Footer */}
            <div className="relative z-10 flex items-center justify-between px-4 py-1.5 bg-[#060B10] border-t border-gray-800/80 text-[10px] text-gray-600 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-teal-500/80">● UTF-8</span>
                <span>Space: 2</span>
              </div>
              <span>JavaScript / JSON</span>
            </div>
          </div>
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
 <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
</>
  );
}
