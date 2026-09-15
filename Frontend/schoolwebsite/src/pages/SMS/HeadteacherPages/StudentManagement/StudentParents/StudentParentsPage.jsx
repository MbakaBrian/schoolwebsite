import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Search,
    RefreshCw,
    Edit,
    Eye,
    Trash2,
    Users,
    User,
    Phone,
    Bell,
    CreditCard,
    ShieldCheck,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Filter,
} from "lucide-react";
import axiosInstance from "../../../../../../utils/axiosInstance";

const StudentParentsPage = () => {
    const navigate = useNavigate();

    const [relationships, setRelationships] = useState([]);
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [relationshipFilter, setRelationshipFilter] = useState("all");
    const [primaryFilter, setPrimaryFilter] = useState("all");

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const getResults = (data) => {
        if (Array.isArray(data)) return data;

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        return [];
    };

    const getStudentName = (student) => {
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
            .join(" ");
    };

    const getParentName = (parent) => {
        if (!parent) return "Unknown Parent/Guardian";

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

    const formatRelationship = (relationship) => {
        if (!relationship) return "Not specified";

        return relationship
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const studentMap = useMemo(() => {
        const map = {};

        students.forEach((student) => {
            map[student.id] = student;
        });

        return map;
    }, [students]);

    const parentMap = useMemo(() => {
        const map = {};

        parents.forEach((parent) => {
            map[parent.id] = parent;
        });

        return map;
    }, [parents]);

    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------

    const fetchData = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                relationshipsResponse,
                studentsResponse,
                parentsResponse,
            ] = await Promise.all([
                axiosInstance.get("/students/student-parents/"),
                axiosInstance.get("/students/students/"),
                axiosInstance.get("/students/parents/"),
            ]);

            setRelationships(
                getResults(relationshipsResponse.data)
            );

            setStudents(
                getResults(studentsResponse.data)
            );

            setParents(
                getResults(parentsResponse.data)
            );
        } catch (err) {
            console.error(
                "Unable to load student-parent relationships:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Unable to load student-parent relationships."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --------------------------------------------------
    // DELETE RELATIONSHIP
    // --------------------------------------------------

    const handleDelete = async (relationship) => {
        const student = studentMap[relationship.student];
        const parent = parentMap[relationship.parent_guardian];

        const studentName = getStudentName(student);
        const parentName = getParentName(parent);

        const confirmed = window.confirm(
            `Are you sure you want to remove the relationship between ${studentName} and ${parentName}?`
        );

        if (!confirmed) return;

        try {
            setError("");

            await axiosInstance.delete(
                `/students/student-parents/${relationship.id}/`
            );

            setRelationships((current) =>
                current.filter(
                    (item) => item.id !== relationship.id
                )
            );
        } catch (err) {
            console.error(
                "Unable to delete relationship:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Unable to remove the relationship."
            );
        }
    };

    // --------------------------------------------------
    // FILTERING
    // --------------------------------------------------

    const filteredRelationships = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return relationships.filter((item) => {
            const student = studentMap[item.student];
            const parent = parentMap[item.parent_guardian];

            const studentName = getStudentName(student).toLowerCase();
            const parentName = getParentName(parent).toLowerCase();

            const admissionNumber =
                student?.admission_number?.toLowerCase() || "";

            const studentId =
                student?.student_id?.toLowerCase() || "";

            const parentId =
                parent?.parent_id?.toLowerCase() || "";

            const phone =
                parent?.mobile_number?.toLowerCase() || "";

            const relationship =
                item.relationship?.toLowerCase() || "";

            const matchesSearch =
                !search ||
                studentName.includes(search) ||
                parentName.includes(search) ||
                admissionNumber.includes(search) ||
                studentId.includes(search) ||
                parentId.includes(search) ||
                phone.includes(search) ||
                relationship.includes(search);

            const matchesRelationship =
                relationshipFilter === "all" ||
                item.relationship === relationshipFilter;

            const matchesPrimary =
                primaryFilter === "all" ||
                (primaryFilter === "primary" &&
                    item.is_primary === true) ||
                (primaryFilter === "non_primary" &&
                    item.is_primary === false);

            return (
                matchesSearch &&
                matchesRelationship &&
                matchesPrimary
            );
        });
    }, [
        relationships,
        students,
        parents,
        searchTerm,
        relationshipFilter,
        primaryFilter,
        studentMap,
        parentMap,
    ]);

    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------

    const stats = useMemo(() => {
        return {
            total: relationships.length,

            primary: relationships.filter(
                (item) => item.is_primary
            ).length,

            parentalResponsibility: relationships.filter(
                (item) => item.has_parental_responsibility
            ).length,

            communications: relationships.filter(
                (item) => item.receives_communications
            ).length,

            feeNotifications: relationships.filter(
                (item) => item.receives_fee_notifications
            ).length,

            emergencyContacts: relationships.filter(
                (item) => item.is_emergency_contact
            ).length,
        };
    }, [relationships]);

    // --------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-purple-800">
                    <Loader2 className="w-10 h-10 animate-spin" />

                    <p className="text-sm font-medium">
                        Loading student-parent relationships...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --------------------------------------------------
                    HEADER
                -------------------------------------------------- */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                        <button
                            onClick={() =>
                                navigate("/student-management")
                            }
                            className="flex items-center gap-2 text-purple-800 hover:text-purple-600 font-medium mb-3"
                        >
                            <ArrowLeft size={18} />
                            Student Management
                        </button>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Student ↔ Parent Relationships
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage relationships between students
                            and their parents or guardians.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition disabled:opacity-60"
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

                        <button
                            onClick={() =>
                                navigate(
                                    "/sms/student-parents/add"
                                )
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition"
                        >
                            <Plus size={18} />
                            Add Relationship
                        </button>
                    </div>
                </div>

                {/* --------------------------------------------------
                    ERROR
                -------------------------------------------------- */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start gap-3">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 flex-shrink-0"
                        />

                        <p className="text-sm">
                            {error}
                        </p>
                    </div>
                )}

                {/* --------------------------------------------------
                    STATISTICS
                -------------------------------------------------- */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                    <StatCard
                        title="Total"
                        value={stats.total}
                        icon={<Users size={20} />}
                    />

                    <StatCard
                        title="Primary"
                        value={stats.primary}
                        icon={<User size={20} />}
                    />

                    <StatCard
                        title="Parental Responsibility"
                        value={stats.parentalResponsibility}
                        icon={<ShieldCheck size={20} />}
                    />

                    <StatCard
                        title="Communications"
                        value={stats.communications}
                        icon={<Bell size={20} />}
                    />

                    <StatCard
                        title="Fee Notifications"
                        value={stats.feeNotifications}
                        icon={<CreditCard size={20} />}
                    />

                    <StatCard
                        title="Emergency"
                        value={stats.emergencyContacts}
                        icon={<Phone size={20} />}
                    />
                </div>

                {/* --------------------------------------------------
                    FILTERS
                -------------------------------------------------- */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">

                    <div className="flex items-center gap-2 mb-4">
                        <Filter
                            size={19}
                            className="text-purple-800"
                        />

                        <h2 className="font-bold text-gray-800">
                            Search & Filters
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Search */}

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="Search student, parent, phone..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Relationship */}

                        <select
                            value={relationshipFilter}
                            onChange={(e) =>
                                setRelationshipFilter(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">
                                All Relationships
                            </option>

                            <option value="mother">
                                Mother
                            </option>

                            <option value="father">
                                Father
                            </option>

                            <option value="step_mother">
                                Step Mother
                            </option>

                            <option value="step_father">
                                Step Father
                            </option>

                            <option value="guardian">
                                Guardian
                            </option>

                            <option value="grandparent">
                                Grandparent
                            </option>

                            <option value="aunt">
                                Aunt
                            </option>

                            <option value="uncle">
                                Uncle
                            </option>

                            <option value="sibling">
                                Sibling
                            </option>

                            <option value="other">
                                Other
                            </option>
                        </select>

                        {/* Primary */}

                        <select
                            value={primaryFilter}
                            onChange={(e) =>
                                setPrimaryFilter(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">
                                All Contact Types
                            </option>

                            <option value="primary">
                                Primary Contacts
                            </option>

                            <option value="non_primary">
                                Non-Primary Contacts
                            </option>
                        </select>
                    </div>
                </div>

                {/* --------------------------------------------------
                    RESULTS COUNT
                -------------------------------------------------- */}

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Relationships
                        </h2>

                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-purple-800">
                                {filteredRelationships.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold">
                                {relationships.length}
                            </span>{" "}
                            relationships
                        </p>
                    </div>
                </div>

                {/* --------------------------------------------------
                    DESKTOP TABLE
                -------------------------------------------------- */}

                <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">
                            <thead>
                                <tr className="bg-purple-800 text-white">
                                    <th className="px-5 py-4 text-left text-sm font-semibold">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold">
                                        Parent / Guardian
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold">
                                        Relationship
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold">
                                        Primary
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold">
                                        Communications
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold">
                                        Fees
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold">
                                        Emergency
                                    </th>

                                    <th className="px-5 py-4 text-right text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {filteredRelationships.map(
                                    (item) => {
                                        const student =
                                            studentMap[
                                                item.student
                                            ];

                                        const parent =
                                            parentMap[
                                                item.parent_guardian
                                            ];

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-purple-50/40 transition"
                                            >
                                                {/* Student */}

                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={() =>
                                                            student &&
                                                            navigate(
                                                                `/sms/students/${student.id}`
                                                            )
                                                        }
                                                        className="text-left"
                                                    >
                                                        <p className="font-semibold text-gray-800 hover:text-purple-800">
                                                            {getStudentName(
                                                                student
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {student?.admission_number ||
                                                                "No admission number"}
                                                        </p>
                                                    </button>
                                                </td>

                                                {/* Parent */}

                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={() =>
                                                            parent &&
                                                            navigate(
                                                                `/sms/parents/${parent.id}`
                                                            )
                                                        }
                                                        className="text-left"
                                                    >
                                                        <p className="font-semibold text-gray-800 hover:text-purple-800">
                                                            {getParentName(
                                                                parent
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {parent?.mobile_number ||
                                                                "No phone number"}
                                                        </p>
                                                    </button>
                                                </td>

                                                {/* Relationship */}

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                                                        {formatRelationship(
                                                            item.relationship
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Primary */}

                                                <td className="px-5 py-4 text-center">
                                                    {item.is_primary ? (
                                                        <CheckCircle
                                                            size={19}
                                                            className="text-purple-700 mx-auto"
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={19}
                                                            className="text-gray-400 mx-auto"
                                                        />
                                                    )}
                                                </td>

                                                {/* Communications */}

                                                <td className="px-5 py-4 text-center">
                                                    {item.receives_communications ? (
                                                        <CheckCircle
                                                            size={19}
                                                            className="text-green-600 mx-auto"
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={19}
                                                            className="text-gray-400 mx-auto"
                                                        />
                                                    )}
                                                </td>

                                                {/* Fees */}

                                                <td className="px-5 py-4 text-center">
                                                    {item.receives_fee_notifications ? (
                                                        <CheckCircle
                                                            size={19}
                                                            className="text-green-600 mx-auto"
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={19}
                                                            className="text-gray-400 mx-auto"
                                                        />
                                                    )}
                                                </td>

                                                {/* Emergency */}

                                                <td className="px-5 py-4 text-center">
                                                    {item.is_emergency_contact ? (
                                                        <CheckCircle
                                                            size={19}
                                                            className="text-purple-700 mx-auto"
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={19}
                                                            className="text-gray-400 mx-auto"
                                                        />
                                                    )}
                                                </td>

                                                {/* Actions */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/sms/student-parents/${item.id}`
                                                                )
                                                            }
                                                            title="View"
                                                            className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-purple-100 hover:text-purple-800 transition"
                                                        >
                                                            <Eye
                                                                size={17}
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/sms/student-parents/${item.id}/edit`
                                                                )
                                                            }
                                                            title="Edit"
                                                            className="p-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                                                        >
                                                            <Edit
                                                                size={17}
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item
                                                                )
                                                            }
                                                            title="Remove relationship"
                                                            className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 transition"
                                                        >
                                                            <Trash2
                                                                size={17}
                                                            />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>
                        </table>

                        {/* Empty */}

                        {filteredRelationships.length === 0 && (
                            <EmptyState
                                searchTerm={searchTerm}
                                onAdd={() =>
                                    navigate(
                                        "/sms/student-parents/add"
                                    )
                                }
                            />
                        )}
                    </div>
                </div>

                {/* --------------------------------------------------
                    MOBILE CARDS
                -------------------------------------------------- */}

                <div className="lg:hidden space-y-4">

                    {filteredRelationships.map((item) => {
                        const student =
                            studentMap[item.student];

                        const parent =
                            parentMap[item.parent_guardian];

                        return (
                            <div
                                key={item.id}
                                className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5"
                            >
                                {/* Header */}

                                <div className="flex items-start justify-between gap-3">

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Relationship
                                        </p>

                                        <span className="inline-flex mt-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                            {formatRelationship(
                                                item.relationship
                                            )}
                                        </span>
                                    </div>

                                    {item.is_primary && (
                                        <span className="px-3 py-1 rounded-full bg-purple-800 text-white text-xs font-semibold">
                                            Primary
                                        </span>
                                    )}
                                </div>

                                {/* Student */}

                                <div className="mt-5 bg-gray-100 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <User
                                                size={20}
                                                className="text-purple-800"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Student
                                            </p>

                                            <button
                                                onClick={() =>
                                                    student &&
                                                    navigate(
                                                        `/sms/students/${student.id}`
                                                    )
                                                }
                                                className="font-bold text-gray-800 hover:text-purple-800 text-left"
                                            >
                                                {getStudentName(
                                                    student
                                                )}
                                            </button>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {student?.admission_number ||
                                                    "No admission number"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent */}

                                <div className="mt-3 bg-gray-100 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Users
                                                size={20}
                                                className="text-purple-800"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Parent / Guardian
                                            </p>

                                            <button
                                                onClick={() =>
                                                    parent &&
                                                    navigate(
                                                        `/sms/parents/${parent.id}`
                                                    )
                                                }
                                                className="font-bold text-gray-800 hover:text-purple-800 text-left"
                                            >
                                                {getParentName(
                                                    parent
                                                )}
                                            </button>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {parent?.mobile_number ||
                                                    "No phone number"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}

                                <div className="grid grid-cols-2 gap-3 mt-4">

                                    <PermissionBadge
                                        label="Parental Responsibility"
                                        active={
                                            item.has_parental_responsibility
                                        }
                                    />

                                    <PermissionBadge
                                        label="Communications"
                                        active={
                                            item.receives_communications
                                        }
                                    />

                                    <PermissionBadge
                                        label="Fee Notifications"
                                        active={
                                            item.receives_fee_notifications
                                        }
                                    />

                                    <PermissionBadge
                                        label="Emergency"
                                        active={
                                            item.is_emergency_contact
                                        }
                                    />
                                </div>

                                {/* Actions */}

                                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-200">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/sms/student-parents/${item.id}`
                                            )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/sms/student-parents/${item.id}/edit`
                                            )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-100 text-purple-800 rounded-xl hover:bg-purple-200 transition"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(item)
                                        }
                                        className="px-3 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-red-100 hover:text-red-700 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredRelationships.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                            <EmptyState
                                searchTerm={searchTerm}
                                onAdd={() =>
                                    navigate(
                                        "/sms/student-parents/add"
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium truncate">
                        {title}
                    </p>

                    <p className="text-xl font-bold text-gray-800 mt-0.5">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------
// PERMISSION BADGE
// --------------------------------------------------

const PermissionBadge = ({ label, active }) => {
    return (
        <div
            className={`rounded-xl border p-3 ${
                active
                    ? "bg-purple-50 border-purple-200"
                    : "bg-gray-100 border-gray-200"
            }`}
        >
            <div className="flex items-center gap-2">
                {active ? (
                    <CheckCircle
                        size={16}
                        className="text-purple-700 flex-shrink-0"
                    />
                ) : (
                    <XCircle
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                    />
                )}

                <span
                    className={`text-xs font-medium ${
                        active
                            ? "text-purple-800"
                            : "text-gray-500"
                    }`}
                >
                    {label}
                </span>
            </div>
        </div>
    );
};

// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

const EmptyState = ({ searchTerm, onAdd }) => {
    return (
        <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-4">
                <Users size={28} />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
                No Relationships Found
            </h3>

            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                {searchTerm
                    ? "No student-parent relationships match your current search or filters."
                    : "No student-parent relationships have been created yet."}
            </p>

            {!searchTerm && (
                <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition"
                >
                    <Plus size={17} />
                    Add Relationship
                </button>
            )}
        </div>
    );
};

export default StudentParentsPage;