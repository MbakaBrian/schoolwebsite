import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
    HeartHandshake,
    Star,
    Bell,
    Banknote,
    Siren,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";

export default function ParentDetailsPage() {
    const { id } = useParams();

    const [parent, setParent] = useState(null);
    const [family, setFamily] = useState(null);
    const [students, setStudents] = useState([]);
    const [relationships, setRelationships] = useState([]);

    const [loading, setLoading] = useState(true);
    const [relationshipLoading, setRelationshipLoading] =
        useState(true);

    const [error, setError] = useState("");
    const [relationshipError, setRelationshipError] =
        useState("");

    // ==================================================
    // FETCH PARENT DATA
    // ==================================================

    const fetchParentData = async () => {
        try {
            setLoading(true);
            setError("");

            const parentResponse =
                await axiosInstance.get(
                    `/students/parents/${id}/`
                );

            const parentData = parentResponse.data;

            setParent(parentData);

            // --------------------------------------------------
            // FETCH FAMILY
            // --------------------------------------------------

            if (parentData.family) {
                try {
                    const familyId =
                        getRelatedId(
                            parentData.family
                        );

                    const familyResponse =
                        await axiosInstance.get(
                            `/students/families/${familyId}/`
                        );

                    setFamily(
                        familyResponse.data
                    );

                    // --------------------------------------------------
                    // FETCH STUDENTS IN SAME FAMILY
                    // --------------------------------------------------

                    try {
                        const studentsResponse =
                            await axiosInstance.get(
                                `/students/students/?family=${familyId}`
                            );

                        const studentData =
                            extractResults(
                                studentsResponse.data
                            );

                        setStudents(
                            studentData
                        );
                    } catch (
                        studentError
                    ) {
                        console.warn(
                            "Could not load family students:",
                            studentError
                        );

                        setStudents([]);
                    }
                } catch (familyError) {
                    console.warn(
                        "Could not load family:",
                        familyError
                    );

                    setFamily(null);
                    setStudents([]);
                }
            } else {
                setFamily(null);
                setStudents([]);
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

    // ==================================================
    // FETCH PARENT-STUDENT RELATIONSHIPS
    // ==================================================

    const fetchRelationships = async () => {
        try {
            setRelationshipLoading(true);
            setRelationshipError("");

            /*
             * StudentParent is a separate model from
             * ParentGuardian.
             *
             * Therefore, relationship-specific fields such as:
             *
             * - relationship
             * - is_primary
             * - has_parental_responsibility
             * - receives_communication
             * - receives_fee_notifications
             * - is_emergency_contact
             *
             * must come from StudentParent.
             *
             * The backend view supports:
             *
             * ?parent_guardian=<parent_id>
             *
             * so we request only relationships belonging
             * to this parent.
             */

            const response =
                await axiosInstance.get(
                    `/students/student-parents/?parent_guardian=${id}`
                );

            let relationshipData =
                extractResults(
                    response.data
                );

            /*
             * The backend already filters by parent_guardian.
             *
             * This additional frontend check protects the page
             * if the serializer/view ever returns a broader
             * response.
             */
            relationshipData =
                relationshipData.filter(
                    (relationship) => {
                        const relationshipParentId =
                            getRelationshipParentId(
                                relationship
                            );

                        /*
                         * If the serializer does not expose
                         * parent_guardian, keep the relationship.
                         */
                        if (
                            relationshipParentId ===
                            null
                        ) {
                            return true;
                        }

                        return (
                            String(
                                relationshipParentId
                            ) === String(id)
                        );
                    }
                );

            setRelationships(
                relationshipData
            );
        } catch (err) {
            console.error(
                "Failed to load parent-student relationships:",
                err
            );

            setRelationshipError(
                err.response?.data?.detail ||
                    "Could not load parent-student relationship information."
            );

            setRelationships([]);
        } finally {
            setRelationshipLoading(false);
        }
    };

    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        if (!id) {
            return;
        }

        fetchParentData();
        fetchRelationships();
    }, [id]);

    // ==================================================
    // PARENT NAME
    // ==================================================

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

    // ==================================================
    // RELATIONSHIP SUMMARY
    // ==================================================

    const primaryRelationship = useMemo(() => {
        return (
            relationships.find(
                (relationship) =>
                    relationship.is_primary === true
            ) || null
        );
    }, [relationships]);

    const emergencyRelationships = useMemo(() => {
        return relationships.filter(
            (relationship) =>
                relationship.is_emergency_contact ===
                true
        );
    }, [relationships]);

    const communicationRelationships = useMemo(() => {
        return relationships.filter(
            (relationship) =>
                relationship.receives_communication ===
                true
        );
    }, [relationships]);

    const feeNotificationRelationships = useMemo(() => {
        return relationships.filter(
            (relationship) =>
                relationship.receives_fee_notifications ===
                true
        );
    }, [relationships]);

    const parentalResponsibilityRelationships =
        useMemo(() => {
            return relationships.filter(
                (relationship) =>
                    relationship.has_parental_responsibility ===
                    true
            );
        }, [relationships]);

    // ==================================================
    // RELATIONSHIP ROWS
    // ==================================================

    const relationshipRows = useMemo(() => {
        return relationships.map(
            (relationship) => {
                const studentId =
                    getRelationshipStudentId(
                        relationship
                    );

                const student =
                    findStudentForRelationship(
                        students,
                        relationship
                    );

                return {
                    relationship,
                    student,
                    studentId,
                };
            }
        );
    }, [relationships, students]);

    // ==================================================
    // DEACTIVATE / ACTIVATE
    // ==================================================

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

                setParent(
                    (previous) => ({
                        ...previous,
                        is_active: false,
                    })
                );
            } else {
                /*
                 * The current backend uses the DELETE endpoint
                 * for soft deactivation.
                 *
                 * To reactivate, send the existing parent
                 * information back through PUT.
                 */
                const response =
                    await axiosInstance.put(
                        `/students/parents/${id}/`,
                        {
                            family:
                                getRelatedId(
                                    parent.family
                                ) ||
                                null,

                            first_name:
                                parent.first_name ||
                                "",

                            middle_name:
                                parent.middle_name ||
                                "",

                            last_name:
                                parent.last_name ||
                                "",

                            national_id_number:
                                parent.national_id_number ||
                                "",

                            gender:
                                parent.gender ||
                                "not_specified",

                            mobile_number:
                                parent.mobile_number ||
                                "",

                            alternative_mobile:
                                parent.alternative_mobile ||
                                "",

                            email:
                                parent.email ||
                                "",

                            occupation:
                                parent.occupation ||
                                "",

                            employer:
                                parent.employer ||
                                "",

                            address:
                                parent.address ||
                                "",

                            is_active: true,
                        }
                    );

                setParent(
                    response.data
                );
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

    // ==================================================
    // LOADING
    // ==================================================

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

    // ==================================================
    // ERROR
    // ==================================================

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

    // ==================================================
    // PAGE
    // ==================================================

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ==================================================
                HEADER
            ================================================== */}

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
                                    ?.toUpperCase() ||
                                    "P"}
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
                                onClick={
                                    handleStatusChange
                                }
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

            {/* ==================================================
                CONTENT
            ================================================== */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

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
                            <HeartHandshake className="w-6 h-6" />
                        }
                        title="Student Relationships"
                        value={
                            relationships.length
                        }
                    />

                    <SummaryCard
                        icon={
                            <Star className="w-6 h-6" />
                        }
                        title="Primary Relationship"
                        value={
                            primaryRelationship
                                ? formatRelationship(
                                      primaryRelationship.relationship
                                  )
                                : "Not Set"
                        }
                    />

                    <SummaryCard
                        icon={
                            <Siren className="w-6 h-6" />
                        }
                        title="Emergency Contact"
                        value={
                            emergencyRelationships.length >
                            0
                                ? "Yes"
                                : "No"
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ==================================================
                        LEFT COLUMN
                    ================================================== */}

                    <div className="lg:col-span-2 space-y-6">
                        {/* ==================================================
                            PERSONAL INFORMATION
                        ================================================== */}

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

                        {/* ==================================================
                            CONTACT INFORMATION
                        ================================================== */}

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

                        {/* ==================================================
                            EMPLOYMENT
                        ================================================== */}

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

                        {/* ==================================================
                            FAMILY
                        ================================================== */}

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
                                            This parent is not
                                            currently connected
                                            to a family.
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

                        {/* ==================================================
                            STUDENT-PARENT RELATIONSHIPS
                        ================================================== */}

                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <HeartHandshake className="w-5 h-5" />
                                }
                                title="Student Relationships"
                                description="Relationship and permissions for each student"
                            />

                            <div className="p-6">
                                {relationshipLoading ? (
                                    <div className="flex items-center justify-center py-10 text-purple-800">
                                        <Loader2 className="w-6 h-6 animate-spin mr-3" />

                                        <span className="font-medium">
                                            Loading relationships...
                                        </span>
                                    </div>
                                ) : relationshipError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                        <div className="flex items-start gap-3 text-red-700">
                                            <AlertCircle className="w-5 h-5 mt-0.5" />

                                            <div>
                                                <p className="font-semibold">
                                                    Unable to load relationships
                                                </p>

                                                <p className="text-sm mt-1">
                                                    {
                                                        relationshipError
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : relationships.length ===
                                  0 ? (
                                    <div className="bg-gray-200 rounded-xl p-8 text-center">
                                        <HeartHandshake className="w-9 h-9 text-gray-500 mx-auto mb-3" />

                                        <h3 className="font-semibold text-gray-700">
                                            No Student Relationships
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            This parent has not yet
                                            been linked to a
                                            student.
                                        </p>

                                        <Link
                                            to={`/sms/parents/${id}/edit`}
                                            className="inline-flex items-center gap-2 mt-4 bg-purple-800 hover:bg-purple-900 text-white font-semibold px-4 py-2.5 rounded-xl transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Manage Parent
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {relationshipRows.map(
                                            ({
                                                relationship,
                                                student,
                                            }) => (
                                                <StudentRelationshipCard
                                                    key={
                                                        relationship.id
                                                    }
                                                    relationship={
                                                        relationship
                                                    }
                                                    student={
                                                        student
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ==================================================
                            FAMILY STUDENTS
                        ================================================== */}

                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <GraduationCap className="w-5 h-5" />
                                }
                                title="Family Students"
                                description="Students currently belonging to this household"
                            />

                            <div className="p-6">
                                {students.length ===
                                0 ? (
                                    <div className="bg-gray-200 rounded-xl p-8 text-center">
                                        <GraduationCap className="w-9 h-9 text-gray-500 mx-auto mb-3" />

                                        <h3 className="font-semibold text-gray-700">
                                            No students found
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            There are currently no
                                            students connected to
                                            this parent's family.
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
                                                            {getStudentName(
                                                                student
                                                            )
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "S"}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">
                                                                {getStudentName(
                                                                    student
                                                                ) ||
                                                                    "Unnamed Student"}
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

                    {/* ==================================================
                        RIGHT COLUMN
                    ================================================== */}

                    <div className="space-y-6">
                        {/* ==================================================
                            RELATIONSHIP SUMMARY
                        ================================================== */}

                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <ShieldCheck className="w-5 h-5" />
                                }
                                title="Parent Relationships"
                                description="Permissions and communication settings for each student"
                            />

                            <div className="p-6">
                                {relationshipLoading ? (
                                    <div className="flex items-center justify-center py-6 text-purple-800">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />

                                        <span className="text-sm font-medium">
                                            Loading...
                                        </span>
                                    </div>
                                ) : relationshipError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                        <div className="flex items-start gap-3 text-red-700">
                                            <AlertCircle className="w-5 h-5 mt-0.5" />

                                            <div>
                                                <p className="font-semibold">
                                                    Unable to load relationships
                                                </p>

                                                <p className="text-sm mt-1">
                                                    {
                                                        relationshipError
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : relationships.length ===
                                  0 ? (
                                    <div className="bg-gray-200 rounded-xl p-5 text-center">
                                        <ShieldCheck className="w-8 h-8 text-gray-500 mx-auto mb-2" />

                                        <p className="font-semibold text-gray-700">
                                            No Relationship Set
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Relationship settings are
                                            configured when the
                                            parent is linked to a
                                            student.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {relationshipRows.map(
                                            ({
                                                relationship,
                                                student,
                                            }) => {
                                                const studentName =
                                                    student
                                                        ? getStudentName(
                                                              student
                                                          )
                                                        : getRelationshipStudentLabel(
                                                              relationship
                                                          );

                                                return (
                                                    <div
                                                        key={
                                                            relationship.id
                                                        }
                                                        className="border border-gray-200 rounded-xl bg-white p-4"
                                                    >
                                                        {/* STUDENT */}

                                                        <div className="flex items-start justify-between gap-3 mb-4">
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                    Student
                                                                </p>

                                                                {student ? (
                                                                    <Link
                                                                        to={`/sms/students/${student.id}`}
                                                                        className="block font-bold text-gray-800 hover:text-purple-800 mt-1 truncate"
                                                                    >
                                                                        {
                                                                            studentName
                                                                        }
                                                                    </Link>
                                                                ) : (
                                                                    <p className="font-bold text-gray-800 mt-1">
                                                                        {
                                                                            studentName
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {relationship.is_primary && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold flex-shrink-0">
                                                                    <Star className="w-3.5 h-3.5" />
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* RELATIONSHIP */}

                                                        <div className="mb-4">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                Relationship
                                                            </p>

                                                            <p className="text-sm font-bold text-purple-800 mt-1">
                                                                {formatRelationship(
                                                                    relationship.relationship
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* SETTINGS */}

                                                        <div className="space-y-3">
                                                            <RelationshipItem
                                                                label="Parental Responsibility"
                                                                value={
                                                                    relationship.has_parental_responsibility
                                                                }
                                                            />

                                                            <RelationshipItem
                                                                label="Receives Communications"
                                                                value={
                                                                    relationship.receives_communication
                                                                }
                                                            />

                                                            <RelationshipItem
                                                                label="Receives Fee Notifications"
                                                                value={
                                                                    relationship.receives_fee_notifications
                                                                }
                                                            />

                                                            <RelationshipItem
                                                                label="Emergency Contact"
                                                                value={
                                                                    relationship.is_emergency_contact
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 pb-6">
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                        Relationship records
                                    </p>

                                    <p className="text-sm text-gray-600 mt-2">
                                        These settings belong to
                                        each parent-student
                                        relationship and may
                                        therefore differ between
                                        students.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            COMMUNICATION SUMMARY
                        ================================================== */}

                        <section className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <SectionHeader
                                icon={
                                    <MessageSquare className="w-5 h-5" />
                                }
                                title="Communication"
                                description="Notification preferences across linked students"
                            />

                            <div className="p-6 space-y-4">
                                <SummaryPreference
                                    icon={
                                        <Bell className="w-4 h-4" />
                                    }
                                    label="Receives Communications"
                                    value={
                                        communicationRelationships.length >
                                        0
                                    }
                                    detail={`${communicationRelationships.length} of ${relationships.length} relationship(s) enabled`}
                                />

                                <SummaryPreference
                                    icon={
                                        <Banknote className="w-4 h-4" />
                                    }
                                    label="Fee Notifications"
                                    value={
                                        feeNotificationRelationships.length >
                                        0
                                    }
                                    detail={`${feeNotificationRelationships.length} of ${relationships.length} relationship(s) enabled`}
                                />

                                <SummaryPreference
                                    icon={
                                        <ShieldCheck className="w-4 h-4" />
                                    }
                                    label="Parental Responsibility"
                                    value={
                                        parentalResponsibilityRelationships.length >
                                        0
                                    }
                                    detail={`${parentalResponsibilityRelationships.length} of ${relationships.length} relationship(s) enabled`}
                                />

                                <SummaryPreference
                                    icon={
                                        <Siren className="w-4 h-4" />
                                    }
                                    label="Emergency Contact"
                                    value={
                                        emergencyRelationships.length >
                                        0
                                    }
                                    detail={`${emergencyRelationships.length} student relationship(s) marked as emergency contact`}
                                />
                            </div>
                        </section>

                        {/* ==================================================
                            QUICK ACTIONS
                        ================================================== */}

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

                        {/* ==================================================
                            SYSTEM INFORMATION
                        ================================================== */}

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

                                        <p>
                                            <span className="font-medium">
                                                Student relationships:
                                            </span>{" "}
                                            {
                                                relationships.length
                                            }
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

// ==================================================
// STUDENT RELATIONSHIP CARD
// ==================================================

function StudentRelationshipCard({
    relationship,
    student,
}) {
    const studentName = student
        ? getStudentName(student)
        : getRelationshipStudentLabel(
              relationship
          );

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* STUDENT HEADER */}

            <div className="bg-purple-50 border-b border-purple-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
                            {studentName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                        </div>

                        <div>
                            <p className="font-bold text-gray-800">
                                {studentName ||
                                    "Student"}
                            </p>

                            {student && (
                                <p className="text-sm text-purple-700 font-medium mt-1">
                                    {student.admission_number ||
                                        student.student_id ||
                                        "No admission number"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {relationship.is_primary && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                                <Star className="w-3.5 h-3.5" />
                                Primary
                            </span>
                        )}

                        {relationship.is_emergency_contact && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                <Siren className="w-3.5 h-3.5" />
                                Emergency
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* RELATIONSHIP BODY */}

            <div className="p-5">
                <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Relationship
                    </p>

                    <p className="text-lg font-bold text-purple-800 mt-1">
                        {formatRelationship(
                            relationship.relationship
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RelationshipItem
                        label="Parental Responsibility"
                        value={
                            relationship.has_parental_responsibility
                        }
                    />

                    <RelationshipItem
                        label="Receives Communications"
                        value={
                            relationship.receives_communication
                        }
                    />

                    <RelationshipItem
                        label="Receives Fee Notifications"
                        value={
                            relationship.receives_fee_notifications
                        }
                    />

                    <RelationshipItem
                        label="Emergency Contact"
                        value={
                            relationship.is_emergency_contact
                        }
                    />
                </div>
            </div>
        </div>
    );
}

// ==================================================
// SECTION HEADER
// ==================================================

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

// ==================================================
// SUMMARY CARD
// ==================================================

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

// ==================================================
// INFO ITEM
// ==================================================

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

// ==================================================
// RELATIONSHIP ITEM
// ==================================================

function RelationshipItem({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
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

// ==================================================
// SUMMARY PREFERENCE
// ==================================================

function SummaryPreference({
    icon,
    label,
    value,
    detail,
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    value
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-200 text-gray-500"
                }`}
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">
                        {label}
                    </p>

                    <span
                        className={`text-xs font-semibold ${
                            value
                                ? "text-purple-700"
                                : "text-gray-500"
                        }`}
                    >
                        {value
                            ? "Enabled"
                            : "Disabled"}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                    {detail}
                </p>
            </div>
        </div>
    );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                active
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-200 text-gray-600"
            }`}
        >
            {active
                ? "Active"
                : "Inactive"}
        </span>
    );
}

// ==================================================
// GENDER
// ==================================================

function formatGender(gender) {
    const labels = {
        male: "Male",
        female: "Female",
        other: "Other",
        not_specified:
            "Not Specified",
    };

    return (
        labels[gender] ||
        gender ||
        "Not Specified"
    );
}

// ==================================================
// RELATIONSHIP
// ==================================================

function formatRelationship(
    relationship
) {
    const labels = {
        mother: "Mother",
        father: "Father",
        guardian: "Guardian",
        step_mother:
            "Step Mother",
        step_father:
            "Step Father",
        grandparent:
            "Grandparent",
        sibling: "Sibling",
        other: "Other",
    };

    return (
        labels[relationship] ||
        relationship ||
        "Not Specified"
    );
}

// ==================================================
// STUDENT NAME
// ==================================================

function getStudentName(student) {
    if (!student) {
        return "";
    }

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
}

// ==================================================
// EXTRACT API RESULTS
// ==================================================

function extractResults(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (
        data &&
        Array.isArray(data.results)
    ) {
        return data.results;
    }

    return [];
}

// ==================================================
// GET RELATED ID
// ==================================================

function getRelatedId(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    if (
        typeof value === "object"
    ) {
        return value.id ?? null;
    }

    return value;
}

// ==================================================
// GET RELATIONSHIP PARENT ID
// ==================================================

function getRelationshipParentId(
    relationship
) {
    if (!relationship) {
        return null;
    }

    if (
        relationship.parent_guardian !==
        undefined
    ) {
        return getRelatedId(
            relationship.parent_guardian
        );
    }

    if (
        relationship.parent_guardian_id !==
        undefined
    ) {
        return relationship.parent_guardian_id;
    }

    return null;
}

// ==================================================
// GET RELATIONSHIP STUDENT ID
// ==================================================

function getRelationshipStudentId(
    relationship
) {
    if (!relationship) {
        return null;
    }

    if (
        relationship.student !==
        undefined
    ) {
        return getRelatedId(
            relationship.student
        );
    }

    if (
        relationship.student_id !==
        undefined
    ) {
        return relationship.student_id;
    }

    return null;
}

// ==================================================
// GET RELATIONSHIP STUDENT LABEL
// ==================================================

function getRelationshipStudentLabel(
    relationship
) {
    if (!relationship) {
        return "Student";
    }

    if (
        relationship.student &&
        typeof relationship.student ===
            "object"
    ) {
        if (
            relationship.student.full_name
        ) {
            return relationship.student.full_name;
        }

        return [
            relationship.student.first_name,
            relationship.student.middle_name,
            relationship.student.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    }

    return (
        relationship.student_name ||
        relationship.full_student_name ||
        "Student"
    );
}

// ==================================================
// FIND STUDENT FOR RELATIONSHIP
// ==================================================

function findStudentForRelationship(
    students,
    relationship
) {
    const studentId =
        getRelationshipStudentId(
            relationship
        );

    if (
        studentId === null ||
        studentId === undefined
    ) {
        return null;
    }

    return (
        students.find(
            (student) =>
                String(
                    student.id
                ) ===
                String(studentId)
        ) || null
    );
}

// ==================================================
// DATE
// ==================================================

function formatDate(date) {
    if (!date) {
        return "—";
    }

    try {
        return new Date(
            date
        ).toLocaleDateString(
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