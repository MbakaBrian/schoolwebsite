import React, { useEffect, useState } from "react";
import axios from "axios";

const FeeStructurePage = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    grade: "",
    term: "",
    interview_fee: 0,
    registration_fee: 0,
    tuition_fee: 0,
    pocket_money: 0,
    meals_fee: 0,
    boarding_fee: 0,
    swimming_fee: 0,
    textbook_fund_fee: 0,
    educational_trips_fee: 0,
    insurance_fee: 0,
    activity_fee: 0,
    rubric_fee: 0,
    others: 0,
    year: new Date().getFullYear(),
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    const res = await axios.get("http://localhost:8000/api/fees/fee-structures/");
    setFeeStructures(res.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(
        `http://localhost:8000/api/fees/fee-structures/${editingId}/`,
        formData
      );
      setEditingId(null);
    } else {
      await axios.post("http://localhost:8000/api/fees/fee-structures/", formData);
    }
    setFormData({
      grade: "",
      term: "",
      interview_fee: 0,
      registration_fee: 0,
      tuition_fee: 0,
      pocket_money: 0,
      meals_fee: 0,
      boarding_fee: 0,
      swimming_fee: 0,
      textbook_fund_fee: 0,
      educational_trips_fee: 0,
      insurance_fee: 0,
      activity_fee: 0,
      rubric_fee: 0,
      others: 0,
      year: new Date().getFullYear(),
    });
    setShowForm(false);
    fetchFeeStructures();
  };

  const handleEdit = (fee) => {
    setFormData(fee);
    setEditingId(fee.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Grade Fee Structures</h2>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setFormData({
            grade: "",
            term: "",
            interview_fee: 0,
            registration_fee: 0,
            tuition_fee: 0,
            pocket_money: 0,
            meals_fee: 0,
            boarding_fee: 0,
            swimming_fee: 0,
            textbook_fund_fee: 0,
            educational_trips_fee: 0,
            insurance_fee: 0,
            activity_fee: 0,
            rubric_fee: 0,
            others: 0,
            year: new Date().getFullYear(),
          });
          setEditingId(null);
        }}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        {showForm ? "Close Form" : "Add Fee Structure"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">Grade</label>
            <input
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Term</label>
            <input
              name="term"
              value={formData.term}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          {Object.keys(formData)
            .filter((field) => !["grade", "term", "year"].includes(field))
            .map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium capitalize">
                  {field.replace(/_/g, " ")}
                </label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            ))}
          <div>
            <label className="block text-sm font-medium">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-3">Existing Fee Structures</h3>
      <table className="w-full border-collapse bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3 border">Grade</th>
            <th className="p-3 border">Term</th>
            <th className="p-3 border">Total Fees</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeStructures.map((fee) => (
            <tr key={fee.id} className="hover:bg-gray-50">
              <td className="p-3 border">{fee.grade}</td>
              <td className="p-3 border">{fee.term}</td>
              <td className="p-3 border">{fee.total_fees} KES</td>
              <td className="p-3 border">
                <button
                  onClick={() => handleEdit(fee)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {feeStructures.length === 0 && (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-500">
                No fee structures yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructurePage;
