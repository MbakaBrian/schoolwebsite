import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    Edit,
    GraduationCap,
    User,
    CalendarDays,
    School,
    BookOpen,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowRightLeft,
    Ban,
    ChevronRight,
    Users,
    Home,
    UserRound,
    FileText,
    GitBranch,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const getStudentName = (student) => {

    if (!student) {
        return "Unknown Student";
    }

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
};


// ============================================================
// ENROLLMENT STATUS
// ============================================================

const getStatusLabel = (status) => {

    const labels = {
        active: "Active",
        completed: "Completed",
        transferred: "Transferred",
        withdrawn: "Withdrawn",
        inactive: "Inactive",
    };

    return labels[status] || status || "Unknown";
};


const getStatusIcon = (status) => {

    switch (status) {

        case "active":
            return <CheckCircle size={18} />;

        case "completed":
            return <GraduationCap size={18} />;

        case "transferred":
            return <ArrowRightLeft size={18} />;

        case "withdrawn":
            return <XCircle size={18} />;

        case "inactive":
            return <Ban size={18} />;

        default:
            return <AlertCircle size={18} />;
    }
};


const getStatusClasses = (status) => {

    switch (status) {

        case "active":
            return "bg-purple-100 text-purple-800 border-purple-200";

        case "completed":
            return "bg-gray-200 text-gray-800 border-gray-300";

        case "transferred":
            return "bg-indigo-100 text-indigo-800 border-indigo-200";

        case "withdrawn":
            return "bg-red-100 text-red-800 border-red-200";

        case "inactive":
            return "bg-gray-300 text-gray-700 border-gray-400";

        default:
            return "bg-gray-200 text-gray-700 border-gray-300";
    }
};


// ============================================================
// DATE FORMATTER
// ============================================================

const formatDate = (date) => {

    if (!date) {
        return "Not provided";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};


// ============================================================
// PAGE
// ============================================================

const EnrollmentDetailsPage = () => {

    const { id } = useParams();
    const navigate = useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [enrollment, setEnrollment] = useState(null);

    const [student, setStudent] = useState(null);
    const [academicYear, setAcademicYear] = useState(null);
    const [classLevel, setClassLevel] = useState(null);
    const [stream, setStream] = useState(null);

    const [loading, setLoading] = useState(true);
    const [deactivating, setDeactivating] = useState(false);
    const [error, setError] = useState("");


    // ========================================================
    // LOAD ENROLLMENT
    // ========================================================

    useEffect(() => {

        const loadEnrollment = async () => {

            try {

                setLoading(true);
                setError("");

                const enrollmentResponse =
                    await axiosInstance.get(
                        `/students/enrollments/${id}/`
                    );

                const enrollmentData =
                    enrollmentResponse.data;

                setEnrollment(enrollmentData);


                // ------------------------------------------------
                // RELATED DATA
                // ------------------------------------------------

                const requests = [];


                // STUDENT

                if (enrollmentData.student) {

                    requests.push(
                        axiosInstance.get(
                            `/students/students/${enrollmentData.student}/`
                        )
                    );

                } else {

                    requests.push(
                        Promise.resolve(null)
                    );

                }


                // ACADEMIC YEAR

                if (enrollmentData.academic_year) {

                    requests.push(
                        axiosInstance.get(
                            `/academics/years/${enrollmentData.academic_year}/`
                        )
                    );

                } else {

                    requests.push(
                        Promise.resolve(null)
                    );

                }


                // CLASS LEVEL

                if (enrollmentData.class_level) {

                    requests.push(
                        axiosInstance.get(
                            `/academics/class-levels/${enrollmentData.class_level}/`
                        )
                    );

                } else {

                    requests.push(
                        Promise.resolve(null)
                    );

                }


                // STREAM

                if (enrollmentData.stream) {

                    requests.push(
                        axiosInstance.get(
                            `/academics/streams/${enrollmentData.stream}/`
                        )
                    );

                } else {

                    requests.push(
                        Promise.resolve(null)
                    );

                }


                const [
                    studentResponse,
                    academicYearResponse,
                    classLevelResponse,
                    streamResponse,
                ] = await Promise.all(requests);


                setStudent(
                    studentResponse?.data || null
                );

                setAcademicYear(
                    academicYearResponse?.data || null
                );

                setClassLevel(
                    classLevelResponse?.data || null
                );

                setStream(
                    streamResponse?.data || null
                );

            } catch (err) {

                console.error(
                    "Error loading enrollment details:",
                    err
                );

                setError(
                    err?.response?.data?.detail ||
                    "Unable to load this enrollment record. Please try again."
                );

            } finally {

                setLoading(false);

            }
        };


        loadEnrollment();

    }, [id]);


    // ========================================================
    // DEACTIVATE
    // ========================================================

    const handleDeactivate = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to deactivate this enrollment?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeactivating(true);
            setError("");

            await axiosInstance.delete(
                `/students/enrollments/${id}/`
            );

            navigate("/sms/enrollments");

        } catch (err) {

            console.error(
                "Error deactivating enrollment:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to deactivate this enrollment. Please try again."
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

                <div className="mx-auto max-w-6xl">

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-10 text-center shadow-sm">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

                        <p className="text-sm text-gray-600">
                            Loading enrollment details...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!enrollment) {

        return (

            <div className="min-h-screen bg-gray-100 p-6">

                <div className="mx-auto max-w-4xl">

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-10 text-center shadow-sm">

                        <AlertCircle
                            size={42}
                            className="mx-auto mb-4 text-purple-600"
                        />

                        <h2 className="text-xl font-bold text-gray-800">
                            Enrollment Not Found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            The enrollment record could not be found.
                        </p>

                        <Link
                            to="/sms/enrollments"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-900"
                        >

                            <ArrowLeft size={18} />

                            Back to Enrollments

                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (

        <div className="min-h-screen bg-gray-100">

            <div className="mx-auto max-w-7xl">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="overflow-hidden border-b border-purple-900 bg-purple-800 shadow-sm">

                    <div className="px-6 py-6 lg:px-8">


                        {/* BREADCRUMB */}

                        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">

                            <Link
                                to="/dashboard/headteacher"
                                className="text-purple-200 transition hover:text-white"
                            >
                                Head Teacher
                            </Link>

                            <ChevronRight
                                size={15}
                                className="text-purple-300"
                            />

                            <Link
                                to="/sms/students"
                                className="text-purple-200 transition hover:text-white"
                            >
                                Student Management
                            </Link>

                            <ChevronRight
                                size={15}
                                className="text-purple-300"
                            />

                            <Link
                                to="/sms/enrollments"
                                className="text-purple-200 transition hover:text-white"
                            >
                                Enrollments
                            </Link>

                            <ChevronRight
                                size={15}
                                className="text-purple-300"
                            />

                            <span className="font-medium text-white">
                                Enrollment Details
                            </span>

                        </div>


                        {/* HEADER CONTENT */}

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-start gap-4">

                                <Link
                                    to="/sms/enrollments"
                                    className="mt-1 rounded-lg bg-purple-700 p-2 text-purple-100 transition hover:bg-purple-600"
                                    title="Back to enrollments"
                                >
                                    <ArrowLeft size={20} />
                                </Link>


                                <div>

                                    <div className="flex items-center gap-2">

                                        <GraduationCap
                                            size={25}
                                            className="text-purple-200"
                                        />

                                        <h1 className="text-2xl font-bold text-white">
                                            Enrollment Details
                                        </h1>

                                    </div>


                                    <p className="mt-1 text-sm text-purple-200">
                                        Academic placement and enrollment
                                        information.
                                    </p>

                                </div>

                            </div>


                            <Link
                                to={`/sms/enrollments/${id}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-5 py-3 text-sm font-semibold text-purple-800 transition hover:bg-gray-200"
                            >

                                <Edit size={18} />

                                Edit Enrollment

                            </Link>

                        </div>

                    </div>


                    {/* ==================================================
                        MANAGEMENT NAVIGATION
                    ================================================== */}

                    <div className="border-t border-purple-700 bg-purple-900">

                        <div className="flex flex-wrap items-center gap-2 px-6 py-3 lg:px-8">

                            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-purple-300">
                                Student Management
                            </span>


                            <Link
                                to="/sms/students"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-600"
                            >

                                <Users size={14} />

                                Students

                            </Link>


                            <Link
                                to="/sms/families"
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-800 hover:text-white"
                            >

                                <Home size={14} />

                                Families

                            </Link>


                            <Link
                                to="/sms/parents"
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-800 hover:text-white"
                            >

                                <UserRound size={14} />

                                Parents

                            </Link>


                            <Link
                                to="/sms/enrollments"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-purple-800 shadow-sm"
                            >

                                <CalendarDays size={14} />

                                Enrollments

                            </Link>


                            <Link
                                to="/sms/documents"
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-800 hover:text-white"
                            >

                                <FileText size={14} />

                                Documents

                            </Link>


                            <Link
                                to="/sms/progression"
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-800 hover:text-white"
                            >

                                <GitBranch size={14} />

                                Progression

                            </Link>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <main className="space-y-6 px-6 py-7 lg:px-8">


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                            <AlertCircle
                                size={20}
                                className="mt-0.5 flex-shrink-0"
                            />

                            <p className="text-sm">
                                {error}
                            </p>

                        </div>

                    )}


                    {/* ==================================================
                        STUDENT + ENROLLMENT HERO
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-4">

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">

                                    <User size={32} />

                                </div>


                                <div className="min-w-0">

                                    {student?.id ? (

                                        <Link
                                            to={`/sms/students/${student.id}`}
                                            className="text-2xl font-bold text-gray-800 transition hover:text-purple-700"
                                        >
                                            {getStudentName(student)}
                                        </Link>

                                    ) : (

                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {getStudentName(student)}
                                        </h2>

                                    )}


                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">

                                        {student?.admission_number && (

                                            <span>
                                                Admission:{" "}
                                                <strong className="text-gray-700">
                                                    {student.admission_number}
                                                </strong>
                                            </span>

                                        )}


                                        {student?.student_id && (

                                            <span>
                                                Student ID:{" "}
                                                <strong className="text-gray-700">
                                                    {student.student_id}
                                                </strong>
                                            </span>

                                        )}

                                    </div>

                                </div>

                            </div>


                            <div
                                className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold md:self-center ${getStatusClasses(
                                    enrollment.status
                                )}`}
                            >

                                {getStatusIcon(
                                    enrollment.status
                                )}

                                {getStatusLabel(
                                    enrollment.status
                                )}

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        RECORD FLOW
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                        <div className="mb-5">

                            <h2 className="text-lg font-bold text-gray-800">
                                Enrollment Record
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                This enrollment connects the permanent
                                student record to a specific academic
                                placement.
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">


                            {/* STUDENT */}

                            <Link
                                to={
                                    student?.id
                                        ? `/sms/students/${student.id}`
                                        : "/sms/students"
                                }
                                className="group rounded-xl border border-purple-200 bg-purple-50 p-4 transition hover:border-purple-400 hover:shadow-sm"
                            >

                                <div className="flex items-center justify-between">

                                    <User
                                        size={20}
                                        className="text-purple-700"
                                    />

                                    <ArrowRight
                                        size={16}
                                        className="text-purple-400 transition group-hover:translate-x-1"
                                    />

                                </div>


                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-purple-600">
                                    Student
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                    {getStudentName(student)}
                                </p>

                            </Link>


                            {/* ACADEMIC YEAR */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-4">

                                <CalendarDays
                                    size={20}
                                    className="text-purple-700"
                                />

                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Academic Year
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                    {academicYear?.name ||
                                        enrollment.academic_year ||
                                        "Not assigned"}
                                </p>

                            </div>


                            {/* CLASS */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-4">

                                <BookOpen
                                    size={20}
                                    className="text-purple-700"
                                />

                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Class Level
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                    {classLevel?.name ||
                                        "Not assigned"}
                                </p>

                            </div>


                            {/* STREAM */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-4">

                                <GraduationCap
                                    size={20}
                                    className="text-purple-700"
                                />

                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Stream
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                    {stream?.name ||
                                        "No stream"}
                                </p>

                            </div>


                            {/* PROGRESSION */}

                            <Link
                                to="/sms/progression"
                                className="group rounded-xl border border-gray-300 bg-gray-50 p-4 transition hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm"
                            >

                                <div className="flex items-center justify-between">

                                    <GitBranch
                                        size={20}
                                        className="text-purple-700"
                                    />

                                    <ArrowRight
                                        size={16}
                                        className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600"
                                    />

                                </div>


                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Next
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-800">
                                    Progression
                                </p>

                            </Link>

                        </div>

                    </section>


                    {/* ==================================================
                        ACADEMIC PLACEMENT
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">

                                <School size={20} />

                            </div>


                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Academic Placement
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Where the student was placed during this
                                    academic year.
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


                            {/* ACADEMIC YEAR */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-5">

                                <div className="mb-3 flex items-center gap-2 text-purple-700">

                                    <CalendarDays size={19} />

                                    <span className="text-xs font-semibold uppercase tracking-wide">
                                        Academic Year
                                    </span>

                                </div>


                                <p className="text-lg font-bold text-gray-800">
                                    {academicYear?.name ||
                                        enrollment.academic_year ||
                                        "Not assigned"}
                                </p>


                                {academicYear?.is_current && (

                                    <span className="mt-2 inline-block rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                                        Current Year
                                    </span>

                                )}

                            </div>


                            {/* CLASS */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-5">

                                <div className="mb-3 flex items-center gap-2 text-purple-700">

                                    <BookOpen size={19} />

                                    <span className="text-xs font-semibold uppercase tracking-wide">
                                        Class Level
                                    </span>

                                </div>


                                <p className="text-lg font-bold text-gray-800">
                                    {classLevel?.name ||
                                        "Not assigned"}
                                </p>


                                {classLevel?.code && (

                                    <p className="mt-1 text-sm text-gray-500">
                                        Code: {classLevel.code}
                                    </p>

                                )}

                            </div>


                            {/* STREAM */}

                            <div className="rounded-xl border border-gray-300 bg-gray-200 p-5">

                                <div className="mb-3 flex items-center gap-2 text-purple-700">

                                    <GraduationCap size={19} />

                                    <span className="text-xs font-semibold uppercase tracking-wide">
                                        Stream
                                    </span>

                                </div>


                                <p className="text-lg font-bold text-gray-800">
                                    {stream?.name ||
                                        "No stream"}
                                </p>


                                {stream?.code && (

                                    <p className="mt-1 text-sm text-gray-500">
                                        Code: {stream.code}
                                    </p>

                                )}

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        ENROLLMENT INFORMATION
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">

                                <Clock size={20} />

                            </div>


                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Enrollment Information
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Important dates and enrollment history.
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            {/* ENROLLMENT DATE */}

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Enrollment Date
                                </p>

                                <p className="mt-1 font-semibold text-gray-800">
                                    {formatDate(
                                        enrollment.enrollment_date
                                    )}
                                </p>

                            </div>


                            {/* STATUS */}

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Enrollment Status
                                </p>

                                <div className="mt-2">

                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                            enrollment.status
                                        )}`}
                                    >

                                        {getStatusIcon(
                                            enrollment.status
                                        )}

                                        {getStatusLabel(
                                            enrollment.status
                                        )}

                                    </span>

                                </div>

                            </div>


                            {/* PREVIOUS SCHOOL */}

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Previous School
                                </p>

                                <p className="mt-1 font-semibold text-gray-800">
                                    {enrollment.previous_school ||
                                        "Not provided"}
                                </p>

                            </div>


                            {/* EXIT DATE */}

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Exit Date
                                </p>

                                <p className="mt-1 font-semibold text-gray-800">
                                    {formatDate(
                                        enrollment.exit_date
                                    )}
                                </p>

                            </div>

                        </div>


                        {/* EXIT REASON */}

                        {enrollment.exit_reason && (

                            <div className="mt-6 rounded-xl border border-gray-300 bg-gray-200 p-5">

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Exit Reason
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-700">
                                    {enrollment.exit_reason}
                                </p>

                            </div>

                        )}

                    </section>


                    {/* ==================================================
                        STUDENT INFORMATION
                    ================================================== */}

                    {student && (

                        <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                            <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                                <div className="rounded-lg bg-purple-100 p-2 text-purple-700">

                                    <User size={20} />

                                </div>


                                <div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        Student Information
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Basic information for the enrolled
                                        student.
                                    </p>

                                </div>

                            </div>


                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Full Name
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {getStudentName(student)}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Admission Number
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {student.admission_number ||
                                            "Not provided"}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Student ID
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {student.student_id ||
                                            "Not provided"}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Date of Birth
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {formatDate(
                                            student.date_of_birth
                                        )}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Gender
                                    </p>

                                    <p className="mt-1 font-semibold capitalize text-gray-800">
                                        {student.gender ||
                                            "Not specified"}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Family
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {student.family_name ||
                                            student.family?.family_name ||
                                            "Not assigned"}
                                    </p>

                                </div>

                            </div>


                            <div className="mt-6 flex flex-wrap gap-3">

                                {student.id && (

                                    <Link
                                        to={`/sms/students/${student.id}`}
                                        className="inline-flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-800 transition hover:bg-purple-200"
                                    >

                                        View Student Profile

                                        <ArrowRight size={16} />

                                    </Link>

                                )}


                                <Link
                                    to="/sms/students"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                                >

                                    <Users size={16} />

                                    All Students

                                </Link>

                            </div>

                        </section>

                    )}


                    {/* ==================================================
                        SYSTEM INFORMATION
                    ================================================== */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-gray-200 p-2 text-gray-700">

                                <Clock size={20} />

                            </div>


                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    System Information
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Record timestamps.
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Created
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {formatDate(
                                        enrollment.created_at
                                    )}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Last Updated
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {formatDate(
                                        enrollment.updated_at
                                    )}
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-300 pt-6 sm:flex-row sm:justify-between">


                        {/* BACK */}

                        <Link
                            to="/sms/enrollments"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                        >

                            <ArrowLeft size={18} />

                            Back to Enrollments

                        </Link>


                        {/* RIGHT ACTIONS */}

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/sms/progression"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-semibold text-purple-800 transition hover:bg-purple-100"
                            >

                                <GitBranch size={18} />

                                Progression

                            </Link>


                            <Link
                                to={`/sms/enrollments/${id}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-100 px-5 py-3 text-sm font-semibold text-purple-800 transition hover:bg-purple-200"
                            >

                                <Edit size={18} />

                                Edit

                            </Link>


                            {enrollment.status === "active" && (

                                <button
                                    type="button"
                                    onClick={handleDeactivate}
                                    disabled={deactivating}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <Ban size={18} />

                                    {deactivating
                                        ? "Deactivating..."
                                        : "Deactivate Enrollment"}

                                </button>

                            )}

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};


export default EnrollmentDetailsPage;

