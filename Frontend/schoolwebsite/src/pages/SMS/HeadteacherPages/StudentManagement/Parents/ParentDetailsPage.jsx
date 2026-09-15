import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    UserRound,
    Users,
    Phone,
    Mail,
    BriefcaseBusiness,
    MapPin,
    CreditCard,
    UserX,
    UserCheck,
    AlertCircle,
    Loader2,
    GraduationCap,
    ShieldCheck,
    MessageSquare,
    ReceiptText,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";

export default function ParentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [parent, setParent] = useState(null);
    const [family, setFamily] = useState(null);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // FETCH PARENT DATA
    // --------------------------------------------------
    const fetchParentData = async () => {
        try {
            setLoading(true);
            setError("");

            const parentResponse = await axiosInstance.get(
                `/students/parents/${id}/`
            );

            const parentData = parentResponse.data;

            setParent(parentData);

            // --------------------------------------------------
            // FETCH FAMILY
            // --------------------------------------------------
            if (parentData.family) {
                try {
                    const familyResponse =
                        await axiosInstance.get(
                            `/students/families/${parentData.family}/`
                        );

                    setFamily(familyResponse.data);
                } catch (familyError) {
                    console.warn(
                        "Could not load family:",
                        familyError
                    );
                }

                // --------------------------------------------------
                // FETCH STUDENTS IN SAME FAMILY
                // --------------------------------------------------
                try {
                    const studentsResponse =
                        await axiosInstance.get(
                            `/students/students/?family=${parentData.family}`
                        );

                    const studentData = Array.isArray(
                        studentsResponse.data
                    )
                        ? studentsResponse.data
                        : studentsResponse.data.results || [];

                    setStudents(studentData);
                } catch (studentError) {
                    console.warn(
                        "Could not load family students:",
                        studentError
                    );
                }
            }
        } catch (err) {
            console.error(
                "Failed to load parent:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Failed to load parent information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParentData();
    }, [id]);

    // --------------------------------------------------
    // PARENT NAME
    // --------------------------------------------------
    const parentName = useMemo(() => {
        if (!parent) {
            return "";
        }

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
    }, [parent]);

    // --------------------------------------------------
    // DEACTIVATE / ACTIVATE
    // --------------------------------------------------
    const handleStatusChange = async () => {
        if (!parent) {
            return;
        }

        const action = parent.is_active
            ? "deactivate"
            : "activate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${parentName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            if (parent.is_active) {
                await axiosInstance.delete(
                    `/students/parents/${id}/`
                );

                setParent((previous) => ({
                    ...previous,
                    is_active: false,
                }));
            } else {
                /*
                 * The current backend uses the DELETE endpoint
                 * for soft deactivation. To reactivate an inactive
                 * parent, we send the current record back through PUT.
                 */
                const response =
                    await axiosInstance.put(
                        `/students/parents/${id}/`,
                        {
                            family: parent.family || null,
                            first_name:
                                parent.first_name || "",
                            middle_name:
                                parent.middle_name || "",
                            last_name:
                                parent.last_name || "",
                            national_id_number:
                                parent.national_id_number || "",
                            gender:
                                parent.gender ||
                                "not_specified",
                            mobile_number:
                                parent.mobile_number || "",
                            alternative_mobile:
                                parent.alternative_mobile ||
                                "",
                            email: parent.email || "",
                            occupation:
                                parent.occupation || "",
                            employer:
                                parent.employer || "",
                            address:
                                parent.address || "",
                            is_active: true,
                        }
                    );

                setParent(response.data);
            }
        } catch (err) {
            console.error(
                "Failed to change parent status:",
                err
            );

            alert(
                err.response?.data?.detail ||
                    `Failed to ${action} parent.`
            );
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-purple-800">
                    <Loader2 className="w-6 h-6 animate-spin" />

                    <span className="font-medium">
                        Loading parent information...
                    </span>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------
    if (error || !parent) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <div className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="w-6 h-6 mt-0.5" />

                            <div>
                                <h2 className="font-bold text-lg">
                                    Parent Not Found
                                </h2>

                                <p className="text-sm mt-1">
                                    {error ||
                                        "The requested parent or guardian could not be found."}
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/sms/parents"
                            className="inline-flex items-center gap-2 mt-5 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-5 py-3 rounded-xl transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Parents
                        </Link>
                    </div>
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
                        {/* TITLE */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/sms/parents"
                                className="p-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition"
                                title="Back to parents"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>

                            <div className="w-14 h-14 rounded-2xl bg-purple-700 flex items-center justify-center text-2xl font-bold">
                                {parentName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "P"}
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        {parentName ||
                                            "Unnamed Parent"}
                                    </h1>

                                    <StatusBadge
                                        active={
                                            parent.is_active
                                        }
                                    />
                                </div>

                                <p className="text-purple-200 mt-1">
                                    Parent ID:{" "}
                                    <span className="font-semibold">
                                        {parent.parent_id ||
                                            "Not assigned"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to={`/sms/parents/${id}/edit`}
                                className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-200 text-purple-800 font-semibold px-5 py-3 rounded-xl transition"
                            >
                                <Edit className="w-5 h-5" />
                                Edit
                            </Link>

                            <button
                                type="button"
                                onClick={handleStatusChange}
                                className={`inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-xl transition ${
                                    parent.is_active
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                }`}
                            >
                                {parent.is_active ? (
                                    <>
                                        <UserX className="w-5 h-5" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-5 h-5" />
                                        Activate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <SummaryCard
                        icon={
                            <GraduationCap className="w-6 h-6" />
                        }
                        title="Family Students"
                        value={students.length}
                    />

                    <SummaryCard
                        icon={
                            <Users className="w-6 h-6" />
                        }
                        title="Family"
                        value={
                            family?.family_name ||
                            "Not Assigned"
                        }
                    />

                    <SummaryCard
                        icon={
                            <Phone className="w-6 h-6" />
                        }
                        title="Primary Phone"
                        value={
                            parent.mobile_number ||
                            "Not provided"
                        }
                    />

                    <SummaryCard
                        icon={
                            <ShieldCheck className="w-6 h-6" />
                        }
                        title="Record Status"
                        value={
                            parent.is_active
                                ? "Active"
                                : "Inactive"
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* PERSONAL INFORMATION */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <UserRound className="w-5 h-5" />
                                }
                                title="Personal Information"
                                description="Basic identification details"
                            />

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    label="First Name"
                                    value={
                                        parent.first_name
                                    }
                                />

                                <InfoItem
                                    label="Middle Name"
                                    value={
                                        parent.middle_name
                                    }
                                />

                                <InfoItem
                                    label="Last Name"
                                    value={
                                        parent.last_name
                                    }
                                />

                                <InfoItem
                                    label="Gender"
                                    value={formatGender(
                                        parent.gender
                                    )}
                                />

                                <InfoItem
                                    label="National ID Number"
                                    value={
                                        parent.national_id_number
                                    }
                                    icon={
                                        <CreditCard className="w-4 h-4" />
                                    }
                                />

                                <InfoItem
                                    label="Parent ID"
                                    value={
                                        parent.parent_id
                                    }
                                />
                            </div>
                        </section>

                        {/* CONTACT INFORMATION */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <Phone className="w-5 h-5" />
                                }
                                title="Contact Information"
                                description="Communication details"
                            />

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    label="Mobile Number"
                                    value={
                                        parent.mobile_number
                                    }
                                    icon={
                                        <Phone className="w-4 h-4" />
                                    }
                                />

                                <InfoItem
                                    label="Alternative Mobile"
                                    value={
                                        parent.alternative_mobile
                                    }
                                    icon={
                                        <Phone className="w-4 h-4" />
                                    }
                                />

                                <InfoItem
                                    label="Email Address"
                                    value={
                                        parent.email
                                    }
                                    icon={
                                        <Mail className="w-4 h-4" />
                                    }
                                />

                                <div className="md:col-span-2">
                                    <InfoItem
                                        label="Address"
                                        value={
                                            parent.address
                                        }
                                        icon={
                                            <MapPin className="w-4 h-4" />
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* EMPLOYMENT */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <BriefcaseBusiness className="w-5 h-5" />
                                }
                                title="Employment Information"
                                description="Occupation and employer"
                            />

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    label="Occupation"
                                    value={
                                        parent.occupation
                                    }
                                    icon={
                                        <BriefcaseBusiness className="w-4 h-4" />
                                    }
                                />

                                <InfoItem
                                    label="Employer / Company"
                                    value={
                                        parent.employer
                                    }
                                />
                            </div>
                        </section>

                        {/* FAMILY */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <Users className="w-5 h-5" />
                                }
                                title="Family"
                                description="Household association"
                            />

                            <div className="p-6">
                                {family ? (
                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Family Name
                                                </p>

                                                <p className="text-xl font-bold text-gray-800 mt-1">
                                                    {
                                                        family.family_name
                                                    }
                                                </p>

                                                <p className="text-sm text-purple-700 font-semibold mt-1">
                                                    {
                                                        family.family_id
                                                    }
                                                </p>
                                            </div>

                                            <Link
                                                to={`/sms/families/${family.id}`}
                                                className="inline-flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                                            >
                                                <Users className="w-4 h-4" />
                                                View Family
                                            </Link>
                                        </div>

                                        {(family.address ||
                                            family.town ||
                                            family.county) && (
                                            <div className="mt-4 pt-4 border-t border-purple-100 flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-purple-700 mt-0.5" />

                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        Residence
                                                    </p>

                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {[
                                                            family.address,
                                                            family.town,
                                                            family.sub_county,
                                                            family.county,
                                                        ]
                                                            .filter(
                                                                Boolean
                                                            )
                                                            .join(
                                                                ", "
                                                            )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-200 rounded-xl p-5 text-center">
                                        <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />

                                        <p className="font-semibold text-gray-700">
                                            No Family Assigned
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            This parent is not currently
                                            connected to a family.
                                        </p>

                                        <Link
                                            to={`/sms/parents/${id}/edit`}
                                            className="inline-flex items-center gap-2 mt-4 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Assign Family
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* STUDENTS */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <GraduationCap className="w-5 h-5" />
                                }
                                title="Family Students"
                                description="Students currently belonging to this household"
                            />

                            <div className="p-6">
                                {students.length === 0 ? (
                                    <div className="bg-gray-200 rounded-xl p-8 text-center">
                                        <GraduationCap className="w-9 h-9 text-gray-500 mx-auto mb-3" />

                                        <h3 className="font-semibold text-gray-700">
                                            No students found
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            There are currently no students
                                            connected to this parent's family.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {students.map(
                                            (student) => (
                                                <Link
                                                    key={
                                                        student.id
                                                    }
                                                    to={`/sms/students/${student.id}`}
                                                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                                                            {student.full_name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "S"}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">
                                                                {student.full_name ||
                                                                    [
                                                                        student.first_name,
                                                                        student.middle_name,
                                                                        student.last_name,
                                                                    ]
                                                                        .filter(
                                                                            Boolean
                                                                        )
                                                                        .join(
                                                                            " "
                                                                        )}
                                                            </p>

                                                            <p className="text-sm text-purple-700 font-medium mt-1">
                                                                {student.admission_number ||
                                                                    student.student_id ||
                                                                    "No admission number"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">
                        {/* RELATIONSHIP SUMMARY */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <ShieldCheck className="w-5 h-5" />
                                }
                                title="Parent Role"
                                description="Relationship settings"
                            />

                            <div className="p-6 space-y-4">
                                <RelationshipItem
                                    label="Parental Responsibility"
                                    value={
                                        parent.has_parental_responsibility
                                    }
                                />

                                <RelationshipItem
                                    label="Receives Communications"
                                    value={
                                        parent.receives_communications
                                    }
                                />

                                <RelationshipItem
                                    label="Receives Fee Notifications"
                                    value={
                                        parent.receives_fee_notifications
                                    }
                                />

                                <RelationshipItem
                                    label="Emergency Contact"
                                    value={
                                        parent.is_emergency_contact
                                    }
                                />
                            </div>

                            <div className="px-6 pb-6">
                                <div className="bg-gray-200 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Note
                                    </p>

                                    <p className="text-sm text-gray-600 mt-2">
                                        These relationship settings will be
                                        configured when this parent is linked
                                        to a specific student.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* QUICK ACTIONS */}
                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <MessageSquare className="w-5 h-5" />
                                }
                                title="Quick Actions"
                                description="Parent management"
                            />

                            <div className="p-5 space-y-3">
                                <Link
                                    to={`/sms/parents/${id}/edit`}
                                    className="w-full flex items-center gap-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold px-4 py-3 rounded-xl transition"
                                >
                                    <Edit className="w-5 h-5" />
                                    Edit Parent
                                </Link>

                                <Link
                                    to="/sms/students"
                                    className="w-full flex items-center gap-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-3 rounded-xl transition"
                                >
                                    <GraduationCap className="w-5 h-5" />
                                    Browse Students
                                </Link>

                                <Link
                                    to="/sms/families"
                                    className="w-full flex items-center gap-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-3 rounded-xl transition"
                                >
                                    <Users className="w-5 h-5" />
                                    Browse Families
                                </Link>
                            </div>
                        </section>

                        {/* SYSTEM INFORMATION */}
                        <section className="bg-gray-200 rounded-2xl border border-gray-300 p-5">
                            <div className="flex items-start gap-3">
                                <ReceiptText className="w-5 h-5 text-purple-800 mt-0.5 flex-shrink-0" />

                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        System Information
                                    </h3>

                                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">
                                                Parent ID:
                                            </span>{" "}
                                            {parent.parent_id ||
                                                "—"}
                                        </p>

                                        <p>
                                            <span className="font-medium">
                                                Record status:
                                            </span>{" "}
                                            {parent.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </p>

                                        {parent.created_at && (
                                            <p>
                                                <span className="font-medium">
                                                    Created:
                                                </span>{" "}
                                                {formatDate(
                                                    parent.created_at
                                                )}
                                            </p>
                                        )}

                                        {parent.updated_at && (
                                            <p>
                                                <span className="font-medium">
                                                    Last updated:
                                                </span>{" "}
                                                {formatDate(
                                                    parent.updated_at
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --------------------------------------------------
// SECTION HEADER
// --------------------------------------------------
function SectionHeader({
    icon,
    title,
    description,
}) {
    return (
        <div className="bg-gray-800 text-white px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="text-purple-300">
                    {icon}
                </div>

                <div>
                    <h2 className="font-semibold">
                        {title}
                    </h2>

                    <p className="text-gray-300 text-sm mt-0.5">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------
function SummaryCard({
    icon,
    title,
    value,
}) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="text-lg font-bold text-gray-800 mt-2 truncate">
                        {value}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// INFO ITEM
// --------------------------------------------------
function InfoItem({
    label,
    value,
    icon,
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <div className="flex items-start gap-2 mt-2">
                {icon && (
                    <span className="text-purple-700 mt-0.5">
                        {icon}
                    </span>
                )}

                <p className="text-sm font-medium text-gray-800 break-words">
                    {value || (
                        <span className="text-gray-400 font-normal">
                            Not provided
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}

// --------------------------------------------------
// RELATIONSHIP ITEM
// --------------------------------------------------
function RelationshipItem({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">
                {label}
            </span>

            <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    value
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-200 text-gray-500"
                }`}
            >
                {value ? "Yes" : "No"}
            </span>
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

// --------------------------------------------------
// GENDER
// --------------------------------------------------
function formatGender(gender) {
    const labels = {
        male: "Male",
        female: "Female",
        other: "Other",
        not_specified: "Not Specified",
    };

    return labels[gender] || gender || "Not Specified";
}

// --------------------------------------------------
// DATE
// --------------------------------------------------
function formatDate(date) {
    if (!date) {
        return "—";
    }

    try {
        return new Date(date).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    } catch {
        return date;
    }
}

