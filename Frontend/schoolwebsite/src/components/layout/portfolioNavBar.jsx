import React from "react";

export default function Navbar() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="flex items-center justify-between py-6 sticky top-0 bg-[#0b0f15]/90 backdrop-blur-md z-50">
      <div
        className="text-2xl font-bold cursor-pointer text-white"
        onClick={() => scrollToSection("hero")}
      >
        Welcome To My Portfolio
      </div>

      <ul className="flex gap-4 text-sm font-medium">
        <li
          onClick={() => scrollToSection("hero")}
          className="px-4 py-2 rounded-full bg-[#0f1724] cursor-pointer hover:bg-[#1a2233] transition"
        >
          Home
        </li>
        <li
          onClick={() => scrollToSection("about")}
          className="px-4 py-2 rounded-full bg-[#0f1724] cursor-pointer hover:bg-[#1a2233] transition"
        >
          About
        </li>
        <li
          onClick={() => scrollToSection("projects")}
          className="px-4 py-2 rounded-full bg-[#0f1724] cursor-pointer hover:bg-[#1a2233] transition"
        >
          Projects
        </li>
        <li
          onClick={() => scrollToSection("contact")}
          className="px-4 py-2 rounded-full bg-[#0f1724] cursor-pointer hover:bg-[#1a2233] transition"
        >
          Contact
        </li>
      </ul>
    </nav>
  );
}
