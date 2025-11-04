import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

// --- PROGRAM MANAGER MODAL (Unchanged) ---
function ProgramManagerModal({ facility, onClose, token }) {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [editingProgram, setEditingProgram] = useState(null); 
    const [programFormData, setProgramFormData] = useState({
        name: "",
        desc: "",
        icon_name: "",
        color_class: "",
    });

    const fetchPrograms = async () => {
        setLoading(true);
        try {
        const res = await axiosInstance.get(`/facilities/${facility.slug}/`);
        setPrograms(res.data.programs || []); 
        } catch (err) {
        console.error("Error fetching programs:", err);
        setMessage("❌ Could not load programs.");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facility]); 

    const handleProgramChange = (e) => {
        const { name, value } = e.target;
        setProgramFormData((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const cancelEdit = () => {
        setEditingProgram(null);
        setProgramFormData({ name: "", desc: "", icon_name: "", color_class: "" });
    };

    const handleProgramDelete = async (programId) => {
        if (!window.confirm("Are you sure you want to delete this program?")) return;

        try {
        await axiosInstance.delete(`/programs/${programId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✅ Program deleted.");
        fetchPrograms(); 
        } catch (err) {
        console.error("Error deleting program:", err);
        setMessage("❌ Failed to delete program.");
        }
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const data = {
        ...programFormData,
        facility: facility.id, 
        };

        const isUpdating = !!editingProgram;
        const url = isUpdating ? `/programs/${editingProgram.id}/` : "/programs/";
        const method = isUpdating ? "patch" : "post";

        try {
        await axiosInstance[method](url, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(isUpdating ? "✅ Program updated!" : "✅ Program added!");
        cancelEdit();
        fetchPrograms(); 
        } catch (err) {
        console.error("Error saving program:", err);
        setMessage("❌ Failed to save program.");
        }
    };

    const handleProgramEditClick = (program) => {
        setEditingProgram(program);
        setProgramFormData({
        name: program.name,
        desc: program.desc,
        icon_name: program.icon_name,
        color_class: program.color_class,
        });
    };

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        {/* Modal Content */}
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
                Manage Programs for: {facility.title}
            </h3>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 text-2xl"
            >
                &times;
            </button>
            </div>

            {message && <p className="text-sm mb-4">{message}</p>}

            {/* Modal Body (Scrollable) */}
            <div className="flex-grow overflow-y-auto pr-2">
            {/* Program Form (for Create/Update) */}
            <form
                onSubmit={handleProgramSubmit}
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <h4 className="text-lg font-semibold col-span-full">
                {editingProgram ? "Edit Program" : "Add New Program"}
                </h4>
                <input
                type="text"
                name="name"
                placeholder="Program Name (e.g., Toddler)"
                value={programFormData.name}
                onChange={handleProgramChange}
                className="border p-2 rounded w-full"
                required
                />
                <input
                type="text"
                name="icon_name"
                placeholder="Lucide Icon Name (e.g., Baby)"
                value={programFormData.icon_name}
                onChange={handleProgramChange}
                className="border p-2 rounded w-full"
                required
                />
                <textarea
                name="desc"
                placeholder="Short Description"
                value={programFormData.shortDesc}
                onChange={handleProgramChange}
                className="border p-2 rounded w-full col-span-full"
                rows="2"
                required
                />
                <input
                type="text"
                name="color_class"
                placeholder="Tailwind Color (e.g., bg-green-400)"
                value={programFormData.color_class}
                onChange={handleProgramChange}
                className="border p-2 rounded w-full"
                required
                />
                <div className="flex items-center gap-2">
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {editingProgram ? "Update Program" : "Add Program"}
                </button>
                {editingProgram && (
                    <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-gray-600 hover:text-black"
                    >
                    Cancel
                    </button>
                )}
                </div>
            </form>

            {/* List of Existing Programs */}
            <h4 className="text-lg font-semibold mb-2">Existing Programs</h4>
            {loading ? (
                <p>Loading programs...</p>
            ) : (
                <div className="space-y-3">
                {programs.length === 0 && <p>No programs found.</p>}
                {programs.map((prog) => (
                    <div
                    key={prog.id}
                    className="flex justify-between items-center bg-white p-3 rounded shadow border"
                    >
                    <div>
                        <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${prog.color_class}`}
                        ></span>
                        <strong className="mr-2">{prog.name}</strong>
                        <span className="text-sm text-gray-500 mr-2">
                        ({prog.icon_name})
                        </span>
                        <p className="text-sm text-gray-700">{prog.desc}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                        onClick={() => handleProgramEditClick(prog)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => handleProgramDelete(prog.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        >
                        Delete
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        </div>
    );
}

// --- MAIN ADMIN FACILITIES COMPONENT ---
function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "", 
    longDesc: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [editingFacility, setEditingFacility] = useState(null);
  const [programModalFacility, setProgramModalFacility] = useState(null);

  const token = JSON.parse(localStorage.getItem("authData"))?.access;
  const baseURL = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

  const fetchFacilities = async () => {
    try {
      const res = await axiosInstance.get("/facilities/");
      setFacilities(res.data);
    } catch (err) {
      console.error("Error fetching facilities:", err);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    setFormData({ title: "", shortDesc: "", longDesc: "", image: null }); 
    document.querySelector('input[name="image"]').value = "";
  };

const handleSubmit = async (e) => {
 e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    form.append("title", formData.title);
    form.append("shortDesc", formData.shortDesc); 
    form.append("longDesc", formData.longDesc);
    
    if (formData.image) {
      form.append("image", formData.image);
    }

    const isUpdating = !!editingFacility;
    const url = isUpdating
      ? `/facilities/${editingFacility.slug}/`
      : "/facilities/";
    const method = isUpdating ? "patch" : "post";

    // ✅ NEW: Guard clause to ensure the token is available
    if (!token) {
        console.error("Authorization Token Missing.");
        setMessage("❌ Authentication required to upload files. Please log in.");
        setLoading(false);
        return;
    }

    try {
      await axiosInstance[method](url, form, {
        headers: {
          // Setting Content-Type is generally optional for FormData as the browser handles it,
          // but keeping it is harmless. The key is the Authorization header.
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // <-- This is the CRITICAL line for file uploads
        },
      });
      setMessage(
        isUpdating
          ? "✅ Facility updated successfully!"
          : "✅ Facility added successfully!"
      );
      handleCancelEdit(); 
      fetchFacilities(); 
    } catch (err) {
      console.error("Error saving facility:", err.response?.data || err); // Log the full error
      setMessage(
        isUpdating
          ? "❌ Failed to update facility."
          : "❌ Failed to add facility. (Check backend permissions/CORS)"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (facility) => {
    setEditingFacility(facility);
    setFormData({
      title: facility.title,
      shortDesc: facility.shortDesc, 
      longDesc: facility.longDesc,
      image: null, 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (facility) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${facility.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/facilities/${facility.slug}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Facility deleted.");
      fetchFacilities(); 
    } catch (err) {
      console.error("Error deleting facility:", err);
      setMessage("❌ Failed to delete facility.");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Facilities</h2>

      {/* Facility Form (Create/Update) */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg mb-8"
      >
        <h3 className="text-xl font-semibold mb-4">
          {editingFacility ? "Edit Facility" : "Add New Facility"}
        </h3>

        <input
          type="text"
          name="title"
          placeholder="Facility Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
          required
        />
        
        <textarea
          name="shortDesc"
          placeholder="Short Description (for list previews)"
          value={formData.shortDesc}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
          rows="2"
        />

        <textarea
          name="longDesc"
          placeholder="Full Facility Description"
          value={formData.longDesc}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
          rows="4"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-2">
          {editingFacility
            ? "Upload new image (optional)"
            : "Facility Image"}
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="mb-4"
          required={!editingFacility}
        />

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingFacility
              ? "Update Facility"
              : "Add Facility"}
          </button>

          {editingFacility && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-600 hover:text-black"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>

      {/* Facilities List */}
      <h3 className="text-xl font-semibold mb-4">Existing Facilities</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col"
          >
            {/* 🐛 FIXED: Check f.image for null before calling startsWith */}
            <img
                src={
                    f.image 
                        ? (f.image.startsWith("http") ? f.image : `${baseURL}${f.image}`)
                        : "/images/placeholder.jpg" // <-- CHANGE THIS to your default image path!
                }
                alt={f.title}
                className="w-full h-48 object-cover rounded mb-3"
            />
            
            <h3 className="text-lg font-semibold">{f.title}</h3>
            
            <p className="text-gray-600 text-sm mt-2 text-justify flex-grow">
              {f.shortDesc && f.shortDesc.length > 100
                ? `${f.shortDesc.substring(0, 100)}...`
                : f.shortDesc || (<em>No short description</em>)}
            </p>
            
            <p className="text-xs text-gray-400 mt-2">Slug: {f.slug}</p>

            <div className="flex gap-2 mt-4 border-t pt-3">
              <button
                onClick={() => handleEditClick(f)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(f)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setProgramModalFacility(f)} 
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 ml-auto"
              >
                Programs
              </button>
            </div>
          </div>
        ))}
      </div>

      {programModalFacility && (
        <ProgramManagerModal
          facility={programModalFacility}
          onClose={() => setProgramModalFacility(null)}
          token={token}
        />
      )}
    </div>
  );
}

export default AdminFacilities;