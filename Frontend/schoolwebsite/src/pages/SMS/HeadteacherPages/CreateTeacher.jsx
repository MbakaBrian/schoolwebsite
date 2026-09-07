import React, { useState } from "react";
import axios from "axios";

export default function CreateTeacher() {
  const [form, setForm] = useState({
    national_id: "",
    first_name: "",
    last_name: "",
    surname: "",
    tsc_number: "",
    date_of_employment: "",
    gender: "M",
    date_of_birth: "",
    nhif_number: "",
    nssf_number: "",
    bank_account_number: "",
    highest_education_level: "Degree",
    grade: "",
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/teachers/teachers/", form);
      alert("Teacher created successfully!");
      setForm({
        national_id: "",
        first_name: "",
        last_name: "",
        surname: "",
        tsc_number: "",
        date_of_employment: "",
        gender: "M",
        date_of_birth: "",
        nhif_number: "",
        nssf_number: "",
        bank_account_number: "",
        highest_education_level: "Degree",
        grade: "",
        status: "active",
      });
    } catch (error) {
      console.error(error);
      alert("Error creating teacher");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create Teacher</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="border p-2 w-full"/>
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="border p-2 w-full"/>
        <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} className="border p-2 w-full"/>
        <input name="national_id" placeholder="National ID" value={form.national_id} onChange={handleChange} className="border p-2 w-full"/>
        <input name="tsc_number" placeholder="TSC Number" value={form.tsc_number} onChange={handleChange} className="border p-2 w-full"/>
        <input type="date" placeholder="Date of Employment" name="date_of_employment" value={form.date_of_employment} onChange={handleChange} className="border p-2 w-full"/>
        <input type="date" placeholder="date of birth" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="border p-2 w-full"/>
        <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 w-full">
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        <input name="nhif_number" placeholder="NHIF Number" value={form.nhif_number} onChange={handleChange} className="border p-2 w-full"/>
        <input name="nssf_number" placeholder="NSSF Number" value={form.nssf_number} onChange={handleChange} className="border p-2 w-full"/>
        <input name="bank_account_number" placeholder="Bank Account Number" value={form.bank_account_number} onChange={handleChange} className="border p-2 w-full"/>
        <select name="highest_education_level" value={form.highest_education_level} onChange={handleChange} className="border p-2 w-full">
          <option>Certificate</option>
          <option>Diploma</option>
          <option>Degree</option>
          <option>Masters</option>
          <option>PhD</option>
          <option>Untrained teacher</option>
        </select>
        <input name="grade" placeholder="Grade" value={form.grade} onChange={handleChange} className="border p-2 w-full"/>
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
