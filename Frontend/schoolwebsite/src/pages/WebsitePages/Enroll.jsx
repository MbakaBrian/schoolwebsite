import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

function Enroll() {
  const [formData, setFormData] = useState({
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    studentName: "",
    age: "",
    grade: "",
    boardingStatus: "Day Scholar",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    axiosInstance
      .post("/enrollments/", {
        guardian_name: formData.guardianName,
        guardian_email: formData.guardianEmail,
        guardian_phone: formData.guardianPhone,
        student_name: formData.studentName,
        age: formData.age,
        grade_interested: formData.grade,
        boarder_or_day: formData.boardingStatus,
      })
      .then((res) => {
        setSuccess(true);
        setFormData({
          guardianName: "",
          guardianEmail: "",
          guardianPhone: "",
          studentName: "",
          age: "",
          grade: "",
          boardingStatus: "Day Scholar",
        });
      })
      .catch((err) => {
        console.error("Error submitting enrollment:", err.response?.data || err);
        setError("Failed to submit enrollment. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
        Enroll Now
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-md space-y-10"
      >
        {/* ------------------------------ */}
        {/* SECTION 1: Guardian Information */}
        {/* ------------------------------ */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Guardian / Parent Details
          </h3>

          {/* Guardian Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Guardian Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="guardianEmail"
              value={formData.guardianEmail}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Guardian Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ------------------------------ */}
        {/* SECTION 2: Student Information */}
        {/* ------------------------------ */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Student Details
          </h3>

          {/* Student Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Student Name
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Age */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grade Interested */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Grade Interested
            </label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Boarding or Day */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Boarding Option
            </label>
            <select
              name="boardingStatus"
              value={formData.boardingStatus}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Day Scholar">Day Scholar</option>
              <option value="Boarder">Boarder</option>
            </select>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && (
          <p className="text-green-600 text-center">
            Enrollment submitted successfully!
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default Enroll;
