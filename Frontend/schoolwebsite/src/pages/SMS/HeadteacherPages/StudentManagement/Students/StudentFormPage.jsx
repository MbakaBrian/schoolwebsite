import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    UserPlus,
    UserRound,
    Users,
    HeartPulse,
    GraduationCap,
    FileText,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";

const StudentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(isEditMode);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [families, setFamilies] = useState([]);

    const [formData, setFormData] = useState({
        admission_number: "",
        family: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        place_of_birth: "",
        gender: "not_specified",
        nationality: "Kenyan",
        religion: "",

        birth_certificate_entry_number: "",
        birth_certificate_number: "",
        birth_certificate_submitted: false,

        home_county: "",
        home_sub_county: "",

        nemis_kemis_number: "",
        child_assessment_number: "",

        has_allergies_or_illness: false,
        medical_conditions: "",

        has_special_abilities: false,
        special_abilities: "",

        status: "active",
    });

    const [fieldErrors, setFieldErrors] = useState({});

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    const getResults = (response) => {
        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.data?.results)) {
            return response.data.results;
        }

        return [];
    };

    const formatDateForInput = (date) => {
        if (!date) return "";

        return String(date).split("T")[0];
    };

    const getErrorMessage = (err) => {
        const data = err?.response?.data;

        if (!data) {
            return "Something went wrong. Please try again.";
        }

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }

        if (data.message) {
            return data.message;
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
            : "Unable to save the student.";
    };

    // --------------------------------------------------
    // Load Families
    // --------------------------------------------------

    useEffect(() => {
        const loadFamilies = async () => {
            try {
                const response = await axiosInstance.get(
                    "/students/families/"
                );

                const data = getResults(response);

                setFamilies(data);
            } catch (err) {
                console.error("Failed to load families:", err);

                setError(
                    "Unable to load families. Please refresh the page and try again."
                );
            }
        };

        loadFamilies();
    }, []);

    // --------------------------------------------------
    // Load Student in Edit Mode
    // --------------------------------------------------

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const loadStudent = async () => {
            try {
                setLoadingStudent(true);
                setError("");

                const response = await axiosInstance.get(
                    `/students/students/${id}/`
                );

                const student = response.data;

                setFormData({
                    admission_number: student.admission_number || "",
                    family: student.family || "",
                    first_name: student.first_name || "",
                    middle_name: student.middle_name || "",
                    last_name: student.last_name || "",
                    date_of_birth: formatDateForInput(
                        student.date_of_birth
                    ),
                    place_of_birth: student.place_of_birth || "",
                    gender: student.gender || "not_specified",
                    nationality: student.nationality || "Kenyan",
                    religion: student.religion || "",

                    birth_certificate_entry_number:
                        student.birth_certificate_entry_number || "",

                    birth_certificate_number:
                        student.birth_certificate_number || "",

                    birth_certificate_submitted:
                        Boolean(student.birth_certificate_submitted),

                    home_county: student.home_county || "",
                    home_sub_county: student.home_sub_county || "",

                    nemis_kemis_number:
                        student.nemis_kemis_number || "",

                    child_assessment_number:
                        student.child_assessment_number || "",

                    has_allergies_or_illness:
                        Boolean(student.has_allergies_or_illness),

                    medical_conditions:
                        student.medical_conditions || "",

                    has_special_abilities:
                        Boolean(student.has_special_abilities),

                    special_abilities:
                        student.special_abilities || "",

                    status: student.status || "active",
                });
            } catch (err) {
                console.error("Failed to load student:", err);

                setError(
                    "Unable to load the student record. Please try again."
                );
            } finally {
                setLoadingStudent(false);
            }
        };

        loadStudent();
    }, [id, isEditMode]);

    // --------------------------------------------------
    // Preselect Family From Query Parameter
    // --------------------------------------------------

    useEffect(() => {
        if (isEditMode) {
            return;
        }

        const familyId = searchParams.get("family");

        if (familyId && familyId !== "undefined" && familyId !== "null") {
            setFormData((previous) => ({
                ...previous,
                family: familyId,
            }));
        }
    }, [searchParams, isEditMode]);

    // --------------------------------------------------
    // Active Families
    // --------------------------------------------------

    const availableFamilies = useMemo(() => {
        return families.filter((family) => {
            if (family.is_active !== false) {
                return true;
            }

            return String(family.id) === String(formData.family);
        });
    }, [families, formData.family]);

    // --------------------------------------------------
    // Input Change
    // --------------------------------------------------

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setError("");
    };

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    const validateForm = () => {
        const errors = {};

        if (!formData.admission_number.trim()) {
            errors.admission_number = "Admission number is required.";
        }

        if (!formData.first_name.trim()) {
            errors.first_name = "First name is required.";
        }

        if (!formData.last_name.trim()) {
            errors.last_name = "Last name is required.";
        }

        if (!formData.date_of_birth) {
            errors.date_of_birth = "Date of birth is required.";
        }

        if (!formData.gender) {
            errors.gender = "Gender is required.";
        }

        if (
            formData.has_allergies_or_illness &&
            !formData.medical_conditions.trim()
        ) {
            errors.medical_conditions =
                "Please provide details of the allergies or illness.";
        }

        if (
            formData.has_special_abilities &&
            !formData.special_abilities.trim()
        ) {
            errors.special_abilities =
                "Please provide details of the special abilities.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // --------------------------------------------------
    // Submit
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            setError("Please correct the highlighted fields.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,

                admission_number:
                    formData.admission_number.trim(),

                family: formData.family
                    ? Number(formData.family)
                    : null,

                first_name: formData.first_name.trim(),
                middle_name: formData.middle_name.trim(),
                last_name: formData.last_name.trim(),

                place_of_birth:
                    formData.place_of_birth.trim(),

                nationality:
                    formData.nationality.trim(),

                religion:
                    formData.religion.trim(),

                birth_certificate_entry_number:
                    formData.birth_certificate_entry_number.trim(),

                birth_certificate_number:
                    formData.birth_certificate_number.trim(),

                home_county:
                    formData.home_county.trim(),

                home_sub_county:
                    formData.home_sub_county.trim(),

                nemis_kemis_number:
                    formData.nemis_kemis_number.trim(),

                child_assessment_number:
                    formData.child_assessment_number.trim(),

                medical_conditions:
                    formData.has_allergies_or_illness
                        ? formData.medical_conditions.trim()
                        : "",

                special_abilities:
                    formData.has_special_abilities
                        ? formData.special_abilities.trim()
                        : "",
            };

            let response;

            if (isEditMode) {
                response = await axiosInstance.patch(
                    `/students/students/${id}/`,
                    payload
                );
            } else {
                response = await axiosInstance.post(
                    "/students/students/",
                    payload
                );
            }

            const savedStudent = response.data;

            setSuccess(
                isEditMode
                    ? "Student record updated successfully."
                    : "Student added successfully."
            );

            setTimeout(() => {
                if (savedStudent?.id) {
                    navigate(`/sms/students/${savedStudent.id}`);
                } else {
                    navigate("/sms/students");
                }
            }, 700);
        } catch (err) {
            console.error("Failed to save student:", err);

            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Cancel
    // --------------------------------------------------

    const handleCancel = () => {
        if (isEditMode) {
            navigate(`/sms/students/${id}`);
        } else {
            navigate("/sms/students");
        }
    };

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loadingStudent) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-center">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600">
                        Loading student record...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="bg-purple-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-5 transition"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-purple-700 flex items-center justify-center">
                            {isEditMode ? (
                                <UserRound size={28} />
                            ) : (
                                <UserPlus size={28} />
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                {isEditMode
                                    ? "Edit Student"
                                    : "Add New Student"}
                            </h1>

                            <p className="text-purple-100 mt-1">
                                {isEditMode
                                    ? "Update the student's profile and admission information."
                                    : "Create a permanent student profile for the school."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3">
                        <AlertCircle
                            size={20}
                            className="flex-shrink-0 mt-0.5"
                        />

                        <div>
                            <p className="font-semibold">
                                Unable to save
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex gap-3">
                        <CheckCircle2
                            size={20}
                            className="flex-shrink-0"
                        />

                        <p className="font-medium">
                            {success}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* ------------------------------------------------ */}
                    {/* Basic Information */}
                    {/* ------------------------------------------------ */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                        <div className="bg-gray-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <UserRound size={21} />

                                <div>
                                    <h2 className="font-bold text-lg">
                                        Student Information
                                    </h2>

                                    <p className="text-gray-300 text-sm">
                                        Basic identity and admission details
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                            {/* Admission Number */}
                            <div>
                                <label className="label">
                                    Admission Number *
                                </label>

                                <input
                                    type="text"
                                    name="admission_number"
                                    value={formData.admission_number}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    placeholder="e.g. ADM-00001"
                                    className={`input ${
                                        fieldErrors.admission_number
                                            ? "border-red-400"
                                            : ""
                                    } ${
                                        isEditMode
                                            ? "bg-gray-200 cursor-not-allowed"
                                            : ""
                                    }`}
                                />

                                {isEditMode && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Admission number is permanent and cannot be changed.
                                    </p>
                                )}

                                {fieldErrors.admission_number && (
                                    <p className="field-error">
                                        {fieldErrors.admission_number}
                                    </p>
                                )}
                            </div>

                            {/* Family */}
                            <div className="md:col-span-2">
                                <label className="label">
                                    Family
                                </label>

                                <select
                                    name="family"
                                    value={formData.family}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">
                                        No family selected
                                    </option>

                                    {availableFamilies.map((family) => (
                                        <option
                                            key={family.id}
                                            value={family.id}
                                        >
                                            {family.family_name} —{" "}
                                            {family.family_id}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-gray-500 mt-1">
                                    You can create or assign the family separately.
                                </p>
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="label">
                                    First Name *
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    className={`input ${
                                        fieldErrors.first_name
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.first_name && (
                                    <p className="field-error">
                                        {fieldErrors.first_name}
                                    </p>
                                )}
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className="label">
                                    Middle Name
                                </label>

                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleChange}
                                    placeholder="Middle name"
                                    className="input"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="label">
                                    Last Name *
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    className={`input ${
                                        fieldErrors.last_name
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.last_name && (
                                    <p className="field-error">
                                        {fieldErrors.last_name}
                                    </p>
                                )}
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="label">
                                    Date of Birth *
                                </label>

                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className={`input ${
                                        fieldErrors.date_of_birth
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.date_of_birth && (
                                    <p className="field-error">
                                        {fieldErrors.date_of_birth}
                                    </p>
                                )}
                            </div>

                            {/* Place of Birth */}
                            <div>
                                <label className="label">
                                    Place of Birth
                                </label>

                                <input
                                    type="text"
                                    name="place_of_birth"
                                    value={formData.place_of_birth}
                                    onChange={handleChange}
                                    placeholder="Place of birth"
                                    className="input"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="label">
                                    Gender *
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="not_specified">
                                        Not specified
                                    </option>

                                    <option value="male">
                                        Male
                                    </option>

                                    <option value="female">
                                        Female
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            {/* Nationality */}
                            <div>
                                <label className="label">
                                    Nationality
                                </label>

                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    placeholder="Nationality"
                                    className="input"
                                />
                            </div>

                            {/* Religion */}
                            <div>
                                <label className="label">
                                    Religion
                                </label>

                                <input
                                    type="text"
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleChange}
                                    placeholder="Religion"
                                    className="input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ------------------------------------------------ */}
                    {/* Birth Certificate */}
                    {/* ------------------------------------------------ */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                        <div className="bg-purple-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <FileText size={21} />

                                <div>
                                    <h2 className="font-bold text-lg">
                                        Birth Certificate
                                    </h2>

                                    <p className="text-purple-100 text-sm">
                                        Identification and birth registration details
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="label">
                                    Birth Certificate Number
                                </label>

                                <input
                                    type="text"
                                    name="birth_certificate_number"
                                    value={
                                        formData.birth_certificate_number
                                    }
                                    onChange={handleChange}
                                    placeholder="Birth certificate number"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Birth Entry Number
                                </label>

                                <input
                                    type="text"
                                    name="birth_certificate_entry_number"
                                    value={
                                        formData.birth_certificate_entry_number
                                    }
                                    onChange={handleChange}
                                    placeholder="Birth entry number"
                                    className="input"
                                />
                            </div>

                            <label className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="birth_certificate_submitted"
                                    checked={
                                        formData.birth_certificate_submitted
                                    }
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-purple-700"
                                />

                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Birth certificate submitted
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Mark this if the birth certificate has been remitted to the school.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* ------------------------------------------------ */}
                    {/* Home / Identification */}
                    {/* ------------------------------------------------ */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                        <div className="bg-gray-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <Users size={21} />

                                <div>
                                    <h2 className="font-bold text-lg">
                                        Home & Identification
                                    </h2>

                                    <p className="text-gray-300 text-sm">
                                        Location and education identification numbers
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="label">
                                    Home County
                                </label>

                                <input
                                    type="text"
                                    name="home_county"
                                    value={formData.home_county}
                                    onChange={handleChange}
                                    placeholder="Home county"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Home Sub-County
                                </label>

                                <input
                                    type="text"
                                    name="home_sub_county"
                                    value={formData.home_sub_county}
                                    onChange={handleChange}
                                    placeholder="Home sub-county"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    NEMIS / KEMIS Number
                                </label>

                                <input
                                    type="text"
                                    name="nemis_kemis_number"
                                    value={formData.nemis_kemis_number}
                                    onChange={handleChange}
                                    placeholder="NEMIS / KEMIS number"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Child Assessment Number
                                </label>

                                <input
                                    type="text"
                                    name="child_assessment_number"
                                    value={
                                        formData.child_assessment_number
                                    }
                                    onChange={handleChange}
                                    placeholder="Assessment number"
                                    className="input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ------------------------------------------------ */}
                    {/* Medical */}
                    {/* ------------------------------------------------ */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                        <div className="bg-purple-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <HeartPulse size={21} />

                                <div>
                                    <h2 className="font-bold text-lg">
                                        Medical Information
                                    </h2>

                                    <p className="text-purple-100 text-sm">
                                        Allergies, illness and medical information
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">

                            <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="has_allergies_or_illness"
                                    checked={
                                        formData.has_allergies_or_illness
                                    }
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-purple-700"
                                />

                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Student has allergies or illness
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Tick this if the student has a known allergy, illness or medical condition.
                                    </p>
                                </div>
                            </label>

                            {formData.has_allergies_or_illness && (
                                <div>
                                    <label className="label">
                                        Medical Conditions / Details *
                                    </label>

                                    <textarea
                                        name="medical_conditions"
                                        value={
                                            formData.medical_conditions
                                        }
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe the allergies, illness or medical condition..."
                                        className={`input resize-none ${
                                            fieldErrors.medical_conditions
                                                ? "border-red-400"
                                                : ""
                                        }`}
                                    />

                                    {fieldErrors.medical_conditions && (
                                        <p className="field-error">
                                            {
                                                fieldErrors.medical_conditions
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ------------------------------------------------ */}
                    {/* Special Abilities */}
                    {/* ------------------------------------------------ */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                        <div className="bg-gray-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <GraduationCap size={21} />

                                <div>
                                    <h2 className="font-bold text-lg">
                                        Special Abilities
                                    </h2>

                                    <p className="text-gray-300 text-sm">
                                        Talents, abilities and additional learner information
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">

                            <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="has_special_abilities"
                                    checked={
                                        formData.has_special_abilities
                                    }
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-purple-700"
                                />

                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Student has special abilities
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Tick this if the student has special talents or abilities that should be recorded.
                                    </p>
                                </div>
                            </label>

                            {formData.has_special_abilities && (
                                <div>
                                    <label className="label">
                                        Special Abilities / Details *
                                    </label>

                                    <textarea
                                        name="special_abilities"
                                        value={
                                            formData.special_abilities
                                        }
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe the student's special abilities..."
                                        className={`input resize-none ${
                                            fieldErrors.special_abilities
                                                ? "border-red-400"
                                                : ""
                                        }`}
                                    />

                                    {fieldErrors.special_abilities && (
                                        <p className="field-error">
                                            {
                                                fieldErrors.special_abilities
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ------------------------------------------------ */}
                    {/* Status */}
                    {/* ------------------------------------------------ */}

                    {isEditMode && (
                        <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">
                            <div className="bg-gray-800 px-6 py-4 text-white">
                                <h2 className="font-bold text-lg">
                                    Student Status
                                </h2>
                            </div>

                            <div className="p-6">
                                <label className="label">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="input max-w-md"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="graduated">
                                        Graduated
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

                                <p className="text-xs text-gray-500 mt-2">
                                    Use this to update the student's overall profile status. Enrollment status is managed separately.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* Actions */}
                    {/* ------------------------------------------------ */}

                    <div className="bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold transition disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditMode
                                        ? "Update Student"
                                        : "Save Student"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Shared input styles */}
            <style>{`
                .label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                }

                .input {
                    width: 100%;
                    padding: 0.75rem 0.875rem;
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    color: #1f2937;
                    outline: none;
                    transition: all 0.2s;
                }

                .input:focus {
                    border-color: #7e22ce;
                    box-shadow: 0 0 0 3px rgba(126, 34, 206, 0.12);
                    background: #fafafa;
                }

                .input::placeholder {
                    color: #9ca3af;
                }

                .field-error {
                    margin-top: 0.35rem;
                    font-size: 0.75rem;
                    color: #dc2626;
                }
            `}</style>
        </div>
    );
};

export default StudentFormPage;

