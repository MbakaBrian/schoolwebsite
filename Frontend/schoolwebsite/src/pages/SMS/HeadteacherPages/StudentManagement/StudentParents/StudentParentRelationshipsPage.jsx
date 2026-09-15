import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    Users,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    UserRound,
    GraduationCap,
    Phone,
    Mail,
    Star,
    Bell,
    CreditCard,
    ShieldCheck,
    RefreshCw,
    X,
} from "lucide-react";

const relationshipLabels = {
    mother: "Mother",
    father: "Father",
    step_mother: "Step Mother",
    step_father: "Step Father",
    guardian: "Guardian",
    grandparent: "Grandparent",
    aunt: "Aunt",
    uncle: "Uncle",
    sibling: "Sibling",
    other: "Other",
};

const relationshipColors = {
    mother: "bg-purple-100 text-purple-800",
    father: "bg-indigo-100 text-indigo-800",
    step_mother: "bg-fuchsia-100 text-fuchsia-800",
    step_father: "bg-violet-100 text-violet-800",
    guardian: "bg-blue-100 text-blue-800",
    grandparent: "bg-amber-100 text-amber-800",
    aunt: "bg-pink-100 text-pink-800",
    uncle: "bg-cyan-100 text-cyan-800",
    sibling: "bg-green-100 text-green-800",
    other: "bg-gray-200 text-gray-800",
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

                    {description && (
                        <p className="text-xs text-gray-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-700" />
                </div>
            </div>
        </div>
    );
}

export default function StudentParentRelationshipsPage() {
    const [relationships, setRelationships] = useState([]);
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [families, setFamilies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [relationshipFilter, setRelationshipFilter] = useState("all");
    const [primaryFilter, setPrimaryFilter] = useState("all");

    const [error, setError] = useState("");

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        relationship: null,
    });

    const [deleting, setDeleting] = useState(false);

    const loadData = async (isRefresh = false) => {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                relationshipsResponse,
                studentsResponse,
                parentsResponse,
                familiesResponse,
            ] = await Promise.all([
                axiosInstance.get("/students/student-parents/"),
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/students/parents/"),
                axiosInstance.get("/students/families/"),
            ]);

            setRelationships(getResults(relationshipsResponse));
            setStudents(getResults(studentsResponse));
            setParents(getResults(parentsResponse));
            setFamilies(getResults(familiesResponse));
        } catch (err) {
            console.error(
                "Failed to load student-parent relationships:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Failed to load student-parent relationships."
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
            students.map((student) => [student.id, student])
        );
    }, [students]);

    const parentMap = useMemo(() => {
        return Object.fromEntries(
            parents.map((parent) => [parent.id, parent])
        );
    }, [parents]);

    const familyMap = useMemo(() => {
        return Object.fromEntries(
            families.map((family) => [family.id, family])
        );
    }, [families]);

    const enrichedRelationships = useMemo(() => {
        return relationships.map((relationship) => {
            const student = studentMap[relationship.student];
            const parent = parentMap[relationship.parent_guardian];

            const family =
                parent?.family != null
                    ? familyMap[parent.family]
                    : student?.family != null
                    ? familyMap[student.family]
                    : null;

            return {
                ...relationship,
                studentObject: student,
                parentObject: parent,
                familyObject: family,
            };
        });
    }, [relationships, studentMap, parentMap, familyMap]);

    const filteredRelationships = useMemo(() => {
        const query = search.trim().toLowerCase();

        return enrichedRelationships.filter((item) => {
            const student = item.studentObject;
            const parent = item.parentObject;
            const family = item.familyObject;

            const studentName = getStudentName(student).toLowerCase();
            const parentName = getParentName(parent).toLowerCase();

            const studentAdmission =
                student?.admission_number?.toLowerCase() || "";

            const studentId =
                student?.student_id?.toLowerCase() || "";

            const parentId =
                parent?.parent_id?.toLowerCase() || "";

            const phone =
                parent?.mobile_number?.toLowerCase() || "";

            const familyName = getFamilyName(family).toLowerCase();

            const matchesSearch =
                !query ||
                studentName.includes(query) ||
                parentName.includes(query) ||
                studentAdmission.includes(query) ||
                studentId.includes(query) ||
                parentId.includes(query) ||
                phone.includes(query) ||
                familyName.includes(query);

            const matchesRelationship =
                relationshipFilter === "all" ||
                item.relationship === relationshipFilter;

            const matchesPrimary =
                primaryFilter === "all" ||
                (primaryFilter === "primary" && item.is_primary) ||
                (primaryFilter === "secondary" && !item.is_primary);

            return (
                matchesSearch &&
                matchesRelationship &&
                matchesPrimary
            );
        });
    }, [
        enrichedRelationships,
        search,
        relationshipFilter,
        primaryFilter,
    ]);

    const stats = useMemo(() => {
        return {
            total: relationships.length,

            primary: relationships.filter(
                (item) => item.is_primary
            ).length,

            communication: relationships.filter(
                (item) => item.receives_communications
            ).length,

            fees: relationships.filter(
                (item) => item.receives_fee_notifications
            ).length,
        };
    }, [relationships]);

    const handleDelete = async () => {
        if (!deleteModal.relationship) return;

        try {
            setDeleting(true);

            await axiosInstance.delete(
                `/students/student-parents/${deleteModal.relationship.id}/`
            );

            setRelationships((current) =>
                current.filter(
                    (item) =>
                        item.id !== deleteModal.relationship.id
                )
            );

            setDeleteModal({
                open: false,
                relationship: null,
            });
        } catch (err) {
            console.error("Failed to delete relationship:", err);

            setError(
                err?.response?.data?.detail ||
                    "Failed to remove the student-parent relationship."
            );
        } finally {
            setDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setRelationshipFilter("all");
        setPrimaryFilter("all");
    };

    const hasFilters =
        search ||
        relationshipFilter !== "all" ||
        primaryFilter !== "all";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* HEADER */}
            <div className="bg-purple-800 rounded-2xl p-6 md:p-7 shadow-lg mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 rounded-xl bg-purple-700 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>

                            <div>
                                <p className="text-purple-200 text-sm">
                                    Student Management
                                </p>

                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Student-Parent Relationships
                                </h1>
                            </div>
                        </div>

                        <p className="text-purple-100 max-w-2xl text-sm md:text-base">
                            Manage the relationships between students and
                            their parents or guardians, including primary
                            contacts and communication responsibilities.
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
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />

                            Refresh
                        </button>

                        <Link
                            to="/sms/student-parents/add"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-white text-purple-800 font-semibold transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Relationship
                        </Link>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 mt-0.5" />

                    <div className="flex-1">
                        <p className="font-semibold text-red-800">
                            Something went wrong
                        </p>

                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={() => setError("")}
                        className="text-red-600 hover:text-red-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={Users}
                    title="Total Relationships"
                    value={stats.total}
                    description="Student-parent links"
                />

                <StatCard
                    icon={Star}
                    title="Primary Contacts"
                    value={stats.primary}
                    description="Primary parent/guardian links"
                />

                <StatCard
                    icon={Bell}
                    title="Communication"
                    value={stats.communication}
                    description="Receive school communications"
                />

                <StatCard
                    icon={CreditCard}
                    title="Fee Notifications"
                    value={stats.fees}
                    description="Receive fee notifications"
                />
            </div>

            {/* FILTERS */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-4 mb-6">
                <div className="flex flex-col xl:flex-row gap-4">
                    {/* SEARCH */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search student, admission number, parent, phone or family..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                    </div>

                    {/* RELATIONSHIP */}
                    <select
                        value={relationshipFilter}
                        onChange={(e) =>
                            setRelationshipFilter(e.target.value)
                        }
                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">
                            All Relationships
                        </option>

                        {Object.entries(relationshipLabels).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>

                    {/* PRIMARY */}
                    <select
                        value={primaryFilter}
                        onChange={(e) =>
                            setPrimaryFilter(e.target.value)
                        }
                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="all">
                            All Contacts
                        </option>

                        <option value="primary">
                            Primary Only
                        </option>

                        <option value="secondary">
                            Secondary Only
                        </option>
                    </select>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium transition"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="font-bold text-gray-900">
                            Relationships
                        </h2>

                        <p className="text-sm text-gray-500">
                            Showing {filteredRelationships.length} of{" "}
                            {relationships.length} relationships
                        </p>
                    </div>

                    <Link
                        to="/sms/student-parents/add"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Relationship
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-purple-700 animate-spin" />

                        <p className="mt-3 text-gray-500">
                            Loading relationships...
                        </p>
                    </div>
                ) : filteredRelationships.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-purple-700" />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                            No relationships found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            {hasFilters
                                ? "No student-parent relationships match your current filters."
                                : "No student-parent relationships have been created yet."}
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
                                to="/sms/student-parents/add"
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add First Relationship
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-800 text-white text-left text-sm">
                                        <th className="px-5 py-4 font-semibold">
                                            Student
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Parent / Guardian
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Relationship
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Family
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Responsibilities
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {filteredRelationships.map(
                                        (item) => {
                                            const student =
                                                item.studentObject;

                                            const parent =
                                                item.parentObject;

                                            const family =
                                                item.familyObject;

                                            return (
                                                <tr
                                                    key={item.id}
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
                                                                        "No admission number"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* PARENT */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                                                                <UserRound className="w-5 h-5 text-gray-700" />
                                                            </div>

                                                            <div>
                                                                <Link
                                                                    to={`/sms/parents/${parent?.id}`}
                                                                    className="font-semibold text-gray-900 hover:text-purple-700"
                                                                >
                                                                    {getParentName(
                                                                        parent
                                                                    )}
                                                                </Link>

                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {parent?.mobile_number && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Phone className="w-3 h-3" />
                                                                            {
                                                                                parent.mobile_number
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* RELATIONSHIP */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    relationshipColors[
                                                                        item.relationship
                                                                    ] ||
                                                                    "bg-gray-200 text-gray-800"
                                                                }`}
                                                            >
                                                                {relationshipLabels[
                                                                    item.relationship
                                                                ] ||
                                                                    item.relationship}
                                                            </span>

                                                            {item.is_primary && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-800 text-white">
                                                                    <Star className="w-3 h-3" />
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* FAMILY */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-gray-700">
                                                            {getFamilyName(
                                                                family
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* RESPONSIBILITIES */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.has_parental_responsibility && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                                                                    <ShieldCheck className="w-3 h-3" />
                                                                    Responsibility
                                                                </span>
                                                            )}

                                                            {item.receives_communications && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                                                                    <Bell className="w-3 h-3" />
                                                                    Communications
                                                                </span>
                                                            )}

                                                            {item.receives_fee_notifications && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                                                                    <CreditCard className="w-3 h-3" />
                                                                    Fees
                                                                </span>
                                                            )}

                                                            {item.is_emergency_contact && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs">
                                                                    Emergency
                                                                </span>
                                                            )}

                                                            {!item.has_parental_responsibility &&
                                                                !item.receives_communications &&
                                                                !item.receives_fee_notifications &&
                                                                !item.is_emergency_contact && (
                                                                    <span className="text-xs text-gray-400">
                                                                        None
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/sms/student-parents/${item.id}`}
                                                                title="View"
                                                                className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-purple-100 text-gray-700 hover:text-purple-700 flex items-center justify-center transition"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>

                                                            <Link
                                                                to={`/sms/student-parents/${item.id}/edit`}
                                                                title="Edit"
                                                                className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>

                                                            <button
                                                                onClick={() =>
                                                                    setDeleteModal(
                                                                        {
                                                                            open: true,
                                                                            relationship:
                                                                                item,
                                                                        }
                                                                    )
                                                                }
                                                                title="Remove relationship"
                                                                className="w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE / TABLET CARDS */}
                        <div className="xl:hidden divide-y divide-gray-200">
                            {filteredRelationships.map((item) => {
                                const student = item.studentObject;
                                const parent = item.parentObject;
                                const family = item.familyObject;

                                return (
                                    <div
                                        key={item.id}
                                        className="p-5 hover:bg-purple-50/40 transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
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

                                                        <p className="text-xs text-gray-500">
                                                            {student?.admission_number ||
                                                                "No admission number"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                                    <div className="bg-gray-100 rounded-xl p-3">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Parent / Guardian
                                                        </p>

                                                        <Link
                                                            to={`/sms/parents/${parent?.id}`}
                                                            className="font-semibold text-gray-900 hover:text-purple-700"
                                                        >
                                                            {getParentName(
                                                                parent
                                                            )}
                                                        </Link>

                                                        {parent?.mobile_number && (
                                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {
                                                                    parent.mobile_number
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="bg-gray-100 rounded-xl p-3">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Family
                                                        </p>

                                                        <p className="font-semibold text-gray-800">
                                                            {getFamilyName(
                                                                family
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            relationshipColors[
                                                                item.relationship
                                                            ] ||
                                                            "bg-gray-200 text-gray-800"
                                                        }`}
                                                    >
                                                        {relationshipLabels[
                                                            item.relationship
                                                        ] ||
                                                            item.relationship}
                                                    </span>

                                                    {item.is_primary && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-800 text-white">
                                                            <Star className="w-3 h-3" />
                                                            Primary
                                                        </span>
                                                    )}

                                                    {item.receives_communications && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                            <Bell className="w-3 h-3" />
                                                            Communications
                                                        </span>
                                                    )}

                                                    {item.receives_fee_notifications && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                            <CreditCard className="w-3 h-3" />
                                                            Fees
                                                        </span>
                                                    )}

                                                    {item.is_emergency_contact && (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                                            Emergency
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/sms/student-parents/${item.id}`}
                                                    className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-purple-100 text-gray-700 hover:text-purple-700 flex items-center justify-center"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                <Link
                                                    to={`/sms/student-parents/${item.id}/edit`}
                                                    className="w-9 h-9 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        setDeleteModal({
                                                            open: true,
                                                            relationship:
                                                                item,
                                                        })
                                                    }
                                                    className="w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* DELETE MODAL */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-700" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Remove Relationship
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Are you sure you want to remove this
                                    student-parent relationship?
                                </p>
                            </div>
                        </div>

                        {deleteModal.relationship && (
                            <div className="mt-5 bg-gray-100 rounded-xl p-4">
                                <p className="font-semibold text-gray-900">
                                    {getStudentName(
                                        deleteModal.relationship
                                            .studentObject
                                    )}
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    ↕{" "}
                                    {
                                        relationshipLabels[
                                            deleteModal.relationship
                                                .relationship
                                        ]
                                    }{" "}
                                    ↕
                                </p>

                                <p className="font-semibold text-gray-800 mt-1">
                                    {getParentName(
                                        deleteModal.relationship
                                            .parentObject
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        open: false,
                                        relationship: null,
                                    })
                                }
                                disabled={deleting}
                                className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-medium disabled:opacity-60"
                            >
                                {deleting && (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                )}

                                {deleting
                                    ? "Removing..."
                                    : "Remove Relationship"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}