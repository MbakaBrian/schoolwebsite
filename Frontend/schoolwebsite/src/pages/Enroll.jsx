import React, { useState } from "react";

function Enroll() {
  const [formData, setFormData] = useState({
    guardianName: "",
    studentName: "",
    age: "",
    grade: "",
    boardingStatus: "Day Scholar",
    guardianEmail: "",
    guardianPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enrollment Data:", formData);
    alert("Enrollment form submitted successfully!");
    // Later: connect this to your Django backend via API call
  };

  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Enroll Now
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6"
      >
        {/* Guardian Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Guardian Name
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

        {/* Student Name */}
        <div>
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
        <div>
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
        <div>
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

        {/* Boarding or Day Scholar */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Boarding or Day Scholar
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

        {/* Guardian Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Guardian Email
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
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Guardian Phone Contacts
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}

export default Enroll;
