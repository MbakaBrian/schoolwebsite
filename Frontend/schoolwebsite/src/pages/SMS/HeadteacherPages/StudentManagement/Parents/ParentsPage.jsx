import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    UserX,
    Phone,
    Mail,
    BriefcaseBusiness,
    MapPin,
    AlertCircle,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";

export default function ParentsPage() {
    const [parents, setParents] = useState([]);
    const [families, setFamilies] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("active");

    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [parentsResponse, familiesResponse, studentsResponse] =
                await Promise.all([
                    axiosInstance.get("/students/parents/"),
                    axiosInstance.get("/students/families/"),
                    axiosInstance.get("/students/students/"),
                ]);

            setParents(
                Array.isArray(parentsResponse.data)
                    ? parentsResponse.data
                    : parentsResponse.data.results || []
            );

            setFamilies(
                Array.isArray(familiesResponse.data)
                    ? familiesResponse.data
                    : familiesResponse.data.results || []
            );

            setStudents(
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : studentsResponse.data.results || []
            );
        } catch (err) {
            console.error("Failed to load parents:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load parents and guardians."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --------------------------------------------------
    // FAMILY LOOKUP
    // --------------------------------------------------
    const familyMap = useMemo(() => {
        const map = {};

        families.forEach((family) => {
            map[family.id] = family;
        });

        return map;
    }, [families]);

    // --------------------------------------------------
    // STUDENT COUNT PER PARENT
    // --------------------------------------------------
    /*
     * StudentParent is the relationship table between
     * students and parents.
     *
     * Since the current parent list endpoint does not
     * include the relationship count, this page uses
     * student relationships if they are included in the
     * serializer later.
     *
     * For now, we display 0 when no relationship data
     * exists.
     */
    const getStudentCount = (parent) => {
        if (Array.isArray(parent.student_relationships)) {
            return parent.student_relationships.length;
        }

        if (Array.isArray(parent.students)) {
            return parent.students.length;
        }

        return 0;
    };

    // --------------------------------------------------
    // FILTER PARENTS
    // --------------------------------------------------
    const filteredParents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return parents.filter((parent) => {
            const family = familyMap[parent.family];

            const familyName = family?.family_name || "";

            const matchesSearch =
                !query ||
                [
                    parent.parent_id,
                    parent.full_name,
                    parent.first_name,
                    parent.middle_name,
                    parent.last_name,
                    parent.mobile_number,
                    parent.email,
                    parent.occupation,
                    parent.employer,
                    familyName,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(query)
                    );

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && parent.is_active) ||
                (statusFilter === "inactive" && !parent.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [parents, familyMap, searchTerm, statusFilter]);

    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------
    const statistics = useMemo(() => {
        const total = parents.length;

        const active = parents.filter(
            (parent) => parent.is_active
        ).length;

        const inactive = parents.filter(
            (parent) => !parent.is_active
        ).length;

        const withPhone = parents.filter(
            (parent) => parent.mobile_number
        ).length;

        return {
            total,
            active,
            inactive,
            withPhone,
        };
    }, [parents]);

    // --------------------------------------------------
    // DEACTIVATE PARENT
    // --------------------------------------------------
    const handleDeactivate = async (parent) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${parent.full_name || "this parent/guardian"}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await axiosInstance.delete(
                `/students/parents/${parent.id}/`
            );

            setParents((previous) =>
                previous.map((item) =>
                    item.id === parent.id
                        ? { ...item, is_active: false }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to deactivate parent:", err);

            alert(
                err.response?.data?.detail ||
                    "Failed to deactivate the parent/guardian."
            );
        }
    };

    // --------------------------------------------------
    // NAME HELPER
    // --------------------------------------------------
    const getParentName = (parent) => {
        if (parent.full_name) {
            return parent.full_name;
        }

        return [
            parent.first_name,
            parent.middle_name,
            parent.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-purple-800">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="font-medium">
                        Loading parents and guardians...
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-700 rounded-xl">
                                    <Users className="w-7 h-7" />
                                </div>

                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        Parents & Guardians
                                    </h1>

                                    <p className="text-purple-200 mt-1">
                                        Manage parents and guardians connected
                                        to students.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/sms/parents/add"
                            className="inline-flex items-center justify-center gap-2 bg-gray-50 text-purple-800 hover:bg-gray-200 font-semibold px-5 py-3 rounded-xl transition"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Parent / Guardian
                        </Link>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Unable to load parents
                            </p>

                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* STATISTICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title="Total Parents"
                        value={statistics.total}
                    />

                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title="Active"
                        value={statistics.active}
                    />

                    <StatCard
                        icon={<UserX className="w-6 h-6" />}
                        title="Inactive"
                        value={statistics.inactive}
                    />

                    <StatCard
                        icon={<Phone className="w-6 h-6" />}
                        title="With Phone"
                        value={statistics.withPhone}
                    />
                </div>

                {/* SEARCH / FILTER */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search by name, parent ID, phone, email, occupation or family..."
                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="lg:w-48 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        >
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                            <option value="all">All Parents</option>
                        </select>

                        <button
                            type="button"
                            onClick={fetchData}
                            className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-3 rounded-xl transition"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Parent & Guardian Records
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Showing {filteredParents.length} of{" "}
                                {parents.length} records
                            </p>
                        </div>

                        <Link
                            to="/sms/parents/add"
                            className="inline-flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Parent
                        </Link>
                    </div>

                    {filteredParents.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-500" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">
                                No parents or guardians found
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Try changing your search or filter, or create
                                a new parent/guardian record.
                            </p>

                            <Link
                                to="/sms/parents/add"
                                className="inline-flex items-center gap-2 mt-5 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-5 py-3 rounded-xl transition"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add Parent / Guardian
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-200 border-b border-gray-300">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Parent / Guardian
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Family
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Contact
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Occupation
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Status
                                            </th>

                                            <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-600">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredParents.map((parent) => {
                                            const family =
                                                familyMap[parent.family];

                                            const parentName =
                                                getParentName(parent);

                                            return (
                                                <tr
                                                    key={parent.id}
                                                    className="hover:bg-purple-50/40 transition"
                                                >
                                                    {/* NAME */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                                                                {parentName
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "P"}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {parentName ||
                                                                        "Unnamed Parent"}
                                                                </p>

                                                                <p className="text-sm text-purple-700 font-medium">
                                                                    {parent.parent_id ||
                                                                        "No ID"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* FAMILY */}
                                                    <td className="px-6 py-4">
                                                        {family ? (
                                                            <>
                                                                <p className="font-medium text-gray-800">
                                                                    {
                                                                        family.family_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {
                                                                        family.family_id
                                                                    }
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                Not assigned
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* CONTACT */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {parent.mobile_number && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                    <Phone className="w-4 h-4 text-purple-700" />
                                                                    {
                                                                        parent.mobile_number
                                                                    }
                                                                </div>
                                                            )}

                                                            {parent.email && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-4 h-4 text-purple-700" />
                                                                    <span className="truncate max-w-[220px]">
                                                                        {
                                                                            parent.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {!parent.mobile_number &&
                                                                !parent.email && (
                                                                    <span className="text-gray-400 text-sm">
                                                                        No contact
                                                                        details
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </td>

                                                    {/* OCCUPATION */}
                                                    <td className="px-6 py-4">
                                                        {parent.occupation ||
                                                        parent.employer ? (
                                                            <div>
                                                                {parent.occupation && (
                                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                        <BriefcaseBusiness className="w-4 h-4 text-purple-700" />
                                                                        {
                                                                            parent.occupation
                                                                        }
                                                                    </div>
                                                                )}

                                                                {parent.employer && (
                                                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                                                        {
                                                                            parent.employer
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">
                                                                Not provided
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-6 py-4">
                                                        <StatusBadge
                                                            active={
                                                                parent.is_active
                                                            }
                                                        />
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/sms/parents/${parent.id}`}
                                                                title="View parent"
                                                                className="p-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>

                                                            <Link
                                                                to={`/sms/parents/${parent.id}/edit`}
                                                                title="Edit parent"
                                                                className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>

                                                            {parent.is_active && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeactivate(
                                                                            parent
                                                                        )
                                                                    }
                                                                    title="Deactivate parent"
                                                                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                                                >
                                                                    <UserX className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE / TABLET CARDS */}
                            <div className="lg:hidden p-4 space-y-4">
                                {filteredParents.map((parent) => {
                                    const family =
                                        familyMap[parent.family];

                                    const parentName =
                                        getParentName(parent);

                                    return (
                                        <div
                                            key={parent.id}
                                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
                                                        {parentName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "P"}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-gray-800">
                                                            {parentName ||
                                                                "Unnamed Parent"}
                                                        </h3>

                                                        <p className="text-sm text-purple-700 font-medium">
                                                            {
                                                                parent.parent_id
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <StatusBadge
                                                    active={parent.is_active}
                                                />
                                            </div>

                                            <div className="mt-5 space-y-3">
                                                {family && (
                                                    <div className="flex items-start gap-3">
                                                        <Users className="w-4 h-4 text-purple-700 mt-1" />

                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Family
                                                            </p>

                                                            <p className="text-sm font-medium text-gray-800">
                                                                {
                                                                    family.family_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {parent.mobile_number && (
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-4 h-4 text-purple-700" />

                                                        <span className="text-sm text-gray-700">
                                                            {
                                                                parent.mobile_number
                                                            }
                                                        </span>
                                                    </div>
                                                )}

                                                {parent.email && (
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-4 h-4 text-purple-700" />

                                                        <span className="text-sm text-gray-700 break-all">
                                                            {parent.email}
                                                        </span>
                                                    </div>
                                                )}

                                                {(parent.address ||
                                                    family?.address) && (
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="w-4 h-4 text-purple-700 mt-1" />

                                                        <span className="text-sm text-gray-600">
                                                            {parent.address ||
                                                                family?.address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-200">
                                                <Link
                                                    to={`/sms/parents/${parent.id}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-4 py-2.5 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>

                                                <Link
                                                    to={`/sms/parents/${parent.id}/edit`}
                                                    className="inline-flex items-center justify-center p-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                {parent.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                parent
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center p-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------
function StatCard({ icon, title, value }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        {value}
                    </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------
function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                active
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-200 text-gray-600"
            }`}
        >
            {active ? "Active" : "Inactive"}
        </span>
    );
}

