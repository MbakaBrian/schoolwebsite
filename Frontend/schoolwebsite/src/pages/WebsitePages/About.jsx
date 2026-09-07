// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import TeamCard from "../../components/ui/TeamCard";
import axiosInstance from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

export default function About() {
  const [team, setTeam] = useState([]);
  const [history, setHistory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    axiosInstance.get("/team/").then((res) => setTeam(res.data));
    axiosInstance.get("/about/history/").then((res) => {
      if (res.data.length > 0) setHistory(res.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!history?.images?.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % history.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [history]);

  if (!history) return <div>Loading...</div>;

  const currentImage = history.images[currentIndex];
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? history.images.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % history.images.length);
  };

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen space-y-12">

      {/* --- History Section --- */}
      <section className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold mb-4">{history.title}</h2>
          <p className="text-gray-700 whitespace-pre-line">{history.content}</p>
        </div>

    {history.images?.length > 0 && (
      <div className="md:w-1/3 flex flex-col items-center">

        {/* IMAGE + ARROWS WRAPPER */}
        <div className="relative w-full">

          {/* IMAGE */}
          <img
            src={currentImage.absolute_image_url}
            alt={currentImage.caption}
            className="rounded-lg shadow-lg h-80 w-full object-cover mb-3"
          />

          {/* LEFT ARROW */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow"
          >
            ❮
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow"
          >
            ❯
          </button>

        </div>

        {/* CAPTION */}
        <p className="text-sm text-gray-600 text-center">{currentImage.caption}</p>
      </div>
    )}

      </section>

      {/* --- TEAM SECTION --- */}
      <div className="px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Meet Our Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {team.map((member) => (
            <TeamCard
              key={member.id}
              name={member.name}
              role={member.role}
              image={member.absolute_image_url}
              onViewMore={() => setSelectedMember(member)}
            />
          ))}
        </div>
      </div>

      {/* --- TEAM MODAL --- */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full text-center relative p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-500 text-2xl font-bold hover:text-red-500"
              >
                &times;
              </button>

              {/* Image */}
              <div className="flex justify-center mb-6">
                <img
                  src={selectedMember.absolute_image_url}
                  alt={selectedMember.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
              </div>

              {/* Name + Role */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedMember.name}
              </h3>
              <p className="text-red-600 font-semibold mb-4">
                {selectedMember.role}
              </p>

              {/* Full Description */}
              <p className="text-gray-700 leading-relaxed">
                {selectedMember.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
