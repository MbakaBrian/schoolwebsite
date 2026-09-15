import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Upload,
    FileText,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    File,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


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


// --------------------------------------------------
// DOCUMENT TYPES
// --------------------------------------------------

const documentTypes = [
    {
        value: "birth_certificate",
        label: "Birth Certificate",
    },
    {
        value: "previous_school_report",
        label: "Previous School Report",
    },
    {
        value: "transfer_certificate",
        label: "Transfer Certificate",
    },
    {
        value: "medical_form",
        label: "Medical Form",
    },
    {
        value: "medical_document",
        label: "Medical Document",
    },
    {
        value: "admission_form",
        label: "Admission Form",
    },
    {
        value: "parent_guardian_document",
        label: "Parent / Guardian Document",
    },
    {
        value: "other",
        label: "Other",
    },
];


// --------------------------------------------------
// PAGE
// --------------------------------------------------

const StudentDocumentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);
    const preselectedStudent = searchParams.get("student");


    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        student: preselectedStudent || "",
        document_type: "",
        title: "",
        file: null,
        description: "",
        is_active: true,
    });

    const [existingFile, setExistingFile] = useState("");

    const [errors, setErrors] = useState({});


    // --------------------------------------------------
    // FETCH STUDENTS
    // --------------------------------------------------

    const fetchStudents = async () => {
        try {
            const response = await axiosInstance.get(
                "/students/students/"
            );

            setStudents(getResults(response));
        } catch (err) {
            console.error("Failed to load students:", err);

            setError(
                err?.response?.data?.detail ||
                "Failed to load students."
            );
        }
    };


    // --------------------------------------------------
    // FETCH DOCUMENT FOR EDITING
    // --------------------------------------------------

    const fetchDocument = async () => {
        try {
            const response = await axiosInstance.get(
                `/students/documents/${id}/`
            );

            const document = response.data;

            setFormData({
                student: document.student || "",
                document_type: document.document_type || "",
                title: document.title || "",
                file: null,
                description: document.description || "",
                is_active:
                    document.is_active !== undefined
                        ? document.is_active
                        : true,
            });

            setExistingFile(document.file || "");
        } catch (err) {
            console.error("Failed to load document:", err);

            setError(
                err?.response?.data?.detail ||
                "Failed to load the document."
            );
        }
    };


    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            setError("");

            try {
                if (isEditMode) {
                    await Promise.all([
                        fetchStudents(),
                        fetchDocument(),
                    ]);
                } else {
                    await fetchStudents();
                }
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [id]);


    // --------------------------------------------------
    // FORM HANDLERS
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };


    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: checked,
        }));
    };


    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setFormData((previous) => ({
            ...previous,
            file,
        }));

        setErrors((previous) => ({
            ...previous,
            file: "",
        }));
    };


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validateForm = () => {
        const newErrors = {};

        if (!formData.student) {
            newErrors.student = "Please select a student.";
        }

        if (!formData.document_type) {
            newErrors.document_type =
                "Please select a document type.";
        }

        if (!formData.title.trim()) {
            newErrors.title =
                "Please enter a document title.";
        }

        // File is required only when creating a new document.
        if (!isEditMode && !formData.file) {
            newErrors.file =
                "Please select a document to upload.";
        }

        if (formData.file) {
            const maxSize =
                10 * 1024 * 1024; // 10 MB

            if (formData.file.size > maxSize) {
                newErrors.file =
                    "The selected file must not exceed 10 MB.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = new FormData();

            payload.append(
                "student",
                formData.student
            );

            payload.append(
                "document_type",
                formData.document_type
            );

            payload.append(
                "title",
                formData.title.trim()
            );

            payload.append(
                "description",
                formData.description.trim()
            );

            payload.append(
                "is_active",
                formData.is_active ? "true" : "false"
            );

            // Only send a file if one has been selected.
            if (formData.file) {
                payload.append(
                    "file",
                    formData.file
                );
            }


            if (isEditMode) {
                await axiosInstance.put(
                    `/students/documents/${id}/`,
                    payload,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setSuccess(
                    "Document updated successfully."
                );

                setTimeout(() => {
                    navigate(
                        `/sms/documents/${id}`
                    );
                }, 700);
            } else {
                const response =
                    await axiosInstance.post(
                        "/students/documents/",
                        payload,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data",
                            },
                        }
                    );

                setSuccess(
                    "Document uploaded successfully."
                );

                const createdId =
                    response?.data?.id;

                setTimeout(() => {
                    if (createdId) {
                        navigate(
                            `/sms/documents/${createdId}`
                        );
                    } else {
                        navigate(
                            "/sms/documents"
                        );
                    }
                }, 700);
            }
        } catch (err) {
            console.error(
                "Failed to save document:",
                err
            );

            const backendErrors =
                err?.response?.data;

            if (
                backendErrors &&
                typeof backendErrors === "object"
            ) {
                const formattedErrors = {};

                Object.entries(
                    backendErrors
                ).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        formattedErrors[field] =
                            messages.join(" ");
                    } else {
                        formattedErrors[field] =
                            String(messages);
                    }
                });

                setErrors(formattedErrors);
            }

            setError(
                backendErrors?.detail ||
                "Failed to save the document. Please check the form and try again."
            );
        } finally {
            setSaving(false);
        }
    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

                <div className="mx-auto max-w-5xl">

                    <div className="h-28 animate-pulse rounded-2xl bg-gray-300" />

                    <div className="mt-6 h-[600px] animate-pulse rounded-2xl bg-gray-300" />

                </div>

            </div>
        );
    }


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

            <div className="mx-auto max-w-5xl space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="overflow-hidden rounded-2xl bg-purple-800 shadow-lg">

                    <div className="p-6">

                        <Link
                            to={
                                isEditMode
                                    ? `/sms/documents/${id}`
                                    : "/sms/documents"
                            }
                            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-purple-200 transition hover:text-white"
                        >
                            <ArrowLeft size={17} />
                            Back to Documents
                        </Link>


                        <div className="flex items-center gap-4">

                            <div className="rounded-xl bg-purple-700 p-3">
                                {isEditMode ? (
                                    <FileText
                                        size={28}
                                        className="text-white"
                                    />
                                ) : (
                                    <Upload
                                        size={28}
                                        className="text-white"
                                    />
                                )}
                            </div>


                            <div>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    {isEditMode
                                        ? "Edit Student Document"
                                        : "Upload Student Document"}
                                </h1>

                                <p className="mt-1 text-sm text-purple-200">
                                    {isEditMode
                                        ? "Update document information or replace the file."
                                        : "Add a supporting document to a student's records."}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    SUCCESS
                ================================================== */}

                {success && (
                    <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-100 p-4 text-purple-800">

                        <CheckCircle size={20} />

                        <p className="text-sm font-semibold">
                            {success}
                        </p>

                    </div>
                )}


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="font-semibold">
                                Unable to save document
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>

                    </div>
                )}


                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ==================================================
                        DOCUMENT INFORMATION
                    ================================================== */}

                    <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">

                        <div className="border-b border-gray-200 bg-gray-200/70 px-6 py-4">

                            <div className="flex items-center gap-3">

                                <FileText
                                    size={20}
                                    className="text-purple-700"
                                />

                                <div>
                                    <h2 className="font-bold text-gray-800">
                                        Document Information
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Identify the document and the student it belongs to.
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                            {/* Student */}
                            <div className="md:col-span-2">

                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Student{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    name="student"
                                    value={formData.student}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className={`w-full rounded-xl border bg-gray-100 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-gray-200 ${
                                        errors.student
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        Select student
                                    </option>

                                    {students.map(
                                        (student) => (
                                            <option
                                                key={
                                                    student.id
                                                }
                                                value={
                                                    student.id
                                                }
                                            >
                                                {getStudentName(
                                                    student
                                                )}{" "}
                                                —{" "}
                                                {student.admission_number ||
                                                    "No admission number"}
                                            </option>
                                        )
                                    )}

                                </select>

                                {errors.student && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.student}
                                    </p>
                                )}

                                {isEditMode && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        The student cannot be changed after the document has been created.
                                    </p>
                                )}

                            </div>


                            {/* Document Type */}
                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Document Type{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    name="document_type"
                                    value={
                                        formData.document_type
                                    }
                                    onChange={handleChange}
                                    className={`w-full rounded-xl border bg-gray-100 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                                        errors.document_type
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        Select document type
                                    </option>

                                    {documentTypes.map(
                                        (type) => (
                                            <option
                                                key={
                                                    type.value
                                                }
                                                value={
                                                    type.value
                                                }
                                            >
                                                {type.label}
                                            </option>
                                        )
                                    )}

                                </select>

                                {errors.document_type && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            errors.document_type
                                        }
                                    </p>
                                )}

                            </div>


                            {/* Title */}
                            <div>

                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Document Title{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. John's Birth Certificate"
                                    className={`w-full rounded-xl border bg-gray-100 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                                        errors.title
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                />

                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.title}
                                    </p>
                                )}

                            </div>


                            {/* Description */}
                            <div className="md:col-span-2">

                                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Add any useful notes about this document..."
                                    className="w-full resize-none rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        FILE
                    ================================================== */}

                    <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">

                        <div className="border-b border-gray-200 bg-gray-200/70 px-6 py-4">

                            <div className="flex items-center gap-3">

                                <File
                                    size={20}
                                    className="text-purple-700"
                                />

                                <div>
                                    <h2 className="font-bold text-gray-800">
                                        Document File
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Upload the document file.
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="p-6">

                            {isEditMode && existingFile && (
                                <div className="mb-5 rounded-xl bg-gray-200 p-4">

                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Current File
                                    </p>

                                    <a
                                        href={existingFile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-purple-800 hover:text-purple-600"
                                    >
                                        <FileText size={17} />
                                        Open Current Document
                                    </a>

                                </div>
                            )}


                            <label
                                htmlFor="document-file"
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition hover:border-purple-500 hover:bg-purple-50 ${
                                    errors.file
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-300 bg-gray-100"
                                }`}
                            >

                                <div className="rounded-2xl bg-purple-100 p-4">
                                    <Upload
                                        size={30}
                                        className="text-purple-700"
                                    />
                                </div>


                                <p className="mt-4 font-semibold text-gray-800">
                                    {formData.file
                                        ? formData.file.name
                                        : isEditMode
                                        ? "Choose a new file to replace the current file"
                                        : "Choose a document file"}
                                </p>


                                <p className="mt-1 text-sm text-gray-500">
                                    Maximum file size: 10 MB
                                </p>


                                <p className="mt-1 text-xs text-gray-400">
                                    PDF, Word documents, images and other supported file types
                                </p>


                                <input
                                    id="document-file"
                                    type="file"
                                    onChange={
                                        handleFileChange
                                    }
                                    className="hidden"
                                />

                            </label>


                            {errors.file && (
                                <p className="mt-2 text-xs text-red-600">
                                    {errors.file}
                                </p>
                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    {isEditMode && (
                        <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-sm">

                            <div className="border-b border-gray-200 bg-gray-200/70 px-6 py-4">

                                <h2 className="font-bold text-gray-800">
                                    Document Status
                                </h2>

                            </div>


                            <div className="p-6">

                                <label className="flex cursor-pointer items-start gap-3">

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            formData.is_active
                                        }
                                        onChange={
                                            handleCheckboxChange
                                        }
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800">
                                            Active document
                                        </span>

                                        <span className="mt-1 block text-xs text-gray-500">
                                            Inactive documents are retained for record purposes but are not shown among active documents.
                                        </span>
                                    </span>

                                </label>

                            </div>

                        </div>
                    )}


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            to={
                                isEditMode
                                    ? `/sms/documents/${id}`
                                    : "/sms/documents"
                            }
                            className="inline-flex items-center justify-center rounded-xl bg-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-400"
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {saving ? (
                                <>
                                    <RefreshCw
                                        size={17}
                                        className="animate-spin"
                                    />

                                    {isEditMode
                                        ? "Saving Changes..."
                                        : "Uploading..."}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <Save size={17} />
                                    ) : (
                                        <Upload size={17} />
                                    )}

                                    {isEditMode
                                        ? "Save Changes"
                                        : "Upload Document"}
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default StudentDocumentFormPage;

