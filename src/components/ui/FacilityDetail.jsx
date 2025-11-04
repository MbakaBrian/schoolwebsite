import React from "react";
import { Link } from "react-router-dom";

function FacilityDetail({ facility }) {
  if (!facility) return null;

  return (
    <div className="mt-12 px-8 py-12 bg-blue-50 rounded-lg transition-all duration-500">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10">
        {/* Image Section */}
        <img
          src={facility.image}
          alt={facility.title}
          className="w-full md:w-1/3 max-w-sm rounded-lg shadow-lg object-cover"
        />

        {/* Text Section */}
        <div className="text-center md:text-left md:w-2/3">
          <h3 className="text-2xl font-bold mb-4">{facility.title}</h3>
          <p className="text-gray-700 max-w-2xl text-justify mb-6">
            {facility.shortDesc}
          </p>

          {/* View More Button - only if slug exists */}
          {facility.slug && (
            <Link
              to={`/facilities/${facility.slug}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              View More
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default FacilityDetail;
