// src/pages/FacilityPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeroSection from "../../components/sections/FacilitiesHero";
import ProgramsSection from "../../components/sections/ProgramsSection";
import * as LucideIcons from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const getIconComponent = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
};

export default function FacilityPage() {
  const { slug } = useParams(); // ← Gets the slug from URL (e.g. /facilities/kindergarten)
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    axiosInstance
      .get(`/facilities/${slug}/`) // Dynamically fetch data based on slug
      .then((res) => setFacility(res.data))
      .catch((err) => {
        console.error("Error fetching facility:", err);
        setFacility(null);
      })
      .finally(() => setLoading(false));
  }, [slug]); // Re-run whenever slug changes

  if (loading)
    return <div className="text-center py-20 text-lg text-gray-600">Loading...</div>;

  if (!facility)
    return (
      <div className="text-center py-20 text-red-600">
        Facility details not available.
      </div>
    );

  // Process dynamic programs
  const dynamicPrograms = (facility.programs || []).map((program) => {
    const IconComponent = getIconComponent(program.icon_name);
    return {
      ...program,
      icon: (props) => <IconComponent {...props} />,
      color: program.color_class,
    };
  });

  return (
    <>
      <HeroSection title={facility.title} backgroundImage={facility.image} />

      {/* Image + Long Description Section */}
      <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Image */}
          <img
            src={facility.image}
            alt={facility.title}
            className="w-full md:w-1/3 max-w-md rounded-xl shadow-xl object-cover h-64 md:h-96"
          />

          {/* Description */}
          <div className="md:w-2/3">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
              About Our {facility.title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {facility.longDesc}
            </p>
          </div>
        </div>
      </section>

      <hr className="my-10 border-blue-100" />

      {/* Programs Section */}
      {dynamicPrograms.length > 0 && (
        <ProgramsSection title="Our Core Programs" programs={dynamicPrograms} />
      )}
    </>
  );
}
