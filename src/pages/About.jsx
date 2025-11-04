// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import TeamCard from "../components/ui/TeamCard";
import axiosInstance from "../utils/axiosInstance";

export default function About() {
  const [team, setTeam] = useState([]);
  const [history, setHistory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axiosInstance.get("/team/").then((res) => setTeam(res.data));
    axiosInstance.get("/about/history/").then((res) => {
      if (res.data.length > 0) setHistory(res.data[0]);
    });
  }, []);

  // Auto carousel effect
  useEffect(() => {
    if (!history?.images?.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % history.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [history]);

  if (!history) return <div>Loading...</div>;

  const currentImage = history.images[currentIndex];

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen space-y-12">
      {/* --- History Section --- */}
      <section className="bg-gray-50 p-8 rounded-lg shadow-md flex flex-col md:flex-row gap-8">
        {/* Text */}
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold mb-4">{history.title}</h2>
          <p className="text-gray-700 whitespace-pre-line">{history.content}</p>
        </div>

        {/* Carousel */}
        {history.images?.length > 0 && (
          <div className="md:w-1/3 text-center">
            <img
              src={currentImage.absolute_image_url}
              alt={currentImage.caption}
              className="rounded-lg shadow-lg h-64 w-full object-cover mb-3"
            />
            <p className="text-sm text-gray-600">{currentImage.caption}</p>
          </div>
        )}
      </section>

      {/* --- Team Section --- */}
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
              desc={member.description}
              image={member.absolute_image_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
