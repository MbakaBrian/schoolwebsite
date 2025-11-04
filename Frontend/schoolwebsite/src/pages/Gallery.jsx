import React, { useEffect, useState } from "react";
import axios from "axios";
import GalleryCard from "../components/ui/GalleryCard";
import axiosInstance from "../utils/axiosInstance";

function Gallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/gallery/")
      .then(res => setPhotos(res.data))
      .catch(err => console.error("Error fetching gallery:", err));
  }, []);

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Our Gallery
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {photos.map((photo) => (
          <GalleryCard 
            key={photo.id} 
            image={photo.image} 
            description={photo.description} 
          />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
