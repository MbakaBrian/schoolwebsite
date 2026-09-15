import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    ArrowLeft,
    Edit,
    Trash2,
    RefreshCw,
    Users,
    GraduationCap,
    UserRound,
    Star,
    Bell,
    CreditCard,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
    Building2,
    CalendarDays,
    AlertCircle,
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

function formatDate(date) {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gray-700" />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">
                    {label}
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                    {value || "Not provided"}
                </p>
            </div>
        </div>
    );
}

function StatusCard({
    icon: Icon,
    title,
    description,
    enabled,
}) {
    return (
        <div
            className={`rounded-xl border p-4 ${
                enabled
                    ? "bg-purple-50 border-purple-200"
                    : "bg-gray-100 border-gray-200"
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        enabled
                            ? "bg-purple-100"
                            : "bg-gray-200"
                    }`}
                >
                    <Icon
                        className={`w-4 h-4 ${
                            enabled
                                ? "text-purple-700"
                                : "text-gray-500"
                        }`}
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p
                            className={`text-sm font-semibold ${
                                enabled
                                    ? "text-purple-900"
                                    : "text-gray-700"
                            }`}
                        >
                            {title}
                        </p>

                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                enabled
                                    ? "bg-purple-200 text-purple-800"
                                    : "bg-gray-200 text-gray-500"
                            }`}
                        >
                            {enabled ? "Yes" : "No"}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function StudentParentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [relationship, setRelationship] = useState(null);
    const [student, setStudent] = useState(null);
    const [parent, setParent] = useState(null);
    const [family, setFamily] = useState(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const loadRelationship = async () => {
        try {
            setLoading(true);
            setError("");

            const relationshipResponse =
                await axiosInstance.get(
                    `/students/student-parents/${id}/`
                );

            const relationshipData =
                relationshipResponse.data;

            setRelationship(relationshipData);

            const requests = [];

            if (relationshipData.student) {
                requests.push(
                    axiosInstance.get(
                        `/students/students/${relationshipData.student}/`
                    )
                );
            } else {
                requests.push(Promise.resolve(null));
            }

            if (relationshipData.parent_guardian) {
                requests.push(
                    axiosInstance.get(
                        `/students/parents/${relationshipData.parent_guardian}/`
                    )
                );
            } else {
                requests.push(Promise.resolve(null));
            }

            const [studentResponse, parentResponse] =
                await Promise.all(requests);

            const studentData =
                studentResponse?.data || null;

            const parentData =
                parentResponse?.data || null;

            setStudent(studentData);
            setParent(parentData);

            const familyId =
                parentData?.family || studentData?.family;

            if (familyId) {
                try {
                    const familyResponse =
                        await axiosInstance.get(
                            `/students/families/${familyId}/`
                        );

                    setFamily(familyResponse.data);
                } catch (familyError) {
                    console.error(
                        "Failed to load family:",
                        familyError
                    );
                }
            } else {
                setFamily(null);
            }
        } catch (err) {
            console.error(
                "Failed to load relationship:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Failed to load the student-parent relationship."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRelationship();
    }, [id]);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this student-parent relationship?"
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            await axiosInstance.delete(
                `/students/student-parents/${id}/`
            );

            navigate("/sms/student-parents");
        } catch (err) {
            console.error(
                "Failed to delete relationship:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                    "Failed to remove the relationship."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                    <RefreshCw className="w-8 h-8 text-purple-700 animate-spin mx-auto" />

                    <p className="mt-4 text-gray-600">
                        Loading relationship details...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !relationship) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <Link
                        to="/sms/student-parents"
                        className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Relationships
                    </Link>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />

                            <div>
                                <h2 className="font-bold text-red-800">
                                    Unable to load relationship
                                </h2>

                                <p className="text-sm text-red-700 mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const studentName = getStudentName(student);
    const parentName = getParentName(parent);

    const relationshipLabel =
        relationshipLabels[
            relationship?.relationship
        ] ||
        relationship?.relationship ||
        "Relationship";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* HEADER */}
            <div className="bg-purple-800 rounded-2xl p-6 md:p-7 shadow-lg mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <Link
                            to="/sms/student-parents"
                            className="w-10 h-10 rounded-xl bg-purple-700 hover:bg-purple-600 flex items-center justify-center shrink-0 transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>

                        <div>
                            <p className="text-purple-200 text-sm">
                                Student Management
                            </p>

                            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
                                Student-Parent Relationship
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="px-3 py-1 rounded-full bg-purple-700 text-purple-100 text-xs font-semibold">
                                    Relationship #{relationship?.id}
                                </span>

                                <span className="px-3 py-1 rounded-full bg-gray-50 text-purple-800 text-xs font-semibold">
                                    {relationshipLabel}
                                </span>

                                {relationship?.is_primary && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                        <Star className="w-3 h-3" />
                                        Primary Contact
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to={`/sms/student-parents/${id}/edit`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-white text-purple-800 font-semibold transition"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold transition disabled:opacity-60"
                        >
                            {deleting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}

                            {deleting
                                ? "Removing..."
                                : "Remove"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="max-w-6xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />

                    <p className="text-sm text-red-700">
                        {error}
                    </p>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                {/* RELATIONSHIP OVERVIEW */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-white" />

                            <div>
                                <h2 className="font-bold text-white">
                                    Relationship Overview
                                </h2>

                                <p className="text-gray-300 text-xs mt-0.5">
                                    The people connected by this
                                    relationship.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-7">
                        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
                            {/* STUDENT */}
                            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-purple-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-purple-600 font-medium">
                                            Student
                                        </p>

                                        <h3 className="font-bold text-gray-900">
                                            {studentName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <InfoItem
                                        icon={GraduationCap}
                                        label="Student ID"
                                        value={
                                            student?.student_id
                                        }
                                    />

                                    <InfoItem
                                        icon={Users}
                                        label="Admission Number"
                                        value={
                                            student?.admission_number
                                        }
                                    />

                                    <InfoItem
                                        icon={CalendarDays}
                                        label="Date of Birth"
                                        value={formatDate(
                                            student?.date_of_birth
                                        )}
                                    />
                                </div>

                                {student?.id && (
                                    <Link
                                        to={`/sms/students/${student.id}`}
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                                    >
                                        View Student
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </Link>
                                )}
                            </div>

                            {/* CENTER */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-purple-800 flex items-center justify-center shadow-md">
                                    <Users className="w-7 h-7 text-white" />
                                </div>

                                <span
                                    className={`mt-3 px-4 py-2 rounded-full text-sm font-bold ${
                                        relationshipColors[
                                            relationship?.relationship
                                        ] ||
                                        "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {relationshipLabel}
                                </span>

                                {relationship?.is_primary && (
                                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                                        <Star className="w-3 h-3" />
                                        Primary Relationship
                                    </div>
                                )}
                            </div>

                            {/* PARENT */}
                            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                                        <UserRound className="w-6 h-6 text-gray-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Parent / Guardian
                                        </p>

                                        <h3 className="font-bold text-gray-900">
                                            {parentName}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <InfoItem
                                        icon={UserRound}
                                        label="Parent ID"
                                        value={
                                            parent?.parent_id
                                        }
                                    />

                                    <InfoItem
                                        icon={Phone}
                                        label="Mobile Number"
                                        value={
                                            parent?.mobile_number
                                        }
                                    />

                                    <InfoItem
                                        icon={Mail}
                                        label="Email"
                                        value={
                                            parent?.email
                                        }
                                    />
                                </div>

                                {parent?.id && (
                                    <Link
                                        to={`/sms/parents/${parent.id}`}
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                                    >
                                        View Parent
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESPONSIBILITIES */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-5 py-4">
                        <h2 className="font-bold text-white">
                            Responsibilities & Notifications
                        </h2>

                        <p className="text-gray-300 text-xs mt-0.5">
                            Settings attached specifically to this
                            student-parent relationship.
                        </p>
                    </div>

                    <div className="p-5 md:p-6 grid md:grid-cols-2 gap-3">
                        <StatusCard
                            icon={Star}
                            title="Primary Contact"
                            description="This person is marked as a primary parent or guardian."
                            enabled={
                                relationship?.is_primary
                            }
                        />

                        <StatusCard
                            icon={ShieldCheck}
                            title="Parental Responsibility"
                            description="This person has parental responsibility for the student."
                            enabled={
                                relationship?.has_parental_responsibility
                            }
                        />

                        <StatusCard
                            icon={Bell}
                            title="School Communications"
                            description="This person receives general school communications."
                            enabled={
                                relationship?.receives_communications
                            }
                        />

                        <StatusCard
                            icon={CreditCard}
                            title="Fee Notifications"
                            description="This person receives fee and payment notifications."
                            enabled={
                                relationship?.receives_fee_notifications
                            }
                        />

                        <StatusCard
                            icon={ShieldCheck}
                            title="Emergency Contact"
                            description="This person is designated as an emergency contact."
                            enabled={
                                relationship?.is_emergency_contact
                            }
                        />
                    </div>
                </div>

                {/* FAMILY */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-white" />

                            <div>
                                <h2 className="font-bold text-white">
                                    Family
                                </h2>

                                <p className="text-gray-300 text-xs mt-0.5">
                                    Household information associated with
                                    the student or parent.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6">
                        {family ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {family.family_name ||
                                            "Family"}
                                    </h3>

                                    <p className="text-sm text-purple-700 font-medium mt-1">
                                        {family.family_id}
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <InfoItem
                                        icon={MapPin}
                                        label="Town"
                                        value={family.town}
                                    />

                                    <InfoItem
                                        icon={MapPin}
                                        label="County"
                                        value={family.county}
                                    />

                                    <InfoItem
                                        icon={MapPin}
                                        label="Sub-County"
                                        value={family.sub_county}
                                    />

                                    <InfoItem
                                        icon={Building2}
                                        label="Address"
                                        value={family.address}
                                    />
                                </div>

                                {family.id && (
                                    <div className="md:col-span-2">
                                        <Link
                                            to={`/sms/families/${family.id}`}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                                        >
                                            View Family
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No family information is associated
                                with this relationship.
                            </p>
                        )}
                    </div>
                </div>

                {/* SYSTEM INFORMATION */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gray-800 px-5 py-4">
                        <h2 className="font-bold text-white">
                            System Information
                        </h2>
                    </div>

                    <div className="p-5 md:p-6 grid md:grid-cols-2 gap-6">
                        <InfoItem
                            icon={CalendarDays}
                            label="Relationship Created"
                            value={formatDate(
                                relationship?.created_at
                            )}
                        />

                        <InfoItem
                            icon={RefreshCw}
                            label="Last Updated"
                            value={formatDate(
                                relationship?.updated_at
                            )}
                        />

                        <InfoItem
                            icon={UserRound}
                            label="Student Record"
                            value={
                                student?.student_id ||
                                student?.id
                            }
                        />

                        <InfoItem
                            icon={UserRound}
                            label="Parent Record"
                            value={
                                parent?.parent_id ||
                                parent?.id
                            }
                        />
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="bg-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
                    <h2 className="font-bold text-white">
                        Quick Actions
                    </h2>

                    <div className="flex flex-wrap gap-3 mt-4">
                        {student?.id && (
                            <Link
                                to={`/sms/students/${student.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold"
                            >
                                <GraduationCap className="w-4 h-4" />
                                Student Profile
                            </Link>
                        )}

                        {parent?.id && (
                            <Link
                                to={`/sms/parents/${parent.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-white text-purple-800 text-sm font-semibold"
                            >
                                <UserRound className="w-4 h-4" />
                                Parent Profile
                            </Link>
                        )}

                        <Link
                            to={`/sms/student-parents/${id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Relationship
                        </Link>

                        <Link
                            to="/sms/student-parents"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold"
                        >
                            <Users className="w-4 h-4" />
                            All Relationships
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}