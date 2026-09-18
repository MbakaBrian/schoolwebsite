import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Users,
    MapPin,
    AlertCircle,
    Loader2,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


export default function FamilyFormPage() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);


    const [formData, setFormData] = useState({
        family_name: "",
        address: "",
        town: "",
        county: "",
        sub_county: "",
        postal_address: "",
        is_active: true,
    });


    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    // ============================================================
    // LOAD FAMILY WHEN EDITING
    // ============================================================

    useEffect(() => {

        if (!isEditMode) {
            setLoading(false);
            return;
        }


        const fetchFamily = async () => {

            try {

                setLoading(true);
                setError("");


                const response = await axiosInstance.get(
                    `/students/families/${id}/`
                );


                const family = response.data;


                setFormData({
                    family_name: family.family_name || "",
                    address: family.address || "",
                    town: family.town || "",
                    county: family.county || "",
                    sub_county: family.sub_county || "",
                    postal_address: family.postal_address || "",

                    is_active:
                        family.is_active !== undefined
                            ? family.is_active
                            : true,
                });

            } catch (err) {

                console.error(
                    "Failed to load family:",
                    err
                );


                setError(
                    err.response?.data?.detail ||
                    "Failed to load the family information."
                );

            } finally {

                setLoading(false);

            }
        };


        fetchFamily();

    }, [id, isEditMode]);


    // ============================================================
    // HANDLE INPUT
    // ============================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setFormData((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm = () => {

        if (!formData.family_name.trim()) {

            setError(
                "Family name is required."
            );

            return false;
        }


        return true;
    };


    // ============================================================
    // FIND NEWLY CREATED FAMILY
    // ============================================================
    //
    // Used as a fallback if the POST response does not contain
    // the database ID.
    //
    // The Family model automatically generates a unique
    // family_id such as:
    //
    //     FAM-00004
    //
    // We use the family name to help identify the newly created
    // record if necessary.
    //
    // ============================================================

    const findCreatedFamily = async (familyName) => {

        try {

            const response = await axiosInstance.get(
                "/students/families/"
            );


            const families = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];


            const matchingFamilies = families.filter(
                (family) =>
                    String(
                        family.family_name || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    String(familyName || "")
                        .trim()
                        .toLowerCase()
            );


            if (matchingFamilies.length === 0) {
                return null;
            }


            // If multiple families have the same name,
            // use the most recently created one when available.
            const sortedFamilies = [
                ...matchingFamilies,
            ].sort((a, b) => {

                const dateA = a.created_at
                    ? new Date(a.created_at).getTime()
                    : 0;

                const dateB = b.created_at
                    ? new Date(b.created_at).getTime()
                    : 0;


                return dateB - dateA;
            });


            return sortedFamilies[0];

        } catch (err) {

            console.error(
                "Failed to locate newly created family:",
                err
            );

            return null;
        }
    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!validateForm()) {
            return;
        }


        try {

            setSaving(true);
            setError("");


            const payload = {

                family_name:
                    formData.family_name.trim(),

                address:
                    formData.address.trim(),

                town:
                    formData.town.trim(),

                county:
                    formData.county.trim(),

                sub_county:
                    formData.sub_county.trim(),

                postal_address:
                    formData.postal_address.trim(),

                is_active:
                    formData.is_active,
            };


            let response;


            // ====================================================
            // EDIT
            // ====================================================

            if (isEditMode) {

                response = await axiosInstance.put(
                    `/students/families/${id}/`,
                    payload
                );


                const savedFamily =
                    response.data;


                /*
                 * For editing we already know the ID from
                 * the URL, so we do not depend on the response.
                 */

                navigate(
                    `/sms/families/${id}`
                );

                return;
            }


            // ====================================================
            // CREATE
            // ====================================================

            response = await axiosInstance.post(
                "/students/families/",
                payload
            );


            const savedFamily =
                response.data;


            console.log(
                "Family created successfully:",
                savedFamily
            );


            // ====================================================
            // GET THE CREATED FAMILY ID
            // ====================================================
            //
            // Normally our serializer returns:
            //
            // {
            //     "id": 4,
            //     "family_id": "FAM-00004",
            //     ...
            // }
            //
            // Try the standard database ID first.
            //
            // ====================================================

            let savedFamilyId =
                savedFamily?.id ??
                savedFamily?.pk;


            // ====================================================
            // FALLBACK
            // ====================================================
            //
            // If the POST response somehow does not contain the
            // database ID, retrieve the family list and locate
            // the newly created family.
            //
            // ====================================================

            if (!savedFamilyId) {

                const createdFamily =
                    await findCreatedFamily(
                        formData.family_name
                    );


                if (createdFamily?.id) {

                    savedFamilyId =
                        createdFamily.id;

                }
            }


            // ====================================================
            // FINAL CHECK
            // ====================================================

            if (!savedFamilyId) {

                console.error(
                    "Family was created, but no family ID was returned or found.",
                    {
                        response: savedFamily,
                    }
                );


                setError(
                    "The family was created successfully, but the system could not determine its details page. Please return to the Families page and open the new family from the list."
                );


                return;
            }


            // ====================================================
            // NAVIGATE TO DETAILS
            // ====================================================

            navigate(
                `/sms/families/${savedFamilyId}`
            );

        } catch (err) {

            console.error(
                "Failed to save family:",
                err
            );


            const data =
                err.response?.data;


            if (
                data &&
                typeof data === "object"
            ) {

                const messages =
                    Object.entries(data)
                        .map(
                            ([
                                field,
                                message,
                            ]) => {

                                const readableField =
                                    field
                                        .replace(
                                            /_/g,
                                            " "
                                        )
                                        .replace(
                                            /\b\w/g,
                                            (letter) =>
                                                letter.toUpperCase()
                                        );


                                const readableMessage =
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                            " "
                                        )
                                        : String(
                                            message
                                        );


                                return `${readableField}: ${readableMessage}`;
                            }
                        )
                        .join(" ");


                setError(
                    messages ||
                    "Failed to save the family information."
                );

            } else {

                setError(
                    "Failed to save the family information. Please try again."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

                <div className="flex items-center gap-3 text-purple-800">

                    <Loader2
                        className="w-6 h-6 animate-spin"
                    />

                    <span className="font-medium">
                        Loading family information...
                    </span>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="bg-purple-800 text-white">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <Link
                                to={
                                    isEditMode
                                        ? `/sms/families/${id}`
                                        : "/sms/families"
                                }
                                className="p-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition"
                            >

                                <ArrowLeft className="w-5 h-5" />

                            </Link>


                            <div>

                                <div className="flex items-center gap-2">

                                    <Users className="w-6 h-6" />

                                    <h1 className="text-2xl font-bold">

                                        {isEditMode
                                            ? "Edit Family"
                                            : "Add Family"}

                                    </h1>

                                </div>


                                <p className="text-purple-200 mt-1">

                                    {isEditMode
                                        ? "Update the family household information."
                                        : "Create a family record for students and guardians."}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* CONTENT */}
            {/* ================================================== */}

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ERROR */}

                {error && (

                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">

                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />


                        <div>

                            <p className="font-semibold">
                                Unable to save family
                            </p>


                            <p className="text-sm mt-1">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ================================================== */}
                        {/* LEFT INFORMATION PANEL */}
                        {/* ================================================== */}

                        <div className="lg:col-span-2 space-y-6">

                            {/* FAMILY INFORMATION */}

                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                <div className="bg-gray-800 text-white px-6 py-4">

                                    <div className="flex items-center gap-3">

                                        <Users className="w-5 h-5" />

                                        <div>

                                            <h2 className="font-semibold">
                                                Family Information
                                            </h2>


                                            <p className="text-gray-300 text-sm">
                                                Basic household identification
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-6">

                                    <div>

                                        <label
                                            htmlFor="family_name"
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Family Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>


                                        <input
                                            id="family_name"
                                            name="family_name"
                                            type="text"
                                            value={formData.family_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Mbaka Family"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            required
                                        />


                                        <p className="text-xs text-gray-500 mt-2">
                                            This is the household/family name
                                            used throughout the system.
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* ================================================== */}
                            {/* LOCATION */}
                            {/* ================================================== */}

                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                <div className="bg-gray-800 text-white px-6 py-4">

                                    <div className="flex items-center gap-3">

                                        <MapPin className="w-5 h-5" />

                                        <div>

                                            <h2 className="font-semibold">
                                                Residence & Address
                                            </h2>


                                            <p className="text-gray-300 text-sm">
                                                Household location information
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-6 space-y-5">

                                    {/* ADDRESS */}

                                    <div>

                                        <label
                                            htmlFor="address"
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Physical Address
                                        </label>


                                        <textarea
                                            id="address"
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter the physical/home address"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none resize-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                        />

                                    </div>


                                    {/* TOWN + COUNTY */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>

                                            <label
                                                htmlFor="town"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Town
                                            </label>


                                            <input
                                                id="town"
                                                name="town"
                                                type="text"
                                                value={formData.town}
                                                onChange={handleChange}
                                                placeholder="e.g. Bomet"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />

                                        </div>


                                        <div>

                                            <label
                                                htmlFor="county"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                County
                                            </label>


                                            <input
                                                id="county"
                                                name="county"
                                                type="text"
                                                value={formData.county}
                                                onChange={handleChange}
                                                placeholder="e.g. Bomet County"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />

                                        </div>

                                    </div>


                                    {/* SUB COUNTY + POSTAL */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>

                                            <label
                                                htmlFor="sub_county"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Sub-County
                                            </label>


                                            <input
                                                id="sub_county"
                                                name="sub_county"
                                                type="text"
                                                value={formData.sub_county}
                                                onChange={handleChange}
                                                placeholder="Enter sub-county"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />

                                        </div>


                                        <div>

                                            <label
                                                htmlFor="postal_address"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Postal Address
                                            </label>


                                            <input
                                                id="postal_address"
                                                name="postal_address"
                                                type="text"
                                                value={formData.postal_address}
                                                onChange={handleChange}
                                                placeholder="e.g. P.O. Box 123"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />

                                        </div>

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* ================================================== */}
                        {/* RIGHT SIDE */}
                        {/* ================================================== */}

                        <div className="space-y-6">

                            {/* STATUS */}

                            <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                <div className="bg-purple-800 text-white px-6 py-4">

                                    <h2 className="font-semibold">
                                        Record Status
                                    </h2>

                                </div>


                                <div className="p-6">

                                    <label className="flex items-start gap-3 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 accent-purple-700"
                                        />


                                        <div>

                                            <p className="font-semibold text-gray-800">
                                                Active Family
                                            </p>


                                            <p className="text-sm text-gray-500 mt-1">
                                                Active families can be used for
                                                current students and guardians.
                                            </p>

                                        </div>

                                    </label>

                                </div>

                            </section>


                            {/* INFORMATION */}

                            <section className="bg-gray-200 rounded-2xl border border-gray-300 p-5">

                                <div className="flex items-start gap-3">

                                    <AlertCircle className="w-5 h-5 text-purple-800 mt-0.5 flex-shrink-0" />


                                    <div>

                                        <h3 className="font-semibold text-gray-800">
                                            About Family Records
                                        </h3>


                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            A family represents a household.
                                            Students and parents/guardians can
                                            be connected to the same family
                                            record.
                                        </p>


                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            The system automatically generates
                                            a unique Family ID such as{" "}

                                            <span className="font-semibold text-purple-800">
                                                FAM-00001
                                            </span>
                                            .
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* ACTIONS */}

                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 disabled:bg-purple-400 text-white font-semibold px-5 py-3 rounded-xl transition"
                                >

                                    {saving ? (

                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <Save className="w-5 h-5" />

                                            {isEditMode
                                                ? "Save Changes"
                                                : "Create Family"}

                                        </>

                                    )}

                                </button>


                                <Link
                                    to={
                                        isEditMode
                                            ? `/sms/families/${id}`
                                            : "/sms/families"
                                    }
                                    className="w-full mt-3 flex items-center justify-center px-5 py-3 rounded-xl border border-gray-300 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                                >
                                    Cancel
                                </Link>

                            </div>

                        </div>

                    </div>

                </form>

            </main>

        </div>
    );
}