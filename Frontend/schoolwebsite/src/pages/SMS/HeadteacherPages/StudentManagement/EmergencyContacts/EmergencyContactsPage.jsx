import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Edit,
    Phone,
    UserRound,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Users,
    AlertCircle,
} from "lucide-react";
import axiosInstance from "../../../../../utils/axiosInstance";

const getResults = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

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

const getRelationshipLabel = (relationship) => {
    if (!relationship) return "Not specified";

    return relationship
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const EmergencyContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("active");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [contactsResponse, studentsResponse] =
                await Promise.all([
                    axiosInstance.get(
                        "/students/emergency-contacts/"
                    ),
                    axiosInstance.get(
                        "/students/students/"
                    ),
                ]);

            setContacts(getResults(contactsResponse));
            setStudents(getResults(studentsResponse));
        } catch (err) {
            console.error(
                "Error fetching emergency contacts:",
                err
            );

            setError(
                "Unable to load emergency contacts. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --------------------------------------------------
    // STUDENT LOOKUP
    // --------------------------------------------------

    const studentMap = useMemo(() => {
        const map = {};

        students.forEach((student) => {
            map[student.id] = student;
        });

        return map;
    }, [students]);

    // --------------------------------------------------
    // FILTER CONTACTS
    // --------------------------------------------------

    const filteredContacts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return contacts.filter((contact) => {
            const student = studentMap[contact.student];

            const studentName = getStudentName(student);

            const searchableText = [
                contact.full_name,
                contact.relationship,
                contact.mobile_number,
                contact.alternative_mobile,
                contact.email,
                contact.address,
                studentName,
                student?.admission_number,
                student?.student_id,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search || searchableText.includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && contact.is_active) ||
                (statusFilter === "inactive" &&
                    !contact.is_active);

            const matchesPriority =
                priorityFilter === "all" ||
                String(contact.priority) ===
                    String(priorityFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [
        contacts,
        students,
        studentMap,
        searchTerm,
        statusFilter,
        priorityFilter,
    ]);

    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------

    const statistics = useMemo(() => {
        const total = contacts.length;

        const active = contacts.filter(
            (contact) => contact.is_active
        ).length;

        const inactive = contacts.filter(
            (contact) => !contact.is_active
        ).length;

        const primary = contacts.filter(
            (contact) => Number(contact.priority) === 1
        ).length;

        return {
            total,
            active,
            inactive,
            primary,
        };
    }, [contacts]);

    // --------------------------------------------------
    // DEACTIVATE
    // --------------------------------------------------

    const handleDeactivate = async (contact) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${contact.full_name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await axiosInstance.delete(
                `/students/emergency-contacts/${contact.id}/`
            );

            setContacts((previous) =>
                previous.map((item) =>
                    item.id === contact.id
                        ? {
                              ...item,
                              is_active: false,
                          }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Error deactivating emergency contact:",
                err
            );

            setError(
                "Unable to deactivate this emergency contact."
            );
        }
    };

    // --------------------------------------------------
    // ACTIVATE
    // --------------------------------------------------

    const handleActivate = async (contact) => {
        try {
            const studentId = contact.student;

            const payload = {
                student: Number(studentId),
                full_name: contact.full_name,
                relationship: contact.relationship,
                mobile_number: contact.mobile_number,
                alternative_mobile:
                    contact.alternative_mobile || "",
                email: contact.email || "",
                address: contact.address || "",
                priority: contact.priority,
                is_active: true,
            };

            const response = await axiosInstance.put(
                `/students/emergency-contacts/${contact.id}/`,
                payload
            );

            setContacts((previous) =>
                previous.map((item) =>
                    item.id === contact.id
                        ? response.data
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Error activating emergency contact:",
                err
            );

            setError(
                "Unable to activate this emergency contact."
            );
        }
    };

    // --------------------------------------------------
    // STATUS BADGE
    // --------------------------------------------------

    const StatusBadge = ({ active }) => {
        if (active) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                    <CheckCircle size={14} />
                    Active
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                <XCircle size={14} />
                Inactive
            </span>
        );
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl bg-gray-50 p-10 text-center shadow-sm">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

                        <p className="text-sm text-gray-600">
                            Loading emergency contacts...
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="overflow-hidden rounded-2xl bg-purple-800 shadow-lg">

                    <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="rounded-xl bg-purple-700 p-3 text-purple-100">
                                <ShieldAlert size={26} />
                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-white">
                                    Emergency Contacts
                                </h1>

                                <p className="mt-1 text-sm text-purple-200">
                                    Manage emergency contacts assigned
                                    to students.
                                </p>

                            </div>

                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">

                            <button
                                type="button"
                                onClick={fetchData}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
                            >
                                <RefreshCw size={17} />
                                Refresh
                            </button>

                            <Link
                                to="/sms/emergency-contacts/add"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-purple-800 transition hover:bg-gray-200"
                            >
                                <Plus size={18} />
                                Add Contact
                            </Link>

                        </div>

                    </div>
                </div>

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
                    STATISTICS
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Contacts
                                </p>

                                <p className="mt-1 text-3xl font-bold text-gray-800">
                                    {statistics.total}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                                <Users size={22} />
                            </div>

                        </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Active
                                </p>

                                <p className="mt-1 text-3xl font-bold text-purple-800">
                                    {statistics.active}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                                <CheckCircle size={22} />
                            </div>

                        </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Inactive
                                </p>

                                <p className="mt-1 text-3xl font-bold text-gray-700">
                                    {statistics.inactive}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-200 p-3 text-gray-700">
                                <XCircle size={22} />
                            </div>

                        </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Primary Contacts
                                </p>

                                <p className="mt-1 text-3xl font-bold text-purple-800">
                                    {statistics.primary}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                                <ShieldAlert size={22} />
                            </div>

                        </div>
                    </div>

                </div>

                {/* ==================================================
                    FILTERS
                ================================================== */}

                <section className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        {/* SEARCH */}

                        <div className="lg:col-span-2">

                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search contact, student, phone..."
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />

                            </div>
                        </div>

                        {/* STATUS */}

                        <div>

                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="all">
                                    All
                                </option>
                            </select>

                        </div>

                        {/* PRIORITY */}

                        <div>

                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Priority
                            </label>

                            <select
                                value={priorityFilter}
                                onChange={(event) =>
                                    setPriorityFilter(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="all">
                                    All Priorities
                                </option>

                                <option value="1">
                                    Priority 1
                                </option>

                                <option value="2">
                                    Priority 2
                                </option>

                                <option value="3">
                                    Priority 3
                                </option>

                            </select>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    CONTACTS TABLE
                ================================================== */}

                <section className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-lg font-bold text-gray-800">
                                Emergency Contact Records
                            </h2>

                            <p className="text-sm text-gray-500">
                                Showing {filteredContacts.length} of{" "}
                                {contacts.length} contacts
                            </p>

                        </div>

                    </div>

                    {/* DESKTOP TABLE */}

                    <div className="hidden overflow-x-auto lg:block">

                        <table className="w-full">

                            <thead className="bg-gray-200">

                                <tr>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Contact
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Relationship
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Phone
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Priority
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

                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center"
                                        >
                                            <ShieldAlert
                                                size={38}
                                                className="mx-auto mb-3 text-gray-400"
                                            />

                                            <p className="font-semibold text-gray-700">
                                                No emergency contacts found
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Try changing your filters or
                                                add a new emergency contact.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map(
                                        (contact) => {
                                            const student =
                                                studentMap[
                                                    contact.student
                                                ];

                                            return (
                                                <tr
                                                    key={
                                                        contact.id
                                                    }
                                                    className="transition hover:bg-purple-50"
                                                >

                                                    {/* CONTACT */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                                                <UserRound
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {
                                                                        contact.full_name
                                                                    }
                                                                </p>

                                                                {contact.email && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            contact.email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* STUDENT */}

                                                    <td className="px-5 py-4">

                                                        {student ? (
                                                            <Link
                                                                to={`/sms/students/${student.id}`}
                                                                className="group"
                                                            >
                                                                <p className="font-semibold text-gray-800 group-hover:text-purple-700">
                                                                    {getStudentName(
                                                                        student
                                                                    )}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        student.admission_number
                                                                    }
                                                                </p>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                Unknown
                                                                Student
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* RELATIONSHIP */}

                                                    <td className="px-5 py-4">

                                                        <span className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                                            {getRelationshipLabel(
                                                                contact.relationship
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* PHONE */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-gray-700">

                                                            <Phone
                                                                size={
                                                                    16
                                                                }
                                                                className="text-purple-600"
                                                            />

                                                            {
                                                                contact.mobile_number ||
                                                                "Not provided"
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* PRIORITY */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                                Number(
                                                                    contact.priority
                                                                ) ===
                                                                1
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : "bg-gray-200 text-gray-700"
                                                            }`}
                                                        >
                                                            Priority{" "}
                                                            {
                                                                contact.priority
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            active={
                                                                contact.is_active
                                                            }
                                                        />
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            <Link
                                                                to={`/sms/emergency-contacts/${contact.id}`}
                                                                title="View"
                                                                className="rounded-lg bg-purple-100 p-2 text-purple-700 transition hover:bg-purple-200"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </Link>

                                                            <Link
                                                                to={`/sms/emergency-contacts/${contact.id}/edit`}
                                                                title="Edit"
                                                                className="rounded-lg bg-gray-200 p-2 text-gray-700 transition hover:bg-gray-300"
                                                            >
                                                                <Edit
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </Link>

                                                            {contact.is_active ? (
                                                                <button
                                                                    type="button"
                                                                    title="Deactivate"
                                                                    onClick={() =>
                                                                        handleDeactivate(
                                                                            contact
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-800 p-2 text-white transition hover:bg-gray-900"
                                                                >
                                                                    <XCircle
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    title="Activate"
                                                                    onClick={() =>
                                                                        handleActivate(
                                                                            contact
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-purple-800 p-2 text-white transition hover:bg-purple-900"
                                                                >
                                                                    <CheckCircle
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* MOBILE / TABLET CARDS */}

                    <div className="divide-y divide-gray-200 lg:hidden">

                        {filteredContacts.length === 0 ? (
                            <div className="p-10 text-center">

                                <ShieldAlert
                                    size={38}
                                    className="mx-auto mb-3 text-gray-400"
                                />

                                <p className="font-semibold text-gray-700">
                                    No emergency contacts found
                                </p>

                            </div>
                        ) : (
                            filteredContacts.map((contact) => {
                                const student =
                                    studentMap[
                                        contact.student
                                    ];

                                return (
                                    <div
                                        key={contact.id}
                                        className="p-5"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                                    <UserRound
                                                        size={20}
                                                    />
                                                </div>

                                                <div>

                                                    <p className="font-bold text-gray-800">
                                                        {
                                                            contact.full_name
                                                        }
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {getRelationshipLabel(
                                                            contact.relationship
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                            <StatusBadge
                                                active={
                                                    contact.is_active
                                                }
                                            />

                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                            <div className="rounded-xl bg-gray-200 p-3">

                                                <p className="text-xs font-semibold uppercase text-gray-500">
                                                    Student
                                                </p>

                                                {student ? (
                                                    <Link
                                                        to={`/sms/students/${student.id}`}
                                                        className="mt-1 block font-semibold text-gray-800 hover:text-purple-700"
                                                    >
                                                        {getStudentName(
                                                            student
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <p className="mt-1 font-semibold text-gray-700">
                                                        Unknown
                                                    </p>
                                                )}

                                            </div>

                                            <div className="rounded-xl bg-gray-200 p-3">

                                                <p className="text-xs font-semibold uppercase text-gray-500">
                                                    Phone
                                                </p>

                                                <p className="mt-1 flex items-center gap-2 font-semibold text-gray-800">

                                                    <Phone
                                                        size={15}
                                                        className="text-purple-700"
                                                    />

                                                    {
                                                        contact.mobile_number ||
                                                        "Not provided"
                                                    }

                                                </p>

                                            </div>

                                            <div className="rounded-xl bg-gray-200 p-3">

                                                <p className="text-xs font-semibold uppercase text-gray-500">
                                                    Priority
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    Priority{" "}
                                                    {
                                                        contact.priority
                                                    }
                                                </p>

                                            </div>

                                            <div className="rounded-xl bg-gray-200 p-3">

                                                <p className="text-xs font-semibold uppercase text-gray-500">
                                                    Admission
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {
                                                        student?.admission_number ||
                                                        "Not available"
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-4 flex gap-2">

                                            <Link
                                                to={`/sms/emergency-contacts/${contact.id}`}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-800 hover:bg-purple-200"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>

                                            <Link
                                                to={`/sms/emergency-contacts/${contact.id}/edit`}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </Link>

                                        </div>

                                    </div>
                                );
                            })
                        )}

                    </div>

                </section>

            </div>
        </div>
    );
};

export default EmergencyContactsPage;