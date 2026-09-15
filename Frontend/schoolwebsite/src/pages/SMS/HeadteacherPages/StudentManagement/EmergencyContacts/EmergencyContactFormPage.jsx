import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    ShieldAlert,
    UserRound,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
} from "lucide-react";
import axiosInstance from "../../../../../utils/axiosInstance";

const getResults = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
};

const getStudentName = (student) => {
    if (!student) return "Unknown Student";

    if (student.full_name) {
        return student.full_name;
    }

    return [
        student.first_name,
        student.middle_name,
        student.last_name,
    ]
        .filter(Boolean)
        .join(" ");
};

const initialForm = {
    student: "",
    full_name: "",
    relationship: "",
    mobile_number: "",
    alternative_mobile: "",
    email: "",
    address: "",
    priority: "1",
    is_active: true,
};

const relationshipOptions = [
    { value: "mother", label: "Mother" },
    { value: "father", label: "Father" },
    { value: "guardian", label: "Guardian" },
    { value: "grandparent", label: "Grandparent" },
    { value: "sibling", label: "Sibling" },
    { value: "aunt", label: "Aunt" },
    { value: "uncle", label: "Uncle" },
    { value: "other", label: "Other" },
];

const getBackendError = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return "Something went wrong. Please try again.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.detail) {
        return data.detail;
    }

    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
            messages.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
            messages.push(`${field}: ${value}`);
        }
    });

    return messages.length
        ? messages.join(" | ")
        : "Unable to save emergency contact.";
};

const EmergencyContactFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState(initialForm);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // LOAD DATA
    // --------------------------------------------------

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const studentsResponse = await axiosInstance.get(
                    "/students/students/"
                );

                const studentsData = getResults(studentsResponse);

                setStudents(studentsData);

                // --------------------------------------------------
                // EDIT MODE
                // --------------------------------------------------

                if (isEditMode) {
                    const contactResponse =
                        await axiosInstance.get(
                            `/students/emergency-contacts/${id}/`
                        );

                    const contact = contactResponse.data;

                    setFormData({
                        student: contact.student ?? "",
                        full_name: contact.full_name ?? "",
                        relationship: contact.relationship ?? "",
                        mobile_number:
                            contact.mobile_number ?? "",
                        alternative_mobile:
                            contact.alternative_mobile ?? "",
                        email: contact.email ?? "",
                        address: contact.address ?? "",
                        priority: String(
                            contact.priority ?? 1
                        ),
                        is_active:
                            contact.is_active ?? true,
                    });

                    return;
                }

                // --------------------------------------------------
                // ADD MODE
                // --------------------------------------------------

                const studentFromQuery =
                    searchParams.get("student");

                if (studentFromQuery) {
                    setFormData((previous) => ({
                        ...previous,
                        student: studentFromQuery,
                    }));
                }
            } catch (err) {
                console.error(
                    "Error loading emergency contact form:",
                    err
                );

                setError(
                    "Unable to load the emergency contact form."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode, searchParams]);

    // --------------------------------------------------
    // HANDLE INPUT
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    };

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validateForm = () => {
        if (!formData.student) {
            return "Please select a student.";
        }

        if (!formData.full_name.trim()) {
            return "Please enter the emergency contact's full name.";
        }

        if (!formData.relationship) {
            return "Please select the relationship.";
        }

        if (!formData.mobile_number.trim()) {
            return "Please enter a mobile number.";
        }

        if (!formData.priority) {
            return "Please select a priority.";
        }

        if (
            formData.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                student: Number(formData.student),
                full_name: formData.full_name.trim(),
                relationship: formData.relationship,
                mobile_number: formData.mobile_number.trim(),
                alternative_mobile:
                    formData.alternative_mobile.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                priority: Number(formData.priority),
                is_active: formData.is_active,
            };

            let response;

            if (isEditMode) {
                response = await axiosInstance.put(
                    `/students/emergency-contacts/${id}/`,
                    payload
                );
            } else {
                response = await axiosInstance.post(
                    "/students/emergency-contacts/",
                    payload
                );
            }

            const savedContact = response?.data;

            navigate(
                `/sms/emergency-contacts/${
                    savedContact?.id || id
                }`
            );
        } catch (err) {
            console.error(
                "Error saving emergency contact:",
                err
            );

            setError(getBackendError(err));

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 md:p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl bg-gray-50 p-10 text-center shadow-sm">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

                        <p className="text-sm text-gray-600">
                            Loading emergency contact form...
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="overflow-hidden rounded-2xl bg-purple-800 shadow-lg">

                    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-start gap-4">

                            <Link
                                to="/sms/emergency-contacts"
                                className="mt-1 rounded-lg bg-purple-700 p-2 text-purple-100 transition hover:bg-purple-600"
                            >
                                <ArrowLeft size={20} />
                            </Link>

                            <div>

                                <div className="flex items-center gap-2">

                                    <ShieldAlert
                                        size={25}
                                        className="text-purple-200"
                                    />

                                    <h1 className="text-2xl font-bold text-white">
                                        {isEditMode
                                            ? "Edit Emergency Contact"
                                            : "Add Emergency Contact"}
                                    </h1>

                                </div>

                                <p className="mt-1 text-sm text-purple-200">
                                    {isEditMode
                                        ? "Update the emergency contact information."
                                        : "Add an emergency contact for a student."}
                                </p>

                            </div>

                        </div>

                    </div>
                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 flex-shrink-0"
                        />

                        <div>

                            <p className="font-semibold">
                                Unable to save contact
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>

                        </div>

                    </div>
                )}

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ==================================================
                        STUDENT
                    ================================================== */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                <UserRound size={20} />
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Student
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Select the student this emergency
                                    contact belongs to.
                                </p>

                            </div>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Student{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="student"
                                value={formData.student}
                                onChange={handleChange}
                                disabled={isEditMode}
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-gray-200"
                            >
                                <option value="">
                                    Select student
                                </option>

                                {students.map((student) => (
                                    <option
                                        key={student.id}
                                        value={student.id}
                                    >
                                        {getStudentName(student)}
                                        {student.admission_number
                                            ? ` — ${student.admission_number}`
                                            : ""}
                                    </option>
                                ))}

                            </select>

                            {isEditMode && (
                                <p className="mt-1 text-xs text-gray-500">
                                    The student cannot be changed when
                                    editing an existing emergency contact.
                                </p>
                            )}

                        </div>

                    </section>

                    {/* ==================================================
                        CONTACT INFORMATION
                    ================================================== */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                <UserRound size={20} />
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Contact Information
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Enter the person's identification and
                                    relationship details.
                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* FULL NAME */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Full Name{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />

                            </div>

                            {/* RELATIONSHIP */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Relationship{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">
                                        Select relationship
                                    </option>

                                    {relationshipOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* PRIORITY */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Priority{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="1">
                                        Priority 1 — Primary
                                    </option>

                                    <option value="2">
                                        Priority 2 — Secondary
                                    </option>

                                    <option value="3">
                                        Priority 3 — Additional
                                    </option>
                                </select>

                            </div>

                        </div>

                    </section>

                    {/* ==================================================
                        PHONE & EMAIL
                    ================================================== */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                <Phone size={20} />
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Contact Details
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Provide reliable ways to reach this
                                    emergency contact.
                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* MOBILE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Mobile Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="tel"
                                        name="mobile_number"
                                        value={
                                            formData.mobile_number
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. 0712 345 678"
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />

                                </div>

                            </div>

                            {/* ALTERNATIVE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Alternative Mobile
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="tel"
                                        name="alternative_mobile"
                                        value={
                                            formData.alternative_mobile
                                        }
                                        onChange={handleChange}
                                        placeholder="Alternative number"
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />

                                </div>

                            </div>

                            {/* EMAIL */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* ==================================================
                        ADDRESS
                    ================================================== */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                <MapPin size={20} />
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Address
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Record where the emergency contact can
                                    be reached.
                                </p>

                            </div>

                        </div>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter physical or postal address..."
                            className="w-full resize-none rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />

                    </section>

                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    {isEditMode && (
                        <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        Contact Status
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Inactive contacts remain in the
                                        system for historical records.
                                    </p>

                                </div>

                                <label className="flex cursor-pointer items-center gap-3">

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            formData.is_active
                                        }
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    <span className="text-sm font-semibold text-gray-700">
                                        Active
                                    </span>

                                </label>

                            </div>

                        </section>
                    )}

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-300 pt-6 sm:flex-row sm:justify-end">

                        <Link
                            to="/sms/emergency-contacts"
                            className="rounded-xl border border-gray-300 bg-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />

                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Contact"
                                    : "Save Contact"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
};

export default EmergencyContactFormPage;