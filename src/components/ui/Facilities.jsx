import React, { useState, useEffect, useRef } from "react";
import FacilityDetail from "./FacilityDetail";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    axiosInstance
      .get("/facilities/")
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  // Auto-scroll to detail section when a facility is selected
  useEffect(() => {
    if (selected && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "nearest" 
        });
      }, 100);
    }
  }, [selected]);

  const handleCardClick = (slug) => {
    setSelected(selected === slug ? null : slug);
  };

  return (
    <section id="facilities" className="px-8 py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Facilities</h2>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {facilities.map((facility) => (
          <div
            key={facility.slug}
            onClick={() => handleCardClick(facility.slug)}
            className="cursor-pointer rounded-xl shadow-lg overflow-hidden transition transform hover:-translate-y-2 hover:shadow-2xl group relative h-64"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundImage: `url(${facility.image})`,
              }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/20 transition-all duration-300"></div>
            </div>

            {/* Facility Name and Content */}
            <div className="relative h-full flex flex-col justify-end p-6 text-white z-10">
              <h3 className="font-bold text-2xl mb-2 drop-shadow-lg">
                {facility.title}
              </h3>
              <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                {facility.shortDesc || facility.longDesc.slice(0, 80)}...
              </p>
              
              {/* Click indicator */}
              <div className="mt-3 text-xs text-white/80 font-medium">
                {selected === facility.slug ? "▲ Click to close" : "▼ Click to view details"}
              </div>
            </div>

            {/* Active indicator border */}
            {selected === facility.slug && (
              <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Show selected detail inline with ref for scrolling */}
      <div ref={detailRef}>
        {selected && (
          <FacilityDetail
            facility={facilities.find((f) => f.slug === selected)}
          />
        )}
      </div>
    </section>
  );
}

export default Facilities;