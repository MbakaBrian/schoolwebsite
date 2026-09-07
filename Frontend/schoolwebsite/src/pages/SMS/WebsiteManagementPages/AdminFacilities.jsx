import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

/* ---------------------------------------------------------
   PROGRAM MANAGER MODAL
--------------------------------------------------------- */
function ProgramManagerModal({ facility, onClose, token }) {
    const [programs, setPrograms] = useState([]);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        desc: "",
        icon_name: "",
        color_class: "",
    });

    const fetchPrograms = async () => {
        const res = await axiosInstance.get(`/facilities/${facility.slug}/`);
        setPrograms(res.data.programs || []);
    };

    useEffect(() => {
        fetchPrograms();
    }, [facility]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitProgram = async (e) => {
        e.preventDefault();

        const url = editingProgram
            ? `/programs/${editingProgram.id}/`
            : "/programs/";

        const method = editingProgram ? "patch" : "post";

        await axiosInstance[method](
            url,
            { ...formData, facility: facility.id },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setFormData({
            name: "",
            desc: "",
            icon_name: "",
            color_class: "",
        });
        setEditingProgram(null);
        fetchPrograms();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold">
                        Programs – {facility.title}
                    </h3>
                    <button onClick={onClose} className="text-2xl">
                        &times;
                    </button>
                </div>

                <form
                    onSubmit={submitProgram}
                    className="grid grid-cols-2 gap-3 mb-6"
                >
                    <input
                        name="name"
                        placeholder="Program name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border p-2"
                        required
                    />
                    <input
                        name="icon_name"
                        placeholder="Icon name"
                        value={formData.icon_name}
                        onChange={handleChange}
                        className="border p-2"
                        required
                    />
                    <input
                        name="color_class"
                        placeholder="Color class"
                        value={formData.color_class}
                        onChange={handleChange}
                        className="border p-2"
                        required
                    />
                    <textarea
                        name="desc"
                        placeholder="Description"
                        value={formData.desc}
                        onChange={handleChange}
                        className="border p-2 col-span-2"
                        required
                    />
                    <button className="bg-green-600 text-white px-4 py-2 rounded col-span-2">
                        {editingProgram ? "Update Program" : "Add Program"}
                    </button>
                </form>

                {programs.map((p) => (
                    <div key={p.id} className="border p-3 rounded mb-2">
                        <strong>{p.name}</strong>
                        <p className="text-sm">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------------------------------------------------------
   MAIN ADMIN FACILITIES PAGE
--------------------------------------------------------- */
function AdminFacilities() {
    const [facilities, setFacilities] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        shortDesc: "",
        longDesc: "",
        image: null,
        category: "",
        customCategory: "",
    });

    const [editingFacility, setEditingFacility] = useState(null);
    const [programModalFacility, setProgramModalFacility] = useState(null);

    const token = JSON.parse(localStorage.getItem("authData"))?.access;
    const baseURL = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

    /* ---------------------------------------------------------
       FETCH DATA
    --------------------------------------------------------- */
    const fetchFacilities = async () => {
        const res = await axiosInstance.get("/facilities/");
        setFacilities(res.data);

        // derive categories from facilities
        const unique = [
            ...new Set(
                res.data
                    .map((f) => f.category?.trim())
                    .filter(Boolean)
            ),
        ];
        setCategories(unique);
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    /* ---------------------------------------------------------
       FORM HANDLERS
    --------------------------------------------------------- */
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    /* ---------------------------------------------------------
       SAVE / UPDATE FACILITY
    --------------------------------------------------------- */
    const saveFacility = async (e) => {
        e.preventDefault();

        const finalCategory =
            formData.customCategory.trim() || formData.category;

        const form = new FormData();
        form.append("title", formData.title);
        form.append("shortDesc", formData.shortDesc);
        form.append("longDesc", formData.longDesc);
        form.append("category", finalCategory);

        if (formData.image) form.append("image", formData.image);

        const url = editingFacility
            ? `/facilities/${editingFacility.slug}/`
            : "/facilities/";

        const method = editingFacility ? "patch" : "post";

        await axiosInstance[method](url, form, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setEditingFacility(null);
        setFormData({
            title: "",
            shortDesc: "",
            longDesc: "",
            image: null,
            category: "",
            customCategory: "",
        });

        fetchFacilities();
    };

    const startEdit = (f) => {
        setEditingFacility(f);
        setFormData({
            title: f.title,
            shortDesc: f.shortDesc,
            longDesc: f.longDesc,
            image: null,
            category: f.category || "",
            customCategory: "",
        });
        window.scrollTo(0, 0);
    };

    const deleteFacility = async (f) => {
        if (!window.confirm("Delete this facility?")) return;
        await axiosInstance.delete(`/facilities/${f.slug}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchFacilities();
    };

    /* ---------------------------------------------------------
       UI
    --------------------------------------------------------- */
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Manage Facilities</h2>

            {/* ------------------ FACILITY FORM ------------------ */}
            <form
                onSubmit={saveFacility}
                className="bg-white shadow-md p-6 rounded-lg mb-8"
            >
                <h3 className="text-xl font-semibold mb-4">
                    {editingFacility ? "Edit Facility" : "Add New Facility"}
                </h3>

                <input
                    name="title"
                    placeholder="Facility title"
                    value={formData.title}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3"
                    required
                />

                {/* CATEGORY PICK OR TYPE */}
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2"
                >
                    <option value="">Select existing category</option>
                    {categories.map((c, i) => (
                        <option key={i} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                <input
                    name="customCategory"
                    placeholder="Or type a new category"
                    value={formData.customCategory}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3"
                />

                <textarea
                    name="shortDesc"
                    placeholder="Short description"
                    value={formData.shortDesc}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3"
                />

                <textarea
                    name="longDesc"
                    placeholder="Full description"
                    value={formData.longDesc}
                    onChange={handleChange}
                    className="border p-2 w-full mb-3"
                    required
                />

                <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="mb-3"
                    required={!editingFacility}
                />

                <button className="bg-blue-600 text-white px-6 py-2 rounded">
                    {editingFacility ? "Update Facility" : "Add Facility"}
                </button>
            </form>

            {/* ------------------ FACILITIES BY CATEGORY ------------------ */}
            {categories.map((cat) => (
                <div key={cat} className="mb-8">
                    <h3 className="text-lg font-bold text-blue-700 mb-3">
                        {cat}
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {facilities
                            .filter((f) => f.category === cat)
                            .map((f) => (
                                <div
                                    key={f.slug}
                                    className="bg-gray-50 p-4 rounded shadow"
                                >
                                    <img
                                        src={
                                            f.absolute_image_url ||
                                            `${baseURL}${f.image}`
                                        }
                                        className="h-40 w-full object-cover rounded mb-2"
                                    />

                                    <h4 className="font-bold">{f.title}</h4>
                                    <p className="text-sm mt-1">
                                        {f.shortDesc}
                                    </p>

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => startEdit(f)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteFacility(f)}
                                            className="bg-red-600 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() =>
                                                setProgramModalFacility(f)
                                            }
                                            className="bg-green-600 text-white px-3 py-1 rounded ml-auto"
                                        >
                                            Programs
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

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
