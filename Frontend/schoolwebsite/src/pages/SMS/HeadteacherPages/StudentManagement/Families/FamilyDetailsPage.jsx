import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    ArrowLeft,
    Edit,
    Home,
    Users,
    GraduationCap,
    UserPlus,
    Mail,
    Phone,
    User,
    AlertCircle,
    RefreshCw,
    UserX,
} from "lucide-react";


const FamilyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [family, setFamily] = useState(null);
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ============================================================
    // FETCH FAMILY DATA
    // ============================================================

    const fetchFamily = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                familyResponse,
                studentsResponse,
                parentsResponse,
            ] = await Promise.all([
                axiosInstance.get(`/students/families/${id}/`),

                axiosInstance.get(
                    `/students/students/?family=${id}`
                ),

                axiosInstance.get(
                    `/students/parents/?family=${id}`
                ),
            ]);


            // ----------------------------------------------------
            // FAMILY
            // ----------------------------------------------------

            setFamily(familyResponse.data);


            // ----------------------------------------------------
            // STUDENTS
            // ----------------------------------------------------

            const studentsData = Array.isArray(studentsResponse.data)
                ? studentsResponse.data
                : studentsResponse.data.results || [];

            setStudents(studentsData);


            // ----------------------------------------------------
            // PARENTS / GUARDIANS
            // ----------------------------------------------------
            //
            // The backend should already filter using:
            //
            //     ?family=<id>
            //
            // We also filter here so this page NEVER displays
            // parents belonging to another family.
            //
            // Supports both:
            //
            //     parent.family
            //
            // and the newer:
            //
            //     parent.family_details.id
            //
            // ----------------------------------------------------

            const parentsData = Array.isArray(parentsResponse.data)
                ? parentsResponse.data
                : parentsResponse.data.results || [];


            const familyParents = parentsData.filter((parent) => {

                const parentFamilyId =
                    parent.family_details?.id ??
                    parent.family;


                return (
                    parentFamilyId !== null &&
                    parentFamilyId !== undefined &&
                    String(parentFamilyId) === String(id)
                );
            });


            setParents(familyParents);

        } catch (err) {
            console.error("Failed to load family:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to load family information."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) {
            fetchFamily();
        }
    }, [id]);


    // ============================================================
    // DEACTIVATE FAMILY
    // ============================================================

    const handleDeactivate = async () => {
        if (!family) return;

        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${family.family_name}?`
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                `/students/families/${id}/`
            );

            setFamily((previous) => ({
                ...previous,
                is_active: false,
            }));

        } catch (err) {
            console.error("Failed to deactivate family:", err);

            alert(
                err.response?.data?.detail ||
                "Failed to deactivate the family."
            );
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="flex flex-col items-center gap-3">

                    <RefreshCw
                        size={32}
                        className="text-purple-700 animate-spin"
                    />

                    <p className="text-gray-600 font-medium">
                        Loading family...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error || !family) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <button
                    onClick={() => navigate("/sms/families")}
                    className="flex items-center gap-2 text-purple-700 font-semibold mb-6 hover:text-purple-900"
                >
                    <ArrowLeft size={18} />
                    Back to Families
                </button>


                <div className="bg-red-100 border border-red-300 rounded-2xl p-6 text-red-800 flex items-start gap-3">

                    <AlertCircle
                        size={22}
                        className="mt-0.5"
                    />

                    <div>

                        <p className="font-bold">
                            Unable to load family
                        </p>

                        <p className="text-sm mt-1">
                            {error || "Family record could not be found."}
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

            {/* ================================================== */}
            {/* BACK */}
            {/* ================================================== */}

            <Link
                to="/sms/families"
                className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold mb-5"
            >
                <ArrowLeft size={18} />
                Back to Families
            </Link>


            {/* ================================================== */}
            {/* HERO */}
            {/* ================================================== */}

            <div className="bg-purple-800 rounded-2xl shadow-lg overflow-hidden mb-6">

                <div className="p-6 md:p-8">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                        <div className="flex items-start gap-4">

                            <div className="w-16 h-16 rounded-2xl bg-purple-700 flex items-center justify-center flex-shrink-0">

                                <Home
                                    size={32}
                                    className="text-purple-100"
                                />

                            </div>


                            <div>

                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        {family.family_name}
                                    </h1>


                                    {family.is_active ? (

                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            Active
                                        </span>

                                    ) : (

                                        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                                            Inactive
                                        </span>

                                    )}

                                </div>


                                <p className="text-purple-200 mt-1">
                                    {family.family_id}
                                </p>


                                <p className="text-purple-300 text-sm mt-2">
                                    Family and household record
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <Link
                                to={`/sms/families/${id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-purple-800 font-semibold hover:bg-gray-200 transition"
                            >
                                <Edit size={18} />
                                Edit Family
                            </Link>


                            {family.is_active && (
                                <button
                                    onClick={handleDeactivate}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-600 transition"
                                >
                                    <UserX size={18} />
                                    Deactivate
                                </button>
                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* QUICK STATS */}
            {/* ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                {/* STUDENTS */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Students
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {students.length}
                            </p>

                        </div>


                        <div className="bg-purple-100 p-3 rounded-xl">

                            <GraduationCap
                                size={24}
                                className="text-purple-700"
                            />

                        </div>

                    </div>

                </div>


                {/* PARENTS */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Parents / Guardians
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {parents.length}
                            </p>

                        </div>


                        <div className="bg-blue-100 p-3 rounded-xl">

                            <Users
                                size={24}
                                className="text-blue-700"
                            />

                        </div>

                    </div>

                </div>


                {/* STATUS */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Family Status
                            </p>

                            <p className="text-lg font-bold text-gray-800 mt-2">
                                {family.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </p>

                        </div>


                        <div className="bg-gray-200 p-3 rounded-xl">

                            <Home
                                size={24}
                                className="text-gray-600"
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* FAMILY INFORMATION */}
            {/* ================================================== */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mb-6">

                <div className="px-6 py-4 bg-gray-200 border-b border-gray-300 rounded-t-2xl">

                    <div className="flex items-center gap-3">

                        <Home
                            size={21}
                            className="text-purple-700"
                        />

                        <div>

                            <h2 className="text-lg font-bold text-gray-800">
                                Family Information
                            </h2>

                            <p className="text-sm text-gray-500">
                                Household and residential information
                            </p>

                        </div>

                    </div>

                </div>


                <div className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        <InfoItem
                            label="Family ID"
                            value={family.family_id}
                        />

                        <InfoItem
                            label="Family Name"
                            value={family.family_name}
                        />

                        <InfoItem
                            label="Town"
                            value={family.town}
                        />

                        <InfoItem
                            label="County"
                            value={family.county}
                        />

                        <InfoItem
                            label="Sub-County"
                            value={family.sub_county}
                        />

                        <InfoItem
                            label="Postal Address"
                            value={family.postal_address}
                        />


                        <div className="md:col-span-2 lg:col-span-3">

                            <InfoItem
                                label="Physical Address"
                                value={family.address}
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* STUDENTS */}
            {/* ================================================== */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mb-6">

                <div className="px-6 py-4 bg-gray-200 border-b border-gray-300 rounded-t-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">

                        <GraduationCap
                            size={21}
                            className="text-purple-700"
                        />

                        <div>

                            <h2 className="text-lg font-bold text-gray-800">
                                Family Students
                            </h2>

                            <p className="text-sm text-gray-500">
                                Students currently associated with this family
                            </p>

                        </div>

                    </div>


                    <Link
                        to="/sms/students/add"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                        <UserPlus size={17} />
                        Add Student
                    </Link>

                </div>


                <div className="p-6">

                    {students.length === 0 ? (

                        <div className="py-10 text-center">

                            <GraduationCap
                                size={35}
                                className="mx-auto text-gray-400 mb-3"
                            />

                            <p className="font-semibold text-gray-700">
                                No students linked to this family
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Students belonging to this household will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                            {students.map((student) => (

                                <Link
                                    key={student.id}
                                    to={`/sms/students/${student.id}`}
                                    className="block bg-gray-100 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition"
                                >

                                    <div className="flex items-start gap-3">

                                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">

                                            <GraduationCap
                                                size={20}
                                                className="text-purple-700"
                                            />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="font-semibold text-gray-800 truncate">
                                                {student.full_name ||
                                                    `${student.first_name || ""} ${student.last_name || ""}`}
                                            </p>


                                            <p className="text-sm text-purple-700 mt-1">
                                                {student.admission_number ||
                                                    student.student_id}
                                            </p>


                                            <span
                                                className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    student.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                            >
                                                {student.status
                                                    ? student.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                      student.status.slice(1)
                                                    : "Unknown"}
                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    )}

                </div>

            </div>


            {/* ================================================== */}
            {/* PARENTS / GUARDIANS */}
            {/* ================================================== */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">

                <div className="px-6 py-4 bg-gray-200 border-b border-gray-300 rounded-t-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">

                        <Users
                            size={21}
                            className="text-purple-700"
                        />

                        <div>

                            <h2 className="text-lg font-bold text-gray-800">
                                Parents & Guardians
                            </h2>

                            <p className="text-sm text-gray-500">
                                Parents and guardians associated with this family
                            </p>

                        </div>

                    </div>


                    <Link
                        to={`/sms/parents/add?family=${id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                    >
                        <UserPlus size={17} />
                        Add Parent / Guardian
                    </Link>

                </div>


                <div className="p-6">

                    {parents.length === 0 ? (

                        <div className="py-10 text-center">

                            <Users
                                size={35}
                                className="mx-auto text-gray-400 mb-3"
                            />

                            <p className="font-semibold text-gray-700">
                                No parents or guardians linked
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Parent and guardian records will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {parents.map((parent) => (

                                <div
                                    key={parent.id}
                                    className="bg-gray-100 border border-gray-200 rounded-xl p-5"
                                >

                                    <div className="flex items-start gap-4">

                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">

                                            <User
                                                size={22}
                                                className="text-purple-700"
                                            />

                                        </div>


                                        <div className="flex-1 min-w-0">

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                                <div>

                                                    <h3 className="font-bold text-gray-800">
                                                        {parent.full_name ||
                                                            `${parent.first_name || ""} ${parent.last_name || ""}`}
                                                    </h3>

                                                    <p className="text-sm text-purple-700">
                                                        {parent.parent_id}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="mt-3 space-y-2">

                                                {parent.mobile_number && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">

                                                        <Phone
                                                            size={15}
                                                            className="text-gray-400"
                                                        />

                                                        <span>
                                                            {parent.mobile_number}
                                                        </span>

                                                    </div>
                                                )}


                                                {parent.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">

                                                        <Mail
                                                            size={15}
                                                            className="text-gray-400"
                                                        />

                                                        <span className="truncate">
                                                            {parent.email}
                                                        </span>

                                                    </div>
                                                )}


                                                {parent.occupation && (
                                                    <div className="text-sm text-gray-500">

                                                        {parent.occupation}

                                                        {parent.employer
                                                            ? ` • ${parent.employer}`
                                                            : ""}

                                                    </div>
                                                )}

                                            </div>


                                            <div className="mt-4">

                                                <Link
                                                    to={`/sms/parents/${parent.id}`}
                                                    className="inline-flex items-center gap-2 text-sm text-purple-700 font-semibold hover:text-purple-900"
                                                >
                                                    View Parent
                                                </Link>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};


// ================================================================
// INFO ITEM
// ================================================================

const InfoItem = ({ label, value }) => {
    return (
        <div>

            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                {label}
            </p>

            <p className="text-gray-800 font-medium">
                {value || "Not provided"}
            </p>

        </div>
    );
};


export default FamilyDetailsPage;