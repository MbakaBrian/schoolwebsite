import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    User,
    Users,
    ShieldAlert,
    CalendarDays,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import axiosInstance from "../../../../../utils/axiosInstance";

const EmergencyContactDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contact, setContact] = useState(null);
    const [student, setStudent] = useState(null);
    const [family, setFamily] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const getResults = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        return [];
    };

    const getStudentName = (studentData) => {
        if (!studentData) return "Unknown Student";

        if (studentData.full_name) {
            return studentData.full_name;
        }

        return [
            studentData.first_name,
            studentData.middle_name,
            studentData.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getFamilyName = (familyData) => {
        if (!familyData) return "Family";

        return (
            familyData.family_name ||
            familyData.name ||
            `Family ${familyData.family_id || ""}`
        );
    };

    const formatDate = (date) => {
        if (!date) return "Not provided";

        try {
            return new Date(date).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return date;
        }
    };

    const formatDateTime = (date) => {
        if (!date) return "Not available";

        try {
            return new Date(date).toLocaleString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return date;
        }
    };

    const priorityLabel = (priority) => {
        switch (Number(priority)) {
            case 1:
                return "Primary Emergency Contact";
            case 2:
                return "Secondary Emergency Contact";
            case 3:
                return "Additional Emergency Contact";
            default:
                return "Emergency Contact";
        }
    };

    const priorityDescription = (priority) => {
        switch (Number(priority)) {
            case 1:
                return "This contact should normally be contacted first during an emergency.";
            case 2:
                return "This contact can be contacted if the primary contact is unavailable.";
            case 3:
                return "This contact provides additional emergency support.";
            default:
                return "Emergency contact for the student.";
        }
    };

    // --------------------------------------------------
    // FETCH DATA
    // --------------------------------------------------

    const fetchContact = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                `/students/emergency-contacts/${id}/`
            );

            const contactData = response.data;
            setContact(contactData);

            // ------------------------------------------
            // FETCH STUDENT
            // ------------------------------------------

            if (contactData.student) {
                try {
                    const studentResponse = await axiosInstance.get(
                        `/students/students/${contactData.student}/`
                    );

                    const studentData = studentResponse.data;
                    setStudent(studentData);

                    // --------------------------------------
                    // FETCH FAMILY
                    // --------------------------------------

                    if (studentData.family) {
                        try {
                            const familyResponse = await axiosInstance.get(
                                `/students/families/${studentData.family}/`
                            );

                            setFamily(familyResponse.data);
                        } catch (familyError) {
                            console.error(
                                "Unable to load family:",
                                familyError
                            );
                        }
                    }
                } catch (studentError) {
                    console.error(
                        "Unable to load student:",
                        studentError
                    );
                }
            }
        } catch (err) {
            console.error("Unable to load emergency contact:", err);

            setError(
                err?.response?.data?.detail ||
                    "Unable to load emergency contact details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContact();
    }, [id]);

    // --------------------------------------------------
    // DEACTIVATE
    // --------------------------------------------------

    const handleDeactivate = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this emergency contact?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setError("");

            await axiosInstance.delete(
                `/students/emergency-contacts/${id}/`
            );

            await fetchContact();
        } catch (err) {
            console.error("Unable to deactivate contact:", err);

            setError(
                err?.response?.data?.detail ||
                    "Unable to deactivate emergency contact."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // --------------------------------------------------
    // ACTIVATE
    // --------------------------------------------------

    const handleActivate = async () => {
        if (!contact) return;

        try {
            setActionLoading(true);
            setError("");

            const payload = {
                student: contact.student,
                full_name: contact.full_name,
                relationship: contact.relationship,
                mobile_number: contact.mobile_number,
                alternative_mobile: contact.alternative_mobile || "",
                email: contact.email || "",
                address: contact.address || "",
                priority: contact.priority,
                is_active: true,
            };

            await axiosInstance.put(
                `/students/emergency-contacts/${id}/`,
                payload
            );

            await fetchContact();
        } catch (err) {
            console.error("Unable to activate contact:", err);

            setError(
                err?.response?.data?.detail ||
                    "Unable to activate emergency contact."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-purple-800">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-sm font-medium">
                        Loading emergency contact...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (error && !contact) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() =>
                            navigate("/sms/emergency-contacts")
                        }
                        className="flex items-center gap-2 text-purple-800 font-medium mb-6 hover:text-purple-600"
                    >
                        <ArrowLeft size={18} />
                        Back to Emergency Contacts
                    </button>

                    <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />

                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Unable to Load Contact
                        </h2>

                        <p className="text-gray-600">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!contact) return null;

    const studentName = getStudentName(student);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --------------------------------------------------
                    TOP NAVIGATION
                -------------------------------------------------- */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                        onClick={() =>
                            navigate("/sms/emergency-contacts")
                        }
                        className="flex items-center gap-2 text-purple-800 hover:text-purple-600 font-medium w-fit"
                    >
                        <ArrowLeft size={18} />
                        Back to Emergency Contacts
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                navigate(
                                    `/sms/emergency-contacts/${id}/edit`
                                )
                            }
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition"
                        >
                            <Edit size={17} />
                            Edit Contact
                        </button>

                        {contact.is_active ? (
                            <button
                                onClick={handleDeactivate}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition disabled:opacity-60"
                            >
                                {actionLoading ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <XCircle size={17} />
                                )}

                                Deactivate
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition disabled:opacity-60"
                            >
                                {actionLoading ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <CheckCircle size={17} />
                                )}

                                Activate
                            </button>
                        )}
                    </div>
                </div>

                {/* --------------------------------------------------
                    ERROR MESSAGE
                -------------------------------------------------- */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start gap-3">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* --------------------------------------------------
                    HERO
                -------------------------------------------------- */}

                <div className="bg-purple-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 md:p-8 text-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-purple-700 flex items-center justify-center">
                                    <ShieldAlert
                                        size={36}
                                        className="text-purple-100"
                                    />
                                </div>

                                <div>
                                    <p className="text-purple-200 text-sm font-medium mb-1">
                                        Emergency Contact
                                    </p>

                                    <h1 className="text-2xl md:text-3xl font-bold">
                                        {contact.full_name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="px-3 py-1 rounded-full bg-purple-700 text-purple-100 text-sm">
                                            {contact.relationship}
                                        </span>

                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-purple-900 text-sm font-medium">
                                            Priority {contact.priority}
                                        </span>

                                        {contact.is_active ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                                                <CheckCircle size={14} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
                                                <XCircle size={14} />
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-900/50 rounded-xl px-5 py-4 min-w-[220px]">
                                <p className="text-purple-200 text-xs uppercase tracking-wide">
                                    Contact Priority
                                </p>

                                <p className="font-bold text-lg mt-1">
                                    {priorityLabel(contact.priority)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------
                    CONTACT OVERVIEW
                -------------------------------------------------- */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Phone
                                    size={20}
                                    className="text-purple-800"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Primary Phone
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {contact.mobile_number ||
                                        "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Mail
                                    size={20}
                                    className="text-purple-800"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Email
                                </p>

                                <p className="font-semibold text-gray-800 break-all">
                                    {contact.email ||
                                        "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <ShieldAlert
                                    size={20}
                                    className="text-purple-800"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Priority
                                </p>

                                <p className="font-semibold text-gray-800">
                                    Priority {contact.priority}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------
                    CONTACT INFORMATION
                -------------------------------------------------- */}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">
                            Contact Information
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoRow
                            icon={<User size={18} />}
                            label="Full Name"
                            value={contact.full_name}
                        />

                        <InfoRow
                            icon={<Users size={18} />}
                            label="Relationship"
                            value={contact.relationship}
                        />

                        <InfoRow
                            icon={<Phone size={18} />}
                            label="Mobile Number"
                            value={
                                contact.mobile_number ||
                                "Not provided"
                            }
                        />

                        <InfoRow
                            icon={<Phone size={18} />}
                            label="Alternative Mobile"
                            value={
                                contact.alternative_mobile ||
                                "Not provided"
                            }
                        />

                        <InfoRow
                            icon={<Mail size={18} />}
                            label="Email Address"
                            value={
                                contact.email ||
                                "Not provided"
                            }
                        />

                        <InfoRow
                            icon={<MapPin size={18} />}
                            label="Address"
                            value={
                                contact.address ||
                                "Not provided"
                            }
                        />
                    </div>
                </div>

                {/* --------------------------------------------------
                    STUDENT INFORMATION
                -------------------------------------------------- */}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-purple-800 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                            Student Information
                        </h2>

                        {student && (
                            <button
                                onClick={() =>
                                    navigate(
                                        `/sms/students/${student.id}`
                                    )
                                }
                                className="text-sm text-purple-100 hover:text-white underline"
                            >
                                View Student
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {student ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                                <DetailBox
                                    label="Student Name"
                                    value={studentName}
                                />

                                <DetailBox
                                    label="Student ID"
                                    value={
                                        student.student_id ||
                                        "Not available"
                                    }
                                />

                                <DetailBox
                                    label="Admission Number"
                                    value={
                                        student.admission_number ||
                                        "Not available"
                                    }
                                />

                                <DetailBox
                                    label="Date of Birth"
                                    value={formatDate(
                                        student.date_of_birth
                                    )}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                Student information is unavailable.
                            </p>
                        )}
                    </div>
                </div>

                {/* --------------------------------------------------
                    FAMILY INFORMATION
                -------------------------------------------------- */}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">
                            Family Information
                        </h2>
                    </div>

                    <div className="p-6">
                        {family ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                                <DetailBox
                                    label="Family Name"
                                    value={getFamilyName(family)}
                                />

                                <DetailBox
                                    label="Family ID"
                                    value={
                                        family.family_id ||
                                        "Not available"
                                    }
                                />

                                <DetailBox
                                    label="Town"
                                    value={
                                        family.town ||
                                        "Not provided"
                                    }
                                />

                                <DetailBox
                                    label="County"
                                    value={
                                        family.county ||
                                        "Not provided"
                                    }
                                />

                                <DetailBox
                                    label="Sub-County"
                                    value={
                                        family.sub_county ||
                                        "Not provided"
                                    }
                                />

                                <DetailBox
                                    label="Address"
                                    value={
                                        family.address ||
                                        "Not provided"
                                    }
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-gray-500">
                                <AlertCircle size={19} />
                                <p>
                                    No family information is associated
                                    with this student.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --------------------------------------------------
                    EMERGENCY ROLE
                -------------------------------------------------- */}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-purple-800 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">
                            Emergency Role
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start gap-4 bg-purple-50 border border-purple-100 rounded-xl p-5">
                            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert
                                    size={22}
                                    className="text-purple-800"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800">
                                    {priorityLabel(contact.priority)}
                                </h3>

                                <p className="text-sm text-gray-600 mt-1">
                                    {priorityDescription(
                                        contact.priority
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --------------------------------------------------
                    SYSTEM INFORMATION
                -------------------------------------------------- */}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">
                            System Information
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoRow
                            icon={<CalendarDays size={18} />}
                            label="Created"
                            value={formatDateTime(
                                contact.created_at
                            )}
                        />

                        <InfoRow
                            icon={<CalendarDays size={18} />}
                            label="Last Updated"
                            value={formatDateTime(
                                contact.updated_at
                            )}
                        />

                        <InfoRow
                            icon={<ShieldAlert size={18} />}
                            label="Contact Priority"
                            value={`Priority ${contact.priority}`}
                        />

                        <InfoRow
                            icon={
                                contact.is_active ? (
                                    <CheckCircle size={18} />
                                ) : (
                                    <XCircle size={18} />
                                )
                            }
                            label="Record Status"
                            value={
                                contact.is_active
                                    ? "Active"
                                    : "Inactive"
                            }
                        />
                    </div>
                </div>

                {/* --------------------------------------------------
                    BOTTOM ACTIONS
                -------------------------------------------------- */}

                <div className="flex flex-col sm:flex-row justify-between gap-3 pb-6">
                    <button
                        onClick={() =>
                            navigate("/sms/emergency-contacts")
                        }
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Emergency Contacts
                    </button>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {student && (
                            <button
                                onClick={() =>
                                    navigate(
                                        `/sms/students/${student.id}`
                                    )
                                }
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition font-medium"
                            >
                                <User size={18} />
                                View Student
                            </button>
                        )}

                        <button
                            onClick={() =>
                                navigate(
                                    `/sms/emergency-contacts/${id}/edit`
                                )
                            }
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition font-medium"
                        >
                            <Edit size={18} />
                            Edit Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

const InfoRow = ({ icon, label, value }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {label}
                </p>

                <p className="text-sm font-semibold text-gray-800 mt-1 break-words">
                    {value || "Not provided"}
                </p>
            </div>
        </div>
    );
};

const DetailBox = ({ label, value }) => {
    return (
        <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
                {label}
            </p>

            <p className="font-semibold text-gray-800 mt-1 break-words">
                {value || "Not provided"}
            </p>
        </div>
    );
};

export default EmergencyContactDetailsPage;