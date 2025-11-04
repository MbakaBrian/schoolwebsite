import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

export default function GalleryPanel() {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = () => {
    axiosInstance
      .get("/gallery/")
      .then((res) => setImages(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) data.append("image", formData.image);

    if (editingId) {
      axiosInstance
        .put(`/gallery/${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          fetchImages();
          resetForm();
        })
        .catch((err) => console.error(err));
    } else {
      axiosInstance
        .post("/gallery/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          fetchImages();
          resetForm();
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (img) => {
    setFormData({
      title: img.title,
      description: img.description,
      image: null, // don’t auto-set image
    });
    setEditingId(img.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this image?")) {
      axiosInstance
        .delete(`/gallery/${id}/`)
        .then(() => fetchImages())
        .catch((err) => console.error(err));
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", image: null });
    setEditingId(null);
  };
  const baseURL = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
      // Return a default placeholder if the path is null/undefined/empty
      if (!imagePath) return "/images/placeholder.jpg"; 
      
      // If the path is already absolute (starts with http/https), use it directly
      if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
          return imagePath;
      }
      
      // Otherwise, prepend the baseURL to the relative path
      return `${baseURL}${imagePath}`;
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Admin Panel - Gallery</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 p-4 border rounded shadow-md bg-gray-50"
      >
        <input
          type="text"
          name="title"
          placeholder="Image Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Image Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
          required={!editingId} // required only for new uploads
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingId ? "Update Image" : "Add Image"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Gallery List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="p-4 border rounded shadow bg-white flex flex-col items-center"
          >
            <img
            src={getImageUrl(img.absolute_image_url || img.image)} 
                alt={img.title}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="text-lg font-bold">{img.title}</h2>
            <p className="text-sm text-gray-600">{img.description}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleEdit(img)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(img.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
