import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Edit,
    Filter,
    GraduationCap,
    RefreshCw,
    Search,
    School,
    User,
    Users,
    X,
    AlertCircle,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const getResults = (response) => {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
        return response.data.results;
    }

    return [];
};


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
        .join(" ");
};


const getAcademicYearName = (enrollment) => {
    if (enrollment.academic_year_name) {
        return enrollment.academic_year_name;
    }

    if (
        enrollment.academic_year &&
        typeof enrollment.academic_year === "object"
    ) {
        return enrollment.academic_year.name;
    }

    return enrollment.academic_year || "Not assigned";
};


const getClassName = (enrollment) => {
    if (enrollment.class_level_name) {
        return enrollment.class_level_name;
    }

    if (
        enrollment.class_level &&
        typeof enrollment.class_level === "object"
    ) {
        return enrollment.class_level.name;
    }

    return "Not assigned";
};


const getStreamName = (enrollment) => {
    if (enrollment.stream_name) {
        return enrollment.stream_name;
    }

    if (
        enrollment.stream &&
        typeof enrollment.stream === "object"
    ) {
        return enrollment.stream.name;
    }

    return "No stream";
};


const getStudentId = (enrollment) => {
    if (enrollment.student && typeof enrollment.student === "object") {
        return enrollment.student.id;
    }

    return enrollment.student;
};


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
        month: "short",
        day: "numeric",
    });
};


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
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                status
            )}`}
        >
            {getStatusLabel(status)}
        </span>
    );
};


// ============================================================
// PAGE
// ============================================================

const EnrollmentsPage = () => {
    const navigate = useNavigate();

    // ========================================================
    // STATE
    // ========================================================

    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [classLevels, setClassLevels] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [academicYearFilter, setAcademicYearFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;


    // ========================================================
    // LOAD DATA
    // ========================================================

    const fetchData = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                enrollmentsResponse,
                studentsResponse,
                academicYearsResponse,
                classLevelsResponse,
            ] = await Promise.all([
                axiosInstance.get("/students/enrollments/"),
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/academics/years/"),
                axiosInstance.get("/academics/class-levels/"),
            ]);

            setEnrollments(getResults(enrollmentsResponse));
            setStudents(getResults(studentsResponse));
            setAcademicYears(getResults(academicYearsResponse));
            setClassLevels(getResults(classLevelsResponse));

        } catch (err) {
            console.error(
                "Error loading enrollments:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Unable to load enrollment records. Please try again."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);


    // ========================================================
    // STUDENT LOOKUP
    // ========================================================

    const studentMap = useMemo(() => {
        const map = {};

        students.forEach((student) => {
            map[String(student.id)] = student;
        });

        return map;
    }, [students]);


    const getEnrollmentStudent = (enrollment) => {
        const studentId = getStudentId(enrollment);

        return studentMap[String(studentId)] || null;
    };


    // ========================================================
    // FILTERING
    // ========================================================

    const filteredEnrollments = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

        return enrollments.filter((enrollment) => {
            const student =
                getEnrollmentStudent(enrollment);

            const studentName =
                getStudentName(student).toLowerCase();

            const admissionNumber =
                student?.admission_number
                    ?.toLowerCase() || "";

            const studentId =
                student?.student_id
                    ?.toLowerCase() || "";

            const academicYear =
                getAcademicYearName(enrollment)
                    .toLowerCase();

            const className =
                getClassName(enrollment)
                    .toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                studentName.includes(normalizedSearch) ||
                admissionNumber.includes(normalizedSearch) ||
                studentId.includes(normalizedSearch) ||
                academicYear.includes(normalizedSearch) ||
                className.includes(normalizedSearch);

            const enrollmentAcademicYear =
                enrollment.academic_year;

            const enrollmentClass =
                enrollment.class_level;

            const matchesStatus =
                !statusFilter ||
                enrollment.status === statusFilter;

            const matchesAcademicYear =
                !academicYearFilter ||
                String(enrollmentAcademicYear) ===
                    String(academicYearFilter);

            const matchesClass =
                !classFilter ||
                String(enrollmentClass) ===
                    String(classFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesAcademicYear &&
                matchesClass
            );
        });
    }, [
        enrollments,
        students,
        searchTerm,
        statusFilter,
        academicYearFilter,
        classFilter,
        studentMap,
    ]);


    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredEnrollments.length / itemsPerPage
        )
    );


    const paginatedEnrollments = useMemo(() => {
        const start =
            (currentPage - 1) * itemsPerPage;

        return filteredEnrollments.slice(
            start,
            start + itemsPerPage
        );
    }, [
        filteredEnrollments,
        currentPage,
    ]);


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {
        return {
            total: enrollments.length,

            active: enrollments.filter(
                (item) => item.status === "active"
            ).length,

            completed: enrollments.filter(
                (item) => item.status === "completed"
            ).length,

            transferred: enrollments.filter(
                (item) => item.status === "transferred"
            ).length,

            withdrawn: enrollments.filter(
                (item) => item.status === "withdrawn"
            ).length,
        };
    }, [enrollments]);


    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setAcademicYearFilter("");
        setClassFilter("");
        setCurrentPage(1);
    };


    const hasFilters =
        searchTerm ||
        statusFilter ||
        academicYearFilter ||
        classFilter;


    // ========================================================
    // SEARCH CHANGE
    // ========================================================

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };


    // ========================================================
    // LOADING STATE
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-6 h-8 w-72 animate-pulse rounded-lg bg-gray-300" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-28 animate-pulse rounded-2xl bg-gray-200"
                            />
                        ))}
                    </div>

                    <div className="mt-6 h-[500px] animate-pulse rounded-2xl bg-gray-200" />

                </div>
            </div>
        );
    }


    // ========================================================
    // ERROR STATE
    // ========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <div className="mx-auto flex min-h-[500px] max-w-4xl items-center justify-center">

                    <div className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-10 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                            <AlertCircle className="h-7 w-7 text-purple-700" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-800">
                            Unable to load enrollments
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => fetchData()}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-900"
                        >
                            <RefreshCw size={17} />
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // MAIN PAGE
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="border-b border-purple-900 bg-purple-800">

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* BREADCRUMB */}

                    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-purple-200">

                        <Link
                            to="/student-management"
                            className="transition hover:text-white"
                        >
                            Student Management
                        </Link>

                        <span>/</span>

                        <span className="font-medium text-white">
                            Enrollments
                        </span>

                    </div>


                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-700">
                                    <GraduationCap className="h-6 w-6 text-purple-100" />
                                </div>

                                <div>

                                    <h1 className="text-2xl font-bold text-white">
                                        Enrollment Records
                                    </h1>

                                    <p className="mt-1 text-sm text-purple-100">
                                        Manage student academic placements
                                        and enrollment history.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <button
                                type="button"
                                onClick={() => fetchData(true)}
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500 bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh
                            </button>


                            <Link
                                to="/sms/students"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-600"
                            >
                                <Users size={17} />
                                Students
                            </Link>


                            <Link
                                to="/sms/enrollments/add"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-purple-800 shadow-sm transition hover:bg-gray-200"
                            >
                                <CalendarDays size={17} />
                                Add Enrollment
                            </Link>

                        </div>

                    </div>

                </div>

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

                {/* ==================================================
                    QUICK NAVIGATION
                ================================================== */}

                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 shadow-sm">

                    <div className="flex flex-wrap gap-2">

                        <Link
                            to="/student-management"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            <ArrowLeft size={16} />
                            Student Management
                        </Link>


                        <Link
                            to="/sms/students"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            <Users size={16} />
                            Students
                        </Link>


                        <Link
                            to="/sms/families"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            Families
                        </Link>


                        <Link
                            to="/sms/parents"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            Parents & Guardians
                        </Link>


                        <Link
                            to="/sms/emergency-contacts"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            Emergency Contacts
                        </Link>


                        <Link
                            to="/sms/documents"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-800"
                        >
                            Documents
                        </Link>

                    </div>

                </div>


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

                    {/* TOTAL */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {statistics.total}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <GraduationCap className="h-5 w-5 text-purple-700" />
                            </div>

                        </div>

                    </div>


                    {/* ACTIVE */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {statistics.active}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <School className="h-5 w-5 text-purple-700" />
                            </div>

                        </div>

                    </div>


                    {/* COMPLETED */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Completed
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.completed}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-200 p-3">
                                <GraduationCap className="h-5 w-5 text-gray-700" />
                            </div>

                        </div>

                    </div>


                    {/* TRANSFERRED */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Transferred
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.transferred}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-200 p-3">
                                <ArrowRight size={20} className="text-gray-700" />
                            </div>

                        </div>

                    </div>


                    {/* WITHDRAWN */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Withdrawn
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.withdrawn}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-200 p-3">
                                <User className="h-5 w-5 text-gray-700" />
                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <section className="rounded-2xl border border-gray-300 bg-gray-50 shadow-sm">

                    <div className="border-b border-gray-300 px-5 py-4">

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                    <Filter size={18} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Find Enrollment
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Search and filter enrollment records.
                                    </p>
                                </div>

                            </div>


                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 self-start rounded-lg bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-300 md:self-auto"
                                >
                                    <X size={15} />
                                    Clear Filters
                                </button>
                            )}

                        </div>

                    </div>


                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">

                        {/* SEARCH */}

                        <div className="lg:col-span-2">

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Search
                            </label>

                            <div className="relative">

                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Student name, admission number, student ID..."
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                />

                            </div>

                        </div>


                        {/* STATUS */}

                        <div>

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(
                                        event.target.value
                                    );
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            >
                                <option value="">
                                    All Statuses
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                                <option value="transferred">
                                    Transferred
                                </option>

                                <option value="withdrawn">
                                    Withdrawn
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>

                        </div>


                        {/* ACADEMIC YEAR */}

                        <div>

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Academic Year
                            </label>

                            <select
                                value={academicYearFilter}
                                onChange={(event) => {
                                    setAcademicYearFilter(
                                        event.target.value
                                    );
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            >
                                <option value="">
                                    All Years
                                </option>

                                {academicYears.map((year) => (
                                    <option
                                        key={year.id}
                                        value={year.id}
                                    >
                                        {year.name}
                                    </option>
                                ))}
                            </select>

                        </div>


                        {/* CLASS */}

                        <div>

                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Class Level
                            </label>

                            <select
                                value={classFilter}
                                onChange={(event) => {
                                    setClassFilter(
                                        event.target.value
                                    );
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            >
                                <option value="">
                                    All Classes
                                </option>

                                {classLevels.map((classLevel) => (
                                    <option
                                        key={classLevel.id}
                                        value={classLevel.id}
                                    >
                                        {classLevel.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    RESULTS
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-gray-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="font-semibold text-gray-800">
                                Enrollment Records
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Showing{" "}
                                {filteredEnrollments.length === 0
                                    ? 0
                                    : (currentPage - 1) *
                                          itemsPerPage +
                                      1}{" "}
                                -{" "}
                                {Math.min(
                                    currentPage *
                                        itemsPerPage,
                                    filteredEnrollments.length
                                )}{" "}
                                of{" "}
                                {filteredEnrollments.length}{" "}
                                records
                            </p>

                        </div>

                        <div className="text-xs font-medium text-gray-500">
                            {statistics.active} active enrollment
                            {statistics.active === 1 ? "" : "s"}
                        </div>

                    </div>


                    {paginatedEnrollments.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <GraduationCap
                                size={42}
                                className="mx-auto text-gray-400"
                            />

                            <h3 className="mt-4 text-lg font-semibold text-gray-700">
                                No enrollment records found
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                {hasFilters
                                    ? "Try changing or clearing your filters."
                                    : "Enrollment records will appear here once they are created."}
                            </p>

                            {hasFilters ? (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-900"
                                >
                                    <X size={17} />
                                    Clear Filters
                                </button>
                            ) : (
                                <Link
                                    to="/sms/enrollments/add"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-900"
                                >
                                    <CalendarDays size={17} />
                                    Add Enrollment
                                </Link>
                            )}

                        </div>

                    ) : (

                        <>

                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto lg:block">

                                <table className="min-w-full">

                                    <thead className="bg-gray-200">

                                        <tr>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Student
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Academic Year
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Class
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Stream
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Enrollment Date
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-gray-200">

                                        {paginatedEnrollments.map(
                                            (enrollment) => {

                                                const student =
                                                    getEnrollmentStudent(
                                                        enrollment
                                                    );

                                                const studentId =
                                                    getStudentId(
                                                        enrollment
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            enrollment.id
                                                        }
                                                        className="transition hover:bg-purple-50"
                                                    >

                                                        {/* STUDENT */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                                                                    <User
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <Link
                                                                        to={`/sms/students/${studentId}`}
                                                                        className="block truncate text-sm font-semibold text-gray-800 hover:text-purple-700"
                                                                    >
                                                                        {
                                                                            getStudentName(
                                                                                student
                                                                            )
                                                                        }
                                                                    </Link>

                                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                                        {student?.admission_number ||
                                                                            "No admission number"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* YEAR */}

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-medium text-gray-800">
                                                                {getAcademicYearName(
                                                                    enrollment
                                                                )}
                                                            </p>

                                                        </td>


                                                        {/* CLASS */}

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-medium text-gray-800">
                                                                {getClassName(
                                                                    enrollment
                                                                )}
                                                            </p>

                                                        </td>


                                                        {/* STREAM */}

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm text-gray-700">
                                                                {getStreamName(
                                                                    enrollment
                                                                )}
                                                            </p>

                                                        </td>


                                                        {/* DATE */}

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm text-gray-700">
                                                                {formatDate(
                                                                    enrollment.enrollment_date
                                                                )}
                                                            </p>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td className="px-5 py-4">
                                                            <StatusBadge
                                                                status={
                                                                    enrollment.status
                                                                }
                                                            />
                                                        </td>


                                                        {/* ACTIONS */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex justify-end gap-2">

                                                                <Link
                                                                    to={`/sms/enrollments/${enrollment.id}`}
                                                                    title="View enrollment"
                                                                    className="rounded-lg bg-purple-100 p-2 text-purple-700 transition hover:bg-purple-200"
                                                                >
                                                                    <ArrowRight
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </Link>

                                                                <Link
                                                                    to={`/sms/enrollments/${enrollment.id}/edit`}
                                                                    title="Edit enrollment"
                                                                    className="rounded-lg bg-gray-200 p-2 text-gray-700 transition hover:bg-gray-300"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </Link>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* MOBILE CARDS */}

                            <div className="divide-y divide-gray-200 lg:hidden">

                                {paginatedEnrollments.map(
                                    (enrollment) => {

                                        const student =
                                            getEnrollmentStudent(
                                                enrollment
                                            );

                                        const studentId =
                                            getStudentId(
                                                enrollment
                                            );

                                        return (
                                            <div
                                                key={
                                                    enrollment.id
                                                }
                                                className="p-5 transition hover:bg-purple-50"
                                            >

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                                                            <User
                                                                size={
                                                                    19
                                                                }
                                                            />
                                                        </div>

                                                        <div className="min-w-0">

                                                            <Link
                                                                to={`/sms/students/${studentId}`}
                                                                className="block truncate text-sm font-bold text-gray-800 hover:text-purple-700"
                                                            >
                                                                {
                                                                    getStudentName(
                                                                        student
                                                                    )
                                                                }
                                                            </Link>

                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {student?.admission_number ||
                                                                    "No admission number"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                    <StatusBadge
                                                        status={
                                                            enrollment.status
                                                        }
                                                    />

                                                </div>


                                                <div className="mt-5 grid grid-cols-2 gap-4">

                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                            Academic Year
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {getAcademicYearName(
                                                                enrollment
                                                            )}
                                                        </p>
                                                    </div>


                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                            Class
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {getClassName(
                                                                enrollment
                                                            )}
                                                        </p>
                                                    </div>


                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                            Stream
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {getStreamName(
                                                                enrollment
                                                            )}
                                                        </p>
                                                    </div>


                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                            Enrolled
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {formatDate(
                                                                enrollment.enrollment_date
                                                            )}
                                                        </p>
                                                    </div>

                                                </div>


                                                <div className="mt-5 flex gap-2">

                                                    <Link
                                                        to={`/sms/enrollments/${enrollment.id}`}
                                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-100 px-3 py-2.5 text-sm font-semibold text-purple-800 transition hover:bg-purple-200"
                                                    >
                                                        View
                                                        <ArrowRight size={16} />
                                                    </Link>


                                                    <Link
                                                        to={`/sms/enrollments/${enrollment.id}/edit`}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </Link>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </>

                    )}


                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    {filteredEnrollments.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-gray-300 bg-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-gray-500">
                                Page {currentPage} of{" "}
                                {totalPages}
                            </p>


                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                Math.max(
                                                    1,
                                                    page - 1
                                                )
                                        )
                                    }
                                    disabled={
                                        currentPage === 1
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                Math.min(
                                                    totalPages,
                                                    page + 1
                                                )
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>
                    )}

                </section>


                {/* ==================================================
                    FOOTER NOTE
                ================================================== */}

                <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <School
                            size={20}
                            className="mt-0.5 shrink-0 text-purple-600"
                        />

                        <div>

                            <p className="text-sm font-semibold text-purple-900">
                                Enrollment History
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-purple-700">
                                Each enrollment represents a student's
                                academic placement for a specific academic
                                year. Previous enrollments should remain
                                unchanged so the student's complete academic
                                history can be preserved.
                            </p>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
};


export default EnrollmentsPage;

