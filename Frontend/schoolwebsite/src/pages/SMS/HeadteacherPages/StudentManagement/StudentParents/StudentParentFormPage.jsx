import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    Users,
    ArrowLeft,
    Save,
    RefreshCw,
    GraduationCap,
    UserRound,
    Star,
    Bell,
    CreditCard,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";

const relationshipOptions = [
    { value: "mother", label: "Mother" },
    { value: "father", label: "Father" },
    { value: "step_mother", label: "Step Mother" },
    { value: "step_father", label: "Step Father" },
    { value: "guardian", label: "Guardian" },
    { value: "grandparent", label: "Grandparent" },
    { value: "aunt", label: "Aunt" },
    { value: "uncle", label: "Uncle" },
    { value: "sibling", label: "Sibling" },
    { value: "other", label: "Other" },
];

function getResults(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
        return response.data.results;
    }

    return [];
}

function getStudentName(student) {
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
        .join(" ") || "Unknown Student";
}

function getParentName(parent) {
    if (!parent) return "Unknown Parent";

    if (parent.full_name) {
        return parent.full_name;
    }

    return [
        parent.first_name,
        parent.middle_name,
        parent.last_name,
    ]
        .filter(Boolean)
        .join(" ") || "Unknown Parent";
}

function getFamilyName(family) {
    if (!family) return "No Family";

    return family.family_name || family.name || "No Family";
}

function FieldLabel({ children, required = false }) {
    return (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {children}

            {required && (
                <span className="text-red-600 ml-1">*</span>
            )}
        </label>
    );
}

function ToggleField({
    checked,
    onChange,
    icon: Icon,
    title,
    description,
}) {
    return (
        <label className="flex items-start gap-4 p-4 rounded-xl bg-gray-100 border border-gray-200 cursor-pointer hover:border-purple-300 transition">
            <div className="pt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />

                <div
                    className={`relative w-11 h-6 rounded-full transition ${
                        checked
                            ? "bg-purple-700"
                            : "bg-gray-300"
                    }`}
                >
                    <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition ${
                            checked
                                ? "left-6"
                                : "left-1"
                        }`}
                    />
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-700" />

                    <p className="font-semibold text-gray-900">
                        {title}
                    </p>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                    {description}
                </p>
            </div>
        </label>
    );
}

export default function StudentParentFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);

    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        student: "",
        parent_guardian: "",
        relationship: "guardian",
        is_primary: false,
        has_parental_responsibility: false,
        receives_communications: true,
        receives_fee_notifications: true,
        is_emergency_contact: false,
    });

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const requests = [
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/students/parents/"),
            ];

            if (isEditMode) {
                requests.push(
                    axiosInstance.get(
                        `/students/student-parents/${id}/`
                    )
                );
            }

            const responses = await Promise.all(requests);

            const studentsData = getResults(responses[0]);
            const parentsData = getResults(responses[1]);

            setStudents(studentsData);
            setParents(parentsData);

            if (isEditMode) {
                const relationshipData = responses[2].data;

                setFormData({
                    student:
                        relationshipData.student ?? "",
                    parent_guardian:
                        relationshipData.parent_guardian ?? "",
                    relationship:
                        relationshipData.relationship ||
                        "guardian",
                    is_primary:
                        Boolean(
                            relationshipData.is_primary
                        ),
                    has_parental_responsibility:
                        Boolean(
                            relationshipData.has_parental_responsibility
                        ),
                    receives_communications:
                        relationshipData.receives_communications !==
                        false,
                    receives_fee_notifications:
                        relationshipData.receives_fee_notifications !==
                        false,
                    is_emergency_contact:
                        Boolean(
                            relationshipData.is_emergency_contact
                        ),
                });
            } else {
                /*
                 * Allow the page to be opened from a student's
                 * details page:
                 *
                 * /sms/student-parents/add?student=5
                 */
                const studentParam =
                    searchParams.get("student");

                /*
                 * Or from a parent's details page:
                 *
                 * /sms/student-parents/add?parent=7
                 */
                const parentParam =
                    searchParams.get("parent");

                setFormData((current) => ({
                    ...current,
                    student: studentParam || "",
                    parent_guardian: parentParam || "",
                }));
            }
        } catch (err) {
            console.error(
                "Failed to load student-parent relationship form:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Failed to load the relationship form."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        setFieldErrors((current) => ({
            ...current,
            [field]: undefined,
        }));

        setError("");
    };

    const validate = () => {
        const errors = {};

        if (!formData.student) {
            errors.student = "Please select a student.";
        }

        if (!formData.parent_guardian) {
            errors.parent_guardian =
                "Please select a parent or guardian.";
        }

        if (!formData.relationship) {
            errors.relationship =
                "Please select the relationship.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const extractErrorMessage = (err) => {
        const data = err?.response?.data;

        if (!data) {
            return "Failed to save the relationship.";
        }

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (typeof data === "string") {
            return data;
        }

        const messages = [];

        Object.entries(data).forEach(([field, value]) => {
            if (Array.isArray(value)) {
                messages.push(
                    `${field}: ${value.join(", ")}`
                );
            } else if (typeof value === "string") {
                messages.push(`${field}: ${value}`);
            }
        });

        return (
            messages.join(" | ") ||
            "Failed to save the relationship."
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            setFieldErrors({});

            const payload = {
                student: Number(formData.student),
                parent_guardian: Number(
                    formData.parent_guardian
                ),
                relationship: formData.relationship,
                is_primary: formData.is_primary,
                has_parental_responsibility:
                    formData.has_parental_responsibility,
                receives_communications:
                    formData.receives_communications,
                receives_fee_notifications:
                    formData.receives_fee_notifications,
                is_emergency_contact:
                    formData.is_emergency_contact,
            };

            if (isEditMode) {
                await axiosInstance.put(
                    `/students/student-parents/${id}/`,
                    payload
                );
            } else {
                await axiosInstance.post(
                    "/students/student-parents/",
                    payload
                );
            }

            if (isEditMode) {
                navigate(`/sms/student-parents/${id}`);
            } else {
                navigate("/sms/student-parents");
            }
        } catch (err) {
            console.error(
                "Failed to save student-parent relationship:",
                err
            );

            if (err?.response?.data) {
                const backendErrors = err.response.data;

                if (
                    typeof backendErrors === "object" &&
                    !Array.isArray(backendErrors)
                ) {
                    setFieldErrors(backendErrors);
                }
            }

            setError(extractErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const selectedStudent = students.find(
        (student) =>
            String(student.id) === String(formData.student)
    );

    const selectedParent = parents.find(
        (parent) =>
            String(parent.id) ===
            String(formData.parent_guardian)
    );

    const selectedStudentFamily = selectedStudent?.family;
    const selectedParentFamily = selectedParent?.family;

    const studentFamilyText = selectedStudentFamily
        ? `Family ID: ${selectedStudentFamily}`
        : "";

    const parentFamilyText = selectedParentFamily
        ? `Family ID: ${selectedParentFamily}`
        : "";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                    <RefreshCw className="w-8 h-8 text-purple-700 animate-spin mx-auto" />

                    <p className="mt-4 text-gray-600">
                        Loading relationship form...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* HEADER */}
            <div className="bg-purple-800 rounded-2xl p-6 md:p-7 shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link
                        to={
                            isEditMode
                                ? `/sms/student-parents/${id}`
                                : "/sms/student-parents"
                        }
                        className="w-10 h-10 rounded-xl bg-purple-700 hover:bg-purple-600 flex items-center justify-center transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>

                    <div className="w-11 h-11 rounded-xl bg-purple-700 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>

                    <div>
                        <p className="text-purple-200 text-sm">
                            Student Management
                        </p>

                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            {isEditMode
                                ? "Edit Student-Parent Relationship"
                                : "Add Student-Parent Relationship"}
                        </h1>

                        <p className="text-purple-100 text-sm mt-1">
                            {isEditMode
                                ? "Update the relationship and communication responsibilities."
                                : "Link a parent or guardian to a student."}
                        </p>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />

                    <div>
                        <p className="font-semibold text-red-800">
                            Unable to save relationship
                        </p>

                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* PEOPLE SELECTION */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-800 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-white" />

                                <div>
                                    <h2 className="font-bold text-white">
                                        People
                                    </h2>

                                    <p className="text-gray-300 text-xs mt-0.5">
                                        Select the student and parent or
                                        guardian to link.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 md:p-6 grid md:grid-cols-2 gap-6">
                            {/* STUDENT */}
                            <div>
                                <FieldLabel required>
                                    Student
                                </FieldLabel>

                                <select
                                    value={formData.student}
                                    onChange={(e) =>
                                        handleChange(
                                            "student",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-4 py-3 bg-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                        fieldErrors.student
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
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

                                {fieldErrors.student && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {Array.isArray(
                                            fieldErrors.student
                                        )
                                            ? fieldErrors.student.join(
                                                  ", "
                                              )
                                            : fieldErrors.student}
                                    </p>
                                )}

                                {selectedStudent && (
                                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-purple-700" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {getStudentName(
                                                        selectedStudent
                                                    )}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {selectedStudent.student_id ||
                                                        "No student ID"}
                                                </p>

                                                {selectedStudent.admission_number && (
                                                    <p className="text-xs text-purple-700 mt-0.5">
                                                        {
                                                            selectedStudent.admission_number
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {studentFamilyText && (
                                            <p className="text-xs text-gray-500 mt-3">
                                                {studentFamilyText}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* PARENT */}
                            <div>
                                <FieldLabel required>
                                    Parent / Guardian
                                </FieldLabel>

                                <select
                                    value={
                                        formData.parent_guardian
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "parent_guardian",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-4 py-3 bg-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                        fieldErrors.parent_guardian
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        Select parent / guardian
                                    </option>

                                    {parents.map((parent) => (
                                        <option
                                            key={parent.id}
                                            value={parent.id}
                                        >
                                            {getParentName(parent)}
                                            {parent.parent_id
                                                ? ` — ${parent.parent_id}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors.parent_guardian && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {Array.isArray(
                                            fieldErrors.parent_guardian
                                        )
                                            ? fieldErrors.parent_guardian.join(
                                                  ", "
                                              )
                                            : fieldErrors.parent_guardian}
                                    </p>
                                )}

                                {selectedParent && (
                                    <div className="mt-3 bg-gray-100 border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <UserRound className="w-5 h-5 text-gray-700" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {getParentName(
                                                        selectedParent
                                                    )}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {selectedParent.parent_id ||
                                                        "No parent ID"}
                                                </p>

                                                {selectedParent.mobile_number && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {
                                                            selectedParent.mobile_number
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {parentFamilyText && (
                                            <p className="text-xs text-gray-500 mt-3">
                                                {parentFamilyText}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RELATIONSHIP */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-800 px-5 py-4">
                            <h2 className="font-bold text-white">
                                Relationship
                            </h2>

                            <p className="text-gray-300 text-xs mt-0.5">
                                Define how the selected person is related
                                to the student.
                            </p>
                        </div>

                        <div className="p-5 md:p-6">
                            <div className="max-w-md">
                                <FieldLabel required>
                                    Relationship Type
                                </FieldLabel>

                                <select
                                    value={formData.relationship}
                                    onChange={(e) =>
                                        handleChange(
                                            "relationship",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-4 py-3 bg-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                        fieldErrors.relationship
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {relationshipOptions.map(
                                        (option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                {fieldErrors.relationship && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {Array.isArray(
                                            fieldErrors.relationship
                                        )
                                            ? fieldErrors.relationship.join(
                                                  ", "
                                              )
                                            : fieldErrors.relationship}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RESPONSIBILITIES */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-800 px-5 py-4">
                            <h2 className="font-bold text-white">
                                Responsibilities & Notifications
                            </h2>

                            <p className="text-gray-300 text-xs mt-0.5">
                                Control what responsibilities and school
                                notifications apply to this relationship.
                            </p>
                        </div>

                        <div className="p-5 md:p-6 space-y-3">
                            <ToggleField
                                checked={formData.is_primary}
                                onChange={(value) =>
                                    handleChange(
                                        "is_primary",
                                        value
                                    )
                                }
                                icon={Star}
                                title="Primary Parent / Guardian"
                                description="Mark this person as a primary contact for the student."
                            />

                            <ToggleField
                                checked={
                                    formData.has_parental_responsibility
                                }
                                onChange={(value) =>
                                    handleChange(
                                        "has_parental_responsibility",
                                        value
                                    )
                                }
                                icon={ShieldCheck}
                                title="Parental Responsibility"
                                description="This person has parental responsibility for the student."
                            />

                            <ToggleField
                                checked={
                                    formData.receives_communications
                                }
                                onChange={(value) =>
                                    handleChange(
                                        "receives_communications",
                                        value
                                    )
                                }
                                icon={Bell}
                                title="Receive School Communications"
                                description="Allow this person to receive general school communications."
                            />

                            <ToggleField
                                checked={
                                    formData.receives_fee_notifications
                                }
                                onChange={(value) =>
                                    handleChange(
                                        "receives_fee_notifications",
                                        value
                                    )
                                }
                                icon={CreditCard}
                                title="Receive Fee Notifications"
                                description="Allow this person to receive fee and payment notifications."
                            />

                            <ToggleField
                                checked={
                                    formData.is_emergency_contact
                                }
                                onChange={(value) =>
                                    handleChange(
                                        "is_emergency_contact",
                                        value
                                    )
                                }
                                icon={ShieldCheck}
                                title="Emergency Contact"
                                description="Use this parent or guardian as an emergency contact for the student."
                            />
                        </div>
                    </div>

                    {/* SUMMARY */}
                    {(selectedStudent || selectedParent) && (
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-purple-700 mt-0.5" />

                                <div>
                                    <h3 className="font-bold text-purple-900">
                                        Relationship Summary
                                    </h3>

                                    <p className="text-sm text-purple-800 mt-1">
                                        {selectedStudent
                                            ? getStudentName(
                                                  selectedStudent
                                              )
                                            : "Select a student"}{" "}
                                        is linked to{" "}
                                        {selectedParent
                                            ? getParentName(
                                                  selectedParent
                                              )
                                            : "select a parent or guardian"}{" "}
                                        as{" "}
                                        <strong>
                                            {relationshipOptions.find(
                                                (option) =>
                                                    option.value ===
                                                    formData.relationship
                                            )?.label ||
                                                "Guardian"}
                                        </strong>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">
                        <Link
                            to={
                                isEditMode
                                    ? `/sms/student-parents/${id}`
                                    : "/sms/student-parents"
                            }
                            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-semibold transition disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isEditMode
                                        ? "Save Changes"
                                        : "Create Relationship"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}