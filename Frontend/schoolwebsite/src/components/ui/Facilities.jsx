import React, { useState, useEffect, useRef } from "react";
import FacilityDetail from "./FacilityDetail";
import axiosInstance from "../../utils/axiosInstance";

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [visibleCards, setVisibleCards] = useState({});
  const detailRef = useRef(null);

  useEffect(() => {
    axiosInstance
      .get("/facilities/")
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  // Track which cards are visible for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            setVisibleCards((prev) => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll(".facility-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [facilities]);

  const handleCardClick = (slug) => {
    setSelected(selected === slug ? null : slug);
    setTimeout(() => {
      if (detailRef.current) {
        detailRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  // Group facilities by category
  const grouped = facilities.reduce((acc, facility) => {
    const category = facility.category || "Others";
    if (!acc[category]) acc[category] = [];
    acc[category].push(facility);
    return acc;
  }, {});

  return (
    <section id="facilities" className="px-8 py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Facilities</h2>

      {/* Loop categories */}
      {Object.keys(grouped).map((category) => (
        <div key={category} className="mb-16">

          {/* Category Name */}
          <h3 className="text-2xl font-bold text-left mb-6 text-gray-800">
            {category}
          </h3>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {grouped[category].map((facility, index) => (
              <div
                key={facility.slug}
                data-id={facility.slug}
                onClick={() => handleCardClick(facility.slug)}
                className={`facility-card cursor-pointer rounded-xl shadow-lg overflow-hidden 
                  transition transform hover:-translate-y-2 hover:shadow-2xl group relative h-64
                  opacity-0
                  ${visibleCards[facility.slug] ? "animate-slide-up-fade" : ""}
                `}
                style={{
                  animationDelay: visibleCards[facility.slug]
                    ? `${index * 0.15}s`
                    : "0s",
                }}
              >

                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${facility.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                </div>

                {/* Text */}
                <div className="relative h-full flex flex-col justify-end p-6 text-white z-10">
                  <h3 className="font-bold text-2xl mb-2">{facility.title}</h3>
                  <p className="text-sm line-clamp-2">
                    {facility.shortDesc || facility.longDesc.slice(0, 80)}...
                  </p>

                  <div className="mt-3 text-xs text-white/80">
                    {selected === facility.slug
                      ? "▲ Click to close"
                      : "▼ Click to view details"}
                  </div>
                </div>

                {/* Active Highlight */}
                {selected === facility.slug && (
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Facility Details */}
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
