import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

import {
    Users,
    UserPlus,
    GraduationCap,
    UserCheck,
    UserX,
    ArrowRight,
    Search,
    RefreshCw,
    School,
    Home,
    CalendarDays,
    AlertCircle,
    UserRound,
    FileText,
    GitBranch,
    ChevronRight,
} from "lucide-react";


const StudentsDashboard = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [students, setStudents] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");


    // ============================================================
    // API HELPERS
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


    // ============================================================
    // FETCH DASHBOARD DATA
    // ============================================================

    const fetchDashboardData = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                studentsResponse,
                enrollmentsResponse,
            ] = await Promise.all([
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/students/enrollments/"),
            ]);

            setStudents(getResults(studentsResponse));
            setEnrollments(getResults(enrollmentsResponse));

        } catch (err) {

            console.error(
                "Error loading students dashboard:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load student dashboard information."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {
        fetchDashboardData();
    }, []);


    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    const statistics = useMemo(() => {

        const totalStudents = students.length;

        const activeStudents = students.filter(
            (student) => student.status === "active"
        ).length;

        const inactiveStudents = students.filter(
            (student) => student.status === "inactive"
        ).length;

        const graduatedStudents = students.filter(
            (student) => student.status === "graduated"
        ).length;

        const transferredStudents = students.filter(
            (student) => student.status === "transferred"
        ).length;

        const withdrawnStudents = students.filter(
            (student) => student.status === "withdrawn"
        ).length;

        const activeEnrollments = enrollments.filter(
            (enrollment) => enrollment.status === "active"
        ).length;

        return {
            totalStudents,
            activeStudents,
            inactiveStudents,
            graduatedStudents,
            transferredStudents,
            withdrawnStudents,
            activeEnrollments,
        };

    }, [students, enrollments]);


    // ============================================================
    // RECENT STUDENTS
    // ============================================================

    const recentStudents = useMemo(() => {

        return [...students]
            .sort((a, b) => {

                const dateA = new Date(
                    a.created_at || 0
                );

                const dateB = new Date(
                    b.created_at || 0
                );

                return dateB - dateA;

            })
            .slice(0, 5);

    }, [students]);


    // ============================================================
    // ENROLLMENT OVERVIEW
    // ============================================================

    const enrollmentOverview = useMemo(() => {

        const classCounts = {};

        enrollments
            .filter(
                (enrollment) =>
                    enrollment.status === "active"
            )
            .forEach((enrollment) => {

                const className =
                    enrollment.class_level_name ||
                    enrollment.class_level?.name ||
                    "Unassigned";

                if (!classCounts[className]) {
                    classCounts[className] = 0;
                }

                classCounts[className] += 1;

            });

        return Object.entries(classCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

    }, [enrollments]);


    // ============================================================
    // NAME HELPERS
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


    const getInitials = (student) => {

        const name = getStudentName(student);

        const parts = name
            .split(" ")
            .filter(Boolean);

        if (parts.length === 0) {
            return "ST";
        }

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    };


    // ============================================================
    // STATUS BADGE
    // ============================================================

    const getStatusBadge = (status) => {

        const styles = {

            active:
                "bg-purple-100 text-purple-700 border-purple-200",

            inactive:
                "bg-gray-200 text-gray-600 border-gray-300",

            graduated:
                "bg-purple-200 text-purple-800 border-purple-300",

            transferred:
                "bg-gray-200 text-gray-700 border-gray-300",

            withdrawn:
                "bg-gray-200 text-gray-700 border-gray-300",

        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                    styles[status] ||
                    "bg-gray-100 text-gray-600 border-gray-200"
                }`}
            >
                {status
                    ? status.charAt(0).toUpperCase() +
                      status.slice(1)
                    : "Unknown"}
            </span>
        );

    };


    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <div className="mb-8">

                    <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-300" />

                    <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-300" />

                </div>


                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {[1, 2, 3, 4].map((item) => (

                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-2xl bg-gray-200"
                        />

                    ))}

                </div>


                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

                    <div className="h-96 animate-pulse rounded-2xl bg-gray-200 xl:col-span-2" />

                    <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />

                </div>

            </div>
        );

    }


    // ============================================================
    // ERROR STATE
    // ============================================================

    if (error) {

        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <div className="flex min-h-[500px] items-center justify-center">

                    <div className="max-w-md rounded-2xl border border-gray-300 bg-gray-50 p-8 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">

                            <AlertCircle className="h-7 w-7 text-purple-600" />

                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-gray-900">
                            Unable to load dashboard
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchDashboardData()
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
                        >

                            <RefreshCw className="h-4 w-4" />

                            Try Again

                        </button>

                    </div>

                </div>

            </div>
        );

    }


    // ============================================================
    // DASHBOARD
    // ============================================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* ====================================================
                PAGE HEADER
            ==================================================== */}

            <div className="border-b border-purple-900 bg-purple-800">

                <div className="px-6 py-7 lg:px-8">

                    {/* BREADCRUMB */}

                    <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">

                        <Link
                            to="/dashboard/headteacher"
                            className="text-purple-200 transition hover:text-white"
                        >
                            Head Teacher
                        </Link>

                        <ChevronRight className="h-4 w-4 text-purple-300" />

                        <span className="font-medium text-white">
                            Student Management
                        </span>

                    </div>


                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div>

                            <div className="flex items-center gap-2 text-sm text-purple-200">

                                <School className="h-4 w-4" />

                                <span>
                                    School Management System
                                </span>

                            </div>


                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">

                                Student Management

                            </h1>


                            <p className="mt-1 max-w-2xl text-sm text-purple-100">

                                Manage the complete student lifecycle,
                                from admission and family records to
                                enrollment, documents and progression.

                            </p>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <button
                                onClick={() =>
                                    fetchDashboardData(true)
                                }
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500 bg-purple-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-purple-700 shadow-sm transition hover:bg-purple-50"
                            >

                                <Search className="h-4 w-4" />

                                View Students

                            </Link>


                            <Link
                                to="/sms/students/add"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
                            >

                                <UserPlus className="h-4 w-4" />

                                Add Student

                            </Link>

                        </div>

                    </div>

                </div>

            </div>


            {/* ====================================================
                MANAGEMENT NAVIGATION
            ==================================================== */}

            <div className="border-b border-gray-300 bg-gray-200">

                <div className="px-6 py-4 lg:px-8">

                    <div className="flex flex-wrap items-center gap-2">

                        <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Student Management
                        </span>


                        <Link
                            to="/sms/students"
                            className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-3 py-2 text-xs font-medium text-white shadow-sm"
                        >
                            <Users className="h-4 w-4" />
                            Students
                        </Link>


                        <ChevronRight className="h-4 w-4 text-gray-400" />


                        <Link
                            to="/sms/families"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <Home className="h-4 w-4" />
                            Families
                        </Link>


                        <ChevronRight className="h-4 w-4 text-gray-400" />


                        <Link
                            to="/sms/parents"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <UserRound className="h-4 w-4" />
                            Parents
                        </Link>


                        <ChevronRight className="h-4 w-4 text-gray-400" />


                        <Link
                            to="/sms/enrollments"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <CalendarDays className="h-4 w-4" />
                            Enrollments
                        </Link>


                        <ChevronRight className="h-4 w-4 text-gray-400" />


                        <Link
                            to="/sms/documents"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <FileText className="h-4 w-4" />
                            Documents
                        </Link>


                        <ChevronRight className="h-4 w-4 text-gray-400" />


                        <Link
                            to="/sms/progression"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                        >
                            <GitBranch className="h-4 w-4" />
                            Progression
                        </Link>

                    </div>

                </div>

            </div>


            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <main className="px-6 py-7 lg:px-8">


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">


                    {/* TOTAL STUDENTS */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Total Students
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {statistics.totalStudents}
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    All student records
                                </p>

                            </div>


                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">

                                <Users className="h-5 w-5 text-purple-700" />

                            </div>

                        </div>

                    </div>


                    {/* ACTIVE STUDENTS */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Active Students
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {statistics.activeStudents}
                                </p>

                                <p className="mt-2 text-xs text-purple-600">
                                    Currently active
                                </p>

                            </div>


                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">

                                <UserCheck className="h-5 w-5 text-purple-700" />

                            </div>

                        </div>

                    </div>


                    {/* ACTIVE ENROLLMENTS */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Active Enrollments
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {statistics.activeEnrollments}
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    Current placements
                                </p>

                            </div>


                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">

                                <GraduationCap className="h-5 w-5 text-purple-700" />

                            </div>

                        </div>

                    </div>


                    {/* INACTIVE / EXITED */}

                    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-gray-500">
                                    Inactive / Exited
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">

                                    {
                                        statistics.inactiveStudents +
                                        statistics.graduatedStudents +
                                        statistics.transferredStudents +
                                        statistics.withdrawnStudents
                                    }

                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    No longer active
                                </p>

                            </div>


                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200">

                                <UserX className="h-5 w-5 text-gray-700" />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    STUDENT MANAGEMENT WORKFLOW
                ================================================== */}

                <section className="mt-8">

                    <div className="mb-4">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Student Management Workflow
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Follow the student record from registration
                            through enrollment, supporting documents and
                            academic progression.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">


                        {/* STUDENTS */}

                        <Link
                            to="/sms/students"
                            className="group rounded-xl border border-purple-300 bg-purple-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-500 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-200">

                                    <Users className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-purple-400 transition group-hover:translate-x-1 group-hover:text-purple-700" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-600">
                                Step 1
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Students
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Student profiles and records.
                            </p>

                        </Link>


                        {/* FAMILIES */}

                        <Link
                            to="/sms/families"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">

                                    <Home className="h-5 w-5 text-gray-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Step 2
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Families
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Household and residence details.
                            </p>

                        </Link>


                        {/* PARENTS */}

                        <Link
                            to="/sms/parents"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">

                                    <UserRound className="h-5 w-5 text-gray-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Step 3
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Parents & Guardians
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Parent relationships and contacts.
                            </p>

                        </Link>


                        {/* ENROLLMENTS */}

                        <Link
                            to="/sms/enrollments"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <CalendarDays className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-600">
                                Step 4
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Enrollments
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Academic year, class and stream.
                            </p>

                        </Link>


                        {/* DOCUMENTS */}

                        <Link
                            to="/sms/documents"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <FileText className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-600">
                                Step 5
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Documents
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Supporting student documents.
                            </p>

                        </Link>


                        {/* PROGRESSION */}

                        <Link
                            to="/sms/progression"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <GitBranch className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>


                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-600">
                                Step 6
                            </p>

                            <h3 className="mt-1 font-semibold text-gray-900">
                                Progression
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Promote, repeat or exit students.
                            </p>

                        </Link>

                    </div>

                </section>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <section className="mt-8">

                    <div className="mb-4">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Frequently used student management actions.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


                        <Link
                            to="/sms/students/add"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <UserPlus className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Add Student
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Register a new student.
                            </p>

                        </Link>


                        <Link
                            to="/sms/families/add"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">

                                    <Home className="h-5 w-5 text-gray-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Add Family
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Create a household record.
                            </p>

                        </Link>


                        <Link
                            to="/sms/parents"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <UserRound className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Manage Parents
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                View parents and guardians.
                            </p>

                        </Link>


                        <Link
                            to="/sms/enrollments"
                            className="group rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                        >

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">

                                    <GraduationCap className="h-5 w-5 text-purple-700" />

                                </div>

                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-purple-600" />

                            </div>

                            <h3 className="mt-4 font-semibold text-gray-900">
                                Manage Enrollments
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage classes and streams.
                            </p>

                        </Link>

                    </div>

                </section>


                {/* ==================================================
                    LOWER CONTENT
                ================================================== */}

                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">


                    {/* =================================================
                        RECENT STUDENTS
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 shadow-sm xl:col-span-2">

                        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-5">

                            <div>

                                <h2 className="font-semibold text-gray-900">
                                    Recently Added Students
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    The latest student records added to the system.
                                </p>

                            </div>


                            <Link
                                to="/sms/students"
                                className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                            >

                                View All

                                <ArrowRight className="h-4 w-4" />

                            </Link>

                        </div>


                        <div className="divide-y divide-gray-200">

                            {recentStudents.length === 0 ? (

                                <div className="px-6 py-12 text-center">

                                    <Users className="mx-auto h-8 w-8 text-gray-400" />

                                    <p className="mt-3 text-sm font-medium text-gray-600">
                                        No students found
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Student records will appear here once
                                        they are added.
                                    </p>

                                </div>

                            ) : (

                                recentStudents.map((student) => (

                                    <Link
                                        key={student.id}
                                        to={`/sms/students/${student.id}`}
                                        className="flex items-center justify-between px-6 py-4 transition hover:bg-purple-50"
                                    >

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">

                                                {getInitials(student)}

                                            </div>


                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-gray-900">

                                                    {getStudentName(student)}

                                                </p>


                                                <p className="mt-0.5 text-xs text-gray-500">

                                                    {
                                                        student.admission_number ||
                                                        "No admission number"
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        <div className="ml-4 flex items-center gap-3">

                                            {getStatusBadge(
                                                student.status
                                            )}

                                            <ArrowRight className="hidden h-4 w-4 text-gray-400 sm:block" />

                                        </div>

                                    </Link>

                                ))

                            )}

                        </div>

                    </section>


                    {/* =================================================
                        ENROLLMENT OVERVIEW
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-300 bg-gray-50 shadow-sm">

                        <div className="border-b border-gray-300 px-6 py-5">

                            <h2 className="font-semibold text-gray-900">
                                Enrollment Overview
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Active students by class.
                            </p>

                        </div>


                        <div className="p-6">

                            {enrollmentOverview.length === 0 ? (

                                <div className="py-10 text-center">

                                    <GraduationCap className="mx-auto h-8 w-8 text-gray-400" />

                                    <p className="mt-3 text-sm font-medium text-gray-600">
                                        No active enrollments
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Enrollment information will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-5">

                                    {enrollmentOverview.map(
                                        ([className, count]) => {

                                            const percentage =
                                                statistics.activeEnrollments > 0
                                                    ? Math.round(
                                                          (count /
                                                              statistics.activeEnrollments) *
                                                              100
                                                      )
                                                    : 0;

                                            return (

                                                <div key={className}>

                                                    <div className="mb-2 flex items-center justify-between">

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {className}
                                                        </span>

                                                        <span className="text-sm font-semibold text-purple-700">
                                                            {count}
                                                        </span>

                                                    </div>


                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-300">

                                                        <div
                                                            className="h-full rounded-full bg-purple-600 transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}


                            <Link
                                to="/sms/enrollments"
                                className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
                            >

                                View Enrollment Records

                                <ArrowRight className="h-4 w-4" />

                            </Link>

                        </div>

                    </section>

                </div>


                {/* ==================================================
                    STUDENT STATUS SUMMARY
                ================================================== */}

                <section className="mt-6 rounded-2xl border border-gray-300 bg-gray-50 shadow-sm">

                    <div className="border-b border-gray-300 px-6 py-5">

                        <h2 className="font-semibold text-gray-900">
                            Student Status Summary
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Current breakdown of student records.
                        </p>

                    </div>


                    <div className="grid grid-cols-2 divide-x divide-gray-300 sm:grid-cols-4">

                        <div className="px-6 py-5">

                            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                                Active
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {statistics.activeStudents}
                            </p>

                        </div>


                        <div className="px-6 py-5">

                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Graduated
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {statistics.graduatedStudents}
                            </p>

                        </div>


                        <div className="px-6 py-5">

                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Transferred
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {statistics.transferredStudents}
                            </p>

                        </div>


                        <div className="px-6 py-5">

                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Withdrawn
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {statistics.withdrawnStudents}
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    BOTTOM NOTE
                ================================================== */}

                <div className="mt-8 rounded-xl border border-purple-200 bg-purple-50 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <School className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />

                        <div>

                            <p className="text-sm font-semibold text-purple-900">
                                Student Management Foundation
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-purple-700">

                                The student record is the permanent identity
                                of the learner. Family, parent relationships,
                                academic enrollments, documents, emergency
                                contacts and progression history are managed
                                separately so that the student's history is
                                preserved across academic years.

                            </p>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
};


export default StudentsDashboard;

