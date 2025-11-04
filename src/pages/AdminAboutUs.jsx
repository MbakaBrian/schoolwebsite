// src/pages/AdminAboutUs.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function AdminAboutUs() {
  const [history, setHistory] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ image: null, caption: "" });
  const [loading, setLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("authData"))?.access;

  // Fetch history and images
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get("/about/history/");
      if (res.data.length > 0) {
        setHistory(res.data[0]);
        setFormData({
          title: res.data[0].title,
          content: res.data[0].content,
        });
        setImages(res.data[0].images);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleTextChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) =>
    setNewImage({ ...newImage, image: e.target.files[0] });

  const handleSaveHistory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (history) {
        await axiosInstance.patch(`/about/history/${history.id}/`, formData, config);
      } else {
        await axiosInstance.post("/about/history/", formData, config);
      }
      fetchHistory();
    } catch (err) {
      console.error("Error saving history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImage.image) return alert("Please select an image");
    const data = new FormData();
    data.append("image", newImage.image);
    data.append("caption", newImage.caption);
    data.append("about", history.id);

    try {
      await axiosInstance.post("/about/history-images/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setNewImage({ image: null, caption: "" });
      fetchHistory();
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axiosInstance.delete(`/about/history-images/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHistory();
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - About Us</h1>

      {/* --- Edit History Text --- */}
      <form
        onSubmit={handleSaveHistory}
        className="space-y-4 border p-6 rounded bg-gray-50 shadow"
      >
        <h2 className="text-xl font-semibold">Edit Our History</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleTextChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="content"
          placeholder="History content"
          rows="8"
          value={formData.content}
          onChange={handleTextChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* --- Manage Carousel Images --- */}
      <div className="border p-6 rounded bg-gray-50 shadow">
        <h2 className="text-xl font-semibold mb-4">Manage Carousel Images</h2>

        <form onSubmit={handleAddImage} className="flex gap-4 items-center">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <input
            type="text"
            placeholder="Caption"
            value={newImage.caption}
            onChange={(e) =>
              setNewImage({ ...newImage, caption: e.target.value })
            }
            className="border p-2 rounded flex-1"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Image
          </button>
        </form>

        {/* Images Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative bg-white p-2 rounded shadow text-center"
            >
              <img
                src={img.absolute_image_url}
                alt={img.caption}
                className="w-full h-40 object-cover rounded"
              />
              <p className="text-sm mt-2">{img.caption}</p>
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
