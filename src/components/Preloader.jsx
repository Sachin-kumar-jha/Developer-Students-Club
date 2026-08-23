import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";

// Dark Cyberpunk / Sci-Fi Web Audio Synthesizer Engine
class DarkCyberSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.distNode = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneOsc3 = null;
    this.droneGain = null;
    this.droneFilter = null;
    this.lfo = null;
    this.lfoGain = null;
    this.telemetryInterval = null;
    this.isRunning = false;
  }

  // Soft saturation distortion curve for gritty cyberpunk warmth
  makeDistortionCurve(amount = 20) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        // Saturation wave shaper for dark warmth
        this.distNode = this.ctx.createWaveShaper();
        this.distNode.curve = this.makeDistortionCurve(12);
        this.distNode.oversample = '4x';

        this.distNode.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume().catch(() => {});
    }
    return Promise.resolve();
  }

  // Starts the continuous dark tech drone & telemetry soundscape
  startContinuous() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const t = this.ctx.currentTime;

      // 1. Dark Sub-Bass Reese Drone (Deep Cyberpunk Atmosphere)
      this.droneOsc1 = this.ctx.createOscillator(); // Sub fundamental
      this.droneOsc2 = this.ctx.createOscillator(); // Detuned saw
      this.droneOsc3 = this.ctx.createOscillator(); // Dark minor 3rd / 5th harmonic
      this.droneGain = this.ctx.createGain();
      this.droneFilter = this.ctx.createBiquadFilter();

      this.droneFilter.type = 'lowpass';
      this.droneFilter.Q.setValueAtTime(6.0, t);
      this.droneFilter.frequency.setValueAtTime(90, t);
      // Dark filter swell over 3.6s
      this.droneFilter.frequency.exponentialRampToValueAtTime(850, t + 3.6);

      // LFO for slow atmospheric breathing / pulse in the dark drone
      this.lfo = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(2.2, t); // 2.2 Hz pulse
      this.lfoGain.gain.setValueAtTime(40, t);
      this.lfo.connect(this.droneFilter.frequency);
      this.lfo.start(t);

      // Deep dark frequencies (D0 / D1 cyber dark mood)
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(48, t); // D1 Sub
      this.droneOsc1.frequency.exponentialRampToValueAtTime(72, t + 3.6);

      this.droneOsc2.type = 'sawtooth';
      this.droneOsc2.frequency.setValueAtTime(48.6, t); // Detuned for reese phase
      this.droneOsc2.frequency.exponentialRampToValueAtTime(72.9, t + 3.6);

      this.droneOsc3.type = 'triangle';
      this.droneOsc3.frequency.setValueAtTime(72, t); // Dark 5th
      this.droneOsc3.frequency.exponentialRampToValueAtTime(108, t + 3.6);

      // Drone Volume Envelope
      this.droneGain.gain.setValueAtTime(0.001, t);
      this.droneGain.gain.linearRampToValueAtTime(0.4, t + 0.35);
      this.droneGain.gain.setValueAtTime(0.4, t + 3.4);
      this.droneGain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneOsc3.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.distNode || this.masterGain);

      this.droneOsc1.start(t);
      this.droneOsc2.start(t);
      this.droneOsc3.start(t);

      // 2. High-Tech Dark Cyber Telemetry & Scanner Chirps (Every 120ms)
      const darkCyberPitches = [349.23, 440.00, 523.25, 698.46, 880.00, 1046.50];
      let step = 0;

      this.telemetryInterval = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        try {
          const now = this.ctx.currentTime;
          const freq = darkCyberPitches[step % darkCyberPitches.length];
          step++;

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, now);
          filter.Q.setValueAtTime(5.0, now);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 0.85, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.05);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.07, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.09);
        } catch (e) {}
      }, 120);

    } catch (e) {}
  }

  // 3. Heavy Dark Cybernetic Lock Impact (Triggered at bracket snap ~1.3s)
  playBracketLock() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;

      // Heavy 808 Dark Sub-Drop
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(220, t);
      subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);
      subGain.gain.setValueAtTime(0.65, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.46);

      // Industrial Metallic Clash
      const metalOsc = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      const metalFilter = this.ctx.createBiquadFilter();
      metalFilter.type = 'highpass';
      metalFilter.frequency.setValueAtTime(800, t);
      metalOsc.type = 'sawtooth';
      metalOsc.frequency.setValueAtTime(1600, t);
      metalOsc.frequency.exponentialRampToValueAtTime(280, t + 0.25);
      metalGain.gain.setValueAtTime(0.28, t);
      metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      metalOsc.connect(metalFilter);
      metalFilter.connect(metalGain);
      metalGain.connect(this.masterGain);
      metalOsc.start(t);
      metalOsc.stop(t + 0.26);
    } catch (e) {}
  }

  // 4. Dark Energy Surge (Triggered at ~1.85s when logos appear)
  playOrbitBurst() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.4);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.7);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130.81, t); // C3
      osc.frequency.exponentialRampToValueAtTime(261.63, t + 0.4); // C4

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.distNode || this.masterGain);

      osc.start(t);
      osc.stop(t + 0.75);
    } catch (e) {}
  }

  // 5. Dark Cyber Glitch Distortion Pulse
  playGlitch() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(140 + Math.random() * 300, t);
      osc.frequency.setValueAtTime(800 + Math.random() * 600, t + 0.03);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // 6. Dark Cinematic Warp Finish (Triggered at 100% completion)
  playLaunchClimax() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;

      // Dark cinematic power surge chord (D Minor 9 sci-fi chord: D, F, A, C, E)
      const darkChord = [146.83, 174.61, 220.00, 261.63, 329.63, 587.33];
      darkChord.forEach((freq, idx) => {
        const timeOffset = t + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, timeOffset);
        filter.frequency.exponentialRampToValueAtTime(2400, timeOffset + 0.3);
        filter.frequency.exponentialRampToValueAtTime(100, timeOffset + 0.9);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, timeOffset);

        gain.gain.setValueAtTime(0.001, timeOffset);
        gain.gain.linearRampToValueAtTime(0.18, timeOffset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, timeOffset + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.distNode || this.masterGain);

        osc.start(timeOffset);
        osc.stop(timeOffset + 0.95);
      });
    } catch (e) {}
  }

  // Stops all continuous sound smoothly
  stop() {
    this.isRunning = false;
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    if (this.ctx && this.masterGain) {
      try {
        const t = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        setTimeout(() => {
          if (this.droneOsc1) { try { this.droneOsc1.stop(); } catch(e){} }
          if (this.droneOsc2) { try { this.droneOsc2.stop(); } catch(e){} }
          if (this.droneOsc3) { try { this.droneOsc3.stop(); } catch(e){} }
          if (this.lfo) { try { this.lfo.stop(); } catch(e){} }
        }, 300);
      } catch (e) {}
    }
  }
}

export default function Preloader({ onComplete }) {
  const [statusText, setStatusText] = useState("Initializing kernel...");
  const [progress, setProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  const sound = useMemo(() => new DarkCyberSoundEngine(), []);

  // Generate random particles once
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (360 / 20) * i,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 3,
    })), []
  );

  // Generate spark particles
  const sparks = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
      delay: 1.2 + Math.random() * 0.8,
      duration: 0.4 + Math.random() * 0.3,
    })), []
  );

  // Dynamic responsive scale calculation for mobile, tablet, laptop & desktop
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scaleW = (w - 24) / 480;
      const scaleH = (h - 130) / 540;
      const computed = Math.min(1.0, Math.min(scaleW, scaleH));
      setScale(Math.max(0.55, computed));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    // Start continuous sci-fi soundscape
    const unlockAndStart = () => {
      sound.startContinuous();
      sound.resume();
    };

    // Try starting immediately on load
    unlockAndStart();

    // Also bind multi-event fallback to immediately unlock audio upon ANY user action
    const unlockEvents = ['click', 'pointerdown', 'touchstart', 'mousemove', 'keydown', 'wheel'];
    unlockEvents.forEach((ev) => window.addEventListener(ev, unlockAndStart, { passive: true }));

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

    // Bracket lock sound trigger at ~1300ms
    const lockTimer = setTimeout(() => {
      sound.playBracketLock();
    }, 1300);

    // Orbit burst sound when tech logos appear at ~1850ms
    const orbitTimer = setTimeout(() => {
      sound.playOrbitBurst();
    }, 1850);

    // Glitch effect trigger & sounds
    const glitchIntervals = [600, 1100, 1600, 2100];
    const glitchTimeouts = glitchIntervals.map((t) =>
      setTimeout(() => {
        setGlitchActive(true);
        sound.playGlitch();
        setTimeout(() => setGlitchActive(false), 150);
      }, t)
    );

    // Progress counter animation — fills over ~3.5s
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    // Mark animation as done after logo fully draws + brackets slide in
    const animTimeout = setTimeout(() => {
      setAnimationDone(true);
    }, 3800);

    // Check if document resources are fully loaded
    const checkLoaded = () => {
      if (document.readyState === 'complete') {
        setResourcesLoaded(true);
      }
    };
    checkLoaded();
    window.addEventListener('load', checkLoaded);

    return () => {
      clearInterval(interval);
      clearTimeout(lockTimer);
      clearTimeout(orbitTimer);
      clearTimeout(animTimeout);
      glitchTimeouts.forEach(clearTimeout);
      window.removeEventListener('load', checkLoaded);
      unlockEvents.forEach((ev) => window.removeEventListener(ev, unlockAndStart));
      sound.stop();
    };
  }, [sound]);

  // Only call onComplete when BOTH animation is done AND resources are loaded
  useEffect(() => {
    if (animationDone && resourcesLoaded && progress >= 100) {
      sound.playLaunchClimax();
      const exitTimeout = setTimeout(() => {
        sound.stop();
        if (onComplete) onComplete();
      }, 450);
      return () => clearTimeout(exitTimeout);
    }
  }, [animationDone, resourcesLoaded, progress, onComplete, sound]);

  // Path drawing variants for brackets — enhanced with spring bounce
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.0, ease: [0.65, 0, 0.35, 1], delay: 0.3 },
        opacity: { duration: 0.15, delay: 0.3 }
      }
    }
  };

  // Bracket position variants — dramatic slide-in with overshoot
  const leftBracketVariants = {
    hidden: { x: -60, opacity: 0, scale: 0.7 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 12, delay: 1.3 },
        opacity: { duration: 0.3, delay: 1.3 },
        scale: { type: "spring", stiffness: 120, damping: 12, delay: 1.3 }
      }
    }
  };

  const rightBracketVariants = {
    hidden: { x: 60, opacity: 0, scale: 0.7 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 12, delay: 1.3 },
        opacity: { duration: 0.3, delay: 1.3 },
        scale: { type: "spring", stiffness: 120, damping: 12, delay: 1.3 }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070D14] z-[9999] flex flex-col items-center justify-center overflow-hidden font-mono select-none">

      {/* Background layered radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.06)_0%,transparent_60%)]"
      />

      {/* Animated grid lines - subtle background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(234,88,12,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(234,88,12,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Animated logo wrapper — fully responsive scaled for mobile, tablet, laptop & desktop */}
      <div
        className="relative flex flex-col items-center justify-center transition-transform duration-200 ease-out"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >

        {/* Logo + effects container — fixed size so rings center on logo */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

        {/* Outer pulsing energy ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0.4, 0.1, 0.4, 0],
            scale: [0.5, 1.2, 1.3, 1.2, 1.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5
          }}
          className="absolute w-52 h-52 rounded-full border border-orange-500/30 pointer-events-none"
        />

        {/* Second energy ring (offset timing) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0.25, 0.05, 0.25, 0],
            scale: [0.6, 1.0, 1.1, 1.0, 1.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1.5
          }}
          className="absolute w-44 h-44 rounded-full border border-amber-400/20 pointer-events-none"
        />

        {/* Inner rotating dashed orbit ring */}
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.25, rotate: 360 }}
          transition={{
            opacity: { delay: 0.8, duration: 0.5 },
            rotate: { duration: 18, repeat: Infinity, ease: "linear" }
          }}
          className="absolute w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{
            border: '1.5px dashed rgba(234,88,12,0.35)',
          }}
        />

        {/* Tech Stack Logos — Inner Orbit (6 logos, clockwise) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute pointer-events-none"
          style={{
            width: 280, height: 280,
            animation: 'orbitSpin 16s linear infinite',
          }}
        >
          {/* MongoDB — 0° (top) */}
          <div className="absolute" style={{ left: '50%', top: 0, transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.0, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(71, 162, 72, 0.6)',
                boxShadow: '0 0 16px rgba(71, 162, 72, 0.4), inset 0 0 10px rgba(71, 162, 72, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 11.2 5.6 11.2 8.5C11.2 11.1 12 13.5 12 13.5C12 13.5 12.8 11.1 12.8 8.5C12.8 5.6 12 2 12 2Z" fill="#47A248"/>
                  <path d="M12 13.5C12 13.5 8.5 11 8.5 7.5C8.5 5.2 10 3 12 2C10 4 9.5 6 9.5 8C9.5 10.5 12 13.5 12 13.5Z" fill="#47A248" opacity="0.75"/>
                  <path d="M12 13.5C12 13.5 15.5 11 15.5 7.5C15.5 5.2 14 3 12 2C14 4 14.5 6 14.5 8C14.5 10.5 12 13.5 12 13.5Z" fill="#47A248" opacity="0.75"/>
                  <path d="M11.5 13V22L12 22.5L12.5 22V13C12.5 13 12 13.5 12 13.5C12 13.5 11.5 13 11.5 13Z" fill="#47A248" opacity="0.6"/>
                </svg>
              </div>
              <span style={{ fontSize: 7.5, color: '#47A248', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(71,162,72,0.6)' }}>MONGO</span>
            </motion.div>
          </div>

          {/* Express.js — 60° (top-right) */}
          <div className="absolute" style={{ left: '93.3%', top: '25%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.15, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(200, 200, 200, 0.5)',
                boxShadow: '0 0 16px rgba(200, 200, 200, 0.25), inset 0 0 10px rgba(200, 200, 200, 0.08)',
              }}>
                <span style={{ color: '#E0E0E0', fontSize: 14, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>Ex</span>
              </div>
              <span style={{ fontSize: 7.5, color: '#CCCCCC', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(200,200,200,0.5)' }}>EXPRESS</span>
            </motion.div>
          </div>

          {/* React — 120° (bottom-right) */}
          <div className="absolute" style={{ left: '93.3%', top: '75%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(97, 218, 251, 0.6)',
                boxShadow: '0 0 16px rgba(97, 218, 251, 0.4), inset 0 0 10px rgba(97, 218, 251, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="2.5" fill="#61DAFB"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" opacity="0.85"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" opacity="0.85" transform="rotate(60 12 12)"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" opacity="0.85" transform="rotate(120 12 12)"/>
                </svg>
              </div>
              <span style={{ fontSize: 7.5, color: '#61DAFB', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(97,218,251,0.6)' }}>REACT</span>
            </motion.div>
          </div>

          {/* Node.js — 180° (bottom) */}
          <div className="absolute" style={{ left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.45, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(104, 159, 56, 0.6)',
                boxShadow: '0 0 16px rgba(104, 159, 56, 0.4), inset 0 0 10px rgba(104, 159, 56, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill="none" stroke="#689F38" strokeWidth="1.8" strokeLinejoin="round"/>
                  <text x="12" y="15.5" textAnchor="middle" fill="#689F38" fontSize="8" fontWeight="bold" fontFamily="monospace">JS</text>
                </svg>
              </div>
              <span style={{ fontSize: 7.5, color: '#689F38', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(104,159,56,0.6)' }}>NODE</span>
            </motion.div>
          </div>

          {/* JavaScript — 240° (bottom-left) */}
          <div className="absolute" style={{ left: '6.7%', top: '75%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(240, 219, 79, 0.6)',
                boxShadow: '0 0 16px rgba(240, 219, 79, 0.4), inset 0 0 10px rgba(240, 219, 79, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="3" fill="#F0DB4F"/>
                  <text x="13" y="17.5" textAnchor="middle" fill="#323330" fontSize="11" fontWeight="bold" fontFamily="monospace">JS</text>
                </svg>
              </div>
              <span style={{ fontSize: 7.5, color: '#F0DB4F', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(240,219,79,0.6)' }}>JAVASCRIPT</span>
            </motion.div>
          </div>

          {/* TypeScript — 300° (top-left) */}
          <div className="absolute" style={{ left: '6.7%', top: '25%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.75, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpin 16s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(49, 120, 198, 0.6)',
                boxShadow: '0 0 16px rgba(49, 120, 198, 0.4), inset 0 0 10px rgba(49, 120, 198, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6"/>
                  <text x="12" y="17" textAnchor="middle" fill="white" fontSize="10.5" fontWeight="bold" fontFamily="monospace">TS</text>
                </svg>
              </div>
              <span style={{ fontSize: 7.5, color: '#3178C6', marginTop: 2, fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 0 8px rgba(49,120,198,0.6)' }}>TYPESCRIPT</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Outer dashed orbit ring — reverse direction */}
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.25, rotate: -360 }}
          transition={{
            opacity: { delay: 1.5, duration: 0.5 },
            rotate: { duration: 24, repeat: Infinity, ease: "linear" }
          }}
          className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            border: '1.5px dashed rgba(97, 218, 251, 0.25)',
          }}
        />

        {/* Outer Orbit — 9 tech logos (reverse rotation, 40° intervals) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute pointer-events-none"
          style={{
            width: 420, height: 420,
            animation: 'orbitSpinReverse 24s linear infinite',
          }}
        >
          {/* 1. Angular — 0° (top) */}
          <div className="absolute" style={{ left: '50%', top: 0, transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(221, 44, 0, 0.6)',
                boxShadow: '0 0 16px rgba(221, 44, 0, 0.4), inset 0 0 10px rgba(221, 44, 0, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7L4.5 18L12 22L19.5 18L21 7L12 2Z" fill="#DD2C00" opacity="0.95"/>
                  <path d="M12 2L12 22L19.5 18L21 7L12 2Z" fill="#C3002F" opacity="0.8"/>
                  <path d="M12 5.5L7.5 16H9.5L10.5 13.5H13.5L14.5 16H16.5L12 5.5ZM12 8.5L13 12H11L12 8.5Z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#DD2C00', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(221,44,0,0.6)' }}>ANGULAR</span>
            </motion.div>
          </div>

          {/* 2. Tailwind CSS — 40° (top-right 1) */}
          <div className="absolute" style={{ left: '82.1%', top: '11.7%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.45, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(56, 189, 248, 0.6)',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6C9.33 6 7.67 7.33 7 10C8 8.67 9.17 8.17 10.5 8.5C11.26 8.69 11.81 9.25 12.41 9.86C13.41 10.87 14.57 12 17 12C19.67 12 21.33 10.67 22 8C21 9.33 19.83 9.83 18.5 9.5C17.74 9.31 17.19 8.75 16.59 8.14C15.59 7.13 14.43 6 12 6Z" fill="#38BDF8"/>
                  <path d="M7 12C4.33 12 2.67 13.33 2 16C3 14.67 4.17 14.17 5.5 14.5C6.26 14.69 6.81 15.25 7.41 15.86C8.41 16.87 9.57 18 12 18C14.67 18 16.33 16.67 17 14C16 15.33 14.83 15.83 13.5 15.5C12.74 15.31 12.19 14.75 11.59 14.14C10.59 13.13 9.43 12 7 12Z" fill="#38BDF8"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#38BDF8', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(56,189,248,0.6)' }}>TAILWIND</span>
            </motion.div>
          </div>

          {/* 3. Flutter — 80° (right) */}
          <div className="absolute" style={{ left: '99.2%', top: '41.3%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(69, 209, 253, 0.6)',
                boxShadow: '0 0 16px rgba(69, 209, 253, 0.4), inset 0 0 10px rgba(69, 209, 253, 0.15)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2L4 12L8 16L22 2H14Z" fill="#45D1FD"/>
                  <path d="M14 10L8 16L12 20L22 10H14Z" fill="#45D1FD"/>
                  <path d="M8 16L12 20L14 18L10 14L8 16Z" fill="#1B6AC0" opacity="0.85"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#45D1FD', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(69,209,253,0.6)' }}>FLUTTER</span>
            </motion.div>
          </div>

          {/* 4. Kotlin — 120° (bottom-right 1) */}
          <div className="absolute" style={{ left: '93.3%', top: '75.0%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.75, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(127, 82, 255, 0.6)',
                boxShadow: '0 0 16px rgba(127, 82, 255, 0.4), inset 0 0 10px rgba(127, 82, 255, 0.15)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="kotlinGradNew" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#7F52FF"/>
                      <stop offset="50%" stopColor="#E44857"/>
                      <stop offset="100%" stopColor="#F88909"/>
                    </linearGradient>
                  </defs>
                  <path d="M2 22L12 12L22 22H2Z" fill="url(#kotlinGradNew)"/>
                  <path d="M2 2H12L2 12V2Z" fill="url(#kotlinGradNew)"/>
                  <path d="M12 2L2 12L12 12L22 2H12Z" fill="url(#kotlinGradNew)" opacity="0.85"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#A985FF', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(127,82,255,0.6)' }}>KOTLIN</span>
            </motion.div>
          </div>

          {/* 5. Android Studio — 160° (bottom-right 2) */}
          <div className="absolute" style={{ left: '67.1%', top: '97.0%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.9, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(60, 175, 80, 0.6)',
                boxShadow: '0 0 16px rgba(60, 175, 80, 0.4), inset 0 0 10px rgba(60, 175, 80, 0.15)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 10C6 8.9 6.9 8 8 8H16C17.1 8 18 8.9 18 10V18C18 19.1 17.1 20 16 20H8C6.9 20 6 19.1 6 18V10Z" fill="#3CAF50"/>
                  <rect x="9" y="3" width="2" height="5" rx="1" fill="#3CAF50"/>
                  <rect x="13" y="3" width="2" height="5" rx="1" fill="#3CAF50"/>
                  <rect x="3" y="11" width="2" height="5" rx="1" fill="#3CAF50"/>
                  <rect x="19" y="11" width="2" height="5" rx="1" fill="#3CAF50"/>
                  <rect x="9" y="20" width="2" height="3" rx="1" fill="#3CAF50"/>
                  <rect x="13" y="20" width="2" height="3" rx="1" fill="#3CAF50"/>
                  <circle cx="10" cy="12" r="1" fill="white"/>
                  <circle cx="14" cy="12" r="1" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#3CAF50', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(60,175,80,0.6)' }}>ANDROID</span>
            </motion.div>
          </div>

          {/* 6. Swift — 200° (bottom-left 2) */}
          <div className="absolute" style={{ left: '32.9%', top: '97.0%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.05, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(240, 81, 56, 0.6)',
                boxShadow: '0 0 16px rgba(240, 81, 56, 0.4), inset 0 0 10px rgba(240, 81, 56, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20.9 14.6C19.7 18.6 15.4 21.6 10.7 21.3C13.5 19.3 15.6 16.5 16.3 13.3C14.5 14.8 12.2 15.7 9.8 15.8C8.5 15.8 7.2 15.4 6 14.8C5.2 14.4 3.7 13.3 2.5 11.8C5 13.2 8.1 13.4 10.8 12.3C7.4 10.7 4.9 7.8 3.8 4.3C5.9 7.1 9 9.1 12.5 9.7C10.7 7.7 9.8 5 10.1 2.3C13.3 5.4 17.4 10.1 19.2 14.3C19.7 13.3 19.9 12.3 20 11.2C20.9 12.4 21.2 13.5 20.9 14.6Z" fill="#F05138"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#F05138', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(240,81,56,0.6)' }}>SWIFT</span>
            </motion.div>
          </div>

          {/* 7. MySQL — 240° (bottom-left 1) */}
          <div className="absolute" style={{ left: '6.7%', top: '75.0%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.2, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(0, 117, 143, 0.6)',
                boxShadow: '0 0 16px rgba(0, 117, 143, 0.4), inset 0 0 10px rgba(0, 117, 143, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18.8 11.2C17.5 8.6 14.9 6.2 12 5.5C11 4.2 9.7 3.3 8.1 3C8.4 3.7 8.5 4.5 8.3 5.2C6.9 5.4 5.6 6 4.6 7C5.8 6.7 7 6.8 8 7.4C5.8 8.8 4.4 11.2 4.1 13.8C5.2 12.6 6.6 11.9 8.1 11.8C7.7 12.6 7.6 13.5 7.8 14.4C8.2 13.7 8.8 13.2 9.6 13C10.1 14.2 11 15.2 12.1 15.8C13.8 16.7 15.8 16.7 17.4 15.8C18.2 15.3 18.8 14.5 19.1 13.6C19.2 12.8 19.1 12 18.8 11.2Z" fill="#00758F"/>
                  <circle cx="9.5" cy="6.2" r="0.7" fill="#fff"/>
                  <path d="M10 18.5H17" stroke="#F29111" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M6 18.5H8" stroke="#00758F" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#00758F', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(0,117,143,0.6)' }}>MYSQL</span>
            </motion.div>
          </div>

          {/* 8. Git — 280° (left) */}
          <div className="absolute" style={{ left: '0.8%', top: '41.3%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.35, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(240, 80, 50, 0.6)',
                boxShadow: '0 0 16px rgba(240, 80, 50, 0.4), inset 0 0 10px rgba(240, 80, 50, 0.15)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21.6 10.9L13.1 2.4C12.5 1.9 11.6 1.9 11 2.4L9.1 4.3L11.5 6.7C12.1 6.5 12.8 6.6 13.3 7.1C13.8 7.7 13.9 8.4 13.6 9L15.9 11.3C16.5 11 17.3 11.1 17.8 11.7C18.5 12.3 18.5 13.3 17.8 14C17.2 14.6 16.2 14.6 15.6 14C15.1 13.5 14.9 12.7 15.2 12.1L13.1 10V15.3C13.3 15.5 13.4 15.7 13.4 16C13.4 17.1 12.5 18 11.4 18C10.3 18 9.4 17.1 9.4 16C9.4 15.2 9.9 14.5 10.6 14.2V8.8C9.9 8.5 9.4 7.8 9.4 7C9.4 6.7 9.5 6.4 9.6 6.1L7.2 3.7L2.4 8.5C1.9 9.1 1.9 10 2.4 10.6L10.9 19.1C11.5 19.6 12.4 19.6 13 19.1L21.6 10.5C22.1 10 22.1 9.1 21.6 10.9Z" fill="#F05032"/>
                  <circle cx="11.4" cy="7" r="1.8" fill="white"/>
                  <circle cx="11.4" cy="16" r="1.8" fill="white"/>
                  <circle cx="16.7" cy="12.8" r="1.8" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#F05032', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(240,80,50,0.6)' }}>GIT</span>
            </motion.div>
          </div>

          {/* 9. GitHub — 320° (top-left 1) */}
          <div className="absolute" style={{ left: '17.9%', top: '11.7%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5, duration: 0.5, type: "spring", stiffness: 150 }}
              style={{ animation: 'orbitCounterSpinReverse 24s linear infinite' }}
              className="flex flex-col items-center"
            >
              <div style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(7, 13, 22, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 0 16px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.1)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017C2 16.446 4.869 20.204 8.84 21.535C9.34 21.626 9.522 21.317 9.522 21.051C9.522 20.814 9.513 20.187 9.508 19.351C6.726 19.957 6.139 18.006 6.139 18.006C5.685 16.848 5.03 16.541 5.03 16.541C4.122 15.918 5.099 15.931 5.099 15.931C6.102 16.002 6.63 16.965 6.63 16.965C7.522 18.497 8.966 18.055 9.536 17.799C9.627 17.151 9.885 16.709 10.17 16.458C7.95 16.205 5.615 15.343 5.615 11.503C5.615 10.409 6.005 9.514 6.645 8.814C6.542 8.56 6.199 7.541 6.743 6.177C6.743 6.177 7.581 5.908 9.489 7.203C10.285 6.981 11.134 6.87 11.979 6.866C12.823 6.87 13.673 6.981 14.471 7.203C16.377 5.908 17.213 6.177 17.213 6.177C17.759 7.541 17.416 8.56 17.314 8.814C17.957 9.514 18.343 10.409 18.343 11.503C18.343 15.354 16.004 16.201 13.776 16.449C14.136 16.762 14.455 17.377 14.455 18.324C14.455 19.684 14.443 20.78 14.443 21.051C14.443 21.321 14.622 21.634 15.132 21.534C19.101 20.201 21.968 16.444 21.968 12.017C21.968 6.484 17.493 2 12 2Z"/>
                </svg>
              </div>
              <span style={{ fontSize: 7, color: '#FFFFFF', marginTop: 2, fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 0 8px rgba(255,255,255,0.6)' }}>GITHUB</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Orbiting particle dots */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              rotate: [p.angle, p.angle + 360],
            }}
            transition={{
              opacity: { duration: p.duration, repeat: Infinity, delay: p.delay + 0.8 },
              rotate: { duration: 6 + p.delay, repeat: Infinity, ease: "linear", delay: 0.8 }
            }}
            className="absolute pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `rgba(234, 88, 12, ${0.4 + Math.random() * 0.4})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(234, 88, 12, 0.5)`,
              transformOrigin: '110px 110px',
              left: 110,
              top: 110,
            }}
          />
        ))}

        {/* Glowing backdrop halo — enhanced multi-layer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [0.9, 1.2, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-44 h-44 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.05, 0.2, 0.05],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute w-56 h-56 rounded-full bg-amber-400/10 blur-[60px] pointer-events-none"
        />

        {/* Scanner line sweep effect */}
        <motion.div
          initial={{ top: '0%', opacity: 0 }}
          animate={{
            top: ['0%', '100%', '0%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(234,88,12,0.8), transparent)',
            boxShadow: '0 0 15px rgba(234,88,12,0.5), 0 0 30px rgba(234,88,12,0.2)',
            width: '160px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />

        {/* Electric spark particles on bracket convergence */}
        {sparks.map((s) => (
          <motion.div
            key={`spark-${s.id}`}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: s.x,
              y: s.y,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: "easeOut",
            }}
            className="absolute pointer-events-none z-30"
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#fbbf24',
              boxShadow: '0 0 6px #fbbf24, 0 0 12px rgba(234,88,12,0.6)',
            }}
          />
        ))}

        {/* Main SVG Logo — same as original, centered in fixed container */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            scale: { type: "spring", stiffness: 80, damping: 15, delay: 0.1 },
            opacity: { duration: 0.4, delay: 0.1 }
          }}
        >
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
        </motion.div>

        </div>{/* End of logo + effects container */}

        {/* Brand Text — with glitch effect (positioned cleanly below the outer orbit ring) */}
        <div className="mt-32 text-center relative z-20">
          <motion.h2
            initial={{ opacity: 0, y: 15, letterSpacing: "0.15em" }}
            animate={{
              opacity: 1,
              y: 0,
              letterSpacing: "0.25em",
              transition: { duration: 0.8, ease: "easeOut", delay: 1.5 }
            }}
            className="text-white text-sm sm:text-base font-bold font-display uppercase relative"
            style={{
              textShadow: glitchActive
                ? '2px 0 #ea580c, -2px 0 #14b8a6, 0 0 8px rgba(234,88,12,0.5)'
                : '0 0 8px rgba(234,88,12,0.15)',
              transform: glitchActive ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 2 - 1}px)` : 'none',
              transition: 'text-shadow 0.05s, transform 0.05s',
            }}
          >
            Developer Students Club
          </motion.h2>

          {/* Glitch overlay lines */}
          {glitchActive && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                clipPath: `inset(${Math.random() * 40}% 0 ${Math.random() * 40}% 0)`,
              }}
            >
              <div
                className="text-white text-sm sm:text-base font-bold font-display uppercase tracking-[0.25em] text-center"
                style={{
                  transform: `translateX(${Math.random() * 8 - 4}px)`,
                  color: '#ea580c',
                  opacity: 0.7,
                }}
              >
                Developer Students Club
              </div>
            </div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="text-[10px] sm:text-xs text-gray-400 tracking-[0.4em] uppercase mt-1"
            style={{
              textShadow: glitchActive ? '1px 0 #ea580c, -1px 0 #14b8a6' : 'none',
              transition: 'text-shadow 0.05s',
            }}
          >
            RTU Kota Chapter
          </motion.p>
        </div>
      </div>

      {/* Loader UI — responsive bottom spacing */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 max-w-xs sm:max-w-sm mx-auto flex flex-col gap-1.5 items-center z-20">
        {/* Simulated Command Log */}
        <div className="h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="text-xs text-teal-400 font-mono tracking-wide"
            >
              <span className="text-orange-400 mr-1">❯</span>
              {statusText}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Loading Progress Bar — enhanced with glow */}
        <div className="w-48 h-1.5 bg-gray-800/80 rounded-full overflow-hidden relative backdrop-blur-sm">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 rounded-full relative"
          >
            {/* Progress bar shine */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-1/3"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
            />
          </motion.div>
          {/* Progress bar glow */}
          <div
            className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 8px rgba(234,88,12,0.6), 0 0 16px rgba(234,88,12,0.3)',
              transition: 'width 0.1s ease-out',
            }}
          />
        </div>

        {/* Progress Percentage — with blinking cursor */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] text-gray-500 font-mono flex items-center gap-1"
        >
          {progress}% loaded
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-orange-400"
          >
            ▎
          </motion.span>
        </motion.span>
      </div>
    </div>
  );
}
