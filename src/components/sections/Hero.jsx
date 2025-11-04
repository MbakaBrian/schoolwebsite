import React from "react";
import { motion } from "framer-motion"; // 👈 Import Framer Motion
import heroimage from "../../assets/images/hero/heroimage.jpg";
import PurpleBg from "../../assets/images/vector-purple.jpg";

function Hero() {
  return (
    <section
      className="relative overflow-hidden grid md:grid-cols-2 items-center px-8 py-16 bg-cover bg-center
                 before:content-[''] before:absolute before:inset-0 before:bg-gray-100 before:opacity-80 before:z-0"
      style={{
        backgroundImage: `url(${PurpleBg})`,
      }}
    >
      {/* Left Column - Text */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Peppercorn Premier Schools Ltd: Where Learning is an Adventure
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to Peppercorn Premier School, a place where learning meets inspiration.
          We believe every child has limitless potential, and we’re here to nurture curiosity,
          creativity, and character.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Enroll Now
        </motion.button>
      </motion.div>

      {/* Right Column - Image */}
      <motion.div
        className="relative z-10 flex justify-center mt-8 md:mt-0"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
      >
        <img
          src={heroimage}
          alt="Student"
          className="max-w-full h-auto md:max-w-[60%] rounded-full shadow-md object-contain"
        />
      </motion.div>
    </section>
  );
}

export default Hero;
