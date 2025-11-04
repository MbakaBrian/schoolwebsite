import React from "react";

function GalleryCard({ image, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <img
        src={image}
        alt={description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default GalleryCard;
