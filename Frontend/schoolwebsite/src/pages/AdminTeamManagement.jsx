import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function AdminTeamManagement() {
  // 1. Renamed state to match 'team'
  const [teamMembers, setTeamMembers] = useState([]);
  
  // 2. Updated formData to match TeamMember model
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    image: null,
  });
  
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false); // Added for form submission state
  const [message, setMessage] = useState(""); // Added for user feedback

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // 3. Renamed fetch function and updated endpoint
  const fetchTeamMembers = () => {
    axiosInstance
      .get("/team/")
      .then((res) => setTeamMembers(res.data))
      .catch((err) => console.error("Error fetching team members:", err));
  };

  // 4. handleChange remains the same, it's generic
  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // 5. handleSubmit updated for TeamMember fields and endpoint
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Get the token for authorization
    const token = JSON.parse(localStorage.getItem("authData"))?.access;
    if (!token) {
        setMessage("❌ Authentication error. Please log in again.");
        setLoading(false);
        return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    data.append("description", formData.description);
    if (formData.image) data.append("image", formData.image);

    const isUpdating = !!editingId;
    // Use PATCH for updates (safer for FormData)
    const method = isUpdating ? "patch" : "post";
    const url = isUpdating ? `/team/${editingId}/` : "/team/"; 

    axiosInstance[method](url, data, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}` // <-- CRITICAL: For file upload
      },
    })
    .then(() => {
      setMessage(isUpdating ? "✅ Team member updated!" : "✅ Team member added!");
      fetchTeamMembers();
      resetForm();
    })
    .catch((err) => {
      console.error("Error saving team member:", err.response?.data || err);
      setMessage("❌ Failed to save team member.");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // 6. handleEdit updated to populate all TeamMember fields
  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      description: member.description,
      image: null, // Don’t auto-set image
    });
    setEditingId(member.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 7. handleDelete updated for /team/ endpoint
  const handleDelete = (id) => {
    if (window.confirm("Delete this team member?")) {
      const token = JSON.parse(localStorage.getItem("authData"))?.access;
      axiosInstance
        .delete(`/team/${id}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(() => fetchTeamMembers())
        .catch((err) => console.error("Error deleting team member:", err));
    }
  };

  // 8. resetForm updated to clear all TeamMember fields
  const resetForm = () => {
    setFormData({ name: "", role: "", description: "", image: null });
    setEditingId(null);
    // Clear file input visually
    const fileInput = document.querySelector('input[name="image"]');
    if (fileInput) fileInput.value = '';
  };
  
  // 9. getImageUrl helper remains the same
  const baseURL = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg"; // Use your placeholder path
    if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
      return imagePath;
    }
    return `${baseURL}${imagePath}`;
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Admin Panel - Team Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 p-4 border rounded shadow-md bg-gray-50"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Team Member" : "Add New Member"}
        </h2>
        
        {/* 10. Form fields updated for TeamMember */}
        <input
          type="text"
          name="name"
          placeholder="Member Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="role"
          placeholder="Member Role (e.g., Head Teacher)"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Short Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
          required={!editingId} // required only for new uploads
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Saving..." : editingId ? "Update Member" : "Add Member"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </form>

      {/* Team List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 11. List rendering updated for TeamMember */}
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 border rounded shadow bg-white flex flex-col items-center text-center"
          >
            <img
              // 12. Use absolute_image_url from your serializer fix
              src={getImageUrl(member.absolute_image_url || member.image)} 
              alt={member.name}
              className="w-32 h-32 object-cover rounded-full mb-4 shadow-lg"
            />
            <h2 className="text-lg font-bold">{member.name}</h2>
            <p className="text-sm text-purple-700 font-medium">{member.role}</p>
            <p className="text-sm text-gray-600 mt-2">{member.description}</p>
            <div className="flex space-x-2 mt-4 pt-2 border-t w-full justify-center">
              <button
                onClick={() => handleEdit(member)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}