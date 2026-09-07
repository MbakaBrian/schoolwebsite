import React, { useState } from "react";

export default function ManageTeachers() {
  // ✅ Hardcoded teacher reviews
  const teacherReviews = [
    { id: 1, name: "Mr. John Doe", subject: "Mathematics", avgReview: 4.8 },
    { id: 2, name: "Ms. Jane Smith", subject: "English", avgReview: 4.6 },
    { id: 3, name: "Mr. Peter Mwangi", subject: "Science", avgReview: 4.2 },
  ].sort((a, b) => b.avgReview - a.avgReview);

  // ✅ Hardcoded attendance per teacher
  const attendance = [
    { teacher: "Mr. John Doe", date: "2025-09-28", totalStudents: 35, present: 32, absent: 3 },
    { teacher: "Ms. Jane Smith", date: "2025-09-28", totalStudents: 40, present: 37, absent: 3 },
    { teacher: "Mr. Peter Mwangi", date: "2025-09-28", totalStudents: 38, present: 36, absent: 2 },
  ];

  // ✅ Hardcoded content progression
  const teacherContent = {
    "Mr. John Doe": [
      { subject: "Mathematics", progress: 80 },
      { subject: "Physics", progress: 60 },
    ],
    "Ms. Jane Smith": [
      { subject: "English", progress: 75 },
      { subject: "History", progress: 50 },
    ],
    "Mr. Peter Mwangi": [
      { subject: "Science", progress: 90 },
      { subject: "Biology", progress: 70 },
    ],
  };

  const [selectedTeacher, setSelectedTeacher] = useState("Mr. John Doe");

  return (
    <div className="p-6 space-y-6">
      {/* Teacher Reviews Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">📊 Teacher Reviews (Avg)</h2>
        {teacherReviews.map((teacher) => (
          <div
            key={teacher.id}
            className="flex justify-between border-b last:border-0 py-2"
          >
            <span>
              {teacher.name} ({teacher.subject})
            </span>
            <span className="font-semibold">{teacher.avgReview} ⭐</span>
          </div>
        ))}
      </div>

      {/* Attendance Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">📅 Student Attendance per Teacher</h2>
        {attendance.map((rec, index) => (
          <div
            key={index}
            className="flex justify-between border-b last:border-0 py-2"
          >
            <span>
              {rec.teacher} - {rec.date}
            </span>
            <span>
              {rec.present}/{rec.totalStudents} Present ({rec.absent} Absent)
            </span>
          </div>
        ))}
      </div>

      {/* Content Progression Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">📘 Content Progression</h2>

        {/* Dropdown */}
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="border rounded p-2 mb-4"
        >
          {Object.keys(teacherContent).map((teacher, i) => (
            <option key={i} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>

        {/* Progress bars */}
        {teacherContent[selectedTeacher]?.map((item, idx) => (
          <div key={idx} className="mb-4">
            <p className="mb-1">{item.subject}</p>
            <div className="w-full bg-gray-200 rounded h-4">
              <div
                className="bg-blue-500 h-4 rounded"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{item.progress}% completed</p>
          </div>
        ))}
      </div>
    </div>
  );
}
