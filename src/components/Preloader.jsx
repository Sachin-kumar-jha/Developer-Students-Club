import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Preloader({ onComplete }) {
  const [statusText, setStatusText] = useState("Initializing kernel...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Status text rotation to give a hacker/dev feel
    const statuses = [
      { text: "Resolving packages...", time: 400 },
      { text: "Connecting to RTU node...", time: 900 },
      { text: "Compiling shaders...", time: 1400 },
      { text: "System check: OK", time: 1900 },
      { text: "Launching Developer Students Club...", time: 2200 }
    ];

    statuses.forEach((status) => {
      setTimeout(() => {
        setStatusText(status.text);
      }, status.time);
    });

    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 22);

    // Call onComplete after animations finish
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  // Path drawing variants for brackets
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.2, ease: "easeInOut", delay: 0.2 },
        opacity: { duration: 0.1, delay: 0.2 }
      }
    }
  };

  // Bracket position variants (sliding together)
  const leftBracketVariants = {
    hidden: { x: -30 },
    visible: {
      x: 0,
      transition: { duration: 0.8, ease: "backOut", delay: 1.4 }
    }
  };

  const rightBracketVariants = {
    hidden: { x: 30 },
    visible: {
      x: 0,
      transition: { duration: 0.8, ease: "backOut", delay: 1.4 }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070D14] z-[9999] flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      {/* Background neon grids & radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)]" />
      
      {/* Animated logo wrapper */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing backdrop halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-40 h-40 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"
        />

        <svg viewBox="0 0 200 200" width="160" height="160" className="relative z-10 filter drop-shadow-[0_0_12px_rgba(234,88,12,0.35)]">
          <defs>
            {/* Left Bracket Gradient */}
            <linearGradient id="leftGrad" x1="80" y1="0" x2="30" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Right Bracket Gradient */}
            <linearGradient id="rightGrad" x1="120" y1="0" x2="170" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="glow-preloader" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Bracket < */}
          <motion.g variants={leftBracketVariants} initial="hidden" animate="visible">
            <motion.path
              d="M 80,50 L 30,100 L 80,150"
              fill="none"
              stroke="url(#leftGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.g>

          {/* Right Bracket > */}
          <motion.g variants={rightBracketVariants} initial="hidden" animate="visible">
            <motion.path
              d="M 120,50 L 170,100 L 120,150"
              fill="none"
              stroke="url(#rightGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.g>
        </svg>

        {/* Brand Text */}
        <div className="mt-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10, letterSpacing: "0.15em" }}
            animate={{
              opacity: 1,
              y: 0,
              letterSpacing: "0.25em",
              transition: { duration: 0.8, ease: "easeOut", delay: 1.5 }
            }}
            className="text-white text-sm font-bold font-display uppercase"
          >
            Developer Students Club
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="text-[10px] text-gray-400 tracking-[0.4em] uppercase mt-1"
          >
            RTU Kota Chapter
          </motion.p>
        </div>
      </div>

      {/* Loader UI */}
      <div className="absolute bottom-16 left-6 right-6 max-w-sm mx-auto flex flex-col gap-2 items-center">
        {/* Simulated Command Log */}
        <div className="h-5 flex items-center justify-center">
          <motion.span
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-teal-400 font-mono tracking-wide"
          >
            {statusText}
          </motion.span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
          />
        </div>

        {/* Progress Percentage */}
        <span className="text-[10px] text-gray-500 font-mono">
          {progress}% loaded
        </span>
      </div>
    </div>
  );
}
