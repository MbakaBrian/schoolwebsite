import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    UserRound,
    Phone,
    Mail,
    BriefcaseBusiness,
    MapPin,
    Users,
    AlertCircle,
    Loader2,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";

export default function ParentFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);

    const [families, setFamilies] = useState([]);

    const [formData, setFormData] = useState({
        family: searchParams.get("family") || "",
        first_name: "",
        middle_name: "",
        last_name: "",
        national_id_number: "",
        gender: "not_specified",
        mobile_number: "",
        alternative_mobile: "",
        email: "",
        occupation: "",
        employer: "",
        address: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // FETCH FAMILIES
    // --------------------------------------------------
    const fetchFamilies = async () => {
        try {
            const response = await axiosInstance.get("/students/families/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setFamilies(data);
        } catch (err) {
            console.error("Failed to load families:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load family records."
            );
        }
    };

    // --------------------------------------------------
    // FETCH PARENT WHEN EDITING
    // --------------------------------------------------
    const fetchParent = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                `/students/parents/${id}/`
            );

            const parent = response.data;

            setFormData({
                family: parent.family ? String(parent.family) : "",
                first_name: parent.first_name || "",
                middle_name: parent.middle_name || "",
                last_name: parent.last_name || "",
                national_id_number:
                    parent.national_id_number || "",
                gender: parent.gender || "not_specified",
                mobile_number: parent.mobile_number || "",
                alternative_mobile:
                    parent.alternative_mobile || "",
                email: parent.email || "",
                occupation: parent.occupation || "",
                employer: parent.employer || "",
                address: parent.address || "",
                is_active:
                    parent.is_active !== undefined
                        ? parent.is_active
                        : true,
            });
        } catch (err) {
            console.error("Failed to load parent:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load parent information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();

        if (isEditMode) {
            fetchParent();
        } else {
            setLoading(false);
        }
    }, [id, isEditMode]);

    // --------------------------------------------------
    // HANDLE INPUT
    // --------------------------------------------------
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------
    const validateForm = () => {
        if (!formData.first_name.trim()) {
            setError("First name is required.");
            return false;
        }

        if (!formData.last_name.trim()) {
            setError("Last name is required.");
            return false;
        }

        if (!formData.mobile_number.trim()) {
            setError("Mobile number is required.");
            return false;
        }

        if (
            formData.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            setError("Please enter a valid email address.");
            return false;
        }

        return true;
    };

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                family: formData.family
                    ? Number(formData.family)
                    : null,

                first_name: formData.first_name.trim(),
                middle_name: formData.middle_name.trim(),
                last_name: formData.last_name.trim(),

                national_id_number:
                    formData.national_id_number.trim(),

                gender: formData.gender,

                mobile_number:
                    formData.mobile_number.trim(),

                alternative_mobile:
                    formData.alternative_mobile.trim(),

                email: formData.email.trim(),

                occupation:
                    formData.occupation.trim(),

                employer:
                    formData.employer.trim(),

                address:
                    formData.address.trim(),

                is_active: formData.is_active,
            };

            let response;

            if (isEditMode) {
                response = await axiosInstance.put(
                    `/students/parents/${id}/`,
                    payload
                );
            } else {
                response = await axiosInstance.post(
                    "/students/parents/",
                    payload
                );
            }

            const savedParent = response.data;

            navigate(
                `/sms/parents/${savedParent.id || id}`
            );
        } catch (err) {
            console.error("Failed to save parent:", err);

            const data = err.response?.data;

            if (data && typeof data === "object") {
                const messages = Object.entries(data)
                    .map(([field, message]) => {
                        const readableField = field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (letter) =>
                                letter.toUpperCase()
                            );

                        const readableMessage =
                            Array.isArray(message)
                                ? message.join(" ")
                                : String(message);

                        return `${readableField}: ${readableMessage}`;
                    })
                    .join(" ");

                setError(
                    messages ||
                        "Failed to save parent/guardian."
                );
            } else {
                setError(
                    "Failed to save parent/guardian. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="flex items-center gap-3 text-purple-800">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium">
                        Loading parent information...
                    </span>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // PAGE
    // --------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100">
            {/* HEADER */}
            <div className="bg-purple-800 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to={
                                isEditMode
                                    ? `/sms/parents/${id}`
                                    : "/sms/parents"
                            }
                            className="p-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="p-2.5 bg-purple-700 rounded-xl">
                            <UserRound className="w-6 h-6" />
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                {isEditMode
                                    ? "Edit Parent / Guardian"
                                    : "Add Parent / Guardian"}
                            </h1>

                            <p className="text-purple-200 mt-1">
                                {isEditMode
                                    ? "Update parent or guardian information."
                                    : "Create a parent or guardian record."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Unable to save parent
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* PERSONAL INFORMATION */}
                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-800 text-white px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <UserRound className="w-5 h-5" />

                                        <div>
                                            <h2 className="font-semibold">
                                                Personal Information
                                            </h2>

                                            <p className="text-gray-300 text-sm">
                                                Parent or guardian identification
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* NAMES */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormInput
                                            label="First Name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="First name"
                                        />

                                        <FormInput
                                            label="Middle Name"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleChange}
                                            placeholder="Middle name"
                                        />

                                        <FormInput
                                            label="Last Name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Last name"
                                        />
                                    </div>

                                    {/* ID + GENDER */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput
                                            label="National ID Number"
                                            name="national_id_number"
                                            value={
                                                formData.national_id_number
                                            }
                                            onChange={handleChange}
                                            placeholder="National ID number"
                                        />

                                        <div>
                                            <label
                                                htmlFor="gender"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Gender
                                            </label>

                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="not_specified">
                                                    Not Specified
                                                </option>

                                                <option value="male">
                                                    Male
                                                </option>

                                                <option value="female">
                                                    Female
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAMILY */}
                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-800 text-white px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5" />

                                        <div>
                                            <h2 className="font-semibold">
                                                Family
                                            </h2>

                                            <p className="text-gray-300 text-sm">
                                                Connect this parent to a household
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <label
                                        htmlFor="family"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Family
                                    </label>

                                    <select
                                        id="family"
                                        name="family"
                                        value={formData.family}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    >
                                        <option value="">
                                            No family assigned
                                        </option>

                                        {families
                                            .filter(
                                                (family) =>
                                                    family.is_active ||
                                                    String(family.id) ===
                                                        String(
                                                            formData.family
                                                        )
                                            )
                                            .map((family) => (
                                                <option
                                                    key={family.id}
                                                    value={family.id}
                                                >
                                                    {family.family_name} —{" "}
                                                    {family.family_id}
                                                </option>
                                            ))}
                                    </select>

                                    <p className="text-xs text-gray-500 mt-2">
                                        A parent can be linked to a family
                                        household. You can also assign one
                                        later.
                                    </p>
                                </div>
                            </section>

                            {/* CONTACT */}
                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-800 text-white px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5" />

                                        <div>
                                            <h2 className="font-semibold">
                                                Contact Information
                                            </h2>

                                            <p className="text-gray-300 text-sm">
                                                Phone and email details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput
                                            label="Mobile Number"
                                            name="mobile_number"
                                            type="tel"
                                            value={
                                                formData.mobile_number
                                            }
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. 0712345678"
                                        />

                                        <FormInput
                                            label="Alternative Mobile"
                                            name="alternative_mobile"
                                            type="tel"
                                            value={
                                                formData.alternative_mobile
                                            }
                                            onChange={handleChange}
                                            placeholder="Alternative number"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Email Address
                                        </label>

                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="parent@example.com"
                                                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="address"
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Parent's Address
                                        </label>

                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />

                                            <textarea
                                                id="address"
                                                name="address"
                                                rows="3"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Enter parent/guardian address"
                                                className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 py-3 text-gray-800 outline-none resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* EMPLOYMENT */}
                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-800 text-white px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BriefcaseBusiness className="w-5 h-5" />

                                        <div>
                                            <h2 className="font-semibold">
                                                Employment Information
                                            </h2>

                                            <p className="text-gray-300 text-sm">
                                                Occupation and employer details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput
                                            label="Occupation"
                                            name="occupation"
                                            value={
                                                formData.occupation
                                            }
                                            onChange={handleChange}
                                            placeholder="e.g. Accountant"
                                        />

                                        <FormInput
                                            label="Employer / Company"
                                            name="employer"
                                            value={
                                                formData.employer
                                            }
                                            onChange={handleChange}
                                            placeholder="Company or employer"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-6">
                            {/* STATUS */}
                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-purple-800 text-white px-6 py-4">
                                    <h2 className="font-semibold">
                                        Record Status
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={
                                                formData.is_active
                                            }
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 accent-purple-700"
                                        />

                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                Active Parent / Guardian
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Active records can be linked
                                                to students and used for
                                                communications.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            {/* RECORD INFORMATION */}
                            <section className="bg-gray-200 rounded-2xl border border-gray-300 p-5">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-purple-800 mt-0.5 flex-shrink-0" />

                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            Parent Records
                                        </h3>

                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            Each parent or guardian receives
                                            a unique Parent ID automatically.
                                        </p>

                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            Example:
                                            <span className="font-semibold text-purple-800 ml-1">
                                                PAR-00001
                                            </span>
                                        </p>

                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            Students are connected to parents
                                            through the student-parent
                                            relationship rather than storing
                                            parent information directly on the
                                            student.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* ACTIONS */}
                            <section className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 disabled:bg-purple-400 text-white font-semibold px-5 py-3 rounded-xl transition"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />

                                            {isEditMode
                                                ? "Save Changes"
                                                : "Create Parent"}
                                        </>
                                    )}
                                </button>

                                <Link
                                    to={
                                        isEditMode
                                            ? `/sms/parents/${id}`
                                            : "/sms/parents"
                                    }
                                    className="w-full mt-3 flex items-center justify-center px-5 py-3 rounded-xl border border-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                                >
                                    Cancel
                                </Link>
                            </section>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

// --------------------------------------------------
// REUSABLE INPUT
// --------------------------------------------------
function FormInput({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700 mb-2"
            >
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
        </div>
    );
}

