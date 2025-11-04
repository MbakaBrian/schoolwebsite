import React from "react";
import { motion } from "framer-motion"; // 👈 Import Framer Motion
import Navbar from "../components/layout/portfolioNavBar.jsx";
import Hero from "../components/sections/portfolioHero.jsx";
import AboutPage from "../components/sections/portflioAboutPage.jsx";
import Projects from "../components/sections/portfolioProjects.jsx";
import ContactPage from "../components/sections/portfolioContactPage.jsx";

export default function PortfolioPage() {
  return (
    <motion.div
      className="min-h-screen font-sans bg-[#0b0f15] text-gray-200"
      initial={{ opacity: 0, y: 20 }}      // 👈 start slightly below and transparent
      animate={{ opacity: 1, y: 0 }}       // 👈 fade + slide in
      transition={{ duration: 0.8, ease: "easeOut" }} // 👈 smooth transition
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section id="hero" className="py-16 border-b border-gray-800">
          <Hero />
        </section>

        {/* About Section */}
        <section id="about" className="py-16 border-b border-gray-800">
          <AboutPage />
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16 border-b border-gray-800">
          <Projects />
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <ContactPage />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm py-6 border-t border-gray-800 text-gray-500">
        Designed and built by <span className="text-cyan-400">Brian Mbaka</span> — ©{" "}
        {new Date().getFullYear()}
        <p className="text-gray-600 mt-2 text-xs">
          Incase you are wondering, I do have permission to host my portfolio on the website above —
          it’s also one of the projects I’ve built.
        </p>
      </footer>
    </motion.div>
  );
}
