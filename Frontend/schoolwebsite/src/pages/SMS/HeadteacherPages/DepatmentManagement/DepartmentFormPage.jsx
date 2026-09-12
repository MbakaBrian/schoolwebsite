import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Loader2,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";


const DepartmentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [subdepartments, setSubdepartments] = useState([]);

    const [newSubdepartment, setNewSubdepartment] = useState({
        name: "",
        code: "",
        is_active: true,
    });

    // ---------------------------------------------------------
    // Generate code
    // ---------------------------------------------------------
    const generateCode = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    // ---------------------------------------------------------
    // Load department when editing
    // ---------------------------------------------------------
    useEffect(() => {
        if (!isEditMode) return;

        const fetchDepartment = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(
                    `/receipts/departments/${id}/`
                );

                const department = response.data;

                setName(department.name || "");
                setCode(department.code || "");
                setIsActive(department.is_active ?? true);

                setSubdepartments(
                    department.subdepartments || []
                );
            } catch (err) {
                console.error(
                    "Failed to load department:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        "Failed to load department."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDepartment();
    }, [id, isEditMode]);

    // ---------------------------------------------------------
    // Name change
    // ---------------------------------------------------------
    const handleNameChange = (e) => {
        const value = e.target.value;

        setName(value);

        // Only automatically generate code when creating.
        if (!isEditMode) {
            setCode(generateCode(value));
        }
    };

    // ---------------------------------------------------------
    // New subdepartment name
    // ---------------------------------------------------------
    const handleSubdepartmentNameChange = (e) => {
        const value = e.target.value;

        setNewSubdepartment((prev) => ({
            ...prev,
            name: value,
            code: generateCode(value),
        }));
    };

    // ---------------------------------------------------------
    // Add subdepartment to local list
    // ---------------------------------------------------------
    const addSubdepartment = () => {
        const subName = newSubdepartment.name.trim();

        if (!subName) {
            alert("Please enter a subdepartment name.");
            return;
        }

        const generatedCode =
            newSubdepartment.code || generateCode(subName);

        const duplicate = subdepartments.some(
            (sub) =>
                sub.name.toLowerCase() ===
                subName.toLowerCase()
        );

        if (duplicate) {
            alert(
                "A subdepartment with this name already exists."
            );
            return;
        }

        setSubdepartments((prev) => [
            ...prev,
            {
                ...newSubdepartment,
                name: subName,
                code: generatedCode,
                localOnly: true,
                tempId: Date.now(),
            },
        ]);

        setNewSubdepartment({
            name: "",
            code: "",
            is_active: true,
        });
    };

    // ---------------------------------------------------------
    // Remove local subdepartment
    // ---------------------------------------------------------
    const removeSubdepartment = async (subdepartment) => {
        // Existing database subdepartment
        if (subdepartment.id && !subdepartment.localOnly) {
            const confirmed = window.confirm(
                `Delete "${subdepartment.name}"?`
            );

            if (!confirmed) return;

            try {
                await axiosInstance.delete(
                    `/receipts/subdepartments/${subdepartment.id}/`
                );

                setSubdepartments((prev) =>
                    prev.filter(
                        (item) =>
                            item.id !== subdepartment.id
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to delete subdepartment:",
                    err
                );

                alert(
                    err.response?.data?.detail ||
                        "Unable to delete this subdepartment."
                );
            }

            return;
        }

        // Local unsaved subdepartment
        setSubdepartments((prev) =>
            prev.filter(
                (item) =>
                    item.tempId !== subdepartment.tempId
            )
        );
    };

    // ---------------------------------------------------------
    // Save department
    // ---------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Department name is required.");
            return;
        }

        if (!code.trim()) {
            setError("Department code is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            let departmentId = id;

            const departmentPayload = {
                name: name.trim(),
                code: code.trim(),
                is_active: isActive,
            };

            // -------------------------------------------------
            // Create
            // -------------------------------------------------
            if (!isEditMode) {
                const response = await axiosInstance.post(
                    "/receipts/departments/",
                    departmentPayload
                );

                departmentId = response.data.id;
            }

            // -------------------------------------------------
            // Update
            // -------------------------------------------------
            else {
                await axiosInstance.patch(
                    `/receipts/departments/${id}/`,
                    departmentPayload
                );
            }

            // -------------------------------------------------
            // Create newly-added subdepartments
            // -------------------------------------------------
            const unsavedSubdepartments =
                subdepartments.filter(
                    (subdepartment) =>
                        subdepartment.localOnly
                );

            for (const subdepartment of unsavedSubdepartments) {
                await axiosInstance.post(
                    "/receipts/subdepartments/",
                    {
                        name: subdepartment.name,
                        code: subdepartment.code,
                        department: departmentId,
                        is_active:
                            subdepartment.is_active,
                    }
                );
            }

            navigate("/departments");
        } catch (err) {
            console.error(
                "Failed to save department:",
                err
            );

            const data = err.response?.data;

            if (typeof data === "object") {
                const firstError = Object.values(data)
                    .flat()
                    .find(Boolean);

                setError(
                    firstError ||
                        "Failed to save department."
                );
            } else {
                setError(
                    "Failed to save department. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-green-700" />

                            <p className="text-sm text-gray-500">
                                Loading department...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="mb-6">
                    <Link
                        to="/departments"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Departments
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                            <Building2 className="h-6 w-6 text-green-700" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {isEditMode
                                    ? "Edit Department"
                                    : "Create Department"}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {isEditMode
                                    ? "Update department details and manage its subdepartments."
                                    : "Create a department and add its subdepartments."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    ERROR
                ====================================================== */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* =================================================
                        DEPARTMENT DETAILS
                    ================================================== */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="font-semibold text-gray-800">
                                Department Details
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Basic information about the department.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">

                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Department Name
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Catering/Dining"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    required
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Department Code
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value)
                                    }
                                    placeholder="e.g. catering-dining"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    required
                                />

                                <p className="mt-1.5 text-xs text-gray-400">
                                    Used internally by the system.
                                </p>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) =>
                                            setIsActive(
                                                e.target.checked
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Active Department
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Active departments can be
                                            selected when recording
                                            receipts and inventory.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        SUBDEPARTMENTS
                    ================================================== */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-200 px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Subdepartments
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Add areas belonging to this
                                        department.
                                    </p>
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                    <LayersIcon />
                                </div>
                            </div>
                        </div>

                        <div className="p-5">

                            {/* Add subdepartment */}
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">

                                <div className="mb-3 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-700" />

                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Add Subdepartment
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">

                                    <input
                                        type="text"
                                        value={
                                            newSubdepartment.name
                                        }
                                        onChange={
                                            handleSubdepartmentNameChange
                                        }
                                        placeholder="Subdepartment name"
                                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            newSubdepartment.code
                                        }
                                        onChange={(e) =>
                                            setNewSubdepartment(
                                                (prev) => ({
                                                    ...prev,
                                                    code: e.target.value,
                                                })
                                            )
                                        }
                                        placeholder="Code"
                                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addSubdepartment
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Existing subdepartments */}
                            {subdepartments.length > 0 && (
                                <div className="mt-5 space-y-2">

                                    {subdepartments.map(
                                        (subdepartment) => (
                                            <div
                                                key={
                                                    subdepartment.id ||
                                                    subdepartment.tempId
                                                }
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {
                                                                subdepartment.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            Code:{" "}
                                                            {
                                                                subdepartment.code
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSubdepartment(
                                                            subdepartment
                                                        )
                                                    }
                                                    className="ml-3 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            {subdepartments.length === 0 && (
                                <div className="mt-5 rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                                    <p className="text-sm text-gray-400">
                                        No subdepartments added yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            to="/departments"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {isEditMode
                                        ? "Save Changes"
                                        : "Create Department"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Small local icon component so the page doesn't need
// another import just for this one visual.
const LayersIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5 text-green-700"
    >
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
    </svg>
);

export default DepartmentFormPage;