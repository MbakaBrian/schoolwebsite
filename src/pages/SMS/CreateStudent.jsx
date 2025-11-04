import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CreateStudent() {
  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    surname: "",
    grade: "",
    gender: "M",
    parent: "",
    date_of_birth: "",
    is_boarder: false,
    term_registered: "1",
    year_registered: new Date().getFullYear(),
    transport_stage: ""  // ✅ updated: store stage id instead of location
  });

  const [parents, setParents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [stages, setStages] = useState([]); // ✅ transport stages

  // ✅ Load parents
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/students/parents/")
      .then((res) => setParents(res.data))
      .catch((err) => console.error(err));
  }, []);

    // Fetch streams
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/students/streams/")
      .then((res) => setStreams(res.data))
      .catch((err) => console.error("Error fetching streams:", err));
    }, []);

  // ✅ Load transport stages (each belongs to a route)
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/fees/stages/")
      .then((res) => setStages(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/students/students/", form);
      alert("✅ Student created successfully!");
      setForm({
        first_name: "",
        second_name: "",
        surname: "",
        grade: "",
        gender: "M",
        parent: "",
        date_of_birth: "",
        is_boarder: false,
        term_registered: "1",
        year_registered: new Date().getFullYear(),
        transport_stage: "" // reset
      });
    } catch (error) {
      console.error(error);
      alert("❌ Error creating student");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="border p-2 w-full"/>
        <input name="second_name" placeholder="Second Name" value={form.second_name} onChange={handleChange} className="border p-2 w-full"/>
        <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} className="border p-2 w-full"/>

        <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="border p-2 w-full"/>

    {/* Stream dropdown */}
          <select
            name="stream"
            value={form.stream}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="">Select Stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.grade} - {s.name}
              </option>
            ))}
          </select>



        <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 w-full">
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="is_boarder" checked={form.is_boarder} onChange={handleChange}/>
          <span>Boarding Student</span>
        </label>

        {/* Parent dropdown */}
        <select name="parent" value={form.parent} onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Parent</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.national_id})
            </option>
          ))}
        </select>

        {/* ✅ Transport Stages dropdown */}
        <select name="transport_stage" value={form.transport_stage} onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Transport Stage</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.stage_name} ({s.route_name}) - {s.fee_amount} KES
            </option>
          ))}
        </select>

        {/* Term + Year */}
        <select name="term_registered" value={form.term_registered} onChange={handleChange} className="border p-2 w-full">
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>

        <input name="year_registered" type="number" value={form.year_registered} onChange={handleChange} className="border p-2 w-full"/>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Save Student
        </button>
      </form>
    </div>
  );
}
