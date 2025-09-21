"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/Custom.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.pageX - 10, y: e.pageY - 10 });
    };

    const handleClick = () => {
      setExpand(true);
      setTimeout(() => setExpand(false), 500);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className={`cursor ${expand ? "expand" : ""}`}
        style={{ top: position.y, left: position.x }}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
      />
    </AnimatePresence>
  );
}
