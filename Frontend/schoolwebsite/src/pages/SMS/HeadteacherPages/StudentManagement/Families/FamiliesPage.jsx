import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    UserX,
    MapPin,
    GraduationCap,
    AlertCircle,
    Home,
    Plus,
} from "lucide-react";


const FamiliesPage = () => {
    const [families, setFamilies] = useState([]);
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("active");

    const [error, setError] = useState("");


    // ============================================================
    // FETCH DATA
    // ============================================================

    const fetchFamilies = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [familiesResponse, studentsResponse, parentsResponse] =
                await Promise.all([
                    axiosInstance.get("/students/families/"),
                    axiosInstance.get("/students/students/"),
                    axiosInstance.get("/students/parents/"),
                ]);

            setFamilies(
                Array.isArray(familiesResponse.data)
                    ? familiesResponse.data
                    : familiesResponse.data.results || []
            );

            setStudents(
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : studentsResponse.data.results || []
            );

            setParents(
                Array.isArray(parentsResponse.data)
                    ? parentsResponse.data
                    : parentsResponse.data.results || []
            );

        } catch (err) {
            console.error("Failed to load families:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to load family information. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        fetchFamilies();
    }, []);


    // ============================================================
    // FAMILY COUNTS
    // ============================================================

    const getStudentCount = (familyId) => {
        return students.filter(
            (student) => String(student.family) === String(familyId)
        ).length;
    };


    const getParentCount = (familyId) => {
        return parents.filter(
            (parent) => String(parent.family) === String(familyId)
        ).length;
    };


    // ============================================================
    // FILTER FAMILIES
    // ============================================================

    const filteredFamilies = useMemo(() => {
        return families.filter((family) => {

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "active"
                        ? family.is_active
                        : !family.is_active;

            const search = searchTerm.toLowerCase().trim();

            if (!search) {
                return matchesStatus;
            }

            const searchableText = [
                family.family_id,
                family.family_name,
                family.address,
                family.town,
                family.county,
                family.sub_county,
                family.postal_address,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                matchesStatus &&
                searchableText.includes(search)
            );
        });
    }, [families, searchTerm, statusFilter]);


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalFamilies = families.length;

    const activeFamilies = families.filter(
        (family) => family.is_active
    ).length;

    const inactiveFamilies = families.filter(
        (family) => !family.is_active
    ).length;

    const familiesWithStudents = families.filter(
        (family) => getStudentCount(family.id) > 0
    ).length;


    // ============================================================
    // DEACTIVATE FAMILY
    // ============================================================

    const handleDeactivate = async (family) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${family.family_name}?`
        );

        if (!confirmed) return;

        try {
            await axiosInstance.delete(
                `/students/families/${family.id}/`
            );

            setFamilies((previous) =>
                previous.map((item) =>
                    item.id === family.id
                        ? { ...item, is_active: false }
                        : item
                )
            );

        } catch (err) {
            console.error("Failed to deactivate family:", err);

            alert(
                err.response?.data?.detail ||
                "Failed to deactivate the family."
            );
        }
    };


    // ============================================================
    // LOADING STATE
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
                        Loading families...
                    </p>
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
            {/* HEADER */}
            {/* ================================================== */}

            <div className="bg-purple-800 rounded-2xl shadow-lg overflow-hidden mb-6">

                <div className="p-6 md:p-7">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div className="flex items-start gap-4">

                            <div className="bg-purple-700 p-3 rounded-xl">
                                <Home
                                    size={30}
                                    className="text-purple-100"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Families
                                </h1>

                                <p className="text-purple-200 mt-1">
                                    Manage student families and household
                                    information
                                </p>
                            </div>

                        </div>


                        <div className="flex flex-col sm:flex-row gap-3">

                            <button
                                onClick={() => fetchFamilies(true)}
                                disabled={refreshing}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white hover:bg-purple-600 transition disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={18}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>


                            <Link
                                to="/sms/families/add"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-purple-800 font-semibold hover:bg-gray-200 transition"
                            >
                                <Plus size={19} />

                                Add Family
                            </Link>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
                <div className="mb-6 bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 flex items-start gap-3">

                    <AlertCircle
                        size={20}
                        className="mt-0.5 flex-shrink-0"
                    />

                    <div>
                        <p className="font-semibold">
                            Unable to load families
                        </p>

                        <p className="text-sm mt-1">
                            {error}
                        </p>
                    </div>

                </div>
            )}


            {/* ================================================== */}
            {/* STATISTICS */}
            {/* ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                {/* Total */}

                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Total Families
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {totalFamilies}
                            </p>
                        </div>

                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Users
                                size={24}
                                className="text-purple-700"
                            />
                        </div>

                    </div>

                </div>


                {/* Active */}

                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Active Families
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {activeFamilies}
                            </p>
                        </div>

                        <div className="bg-green-100 p-3 rounded-xl">
                            <UserPlus
                                size={24}
                                className="text-green-700"
                            />
                        </div>

                    </div>

                </div>


                {/* With Students */}

                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                With Students
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {familiesWithStudents}
                            </p>
                        </div>

                        <div className="bg-blue-100 p-3 rounded-xl">
                            <GraduationCap
                                size={24}
                                className="text-blue-700"
                            />
                        </div>

                    </div>

                </div>


                {/* Inactive */}

                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Inactive Families
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {inactiveFamilies}
                            </p>
                        </div>

                        <div className="bg-gray-200 p-3 rounded-xl">
                            <UserX
                                size={24}
                                className="text-gray-600"
                            />
                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* SEARCH + FILTER */}
            {/* ================================================== */}

            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">

                <div className="flex flex-col md:flex-row gap-4">

                    {/* Search */}

                    <div className="relative flex-1">

                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by family name, ID, town, county..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />

                    </div>


                    {/* Status */}

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="md:w-52 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="active">
                            Active Families
                        </option>

                        <option value="inactive">
                            Inactive Families
                        </option>

                        <option value="all">
                            All Families
                        </option>
                    </select>

                </div>

                <div className="mt-3 text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                        {filteredFamilies.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                        {families.length}
                    </span>{" "}
                    families
                </div>

            </div>


            {/* ================================================== */}
            {/* FAMILY TABLE */}
            {/* ================================================== */}

            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

                    <h2 className="text-lg font-bold text-gray-800">
                        Family Records
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        View and manage registered families
                    </p>

                </div>


                {filteredFamilies.length === 0 ? (

                    <div className="py-16 px-6 text-center">

                        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">

                            <Home
                                size={30}
                                className="text-purple-700"
                            />

                        </div>

                        <h3 className="text-lg font-semibold text-gray-800">
                            No families found
                        </h3>

                        <p className="text-gray-500 mt-1 max-w-md mx-auto">
                            {searchTerm
                                ? "No families match your search criteria."
                                : "There are currently no families registered."}
                        </p>

                        {!searchTerm && (
                            <Link
                                to="/sms/families/add"
                                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-purple-800 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                            >
                                <Plus size={18} />
                                Add First Family
                            </Link>
                        )}

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="bg-gray-200">

                                <tr>

                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Family
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Location
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Students
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Parents
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-200">

                                {filteredFamilies.map((family) => {

                                    const studentCount =
                                        getStudentCount(family.id);

                                    const parentCount =
                                        getParentCount(family.id);

                                    return (

                                        <tr
                                            key={family.id}
                                            className="hover:bg-purple-50 transition"
                                        >

                                            {/* Family */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">

                                                        <Home
                                                            size={20}
                                                            className="text-purple-700"
                                                        />

                                                    </div>

                                                    <div>

                                                        <p className="font-semibold text-gray-800">
                                                            {family.family_name ||
                                                                "Unnamed Family"}
                                                        </p>

                                                        <p className="text-sm text-purple-700 font-medium">
                                                            {family.family_id}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Location */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-start gap-2">

                                                    <MapPin
                                                        size={17}
                                                        className="text-gray-400 mt-0.5 flex-shrink-0"
                                                    />

                                                    <div>

                                                        <p className="text-sm text-gray-700">
                                                            {family.town ||
                                                                family.county ||
                                                                "Not provided"}
                                                        </p>

                                                        {family.county && (
                                                            <p className="text-xs text-gray-500">
                                                                {family.county}
                                                                {family.sub_county
                                                                    ? ` • ${family.sub_county}`
                                                                    : ""}
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Students */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-purple-100 text-purple-800 font-bold">
                                                    {studentCount}
                                                </span>

                                            </td>


                                            {/* Parents */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-gray-200 text-gray-700 font-bold">
                                                    {parentCount}
                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td className="px-5 py-4 text-center">

                                                {family.is_active ? (

                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                        Active
                                                    </span>

                                                ) : (

                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                                                        Inactive
                                                    </span>

                                                )}

                                            </td>


                                            {/* Actions */}

                                            <td className="px-5 py-4">

                                                <div className="flex justify-end items-center gap-2">

                                                    <Link
                                                        to={`/sms/families/${family.id}`}
                                                        title="View Family"
                                                        className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                                                    >
                                                        <Eye size={17} />
                                                    </Link>


                                                    <Link
                                                        to={`/sms/families/${family.id}/edit`}
                                                        title="Edit Family"
                                                        className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                                    >
                                                        <Edit size={17} />
                                                    </Link>


                                                    {family.is_active && (
                                                        <button
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    family
                                                                )
                                                            }
                                                            title="Deactivate Family"
                                                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                                        >
                                                            <UserX size={17} />
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

                )}

            </div>

        </div>
    );
};


export default FamiliesPage;

