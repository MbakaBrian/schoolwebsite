import React from "react";
import {
  Baby,
  BookOpen,
  Bus,
  Apple,
  Blocks,
  Sun,
} from "lucide-react"; // You can replace icons later if needed

export default function ProgramsSection({ title, programs }) {
  return (
    <section className="py-16 bg-[#fff8f2] flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-12">
      {/* Text Content */}
      <div className="md:w-1/2">
        <h2 className="text-3xl font-bold text-purple-800 mb-8 font-serif text-center md:text-left">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <div key={index} className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${program.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-600">{program.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
