import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    ArrowLeft,
    Pencil,
    User,
    Users,
    CalendarDays,
    MapPin,
    HeartPulse,
    GraduationCap,
    FileText,
    ShieldCheck,
    AlertCircle,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react";


// ============================================================
// HELPERS
// ============================================================

const getStudentName = (student) => {
    if (student.full_name) {
        return student.full_name;
    }

    return [
        student.first_name,
        student.middle_name,
        student.last_name,
    ]
        .filter(Boolean)
        .join(" ") || "Unnamed Student";
};


const formatDate = (date) => {
    if (!date) {
        return "Not provided";
    }

    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const getStatusLabel = (status) => {
    const labels = {
        active: "Active",
        inactive: "Inactive",
        graduated: "Graduated",
        transferred: "Transferred",
        withdrawn: "Withdrawn",
    };

    return labels[status] || status || "Unknown";
};


const getStatusClasses = (status) => {
    switch (status) {
        case "active":
            return "bg-purple-100 text-purple-700 border-purple-200";

        case "graduated":
            return "bg-gray-200 text-gray-700 border-gray-300";

        case "transferred":
            return "bg-blue-100 text-blue-700 border-blue-200";

        case "withdrawn":
            return "bg-red-100 text-red-700 border-red-200";

        case "inactive":
            return "bg-gray-100 text-gray-600 border-gray-200";

        default:
            return "bg-gray-100 text-gray-600 border-gray-200";
    }
};


const formatGender = (gender) => {
    const labels = {
        male: "Male",
        female: "Female",
        other: "Other",
        not_specified: "Not specified",
    };

    return labels[gender] || gender || "Not provided";
};


// ============================================================
// SMALL UI COMPONENTS
// ============================================================

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {label}
        </p>

        <p className="text-sm font-medium text-gray-700 mt-1 break-words">
            {value || "Not provided"}
        </p>
    </div>
);


const SectionHeader = ({
    icon: Icon,
    title,
    description,
    purple = false,
}) => (
    <div
        className={`px-5 sm:px-6 py-5 ${
            purple
                ? "bg-purple-800 text-white"
                : "bg-gray-800 text-white"
        }`}
    >
        <div className="flex items-center gap-3">

            <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    purple
                        ? "bg-purple-700"
                        : "bg-gray-700"
                }`}
            >
                <Icon size={20} />
            </div>

            <div>
                <h2 className="font-semibold text-lg">
                    {title}
                </h2>

                {description && (
                    <p
                        className={`text-sm ${
                            purple
                                ? "text-purple-200"
                                : "text-gray-300"
                        }`}
                    >
                        {description}
                    </p>
                )}
            </div>

        </div>
    </div>
);


// ============================================================
// COMPONENT
// ============================================================

const StudentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");
    const [deactivating, setDeactivating] = useState(false);


    // ========================================================
    // FETCH STUDENT
    // ========================================================

    const fetchStudent = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axiosInstance.get(
                `/students/students/${id}/`
            );

            setStudent(response.data);

        } catch (err) {
            console.error(
                "Failed to fetch student:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load student information."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        fetchStudent();
    }, [id]);


    // ========================================================
    // DEACTIVATE STUDENT
    // ========================================================

    const handleDeactivate = async () => {
        if (!student) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${getStudentName(
                student
            )}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeactivating(true);
            setError("");

            await axiosInstance.delete(
                `/students/students/${id}/`
            );

            setStudent((previous) => ({
                ...previous,
                status: "inactive",
            }));

        } catch (err) {
            console.error(
                "Failed to deactivate student:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to deactivate the student."
            );
        } finally {
            setDeactivating(false);
        }
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <div className="max-w-6xl mx-auto">

                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />

                    <div className="bg-gray-200 rounded-2xl h-52 animate-pulse mb-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="h-72 bg-gray-200 rounded-2xl animate-pulse" />

                        <div className="h-72 bg-gray-200 rounded-2xl animate-pulse" />

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error && !student) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

                <div className="max-w-6xl mx-auto">

                    <Link
                        to="/sms/students"
                        className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 mb-6"
                    >
                        <ArrowLeft size={17} />
                        Back to Students
                    </Link>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                        <div className="flex gap-3">

                            <AlertCircle
                                size={22}
                                className="text-red-600 flex-shrink-0"
                            />

                            <div>

                                <h2 className="font-semibold text-red-800">
                                    Unable to load student
                                </h2>

                                <p className="text-sm text-red-700 mt-1">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => fetchStudent()}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                                >
                                    <RefreshCw size={16} />
                                    Try Again
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    if (!student) {
        return null;
    }


    const studentName = getStudentName(student);

    const familyName =
        student.family_name ||
        student.family?.family_name ||
        "Family not provided";


    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

            <div className="max-w-6xl mx-auto">

                {/* ==================================================
                    TOP NAVIGATION
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <Link
                        to="/sms/students"
                        className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
                    >
                        <ArrowLeft size={17} />
                        Back to Students
                    </Link>


                    <button
                        type="button"
                        onClick={() => fetchStudent(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                </div>


                {/* ==================================================
                    ERROR ALERT
                ================================================== */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">

                        <div className="flex items-center gap-3">

                            <AlertCircle size={19} />

                            <p className="text-sm font-medium">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    STUDENT HERO
                ================================================== */}

                <section className="bg-purple-800 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <div className="p-5 sm:p-7">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                            <div className="flex items-center gap-4">

                                {/* Avatar */}

                                <div className="h-20 w-20 rounded-2xl bg-purple-700 border border-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">

                                    {student.photo ? (
                                        <img
                                            src={student.photo}
                                            alt={studentName}
                                            className="h-full w-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        studentName
                                            .charAt(0)
                                            .toUpperCase()
                                    )}

                                </div>


                                <div>

                                    <p className="text-purple-200 text-sm font-medium">
                                        Student Profile
                                    </p>

                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                                        {studentName}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2 mt-3">

                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-700 text-purple-100 text-xs font-semibold">
                                            {student.student_id ||
                                                "Student ID unavailable"}
                                        </span>

                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-700 text-purple-100 text-xs font-semibold">
                                            {student.admission_number ||
                                                "Admission number unavailable"}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                                <span
                                    className={`inline-flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-semibold ${getStatusClasses(
                                        student.status
                                    )}`}
                                >
                                    {getStatusLabel(
                                        student.status
                                    )}
                                </span>


                                <Link
                                    to={`/sms/students/${student.id}/edit`}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-800 font-semibold hover:bg-purple-50 transition"
                                >
                                    <Pencil size={17} />
                                    Edit Student
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    BASIC INFORMATION
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={User}
                        title="Personal Information"
                        description="Basic information about the student."
                        purple
                    />

                    <div className="p-5 sm:p-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            <InfoItem
                                label="First Name"
                                value={student.first_name}
                            />

                            <InfoItem
                                label="Middle Name"
                                value={student.middle_name}
                            />

                            <InfoItem
                                label="Last Name"
                                value={student.last_name}
                            />

                            <InfoItem
                                label="Gender"
                                value={formatGender(student.gender)}
                            />

                            <InfoItem
                                label="Date of Birth"
                                value={formatDate(
                                    student.date_of_birth
                                )}
                            />

                            <InfoItem
                                label="Place of Birth"
                                value={student.place_of_birth}
                            />

                            <InfoItem
                                label="Nationality"
                                value={student.nationality}
                            />

                            <InfoItem
                                label="Religion"
                                value={student.religion}
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FAMILY
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={Users}
                        title="Family"
                        description="Household information associated with this student."
                    />

                    <div className="p-5 sm:p-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            <InfoItem
                                label="Family"
                                value={familyName}
                            />

                            <InfoItem
                                label="Family ID"
                                value={
                                    student.family?.family_id
                                }
                            />

                            <InfoItem
                                label="Town"
                                value={
                                    student.family?.town
                                }
                            />

                            <InfoItem
                                label="County"
                                value={
                                    student.family?.county
                                }
                            />

                            <InfoItem
                                label="Sub-County"
                                value={
                                    student.family?.sub_county
                                }
                            />

                            <InfoItem
                                label="Address"
                                value={
                                    student.family?.address
                                }
                            />

                            <InfoItem
                                label="Postal Address"
                                value={
                                    student.family?.postal_address
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    BIRTH CERTIFICATE / IDENTIFICATION
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={FileText}
                        title="Identification & Birth Certificate"
                        description="Official identification information."
                        purple
                    />

                    <div className="p-5 sm:p-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            <InfoItem
                                label="Birth Certificate Number"
                                value={
                                    student.birth_certificate_number
                                }
                            />

                            <InfoItem
                                label="Birth Entry Number"
                                value={
                                    student.birth_certificate_entry_number
                                }
                            />

                            <InfoItem
                                label="NEMIS / KEMIS Number"
                                value={
                                    student.nemis_kemis_number
                                }
                            />

                            <InfoItem
                                label="Assessment Number"
                                value={
                                    student.child_assessment_number
                                }
                            />

                        </div>


                        <div className="mt-6 pt-5 border-t border-gray-200">

                            {student.birth_certificate_submitted ? (

                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">

                                    <CheckCircle2 size={18} />

                                    Birth certificate submitted

                                </div>

                            ) : (

                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500">

                                    <XCircle size={18} />

                                    Birth certificate not yet submitted

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    HOME INFORMATION
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={MapPin}
                        title="Home Information"
                        description="Student's home location."
                    />

                    <div className="p-5 sm:p-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <InfoItem
                                label="Home County"
                                value={
                                    student.home_county
                                }
                            />

                            <InfoItem
                                label="Home Sub-County"
                                value={
                                    student.home_sub_county
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    MEDICAL INFORMATION
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={HeartPulse}
                        title="Medical Information"
                        description="Allergies, illnesses and medical conditions."
                        purple
                    />

                    <div className="p-5 sm:p-6">

                        <div className="flex items-center gap-3 mb-5">

                            {student.has_allergies_or_illness ? (

                                <>

                                    <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <AlertCircle size={18} />
                                    </div>

                                    <div>

                                        <p className="font-semibold text-gray-800">
                                            Medical condition reported
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Additional medical information has been provided.
                                        </p>

                                    </div>

                                </>

                            ) : (

                                <>

                                    <div className="h-9 w-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <ShieldCheck size={18} />
                                    </div>

                                    <div>

                                        <p className="font-semibold text-gray-800">
                                            No allergies or illness reported
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            No medical condition has been recorded.
                                        </p>

                                    </div>

                                </>

                            )}

                        </div>


                        {student.has_allergies_or_illness && (
                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Medical Details
                                </p>

                                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                                    {student.medical_conditions ||
                                        "No details provided."}
                                </p>

                            </div>
                        )}

                    </div>

                </section>


                {/* ==================================================
                    SPECIAL ABILITIES
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={GraduationCap}
                        title="Special Abilities"
                        description="Special talents, abilities or support information."
                    />

                    <div className="p-5 sm:p-6">

                        {student.has_special_abilities ? (

                            <div>

                                <div className="flex items-center gap-3 mb-4">

                                    <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                                        <GraduationCap size={18} />
                                    </div>

                                    <p className="font-semibold text-gray-800">
                                        Special abilities reported
                                    </p>

                                </div>

                                <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Details
                                    </p>

                                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                                        {student.special_abilities ||
                                            "No details provided."}
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div className="flex items-center gap-3">

                                <div className="h-9 w-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                                    <GraduationCap size={18} />
                                </div>

                                <div>

                                    <p className="font-semibold text-gray-800">
                                        No special abilities reported
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        No special abilities have been recorded.
                                    </p>

                                </div>

                            </div>

                        )}

                    </div>

                </section>


                {/* ==================================================
                    RECORD INFORMATION
                ================================================== */}

                <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <SectionHeader
                        icon={CalendarDays}
                        title="Record Information"
                        description="System record information."
                        purple
                    />

                    <div className="p-5 sm:p-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            <InfoItem
                                label="Student ID"
                                value={student.student_id}
                            />

                            <InfoItem
                                label="Admission Number"
                                value={student.admission_number}
                            />

                            <InfoItem
                                label="Created"
                                value={formatDate(
                                    student.created_at
                                )}
                            />

                            <InfoItem
                                label="Last Updated"
                                value={formatDate(
                                    student.updated_at
                                )}
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    BOTTOM ACTIONS
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pb-8">

                    <button
                        type="button"
                        onClick={handleDeactivate}
                        disabled={
                            deactivating ||
                            student.status === "inactive"
                        }
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deactivating ? (
                            <>
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />

                                Deactivating...
                            </>
                        ) : (
                            <>
                                <XCircle size={17} />

                                {student.status === "inactive"
                                    ? "Student Inactive"
                                    : "Deactivate Student"}
                            </>
                        )}
                    </button>


                    <div className="flex flex-col sm:flex-row gap-3">

                        <Link
                            to="/sms/students"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-200 transition"
                        >
                            <ArrowLeft size={17} />
                            Back to Students
                        </Link>


                        <Link
                            to={`/sms/students/${student.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
                        >
                            <Pencil size={17} />
                            Edit Student
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default StudentDetailsPage;

