import React from "react";

function EventCard({ title, date, description, image }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 hover:shadow-lg transition duration-300">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6 text-left">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{date}</p>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}

export default EventCard;
