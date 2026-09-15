import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    GraduationCap,
    Search,
    Plus,
    Eye,
    Edit,
    RefreshCw,
    X,
    CalendarDays,
    School,
    Users,
    CheckCircle,
    ArrowRightLeft,
} from "lucide-react";

const statusLabels = {
    active: "Active",
    completed: "Completed",
    transferred: "Transferred",
    withdrawn: "Withdrawn",
    inactive: "Inactive",
};

const statusColors = {
    active: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    transferred: "bg-blue-100 text-blue-800",
    withdrawn: "bg-red-100 text-red-800",
    inactive: "bg-gray-200 text-gray-700",
};

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

function formatDate(date) {
    if (!date) return "Not provided";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function StatCard({ icon: Icon, title, value, description }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {value}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        {description}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-700" />
                </div>
            </div>
        </div>
    );
}

export default function EnrollmentsPage() {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    const [streams, setStreams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [streamFilter, setStreamFilter] = useState("all");

    const [error, setError] = useState("");

    const loadData = async (isRefresh = false) => {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                enrollmentResponse,
                studentsResponse,
                yearsResponse,
                classesResponse,
                streamsResponse,
            ] = await Promise.all([
                axiosInstance.get("/students/enrollments/"),
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/academics/years/"),
                axiosInstance.get("/academics/class-levels/"),
                axiosInstance.get("/academics/streams/"),
            ]);

            setEnrollments(getResults(enrollmentResponse));
            setStudents(getResults(studentsResponse));
            setAcademicYears(getResults(yearsResponse));
            setClassLevels(getResults(classesResponse));
            setStreams(getResults(streamsResponse));
        } catch (err) {
            console.error(
                "Failed to load enrollments:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Failed to load enrollment information."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const studentMap = useMemo(() => {
        return Object.fromEntries(
            students.map((student) => [
                student.id,
                student,
            ])
        );
    }, [students]);

    const yearMap = useMemo(() => {
        return Object.fromEntries(
            academicYears.map((year) => [
                year.id,
                year,
            ])
        );
    }, [academicYears]);

    const classMap = useMemo(() => {
        return Object.fromEntries(
            classLevels.map((classLevel) => [
                classLevel.id,
                classLevel,
            ])
        );
    }, [classLevels]);

    const streamMap = useMemo(() => {
        return Object.fromEntries(
            streams.map((stream) => [
                stream.id,
                stream,
            ])
        );
    }, [streams]);

    const enrichedEnrollments = useMemo(() => {
        return enrollments.map((enrollment) => ({
            ...enrollment,

            studentObject:
                studentMap[enrollment.student],

            academicYearObject:
                yearMap[enrollment.academic_year],

            classObject:
                classMap[enrollment.class_level],

            streamObject:
                streamMap[enrollment.stream],
        }));
    }, [
        enrollments,
        studentMap,
        yearMap,
        classMap,
        streamMap,
    ]);

    const filteredEnrollments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return enrichedEnrollments.filter((enrollment) => {
            const student =
                enrollment.studentObject;

            const year =
                enrollment.academicYearObject;

            const classLevel =
                enrollment.classObject;

            const stream =
                enrollment.streamObject;

            const studentName =
                getStudentName(student).toLowerCase();

            const admissionNumber =
                student?.admission_number?.toLowerCase() ||
                "";

            const studentId =
                student?.student_id?.toLowerCase() ||
                "";

            const yearName =
                year?.name?.toLowerCase() || "";

            const className =
                classLevel?.name?.toLowerCase() || "";

            const classCode =
                classLevel?.code?.toLowerCase() || "";

            const streamName =
                stream?.name?.toLowerCase() || "";

            const streamCode =
                stream?.code?.toLowerCase() || "";

            const matchesSearch =
                !query ||
                studentName.includes(query) ||
                admissionNumber.includes(query) ||
                studentId.includes(query) ||
                yearName.includes(query) ||
                className.includes(query) ||
                classCode.includes(query) ||
                streamName.includes(query) ||
                streamCode.includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                enrollment.status === statusFilter;

            const matchesYear =
                yearFilter === "all" ||
                String(enrollment.academic_year) ===
                    String(yearFilter);

            const matchesClass =
                classFilter === "all" ||
                String(enrollment.class_level) ===
                    String(classFilter);

            const matchesStream =
                streamFilter === "all" ||
                String(enrollment.stream) ===
                    String(streamFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesYear &&
                matchesClass &&
                matchesStream
            );
        });
    }, [
        enrichedEnrollments,
        search,
        statusFilter,
        yearFilter,
        classFilter,
        streamFilter,
    ]);

    const stats = useMemo(() => {
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
        };
    }, [enrollments]);

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setYearFilter("all");
        setClassFilter("all");
        setStreamFilter("all");
    };

    const hasFilters =
        search ||
        statusFilter !== "all" ||
        yearFilter !== "all" ||
        classFilter !== "all" ||
        streamFilter !== "all";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* HEADER */}
            <div className="bg-purple-800 rounded-2xl p-6 md:p-7 shadow-lg mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 rounded-xl bg-purple-700 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>

                            <div>
                                <p className="text-purple-200 text-sm">
                                    Student Management
                                </p>

                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Enrollment Management
                                </h1>
                            </div>
                        </div>

                        <p className="text-purple-100 max-w-2xl text-sm md:text-base">
                            Manage student enrollment history,
                            academic-year placement, class levels and
                            streams.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-medium transition disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Refresh
                        </button>

                        <Link
                            to="/sms/enrollments/add"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-white text-purple-800 font-semibold transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Enrollment
                        </Link>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircleIcon />

                    <div>
                        <p className="font-semibold text-red-800">
                            Something went wrong
                        </p>

                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={Users}
                    title="Total Enrollments"
                    value={stats.total}
                    description="All enrollment records"
                />

                <StatCard
                    icon={CheckCircle}
                    title="Active"
                    value={stats.active}
                    description="Currently enrolled"
                />

                <StatCard
                    icon={GraduationCap}
                    title="Completed"
                    value={stats.completed}
                    description="Completed academic placement"
                />

                <StatCard
                    icon={ArrowRightLeft}
                    title="Transferred"
                    value={stats.transferred}
                    description="Transferred out"
                />
            </div>

            {/* FILTERS */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    {/* SEARCH */}
                    <div className="relative md:col-span-2 xl:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search student..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                    </div>

                    {/* YEAR */}
                    <select
                        value={yearFilter}
                        onChange={(e) =>
                            setYearFilter(e.target.value)
                        }
                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">
                            All Academic Years
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

                    {/* CLASS */}
                    <select
                        value={classFilter}
                        onChange={(e) =>
                            setClassFilter(e.target.value)
                        }
                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">
                            All Class Levels
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

                    {/* STREAM */}
                    <select
                        value={streamFilter}
                        onChange={(e) =>
                            setStreamFilter(e.target.value)
                        }
                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">
                            All Streams
                        </option>

                        {streams.map((stream) => (
                            <option
                                key={stream.id}
                                value={stream.id}
                            >
                                {stream.name}
                            </option>
                        ))}
                    </select>

                    {/* STATUS */}
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="all">
                                All Statuses
                            </option>

                            {Object.entries(statusLabels).map(
                                ([value, label]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>
                                )
                            )}
                        </select>

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                title="Clear filters"
                                className="w-12 rounded-xl bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-gray-900">
                            Enrollment Records
                        </h2>

                        <p className="text-sm text-gray-500 mt-0.5">
                            Showing{" "}
                            {filteredEnrollments.length} of{" "}
                            {enrollments.length} records
                        </p>
                    </div>

                    <Link
                        to="/sms/enrollments/add"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Enrollment
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw className="w-8 h-8 text-purple-700 animate-spin mx-auto" />

                        <p className="mt-3 text-gray-500">
                            Loading enrollment records...
                        </p>
                    </div>
                ) : filteredEnrollments.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-purple-700" />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                            No enrollment records found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            {hasFilters
                                ? "No enrollments match your current filters."
                                : "No student enrollments have been created yet."}
                        </p>

                        {hasFilters ? (
                            <button
                                onClick={clearFilters}
                                className="mt-5 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <Link
                                to="/sms/enrollments/add"
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add First Enrollment
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* DESKTOP */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-800 text-white text-left text-sm">
                                        <th className="px-5 py-4 font-semibold">
                                            Student
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Academic Year
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Class
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Stream
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Enrollment Date
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {filteredEnrollments.map(
                                        (enrollment) => {
                                            const student =
                                                enrollment.studentObject;

                                            const year =
                                                enrollment.academicYearObject;

                                            const classLevel =
                                                enrollment.classObject;

                                            const stream =
                                                enrollment.streamObject;

                                            return (
                                                <tr
                                                    key={enrollment.id}
                                                    className="hover:bg-purple-50/50 transition"
                                                >
                                                    {/* STUDENT */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                                <GraduationCap className="w-5 h-5 text-purple-700" />
                                                            </div>

                                                            <div>
                                                                <Link
                                                                    to={`/sms/students/${student?.id}`}
                                                                    className="font-semibold text-gray-900 hover:text-purple-700"
                                                                >
                                                                    {getStudentName(
                                                                        student
                                                                    )}
                                                                </Link>

                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {student?.admission_number ||
                                                                        student?.student_id ||
                                                                        "No ID"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* YEAR */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <CalendarDays className="w-4 h-4 text-purple-600" />

                                                            {year?.name ||
                                                                enrollment.academic_year ||
                                                                "Not assigned"}
                                                        </div>
                                                    </td>

                                                    {/* CLASS */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <School className="w-4 h-4 text-purple-600" />

                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {classLevel?.name ||
                                                                        "Not assigned"}
                                                                </p>

                                                                {classLevel?.code && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            classLevel.code
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* STREAM */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-gray-700">
                                                            {stream?.name ||
                                                                "No stream"}
                                                        </span>

                                                        {stream?.code && (
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    stream.code
                                                                }
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* DATE */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {formatDate(
                                                            enrollment.enrollment_date
                                                        )}
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                statusColors[
                                                                    enrollment
                                                                        .status
                                                                ] ||
                                                                "bg-gray-200 text-gray-700"
                                                            }`}
                                                        >
                                                            {statusLabels[
                                                                enrollment
                                                                    .status
                                                            ] ||
                                                                enrollment.status}
                                                        </span>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/sms/enrollments/${enrollment.id}`}
                                                                title="View enrollment"
                                                                className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-purple-100 text-gray-700 hover:text-purple-700 flex items-center justify-center transition"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>

                                                            <Link
                                                                to={`/sms/enrollments/${enrollment.id}/edit`}
                                                                title="Edit enrollment"
                                                                className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition"
                                                            >
                                                                <Edit className="w-4 h-4" />
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

                        {/* MOBILE */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {filteredEnrollments.map(
                                (enrollment) => {
                                    const student =
                                        enrollment.studentObject;

                                    const year =
                                        enrollment.academicYearObject;

                                    const classLevel =
                                        enrollment.classObject;

                                    const stream =
                                        enrollment.streamObject;

                                    return (
                                        <div
                                            key={enrollment.id}
                                            className="p-5 hover:bg-purple-50/40 transition"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                                        <GraduationCap className="w-5 h-5 text-purple-700" />
                                                    </div>

                                                    <div>
                                                        <Link
                                                            to={`/sms/students/${student?.id}`}
                                                            className="font-bold text-gray-900 hover:text-purple-700"
                                                        >
                                                            {getStudentName(
                                                                student
                                                            )}
                                                        </Link>

                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {student?.admission_number ||
                                                                student?.student_id ||
                                                                "No ID"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        statusColors[
                                                            enrollment.status
                                                        ] ||
                                                        "bg-gray-200 text-gray-700"
                                                    }`}
                                                >
                                                    {statusLabels[
                                                        enrollment.status
                                                    ] ||
                                                        enrollment.status}
                                                </span>
                                            </div>

                                            <div className="grid sm:grid-cols-3 gap-3 mt-4">
                                                <div className="bg-gray-100 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500">
                                                        Academic Year
                                                    </p>

                                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                                        {year?.name ||
                                                            "Not assigned"}
                                                    </p>
                                                </div>

                                                <div className="bg-gray-100 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500">
                                                        Class
                                                    </p>

                                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                                        {classLevel?.name ||
                                                            "Not assigned"}
                                                    </p>
                                                </div>

                                                <div className="bg-gray-100 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500">
                                                        Stream
                                                    </p>

                                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                                        {stream?.name ||
                                                            "No stream"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-xs text-gray-500">
                                                    Enrolled{" "}
                                                    {formatDate(
                                                        enrollment.enrollment_date
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/sms/enrollments/${enrollment.id}`}
                                                        className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-purple-100 text-gray-700 hover:text-purple-700 flex items-center justify-center"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>

                                                    <Link
                                                        to={`/sms/enrollments/${enrollment.id}/edit`}
                                                        className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function AlertCircleIcon() {
    return (
        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-700 font-bold">!</span>
        </div>
    );
}