import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    Search,
    RefreshCw,
    UserPlus,
    Eye,
    Pencil,
    Users,
    UserCheck,
    UserX,
    GraduationCap,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
} from "lucide-react";


// ============================================================
// HELPERS
// ============================================================

const getResults = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.results || [];
};


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
            return "bg-gray-100 text-gray-500 border-gray-200";

        default:
            return "bg-gray-100 text-gray-600 border-gray-200";
    }
};


// ============================================================
// COMPONENT
// ============================================================

const StudentsPage = () => {
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    // ========================================================
    // FETCH STUDENTS
    // ========================================================

    const fetchStudents = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axiosInstance.get(
                "/students/students/"
            );

            const results = getResults(response.data);

            setStudents(results);
        } catch (err) {
            console.error("Failed to fetch students:", err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load students. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        fetchStudents();
    }, []);


    // ========================================================
    // FILTER STUDENTS
    // ========================================================

    const filteredStudents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return students.filter((student) => {
            const name = getStudentName(student).toLowerCase();

            const admissionNumber =
                student.admission_number?.toLowerCase() || "";

            const studentId =
                student.student_id?.toLowerCase() || "";

            const matchesSearch =
                !search ||
                name.includes(search) ||
                admissionNumber.includes(search) ||
                studentId.includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                student.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, searchTerm, statusFilter]);


    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / itemsPerPage)
    );

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);


    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {
        const active = students.filter(
            (student) => student.status === "active"
        ).length;

        const inactive = students.filter(
            (student) => student.status === "inactive"
        ).length;

        const graduated = students.filter(
            (student) => student.status === "graduated"
        ).length;

        const transferred = students.filter(
            (student) => student.status === "transferred"
        ).length;

        return {
            total: students.length,
            active,
            inactive,
            graduated,
            transferred,
        };
    }, [students]);


    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
    };


    // ========================================================
    // LOADING STATE
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">

                    <div className="h-10 w-72 bg-gray-200 rounded-lg animate-pulse mb-3" />

                    <div className="h-5 w-96 bg-gray-200 rounded-lg animate-pulse mb-8" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-28 bg-gray-200 rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>

                    <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

            <div className="max-w-7xl mx-auto">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                    <div>

                        <Link
                            to="/student-management"
                            className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium mb-3"
                        >
                            <ArrowLeft size={17} />
                            Student Management
                        </Link>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Students
                        </h1>

                        <p className="text-gray-500 mt-1">
                            View and manage all students registered in the school.
                        </p>

                    </div>


                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={() => fetchStudents(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "animate-spin" : ""}
                            />

                            Refresh
                        </button>


                        <Link
                            to="/sms/students/add"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition shadow-sm"
                        >
                            <UserPlus size={18} />

                            Add Student
                        </Link>

                    </div>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <p className="font-semibold">
                                    Unable to load students
                                </p>

                                <p className="text-sm mt-1">
                                    {error}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fetchStudents()}
                                className="text-sm font-semibold underline"
                            >
                                Retry
                            </button>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                    {/* Total */}

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Total Students
                                </p>

                                <p className="text-3xl font-bold text-gray-800 mt-2">
                                    {statistics.total}
                                </p>

                            </div>

                            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                <Users size={23} />
                            </div>

                        </div>

                    </div>


                    {/* Active */}

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Active Students
                                </p>

                                <p className="text-3xl font-bold text-purple-700 mt-2">
                                    {statistics.active}
                                </p>

                            </div>

                            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                <UserCheck size={23} />
                            </div>

                        </div>

                    </div>


                    {/* Inactive */}

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Inactive
                                </p>

                                <p className="text-3xl font-bold text-gray-700 mt-2">
                                    {statistics.inactive}
                                </p>

                            </div>

                            <div className="h-12 w-12 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center">
                                <UserX size={23} />
                            </div>

                        </div>

                    </div>


                    {/* Graduated */}

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Graduated
                                </p>

                                <p className="text-3xl font-bold text-gray-700 mt-2">
                                    {statistics.graduated}
                                </p>

                            </div>

                            <div className="h-12 w-12 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center">
                                <GraduationCap size={23} />
                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    SEARCH + FILTERS
                ================================================== */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mb-6">

                    <div className="p-4 sm:p-5">

                        <div className="flex flex-col lg:flex-row gap-4">

                            {/* Search */}

                            <div className="relative flex-1">

                                <Search
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search by name, admission number or student ID..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />

                            </div>


                            {/* Status */}

                            <div className="relative lg:w-56">

                                <Filter
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full appearance-none pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="all">
                                        All Statuses
                                    </option>

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                    <option value="graduated">
                                        Graduated
                                    </option>

                                    <option value="transferred">
                                        Transferred
                                    </option>

                                    <option value="withdrawn">
                                        Withdrawn
                                    </option>
                                </select>

                            </div>


                            {/* Clear */}

                            {(searchTerm || statusFilter !== "all") && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                                >
                                    <X size={17} />
                                    Clear
                                </button>
                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    RESULTS SUMMARY
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                    <div>
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-700">
                                {paginatedStudents.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-700">
                                {filteredStudents.length}
                            </span>{" "}
                            students
                        </p>
                    </div>

                    {(searchTerm || statusFilter !== "all") && (
                        <p className="text-sm text-purple-700 font-medium">
                            Filters applied
                        </p>
                    )}

                </div>


                {/* ==================================================
                    STUDENTS TABLE
                ================================================== */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    {paginatedStudents.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                                <Users size={28} />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">
                                No students found
                            </h3>

                            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try changing your search or filters."
                                    : "There are currently no students registered in the system."}
                            </p>

                            {(searchTerm || statusFilter !== "all") && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-medium hover:bg-purple-800 transition"
                                >
                                    <X size={17} />
                                    Clear Filters
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[900px]">

                                <thead className="bg-gray-200 border-b border-gray-300">

                                    <tr>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Student
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Admission No.
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Student ID
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Family
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Date of Birth
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-600">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-gray-200">

                                    {paginatedStudents.map((student) => (

                                        <tr
                                            key={student.id}
                                            className="hover:bg-purple-50/50 transition"
                                        >

                                            {/* Student */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                                                        {getStudentName(student)
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>

                                                        <p className="font-semibold text-gray-800">
                                                            {getStudentName(student)}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {student.gender || "Gender not specified"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Admission */}

                                            <td className="px-5 py-4">

                                                <span className="font-medium text-gray-700">
                                                    {student.admission_number || "—"}
                                                </span>

                                            </td>


                                            {/* Student ID */}

                                            <td className="px-5 py-4">

                                                <span className="text-sm text-gray-600">
                                                    {student.student_id || "—"}
                                                </span>

                                            </td>


                                            {/* Family */}

                                            <td className="px-5 py-4">

                                                <span className="text-sm text-gray-600">
                                                    {student.family_name ||
                                                        student.family?.family_name ||
                                                        "—"}
                                                </span>

                                            </td>


                                            {/* DOB */}

                                            <td className="px-5 py-4">

                                                <span className="text-sm text-gray-600">
                                                    {student.date_of_birth
                                                        ? new Date(
                                                              student.date_of_birth
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                                                        student.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        student.status
                                                    )}
                                                </span>

                                            </td>


                                            {/* Actions */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-end gap-2">

                                                    <Link
                                                        to={`/sms/students/${student.id}`}
                                                        title="View Student"
                                                        className="h-9 w-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-purple-100 hover:text-purple-700 transition"
                                                    >
                                                        <Eye size={17} />
                                                    </Link>


                                                    <Link
                                                        to={`/sms/students/${student.id}/edit`}
                                                        title="Edit Student"
                                                        className="h-9 w-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-purple-100 hover:text-purple-700 transition"
                                                    >
                                                        <Pencil size={17} />
                                                    </Link>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {filteredStudents.length > itemsPerPage && (

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">

                        <p className="text-sm text-gray-500">
                            Page{" "}
                            <span className="font-semibold text-gray-700">
                                {currentPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-700">
                                {totalPages}
                            </span>
                        </p>


                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.max(1, page - 1)
                                    )
                                }
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>


                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.min(totalPages, page + 1)
                                    )
                                }
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-700 text-white font-medium hover:bg-purple-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
};


export default StudentsPage;

