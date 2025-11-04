import React from "react";

export default function ProjectCard({ project }) {
  return (
    <article className="bg-[#0e1620] border border-[#18202a] rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-[#1e293b] transition-all duration-300">
      {/* Project Image */}
      {project.absolute_image_url && (
        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
          <img
            src={project.absolute_image_url}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Project Details */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-md bg-[#0b1116] flex-shrink-0 flex items-center justify-center text-2xl">
          🔷
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <p className="text-sm text-gray-400 mt-2">{project.short_description}</p>
        </div>
      </div>

      {/* Tech Stack + Links */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">{project.tech_stack}</div>
        <div className="flex gap-3">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-[#111827] rounded-md hover:bg-[#1e293b] transition"
            >
              GitHub
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-[#111827] rounded-md hover:bg-[#1e293b] transition"
            >
              Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
