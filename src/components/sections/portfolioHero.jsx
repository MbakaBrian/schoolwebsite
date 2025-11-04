import React from "react";
import { motion } from "framer-motion";
import portfolioImage from "../../assets/images/passportphoto.png";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 bg-[#0b0f15] px-6 py-12">
      {/* Profile Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden ring-4 ring-[#111827] shadow-lg"
      >
        <img
          src={portfolioImage}
          alt="Brian Mbaka"
          className="object-cover w-full h-full"
        />
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center md:text-left max-w-2xl"
      >
        <h1 className="text-5xl font-extrabold text-white mb-4">
          Hi, I'm <span className="text-cyan-400">Brian Mbaka</span>
        </h1>
        <p className="text-lg text-gray-300 mb-2">
          Software Engineer | Full Stack Developer
        </p>
        <p className="text-lg text-gray-300 mb-6">
          Building responsive and accessible web applications that bring ideas to life.
        </p>

        {/* Download CV Button */}
        <a
          href="/cv/CV_Resume.pdf"
          download
          className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300"
        >
          Download My CV
        </a>
      </motion.div>
    </section>
  );
}
