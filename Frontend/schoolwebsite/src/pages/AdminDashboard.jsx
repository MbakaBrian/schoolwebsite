import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-700">
          Peppercorn Premier School
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">
          Website Admin Panel
        </h2>
      </header>

      {/* Buttons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/admin/events")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Manage Events</h3>
          <p className="text-gray-600">Add, edit, or remove upcoming events.</p>
        </button>

        <button
          onClick={() => navigate("/admin/gallery")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Manage Gallery</h3>
          <p className="text-gray-600">Upload and organize school images.</p>
        </button>

        <button
          onClick={() => navigate("/admin/facilities")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Manage Facilities Section</h3>
          <p className="text-gray-600">Upload facilities images and manage descriptions.</p>
        </button>

        <button
          onClick={() => navigate("/admin/team")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Manage Team</h3>
          <p className="text-gray-600">Add or update teacher/staff profiles.</p>
        </button>

        <button
          onClick={() => navigate("/admin/aboutUs")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Manage About Us Section</h3>
          <p className="text-gray-600">Edit the content and images for the About Us page.</p>
        </button>

        <button
          onClick={() => navigate("/admin/enrollments")}
          className="p-6 bg-white rounded-lg shadow-md border hover:bg-blue-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-2">View Enrollments</h3>
          <p className="text-gray-600">Review student applications submitted online.</p>
        </button>
      </div>
    </div>
  );
}
