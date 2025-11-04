import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { BookOpen, Eye, Target } from "lucide-react";

// --- Guiding Principles ---
const guidingPrinciples = [
  {
    id: 1,
    title: "SCHOOL MOTTO",
    desc: 'KNOWLEDGE ONCE TAPPED IS POWER - "IN GOD WE TRUST", Nurturing Excellence, Inspiring Futures',
    color: "bg-gray-600/90",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "SCHOOL VISION",
    desc: "Aspire to be the preferred education gateway through which all our Learners and staff are turned into industrious adults",
    color: "bg-purple-600/90",
    icon: Eye,
  },
  {
    id: 3,
    title: "SCHOOL MISSION",
    desc: "To inculcate self-esteem and integrity in youth in a professional, homely environment by emphasizing the social, emotional, physical, spiritual, and intellectual development of each child to unleash their full potential",
    color: "bg-red-600/90",
    icon: Target,
  },
];

// --- Core Values ---
const peppercornList = [
  { letter: "P", name: "PERSEVERANCE", desc: "Striving through challenges" },
  { letter: "E", name: "EMPATHY", desc: "Understanding and Compassion" },
  { letter: "P", name: "PURPOSE", desc: "Clarity in goals and actions" },
  { letter: "P", name: "PASSION", desc: "Enthusiastic Pursuit of interests" },
  { letter: "E", name: "ETHICS", desc: "Strong moral principles" },
  { letter: "R", name: "RESPECT", desc: "Appreciation for diversity" },
  { letter: "C", name: "CREATIVITY", desc: "Innovative thinking" },
  { letter: "O", name: "OPENNESS", desc: "Transparency and Communication" },
  { letter: "R", name: "RESILIENCE", desc: "Strength in adversity" },
  { letter: "N", name: "NURTURE", desc: "Supportive and caring environment" },
];

export default function CoreValues() {
  const [selectedValue, setSelectedValue] = useState(null);

  const valuesRef = useRef(null);
  const guidingRef = useRef(null);

  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const guidingInView = useInView(guidingRef, { once: true, margin: "-100px" });

  const truncateText = (text, limit = 90) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  return (
    <section className="py-16 bg-gray-50 text-center min-h-screen flex flex-col font-[Inter]">

      {/* -------------------- 1. CORE VALUES SECTION -------------------- */}
      <motion.div
        ref={valuesRef}
        initial={{ opacity: 0, y: 60 }}
        animate={valuesInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="px-4 md:px-12 mb-16"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
          OUR CORE VALUES
        </h2>
        <p className="text-xl sm:text-2xl text-gray-600 mb-10 font-medium">
          <span className="font-bold text-red-600">PEPPERCORN</span> - *An Aromatic Spice*
        </p>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-left">
          {peppercornList.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.05 * index,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="flex flex-col p-4 bg-white rounded-xl shadow-lg border-t-4 border-red-500 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-2">
                <div className="text-2xl font-black text-red-600 mr-2">{item.letter}</div>
                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                  {item.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="h-0.5 bg-gray-700 w-3/4 mx-auto my-10" />

      {/* -------------------- 2. GUIDING PRINCIPLES -------------------- */}
      <motion.div
        ref={guidingRef}
        initial={{ opacity: 0, y: 60 }}
        animate={guidingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-10">
          Motto, Vision, and Mission
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-12 flex-grow">
          {guidingPrinciples.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.id}
                whileHover={{ scale: 1.03, rotate: 1 }}
                initial={{ opacity: 0, y: 50 }}
                animate={guidingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                onClick={() => setSelectedValue(value)}
                className={`${value.color} cursor-pointer rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between`}
              >
                <div className="mb-4">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                      <Icon className="w-8 h-8 text-gray-700" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-sm">
                    {truncateText(value.desc, 80)}
                    <span className="text-white font-medium ml-1 underline hover:text-gray-100">
                      See full text
                    </span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* -------------------- 3. MODAL -------------------- */}
      <AnimatePresence>
        {selectedValue && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedValue(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full text-center relative p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedValue(null)}
                className="absolute top-4 right-4 text-gray-500 text-2xl font-bold hover:text-red-500 transition-colors"
                aria-label="Close"
              >
                &times;
              </button>

              <div className="flex justify-center mb-5">
                <div className="bg-gray-100 p-5 rounded-full shadow-inner border-4 border-gray-200">
                  <selectedValue.icon className="w-12 h-12 text-gray-700" />
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                {selectedValue.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {selectedValue.desc}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
