import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

import {
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Layers,
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
} from "lucide-react";


const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [expandedDepartments, setExpandedDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // ---------------------------------------------------------
    // Load departments
    // ---------------------------------------------------------
    const fetchDepartments = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axiosInstance.get(
                "/receipts/departments/"
            );

            setDepartments(response.data || []);
        } catch (err) {
            console.error("Failed to load departments:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load departments. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // ---------------------------------------------------------
    // Expand / collapse
    // ---------------------------------------------------------
    const toggleDepartment = (departmentId) => {
        setExpandedDepartments((prev) => ({
            ...prev,
            [departmentId]: !prev[departmentId],
        }));
    };

    // ---------------------------------------------------------
    // Delete department
    // ---------------------------------------------------------
    const handleDeleteDepartment = async (department) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${department.name}"?\n\n` +
                "This will also delete its subdepartments. " +
                "Departments that are already being used by receipts or inventory " +
                "may not be deletable."
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                `/receipts/departments/${department.id}/`
            );

            await fetchDepartments(true);
        } catch (err) {
            console.error("Failed to delete department:", err);

            const message =
                err.response?.data?.detail ||
                "Unable to delete this department. It may already be in use.";

            alert(message);
        }
    };

    // ---------------------------------------------------------
    // Delete subdepartment
    // ---------------------------------------------------------
    const handleDeleteSubDepartment = async (subdepartment) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${subdepartment.name}"?`
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                `/receipts/subdepartments/${subdepartment.id}/`
            );

            await fetchDepartments(true);
        } catch (err) {
            console.error("Failed to delete subdepartment:", err);

            const message =
                err.response?.data?.detail ||
                "Unable to delete this subdepartment. It may already be in use.";

            alert(message);
        }
    };

    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-green-700" />

                            <p className="text-sm text-gray-500">
                                Loading departments...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Stats
    // ---------------------------------------------------------
    const activeDepartments = departments.filter(
        (department) => department.is_active
    ).length;

    const inactiveDepartments = departments.filter(
        (department) => !department.is_active
    ).length;

    const totalSubDepartments = departments.reduce(
        (total, department) =>
            total + (department.subdepartments?.length || 0),
        0
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                                <Building2 className="h-6 w-6 text-green-700" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Departments
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Manage school departments and their
                                    subdepartments.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchDepartments(true)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />

                            Refresh
                        </button>

                        <Link
                            to="/departments/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                        >
                            <Plus className="h-4 w-4" />

                            New Department
                        </Link>
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

                {/* =====================================================
                    STAT CARDS
                ====================================================== */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Departments
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {departments.length}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-100 p-3">
                                <Building2 className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Active
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {activeDepartments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-100 p-3">
                                <CheckCircle2 className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Inactive
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {inactiveDepartments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-100 p-3">
                                <XCircle className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Subdepartments
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {totalSubDepartments}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-100 p-3">
                                <Layers className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    DEPARTMENT LIST
                ====================================================== */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="font-semibold text-gray-800">
                            School Departments
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Departments and their associated subdepartments.
                        </p>
                    </div>

                    {departments.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Building2 className="mx-auto h-12 w-12 text-gray-300" />

                            <h3 className="mt-4 text-base font-semibold text-gray-700">
                                No departments found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Create your first department to get started.
                            </p>

                            <Link
                                to="/departments/create"
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                            >
                                <Plus className="h-4 w-4" />
                                Create Department
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {departments.map((department) => {
                                const isExpanded =
                                    expandedDepartments[department.id];

                                const subdepartments =
                                    department.subdepartments || [];

                                return (
                                    <div key={department.id}>

                                        {/* =================================================
                                            DEPARTMENT ROW
                                        ================================================== */}
                                        <div className="flex flex-col gap-4 px-5 py-4 transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between">

                                            <div className="flex min-w-0 items-center gap-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleDepartment(
                                                            department.id
                                                        )
                                                    }
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                                    title={
                                                        isExpanded
                                                            ? "Collapse"
                                                            : "Expand"
                                                    }
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                                                    <Building2 className="h-5 w-5 text-green-700" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-gray-800">
                                                            {department.name}
                                                        </h3>

                                                        {department.is_active ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                                                                <XCircle className="h-3 w-3" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        Code:{" "}
                                                        <span className="font-medium text-gray-600">
                                                            {department.code}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pl-12 lg:pl-0">

                                                <span className="mr-2 text-xs text-gray-500">
                                                    {subdepartments.length}{" "}
                                                    {subdepartments.length === 1
                                                        ? "subdepartment"
                                                        : "subdepartments"}
                                                </span>

                                                <Link
                                                    to={`/departments/${department.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteDepartment(
                                                            department
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* =================================================
                                            SUBDEPARTMENTS
                                        ================================================== */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4">

                                                <div className="ml-12">

                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-700">
                                                                Subdepartments
                                                            </h4>

                                                            <p className="text-xs text-gray-500">
                                                                Areas belonging
                                                                to{" "}
                                                                {
                                                                    department.name
                                                                }
                                                                .
                                                            </p>
                                                        </div>

                                                        <Link
                                                            to={`/departments/${department.id}/edit`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Subdepartment
                                                        </Link>
                                                    </div>

                                                    {subdepartments.length ===
                                                    0 ? (
                                                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center">
                                                            <Layers className="mx-auto h-8 w-8 text-gray-300" />

                                                            <p className="mt-2 text-sm text-gray-500">
                                                                No subdepartments
                                                                have been
                                                                created for
                                                                this department.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                                            {subdepartments.map(
                                                                (
                                                                    subdepartment
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            subdepartment.id
                                                                        }
                                                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                                                    >
                                                                        <div className="flex min-w-0 items-center gap-3">
                                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
                                                                                <Layers className="h-4 w-4 text-green-700" />
                                                                            </div>

                                                                            <div className="min-w-0">
                                                                                <p className="truncate text-sm font-medium text-gray-700">
                                                                                    {
                                                                                        subdepartment.name
                                                                                    }
                                                                                </p>

                                                                                <p className="truncate text-xs text-gray-400">
                                                                                    {
                                                                                        subdepartment.code
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="ml-2 flex shrink-0 items-center gap-1">
                                                                            <Link
                                                                                to={`/departments/${department.id}/edit`}
                                                                                className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-green-700"
                                                                                title="Edit"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Link>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleDeleteSubDepartment(
                                                                                        subdepartment
                                                                                    )
                                                                                }
                                                                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;