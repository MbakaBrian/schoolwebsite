import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../utils/axiosInstance";

export default function AdminPanel() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch events on page load
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axiosInstance
      .get("/events/")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update event
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      axiosInstance.put(`/events/${editingId}/`, formData)
        .then(() => {
          fetchEvents();
          resetForm();
        })
        .catch(err => console.error(err));
    } else {
      axiosInstance.post("/events/", formData)
        .then(() => {
          fetchEvents();
          resetForm();
        })
        .catch(err => console.error(err));
    }
  };

  const handleEdit = (event) => {
    setFormData({
    title: event.title,
      description: event.description,
      date: event.date,
      location: event.location
    });
    setEditingId(event.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      axiosInstance.delete(`/events/${id}/`)
        .then(() => fetchEvents())
        .catch(err => console.error(err));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", date: "", location: "" });
    setEditingId(null);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Admin Panel - Events</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 border rounded shadow-md bg-gray-50">
        <input
          type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Event Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Event Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex space-x-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? "Update Event" : "Add Event"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{event.title}</h2>
              <p>{event.description}</p>
              <p className="text-sm text-gray-500">
                {event.date} - {event.location}
              </p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(event)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Edit
              </button>
              <button onClick={() => handleDelete(event.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
