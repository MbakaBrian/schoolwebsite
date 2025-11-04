import React from "react";

function TeamCard({ name, role, image, desc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
      <img
        src={image}
        alt={name}
        className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
      />
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <p className="text-blue-600 font-medium">{role}</p>
      <p className="text-gray-600 mt-2 text-sm">{desc}</p>
    </div>
  );
}

export default TeamCard;
