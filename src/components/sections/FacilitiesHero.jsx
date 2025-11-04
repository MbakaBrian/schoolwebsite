import React from "react";
import { motion } from "framer-motion";

export default function HeroSection({ title, backgroundImage }) {
  return (
    <div
      className="relative w-full h-[60vh] flex items-center justify-center bg-center bg-cover"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Animated Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg"
      >
        {title}
      </motion.h1>
    </div>
  );
}
