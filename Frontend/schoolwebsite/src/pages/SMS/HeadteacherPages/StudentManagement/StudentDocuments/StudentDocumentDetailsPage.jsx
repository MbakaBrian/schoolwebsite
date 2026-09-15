import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    FileText,
    Upload,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    File,
    User,
    Calendar,
    Filter,
    AlertCircle,
} from "lucide-react";


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

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
        .join(" ") || "Unknown Student";
};


const getDocumentTypeLabel = (type) => {
    const labels = {
        birth_certificate: "Birth Certificate",
        previous_school_report: "Previous School Report",
        transfer_certificate: "Transfer Certificate",
        medical_form: "Medical Form",
        medical_document: "Medical Document",
        admission_form: "Admission Form",
        parent_guardian_document: "Parent / Guardian Document",
        other: "Other",
    };

    return labels[type] || type || "Unknown";
};


const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


// --------------------------------------------------
// PAGE
// --------------------------------------------------

const StudentDocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("active");

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        document: null,
    });

    const [deleting, setDeleting] = useState(false);


    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------

    const fetchData = async (showRefresh = false) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [documentsResponse, studentsResponse] =
                await Promise.all([
                    axiosInstance.get("/students/documents/"),
                    axiosInstance.get("/students/students/"),
                ]);

            setDocuments(getResults(documentsResponse));
            setStudents(getResults(studentsResponse));
        } catch (err) {
            console.error("Failed to fetch student documents:", err);

            setError(
                err?.response?.data?.detail ||
                "Failed to load student documents. Please try again."
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
    // FILTER DOCUMENTS
    // --------------------------------------------------

    const filteredDocuments = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return documents.filter((document) => {
            const student =
                studentMap[document.student] ||
                document.student;

            const studentName = getStudentName(student);

            const admissionNumber =
                student?.admission_number || "";

            const studentId =
                student?.student_id || "";

            const documentTitle =
                document.title || "";

            const description =
                document.description || "";

            const documentType =
                getDocumentTypeLabel(document.document_type);

            const uploadedBy =
                document.uploaded_by_name || "";

            const matchesSearch =
                !search ||
                studentName.toLowerCase().includes(search) ||
                admissionNumber.toLowerCase().includes(search) ||
                studentId.toLowerCase().includes(search) ||
                documentTitle.toLowerCase().includes(search) ||
                description.toLowerCase().includes(search) ||
                documentType.toLowerCase().includes(search) ||
                uploadedBy.toLowerCase().includes(search);

            const matchesType =
                documentTypeFilter === "all" ||
                document.document_type === documentTypeFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && document.is_active) ||
                (statusFilter === "inactive" && !document.is_active);

            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );
        });
    }, [
        documents,
        studentMap,
        searchTerm,
        documentTypeFilter,
        statusFilter,
    ]);


    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------

    const statistics = useMemo(() => {
        const total = documents.length;

        const active = documents.filter(
            (document) => document.is_active
        ).length;

        const inactive = documents.filter(
            (document) => !document.is_active
        ).length;

        const birthCertificates = documents.filter(
            (document) =>
                document.document_type === "birth_certificate"
        ).length;

        const admissionForms = documents.filter(
            (document) =>
                document.document_type === "admission_form"
        ).length;

        return {
            total,
            active,
            inactive,
            birthCertificates,
            admissionForms,
        };
    }, [documents]);


    // --------------------------------------------------
    // DEACTIVATE DOCUMENT
    // --------------------------------------------------

    const handleDeactivate = async () => {
        const document = deleteModal.document;

        if (!document) return;

        try {
            setDeleting(true);

            await axiosInstance.delete(
                `/students/documents/${document.id}/`
            );

            setDeleteModal({
                open: false,
                document: null,
            });

            await fetchData(true);
        } catch (err) {
            console.error("Failed to deactivate document:", err);

            setError(
                err?.response?.data?.detail ||
                "Failed to deactivate the document."
            );
        } finally {
            setDeleting(false);
        }
    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-6 h-28 animate-pulse rounded-2xl bg-gray-300" />

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-28 animate-pulse rounded-2xl bg-gray-300"
                            />
                        ))}
                    </div>

                    <div className="h-96 animate-pulse rounded-2xl bg-gray-300" />
                </div>
            </div>
        );
    }


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="overflow-hidden rounded-2xl bg-purple-800 shadow-lg">

                    <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-xl bg-purple-700 p-3">
                                    <FileText
                                        size={28}
                                        className="text-white"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                        Student Documents
                                    </h1>

                                    <p className="mt-1 text-sm text-purple-200">
                                        Manage student records and supporting documents
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-wrap gap-3">

                            <button
                                type="button"
                                onClick={() => fetchData(true)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
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


                            <Link
                                to="/sms/documents/upload"
                                className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-semibold text-purple-800 shadow-sm transition hover:bg-gray-200"
                            >
                                <Upload size={17} />

                                Upload Document
                            </Link>

                        </div>

                    </div>
                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-semibold">
                                Something went wrong
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-sm font-semibold text-red-700 hover:text-red-900"
                        >
                            Dismiss
                        </button>

                    </div>
                )}


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total */}
                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Documents
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.total}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <FileText
                                    size={24}
                                    className="text-purple-700"
                                />
                            </div>

                        </div>

                    </div>


                    {/* Active */}
                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.active}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <CheckCircle
                                    size={24}
                                    className="text-purple-700"
                                />
                            </div>

                        </div>

                    </div>


                    {/* Birth Certificates */}
                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Birth Certificates
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.birthCertificates}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <File
                                    size={24}
                                    className="text-purple-700"
                                />
                            </div>

                        </div>

                    </div>


                    {/* Admission Forms */}
                    <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Admission Forms
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-800">
                                    {statistics.admissionForms}
                                </p>
                            </div>

                            <div className="rounded-xl bg-purple-100 p-3">
                                <FileText
                                    size={24}
                                    className="text-purple-700"
                                />
                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">

                    <div className="mb-4 flex items-center gap-2">
                        <Filter
                            size={19}
                            className="text-purple-700"
                        />

                        <h2 className="font-semibold text-gray-800">
                            Search & Filters
                        </h2>
                    </div>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        {/* Search */}
                        <div className="lg:col-span-2">

                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
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
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search student, admission number, document..."
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />

                            </div>

                        </div>


                        {/* Document Type */}
                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Document Type
                            </label>

                            <select
                                value={documentTypeFilter}
                                onChange={(event) =>
                                    setDocumentTypeFilter(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="all">
                                    All Document Types
                                </option>

                                <option value="birth_certificate">
                                    Birth Certificate
                                </option>

                                <option value="previous_school_report">
                                    Previous School Report
                                </option>

                                <option value="transfer_certificate">
                                    Transfer Certificate
                                </option>

                                <option value="medical_form">
                                    Medical Form
                                </option>

                                <option value="medical_document">
                                    Medical Document
                                </option>

                                <option value="admission_form">
                                    Admission Form
                                </option>

                                <option value="parent_guardian_document">
                                    Parent / Guardian Document
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* Status */}
                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="all">
                                    All Statuses
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    DOCUMENTS TABLE
                ================================================== */}

                <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">

                    {/* Table header */}
                    <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="font-bold text-gray-800">
                                Document Records
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Showing {filteredDocuments.length} of{" "}
                                {documents.length} documents
                            </p>
                        </div>

                    </div>


                    {filteredDocuments.length === 0 ? (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="rounded-2xl bg-purple-100 p-4">
                                <FileText
                                    size={34}
                                    className="text-purple-700"
                                />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-gray-800">
                                No documents found
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-gray-500">
                                {documents.length === 0
                                    ? "No student documents have been uploaded yet."
                                    : "No documents match your current search and filter criteria."
                                }
                            </p>

                            {documents.length === 0 && (
                                <Link
                                    to="/sms/documents/upload"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                                >
                                    <Upload size={17} />
                                    Upload First Document
                                </Link>
                            )}

                        </div>

                    ) : (

                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto lg:block">

                                <table className="w-full text-left">

                                    <thead className="bg-gray-800 text-xs uppercase tracking-wide text-gray-200">

                                        <tr>
                                            <th className="px-5 py-4">
                                                Document
                                            </th>

                                            <th className="px-5 py-4">
                                                Student
                                            </th>

                                            <th className="px-5 py-4">
                                                Type
                                            </th>

                                            <th className="px-5 py-4">
                                                Uploaded
                                            </th>

                                            <th className="px-5 py-4">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-gray-200">

                                        {filteredDocuments.map((document) => {

                                            const student =
                                                studentMap[document.student] ||
                                                document.student;

                                            return (
                                                <tr
                                                    key={document.id}
                                                    className="transition hover:bg-gray-100"
                                                >

                                                    {/* Document */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="rounded-xl bg-purple-100 p-2.5">
                                                                <FileText
                                                                    size={19}
                                                                    className="text-purple-700"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="truncate font-semibold text-gray-800">
                                                                    {document.title ||
                                                                        getDocumentTypeLabel(
                                                                            document.document_type
                                                                        )}
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    ID: {document.id}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Student */}
                                                    <td className="px-5 py-4">

                                                        <Link
                                                            to={`/sms/students/${document.student}`}
                                                            className="group"
                                                        >

                                                            <p className="font-semibold text-purple-800 group-hover:text-purple-600">
                                                                {getStudentName(
                                                                    student
                                                                )}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {student?.admission_number ||
                                                                    "No admission number"}
                                                            </p>

                                                        </Link>

                                                    </td>


                                                    {/* Type */}
                                                    <td className="px-5 py-4">

                                                        <span className="inline-flex rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-800">
                                                            {getDocumentTypeLabel(
                                                                document.document_type
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* Uploaded */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-gray-600">

                                                            <Calendar
                                                                size={15}
                                                                className="text-gray-400"
                                                            />

                                                            {formatDate(
                                                                document.uploaded_at
                                                            )}

                                                        </div>

                                                        {document.uploaded_by_name && (
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                By{" "}
                                                                {
                                                                    document.uploaded_by_name
                                                                }
                                                            </p>
                                                        )}

                                                    </td>


                                                    {/* Status */}
                                                    <td className="px-5 py-4">

                                                        {document.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-800">
                                                                <CheckCircle size={14} />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                                                <XCircle size={14} />
                                                                Inactive
                                                            </span>
                                                        )}

                                                    </td>


                                                    {/* Actions */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            <Link
                                                                to={`/sms/documents/${document.id}`}
                                                                title="View document"
                                                                className="rounded-lg bg-gray-200 p-2 text-gray-700 transition hover:bg-purple-100 hover:text-purple-700"
                                                            >
                                                                <Eye size={17} />
                                                            </Link>


                                                            <Link
                                                                to={`/sms/documents/${document.id}/edit`}
                                                                title="Edit document"
                                                                className="rounded-lg bg-gray-200 p-2 text-gray-700 transition hover:bg-purple-100 hover:text-purple-700"
                                                            >
                                                                <Edit size={17} />
                                                            </Link>


                                                            {document.is_active && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleteModal({
                                                                            open: true,
                                                                            document,
                                                                        })
                                                                    }
                                                                    title="Deactivate document"
                                                                    className="rounded-lg bg-gray-200 p-2 text-gray-700 transition hover:bg-red-100 hover:text-red-700"
                                                                >
                                                                    <Trash2 size={17} />
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

                            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">

                                {filteredDocuments.map((document) => {

                                    const student =
                                        studentMap[document.student] ||
                                        document.student;

                                    return (
                                        <div
                                            key={document.id}
                                            className="rounded-2xl border border-gray-200 bg-gray-100 p-4"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="rounded-xl bg-purple-100 p-2.5">
                                                        <FileText
                                                            size={20}
                                                            className="text-purple-700"
                                                        />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="truncate font-bold text-gray-800">
                                                            {document.title ||
                                                                getDocumentTypeLabel(
                                                                    document.document_type
                                                                )}
                                                        </h3>

                                                        <p className="text-xs text-gray-500">
                                                            Document #{document.id}
                                                        </p>

                                                    </div>

                                                </div>


                                                {document.is_active ? (
                                                    <span className="shrink-0 rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                        Inactive
                                                    </span>
                                                )}

                                            </div>


                                            <div className="mt-4 space-y-3">

                                                <Link
                                                    to={`/sms/students/${document.student}`}
                                                    className="flex items-center gap-3 rounded-xl bg-gray-200 p-3 transition hover:bg-purple-100"
                                                >

                                                    <User
                                                        size={17}
                                                        className="text-purple-700"
                                                    />

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Student
                                                        </p>

                                                        <p className="font-semibold text-purple-800">
                                                            {getStudentName(
                                                                student
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {student?.admission_number ||
                                                                "No admission number"}
                                                        </p>
                                                    </div>

                                                </Link>


                                                <div className="grid grid-cols-2 gap-3">

                                                    <div className="rounded-xl bg-gray-200 p-3">

                                                        <p className="text-xs text-gray-500">
                                                            Type
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                                            {getDocumentTypeLabel(
                                                                document.document_type
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-gray-200 p-3">

                                                        <p className="text-xs text-gray-500">
                                                            Uploaded
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                                            {formatDate(
                                                                document.uploaded_at
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">

                                                <Link
                                                    to={`/sms/documents/${document.id}`}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>


                                                <Link
                                                    to={`/sms/documents/${document.id}/edit`}
                                                    className="flex items-center justify-center rounded-xl bg-gray-200 px-3 py-2.5 text-gray-700 transition hover:bg-purple-100 hover:text-purple-700"
                                                    title="Edit"
                                                >
                                                    <Edit size={17} />
                                                </Link>


                                                {document.is_active && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                open: true,
                                                                document,
                                                            })
                                                        }
                                                        className="flex items-center justify-center rounded-xl bg-gray-200 px-3 py-2.5 text-gray-700 transition hover:bg-red-100 hover:text-red-700"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 size={17} />
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

            </div>


            {/* ======================================================
                DEACTIVATE MODAL
            ====================================================== */}

            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-gray-50 p-6 shadow-2xl">

                        <div className="flex items-start gap-4">

                            <div className="rounded-xl bg-red-100 p-3">
                                <Trash2
                                    size={24}
                                    className="text-red-600"
                                />
                            </div>

                            <div className="flex-1">

                                <h3 className="text-lg font-bold text-gray-800">
                                    Deactivate Document?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    You are about to deactivate{" "}
                                    <span className="font-semibold text-gray-800">
                                        {deleteModal.document?.title ||
                                            getDocumentTypeLabel(
                                                deleteModal.document
                                                    ?.document_type
                                            )}
                                    </span>
                                    .
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    The document will remain in the system but
                                    will no longer appear among active records.
                                </p>

                            </div>

                        </div>


                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({
                                        open: false,
                                        document: null,
                                    })
                                }
                                disabled={deleting}
                                className="rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-60"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleDeactivate}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deactivating...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Deactivate
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default StudentDocumentsPage;

