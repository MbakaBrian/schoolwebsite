import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosClient from "../../utils/axiosClient";

function StreamsPage() {
  const [streams, setStreams] = useState([]);
  const [grade, setGrade] = useState("");
  const [name, setName] = useState("");

  // base URL for Django API
  const API_URL = "http://127.0.0.1:8000/api/students/streams/";



useEffect(() => {
  axiosClient.get("students/streams/")
    .then((res) => setStreams(res.data))
    .catch((err) => console.error("Error fetching streams:", err));
}, []);

    const [gradeChoices, setGradeChoices] = useState([]);

    useEffect(() => {
      axiosClient
        .get("http://127.0.0.1:8000/api/students/streams/grade_choices/")
        .then((res) => setGradeChoices(res.data))
        .catch((err) => console.error("Error fetching grade choices:", err));
    }, []);


  const addStream = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        API_URL,
        { grade, name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setStreams([...streams, res.data]);
      setGrade("");
      setName("");
    } catch (err) {
      console.error("Error adding stream:", err);
    }
  };

  const deleteStream = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStreams(streams.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting stream:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Streams</h1>

      <form onSubmit={addStream} className="flex gap-2 mb-6">
      {/* Grade dropdown */}
      <select
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="border px-2 py-1 rounded"
        required
      >
        <option value="">Select Grade</option>
        {gradeChoices.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
        <input
          type="text"
          placeholder="Stream Name (e.g. Alpha)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Add Stream
        </button>
      </form>

      <ul className="space-y-2">
        {streams.map((s) => (
          <li
            key={s.id}
            className="flex justify-between items-center border px-4 py-2 rounded"
          >
            <span>
              {s.grade} {s.name}
            </span>
            <button
              onClick={() => deleteStream(s.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StreamsPage;
