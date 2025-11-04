import React from "react";
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaPython,
  FaPhp,
  FaDatabase,
  FaGitAlt,
  FaNodeJs,
} from "react-icons/fa";
import {
  SiDjango,
  SiMysql,
  SiTailwindcss,
  SiNextdotjs,
  SiCodeigniter,
  SiBootstrap,
  SiStreamlit,
  SiGoogle,
  SiTwilio,
  SiOpenai,
} from "react-icons/si";
import portfolioImage from "../../assets/images/passportphoto.png";

export default function AboutPage() {
const technologies = [
  { icon: <FaHtml5 className="text-orange-500" />, name: "HTML5" },
  { icon: <FaCss3Alt className="text-blue-500" />, name: "CSS3" },
  { icon: <SiTailwindcss className="text-sky-500" />, name: "TailwindCSS" },
  { icon: <FaJs className="text-yellow-400" />, name: "JavaScript" },
  { icon: <FaReact className="text-cyan-400" />, name: "React" },
  { icon: <SiNextdotjs className="text-red-900 dark:text-white" />, name: "Next.js" },
  { icon: <FaPython className="text-blue-400" />, name: "Python" },
  { icon: <SiDjango className="text-green-700" />, name: "Django" },
  { icon: <FaPhp className="text-indigo-500" />, name: "PHP" },
  { icon: <SiCodeigniter className="text-red-600" />, name: "CodeIgniter 4" },
  { icon: <SiMysql className="text-blue-600" />, name: "MySQL" },
  { icon: <FaDatabase className="text-gray-500" />, name: "Database" },
  { icon: <FaNodeJs className="text-green-500" />, name: "Node.js" },
  { icon: <FaGitAlt className="text-orange-600" />, name: "Git" },
  { icon: <SiBootstrap className="text-purple-600" />, name: "Bootstrap" },
  { icon: <SiStreamlit className="text-red-500" />, name: "Streamlit" },

  // Added APIs
  { icon: <SiGoogle className="text-blue-500" />, name: "Gemini API" },
  { icon: <SiTwilio className="text-red-500" />, name: "Twilio API" },
  { icon: <SiOpenai className="text-emerald-400" />, name: "OpenAI API" },
];


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-600 px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">
        About Me
      </h1>

      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Profile and Bio */}
        <div className="flex flex-col items-center text-center md:text-left md:items-start">
          <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-[#111827] mb-6">
            <img
              src={portfolioImage}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Who I Am
          </h2>
<p className="text-white leading-relaxed mb-4">
  Hello 👋, I'm{" "}
  <span className="font-semibold text-white">Brian Mbaka</span>, a
  passionate Full Stack Developer currently in my 4th year at{" "}
  <span className="font-semibold text-white">Jomo Kenyatta University of Agriculture and Technology (JKUAT)</span>,
  pursuing a degree in Computer Technology.
</p>

<p className="text-white leading-relaxed mb-4">
  I’m a mostly self-taught developer who has continuously sharpened my skills
  through real-world projects and continuous learning. To build a strong
  foundation, I attended a{" "}
  <span className="font-semibold text-white">
    Full Stack Web and Android Development
  </span>{" "}
  class at{" "}
  <span className="font-semibold text-white">eMobilis Technical Institute</span>,
  which laid the groundwork for the expertise I have today.
</p>

<p className="text-white leading-relaxed">
  I’m deeply focused on crafting clean, scalable, and user-friendly systems —
  transforming ideas into efficient digital solutions. I’m currently open to{" "}
  <span className="font-semibold text-white">freelance</span> and{" "}
  <span className="font-semibold text-white">part-time opportunities</span>,
  where I can contribute my technical and creative problem-solving skills to
  meaningful projects as i upskill myself.
</p>

          <p className="text-white leading-relaxed">
            From backend logic to frontend design, my goal is to deliver smooth
            digital experiences that make a real impact.
          </p>
        </div>

        {/* Right Side - Technologies */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-8 text-white">
            Technologies I Work With
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center group hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-2 group-hover:opacity-80 transition">
                  {tech.icon}
                </div>
                <span className="text-sm text-white font-medium">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
