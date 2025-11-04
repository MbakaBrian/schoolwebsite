import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CreateParent() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    national_id: "",
    email: "",
    emergency_number: "",
    residence: "",
    referral_source: "",
    referred_by: ""
  });

  const [parents, setParents] = useState([]); // For dropdown list

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/students/parents/");
        setParents(res.data);
      } catch (err) {
        console.error("Error fetching parents", err);
      }
    };
    fetchParents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/students/parents/", form);
      alert("Parent created successfully!");
      setForm({
        name: "",
        contact: "",
        national_id: "",
        email: "",
        emergency_number: "",
        residence: "",
        referral_source: "",
        referred_by: ""
      });
    } catch (error) {
      console.error(error);
      alert("Error creating parent");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create Parent</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 w-full"/>
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} className="border p-2 w-full"/>
        <input name="national_id" placeholder="National ID" value={form.national_id} onChange={handleChange} className="border p-2 w-full"/>
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} className="border p-2 w-full"/>
        <input name="emergency_number" placeholder="Emergency Number" value={form.emergency_number} onChange={handleChange} className="border p-2 w-full"/>
        <input name="residence" placeholder="Residence" value={form.residence} onChange={handleChange} className="border p-2 w-full"/>

        {/* Referral Source Dropdown */}
        <select name="referral_source" value={form.referral_source} onChange={handleChange} className="border p-2 w-full">
          <option value="">-- Select Referral Source --</option>
          <option value="self">Self</option>
          <option value="website">Website</option>
          <option value="brochure">Brochure</option>
          <option value="other">Other</option>
        </select>

        {/* Referred By Dropdown */}
        <select name="referred_by" value={form.referred_by} onChange={handleChange} className="border p-2 w-full">
          <option value="">-- Select Referring Parent (optional) --</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.national_id})</option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
