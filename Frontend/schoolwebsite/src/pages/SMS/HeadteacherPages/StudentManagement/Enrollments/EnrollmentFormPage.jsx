import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    GraduationCap,
    CalendarDays,
    School,
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

const today = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
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

const getBackendError = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return "Something went wrong. Please try again.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.detail) {
        return data.detail;
    }

    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
            messages.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
            messages.push(`${field}: ${value}`);
        }
    });

    return messages.length
        ? messages.join(" | ")
        : "Unable to save enrollment.";
};

const initialForm = {
    student: "",
    academic_year: "",
    class_level: "",
    stream: "",
    enrollment_date: today(),
    status: "active",
    exit_date: "",
    exit_reason: "",
    previous_school: "",
};

const EnrollmentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState(initialForm);

    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    const [streams, setStreams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // LOAD FORM DATA
    // --------------------------------------------------

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const requests = [
                    axiosInstance.get("/students/students/"),
                    axiosInstance.get("/academics/years/"),
                    axiosInstance.get("/academics/class-levels/"),
                    axiosInstance.get("/academics/streams/"),
                ];

                if (isEditMode) {
                    requests.push(
                        axiosInstance.get(`/students/enrollments/${id}/`)
                    );
                }

                const responses = await Promise.all(requests);

                const studentsData = getResults(responses[0]);
                const yearsData = getResults(responses[1]);
                const classLevelsData = getResults(responses[2]);
                const streamsData = getResults(responses[3]);

                setStudents(studentsData);
                setAcademicYears(yearsData);
                setClassLevels(classLevelsData);
                setStreams(streamsData);

                // --------------------------------------------------
                // EDIT MODE
                // --------------------------------------------------

                if (isEditMode) {
                    const enrollment = responses[4]?.data;

                    setFormData({
                        student: enrollment?.student ?? "",
                        academic_year: enrollment?.academic_year ?? "",
                        class_level: enrollment?.class_level ?? "",
                        stream: enrollment?.stream ?? "",
                        enrollment_date:
                            enrollment?.enrollment_date || today(),
                        status: enrollment?.status || "active",
                        exit_date: enrollment?.exit_date || "",
                        exit_reason: enrollment?.exit_reason || "",
                        previous_school:
                            enrollment?.previous_school || "",
                    });

                    return;
                }

                // --------------------------------------------------
                // ADD MODE
                // --------------------------------------------------

                const currentYear = yearsData.find(
                    (year) => year.is_current
                );

                setFormData((previous) => ({
                    ...previous,
                    academic_year: currentYear?.id || "",
                }));
            } catch (err) {
                console.error("Error loading enrollment form:", err);

                setError(
                    "Unable to load the enrollment form. Please refresh and try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode]);

    // --------------------------------------------------
    // FILTER STREAMS BY CLASS LEVEL
    // --------------------------------------------------

    const filteredStreams = useMemo(() => {
        if (!formData.class_level) {
            return [];
        }

        return streams.filter((stream) => {
            const classLevelId =
                typeof stream.class_level === "object"
                    ? stream.class_level?.id
                    : stream.class_level;

            return Number(classLevelId) === Number(formData.class_level);
        });
    }, [streams, formData.class_level]);

    // --------------------------------------------------
    // HANDLE INPUT
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => {
            const updated = {
                ...previous,
                [name]: value,
            };

            // If class level changes, reset stream.
            if (name === "class_level") {
                updated.stream = "";
            }

            // If status changes back to active,
            // remove exit information.
            if (name === "status" && value === "active") {
                updated.exit_date = "";
                updated.exit_reason = "";
            }

            return updated;
        });

        setError("");
    };

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validateForm = () => {
        if (!formData.student) {
            return "Please select a student.";
        }

        if (!formData.academic_year) {
            return "Please select an academic year.";
        }

        if (!formData.class_level) {
            return "Please select a class level.";
        }

        if (!formData.enrollment_date) {
            return "Please select the enrollment date.";
        }

        if (
            formData.exit_date &&
            formData.exit_date < formData.enrollment_date
        ) {
            return "Exit date cannot be earlier than the enrollment date.";
        }

        if (
            formData.stream &&
            !filteredStreams.some(
                (stream) => Number(stream.id) === Number(formData.stream)
            )
        ) {
            return "The selected stream does not belong to the selected class level.";
        }

        if (
            formData.status !== "active" &&
            formData.exit_date &&
            !formData.exit_reason.trim()
        ) {
            return "Please provide an exit reason when an exit date is provided.";
        }

        return "";
    };

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                student: Number(formData.student),
                academic_year: Number(formData.academic_year),
                class_level: Number(formData.class_level),
                stream: formData.stream
                    ? Number(formData.stream)
                    : null,
                enrollment_date: formData.enrollment_date,
                status: formData.status,
                exit_date: formData.exit_date || null,
                exit_reason: formData.exit_reason.trim(),
                previous_school: formData.previous_school.trim(),
            };

            let response;

            if (isEditMode) {
                response = await axiosInstance.put(
                    `/students/enrollments/${id}/`,
                    payload
                );
            } else {
                response = await axiosInstance.post(
                    "/students/enrollments/",
                    payload
                );
            }

            const savedEnrollment = response?.data;

            navigate(
                `/sms/enrollments/${savedEnrollment?.id || id}`
            );
        } catch (err) {
            console.error("Error saving enrollment:", err);

            setError(getBackendError(err));

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl bg-gray-50 p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

                        <p className="text-sm text-gray-600">
                            Loading enrollment form...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* --------------------------------------------------
                    HEADER
                -------------------------------------------------- */}

                <div className="overflow-hidden rounded-2xl bg-purple-800 shadow-lg">

                    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-start gap-4">

                            <Link
                                to="/sms/enrollments"
                                className="mt-1 rounded-lg bg-purple-700 p-2 text-purple-100 transition hover:bg-purple-600"
                            >
                                <ArrowLeft size={20} />
                            </Link>

                            <div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap
                                        size={24}
                                        className="text-purple-200"
                                    />

                                    <h1 className="text-2xl font-bold text-white">
                                        {isEditMode
                                            ? "Edit Enrollment"
                                            : "Add Enrollment"}
                                    </h1>
                                </div>

                                <p className="mt-1 text-sm text-purple-200">
                                    {isEditMode
                                        ? "Update the student's academic enrollment record."
                                        : "Create a new academic enrollment record for a student."}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --------------------------------------------------
                    ERROR
                -------------------------------------------------- */}

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle
                            size={20}
                            className="mt-0.5 flex-shrink-0"
                        />

                        <div>
                            <p className="font-semibold">
                                Unable to save enrollment
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* --------------------------------------------------
                    FORM
                -------------------------------------------------- */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* --------------------------------------------------
                        STUDENT & ACADEMIC PLACEMENT
                    -------------------------------------------------- */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">

                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                                <School size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Academic Placement
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Select the student and academic placement.
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* STUDENT */}

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Student <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="student"
                                    value={formData.student}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-gray-200"
                                >
                                    <option value="">
                                        Select student
                                    </option>

                                    {students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {getStudentName(student)}
                                            {student.admission_number
                                                ? ` — ${student.admission_number}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                {isEditMode && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        The student cannot be changed after
                                        the enrollment record has been created.
                                    </p>
                                )}
                            </div>

                            {/* ACADEMIC YEAR */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Academic Year{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="academic_year"
                                    value={formData.academic_year}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">
                                        Select academic year
                                    </option>

                                    {academicYears.map((year) => (
                                        <option
                                            key={year.id}
                                            value={year.id}
                                        >
                                            {year.name}
                                            {year.is_current
                                                ? " (Current)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CLASS LEVEL */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Class Level{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="class_level"
                                    value={formData.class_level}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">
                                        Select class level
                                    </option>

                                    {classLevels.map((classLevel) => (
                                        <option
                                            key={classLevel.id}
                                            value={classLevel.id}
                                        >
                                            {classLevel.name}
                                            {classLevel.code
                                                ? ` (${classLevel.code})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* STREAM */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Stream
                                </label>

                                <select
                                    name="stream"
                                    value={formData.stream}
                                    onChange={handleChange}
                                    disabled={!formData.class_level}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-gray-200"
                                >
                                    <option value="">
                                        {formData.class_level
                                            ? "Select stream (optional)"
                                            : "Select class level first"}
                                    </option>

                                    {filteredStreams.map((stream) => (
                                        <option
                                            key={stream.id}
                                            value={stream.id}
                                        >
                                            {stream.name}
                                            {stream.code
                                                ? ` (${stream.code})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                {formData.class_level &&
                                    filteredStreams.length === 0 && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            No streams have been configured for
                                            this class level.
                                        </p>
                                    )}
                            </div>

                            {/* ENROLLMENT DATE */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Enrollment Date{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">

                                    <CalendarDays
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="date"
                                        name="enrollment_date"
                                        value={formData.enrollment_date}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />

                                </div>
                            </div>

                        </div>
                    </section>

                    {/* --------------------------------------------------
                        ENROLLMENT STATUS
                    -------------------------------------------------- */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 border-b border-gray-200 pb-4">

                            <h2 className="text-lg font-bold text-gray-800">
                                Enrollment Status
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Record the current state of this enrollment.
                            </p>

                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* STATUS */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Status{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="transferred">
                                        Transferred
                                    </option>

                                    <option value="withdrawn">
                                        Withdrawn
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            {/* EXIT DATE */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Exit Date
                                </label>

                                <input
                                    type="date"
                                    name="exit_date"
                                    value={formData.exit_date}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            {/* EXIT REASON */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Exit Reason
                                </label>

                                <textarea
                                    name="exit_reason"
                                    value={formData.exit_reason}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Enter the reason for leaving, if applicable..."
                                    className="w-full resize-none rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />

                            </div>

                        </div>
                    </section>

                    {/* --------------------------------------------------
                        PREVIOUS SCHOOL
                    -------------------------------------------------- */}

                    <section className="rounded-2xl bg-gray-50 p-6 shadow-sm">

                        <div className="mb-6 border-b border-gray-200 pb-4">

                            <h2 className="text-lg font-bold text-gray-800">
                                Previous School
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Record the school the student attended before
                                this enrollment.
                            </p>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Previous School
                            </label>

                            <input
                                type="text"
                                name="previous_school"
                                value={formData.previous_school}
                                onChange={handleChange}
                                placeholder="e.g. St. Mary's Primary School"
                                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            />

                        </div>

                    </section>

                    {/* --------------------------------------------------
                        ACTIONS
                    -------------------------------------------------- */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            to="/sms/enrollments"
                            className="rounded-xl border border-gray-300 bg-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />

                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Enrollment"
                                    : "Save Enrollment"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default EnrollmentFormPage;