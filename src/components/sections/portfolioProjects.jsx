import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // 👈 Import Framer Motion
import ProjectCard from "./portfolioProjectCard";
import axiosInstance from "../../utils/axiosInstance";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/portfolio/projects/")
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setLoading(false);
      });
  }, []);

  // 👇 Define motion variants for parent and children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // 👈 Delay between each card
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Projects</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((p) => (
            <motion.div key={p.id} variants={cardVariants}>
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
