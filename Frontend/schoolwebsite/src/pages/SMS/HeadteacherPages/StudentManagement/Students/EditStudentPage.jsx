import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

import {
    ArrowLeft,
    Save,
    User,
    HeartPulse,
    GraduationCap,
    Users,
    FileText,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";


// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
    first_name: "",
    middle_name: "",
    last_name: "",

    date_of_birth: "",
    place_of_birth: "",

    gender: "",
    nationality: "Kenyan",
    religion: "",

    birth_certificate_entry_number: "",
    birth_certificate_number: "",
    birth_certificate_submitted: false,

    nemis_kemis_number: "",
    child_assessment_number: "",

    home_county: "",
    home_sub_county: "",

    has_allergies_or_illness: false,
    medical_conditions: "",

    has_special_abilities: false,
    special_abilities: "",
};


// ============================================================
// HELPERS
// ============================================================

const SectionHeader = ({
    icon: Icon,
    title,
    description,
    purple = false,
}) => (
    <div
        className={`px-5 sm:px-6 py-5 ${
            purple
                ? "bg-purple-800 text-white"
                : "bg-gray-800 text-white"
        }`}
    >
        <div className="flex items-center gap-3">

            <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    purple
                        ? "bg-purple-700"
                        : "bg-gray-700"
                }`}
            >
                <Icon size={20} />
            </div>

            <div>

                <h2 className="font-semibold text-lg">
                    {title}
                </h2>

                <p
                    className={`text-sm ${
                        purple
                            ? "text-purple-200"
                            : "text-gray-300"
                    }`}
                >
                    {description}
                </p>

            </div>

        </div>
    </div>
);


const getStudentName = (student) => {
    if (student?.full_name) {
        return student.full_name;
    }

    return [
        student?.first_name,
        student?.middle_name,
        student?.last_name,
    ]
        .filter(Boolean)
        .join(" ") || "Student";
};


// ============================================================
// COMPONENT
// ============================================================

const EditStudentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [formData, setFormData] = useState(initialForm);

    const [families, setFamilies] = useState([]);
    const [selectedFamily, setSelectedFamily] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingFamilies, setLoadingFamilies] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ========================================================
    // FETCH STUDENT + FAMILIES
    // ========================================================

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setLoadingFamilies(true);
                setError("");

                const [studentResponse, familiesResponse] =
                    await Promise.all([
                        axiosInstance.get(
                            `/students/students/${id}/`
                        ),
                        axiosInstance.get(
                            "/students/families/"
                        ),
                    ]);

                const studentData =
                    studentResponse.data;

                const familyData =
                    familiesResponse.data;

                setStudent(studentData);

                setFormData({
                    first_name:
                        studentData.first_name || "",

                    middle_name:
                        studentData.middle_name || "",

                    last_name:
                        studentData.last_name || "",

                    date_of_birth:
                        studentData.date_of_birth || "",

                    place_of_birth:
                        studentData.place_of_birth || "",

                    gender:
                        studentData.gender || "",

                    nationality:
                        studentData.nationality ||
                        "Kenyan",

                    religion:
                        studentData.religion || "",

                    birth_certificate_entry_number:
                        studentData.birth_certificate_entry_number ||
                        "",

                    birth_certificate_number:
                        studentData.birth_certificate_number ||
                        "",

                    birth_certificate_submitted:
                        Boolean(
                            studentData.birth_certificate_submitted
                        ),

                    nemis_kemis_number:
                        studentData.nemis_kemis_number ||
                        "",

                    child_assessment_number:
                        studentData.child_assessment_number ||
                        "",

                    home_county:
                        studentData.home_county || "",

                    home_sub_county:
                        studentData.home_sub_county ||
                        "",

                    has_allergies_or_illness:
                        Boolean(
                            studentData.has_allergies_or_illness
                        ),

                    medical_conditions:
                        studentData.medical_conditions ||
                        "",

                    has_special_abilities:
                        Boolean(
                            studentData.has_special_abilities
                        ),

                    special_abilities:
                        studentData.special_abilities ||
                        "",
                });

                setSelectedFamily(
                    studentData.family
                        ? String(studentData.family)
                        : ""
                );

                setFamilies(
                    Array.isArray(familyData)
                        ? familyData
                        : familyData?.results || []
                );

            } catch (err) {
                console.error(
                    "Failed to load student:",
                    err
                );

                setError(
                    err?.response?.data?.detail ||
                    "Unable to load student information."
                );

            } finally {
                setLoading(false);
                setLoadingFamilies(false);
            }
        };

        loadData();
    }, [id]);


    // ========================================================
    // HANDLE INPUT
    // ========================================================

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

        setError("");
        setSuccess("");
    };


    // ========================================================
    // VALIDATE
    // ========================================================

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            return "First name is required.";
        }

        if (!formData.last_name.trim()) {
            return "Last name is required.";
        }

        if (!formData.date_of_birth) {
            return "Date of birth is required.";
        }

        if (!formData.gender) {
            return "Please select the student's gender.";
        }

        if (!selectedFamily) {
            return "Please select a family.";
        }

        if (
            formData.has_allergies_or_illness &&
            !formData.medical_conditions.trim()
        ) {
            return "Please provide details about the allergy or illness.";
        }

        if (
            formData.has_special_abilities &&
            !formData.special_abilities.trim()
        ) {
            return "Please provide details about the student's special abilities.";
        }

        return null;
    };


    // ========================================================
    // SAVE
    // ========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

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

            const payload = {
                ...formData,
                family: Number(selectedFamily),
            };

            await axiosInstance.put(
                `/students/students/${id}/`,
                payload
            );

            setSuccess(
                "Student information updated successfully."
            );

            setTimeout(() => {
                navigate(
                    `/sms/students/${id}`
                );
            }, 800);

        } catch (err) {
            console.error(
                "Failed to update student:",
                err
            );

            const responseData =
                err?.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages =
                    Object.entries(responseData)
                        .map(
                            ([field, message]) => {
                                const text =
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                              ", "
                                          )
                                        : message;

                                return `${field}: ${text}`;
                            }
                        )
                        .join(" | ");

                setError(
                    messages ||
                    "Unable to update the student."
                );
            } else {
                setError(
                    "Unable to update the student. Please check the information and try again."
                );
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } finally {
            setSaving(false);
        }
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">

                <div className="max-w-6xl mx-auto">

                    <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-3" />

                    <div className="h-5 w-96 bg-gray-200 rounded-lg animate-pulse mb-8" />

                    <div className="space-y-6">

                        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />

                        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />

                        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // ERROR / NO STUDENT
    // ========================================================

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

                <div className="max-w-6xl mx-auto">

                    <Link
                        to="/sms/students"
                        className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 mb-6"
                    >
                        <ArrowLeft size={17} />
                        Back to Students
                    </Link>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                        <div className="flex gap-3">

                            <AlertCircle
                                size={22}
                                className="text-red-600 flex-shrink-0"
                            />

                            <div>

                                <h2 className="font-semibold text-red-800">
                                    Unable to load student
                                </h2>

                                <p className="text-sm text-red-700 mt-1">
                                    {error ||
                                        "The requested student could not be found."}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

            <div className="max-w-6xl mx-auto">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-7">

                    <Link
                        to={`/sms/students/${id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 mb-3"
                    >
                        <ArrowLeft size={17} />
                        Back to Student
                    </Link>

                    <div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Edit Student
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Update information for{" "}
                            <span className="font-semibold text-gray-700">
                                {getStudentName(student)}
                            </span>
                            .
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    ALERTS
                ================================================== */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">

                        <div className="flex gap-3">

                            <AlertCircle
                                size={20}
                                className="flex-shrink-0 mt-0.5"
                            />

                            <div>

                                <p className="font-semibold">
                                    Unable to save changes
                                </p>

                                <p className="text-sm mt-1">
                                    {error}
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-green-700">

                        <div className="flex items-center gap-3">

                            <CheckCircle2 size={20} />

                            <p className="font-semibold">
                                {success}
                            </p>

                        </div>

                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    {/* ==================================================
                        PERSONAL INFORMATION
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={User}
                            title="Student Information"
                            description="Basic information about the student."
                            purple
                        />

                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                <div>
                                    <label className="form-label">
                                        First Name
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Middle Name
                                    </label>

                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={
                                            formData.middle_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Last Name
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Date of Birth
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={
                                            formData.date_of_birth
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Place of Birth
                                    </label>

                                    <input
                                        type="text"
                                        name="place_of_birth"
                                        value={
                                            formData.place_of_birth
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Gender
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="gender"
                                        value={
                                            formData.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    >
                                        <option value="">
                                            Select gender
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

                                        <option value="not_specified">
                                            Prefer not to specify
                                        </option>

                                    </select>
                                </div>


                                <div>
                                    <label className="form-label">
                                        Nationality
                                    </label>

                                    <input
                                        type="text"
                                        name="nationality"
                                        value={
                                            formData.nationality
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Religion
                                    </label>

                                    <input
                                        type="text"
                                        name="religion"
                                        value={
                                            formData.religion
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        FAMILY
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={Users}
                            title="Family"
                            description="Household associated with this student."
                        />

                        <div className="p-5 sm:p-6">

                            <label className="form-label">
                                Family
                                <span className="required">
                                    *
                                </span>
                            </label>

                            <select
                                value={
                                    selectedFamily
                                }
                                onChange={(event) => {
                                    setSelectedFamily(
                                        event.target.value
                                    );

                                    setError("");
                                }}
                                disabled={
                                    loadingFamilies
                                }
                                className="form-input"
                            >

                                <option value="">
                                    {loadingFamilies
                                        ? "Loading families..."
                                        : "Select family"}
                                </option>

                                {families.map(
                                    (family) => (
                                        <option
                                            key={
                                                family.id
                                            }
                                            value={
                                                family.id
                                            }
                                        >
                                            {
                                                family.family_name
                                            }

                                            {family.family_id
                                                ? ` (${family.family_id})`
                                                : ""}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                    </section>


                    {/* ==================================================
                        IDENTIFICATION
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={FileText}
                            title="Identification & Birth Certificate"
                            description="Official student identification information."
                            purple
                        />

                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div>
                                    <label className="form-label">
                                        Birth Certificate Number
                                    </label>

                                    <input
                                        type="text"
                                        name="birth_certificate_number"
                                        value={
                                            formData.birth_certificate_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div>
                                    <label className="form-label">
                                        Birth Entry Number
                                    </label>

                                    <input
                                        type="text"
                                        name="birth_certificate_entry_number"
                                        value={
                                            formData.birth_certificate_entry_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />
                                </div>


                                <div className="md:col-span-2">

                                    <label className="flex items-center gap-3 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            name="birth_certificate_submitted"
                                            checked={
                                                formData.birth_certificate_submitted
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                                        />

                                        <span className="text-sm font-medium text-gray-700">
                                            Birth certificate has been submitted
                                        </span>

                                    </label>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        EDUCATION IDENTIFIERS
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={GraduationCap}
                            title="Education Identifiers"
                            description="NEMIS/KEMIS and assessment information."
                        />

                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div>

                                    <label className="form-label">
                                        NEMIS / KEMIS Number
                                    </label>

                                    <input
                                        type="text"
                                        name="nemis_kemis_number"
                                        value={
                                            formData.nemis_kemis_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />

                                </div>


                                <div>

                                    <label className="form-label">
                                        Child Assessment Number
                                    </label>

                                    <input
                                        type="text"
                                        name="child_assessment_number"
                                        value={
                                            formData.child_assessment_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        HOME
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={MapPin}
                            title="Home Information"
                            description="Student's home county and sub-county."
                            purple
                        />

                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div>

                                    <label className="form-label">
                                        Home County
                                    </label>

                                    <input
                                        type="text"
                                        name="home_county"
                                        value={
                                            formData.home_county
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />

                                </div>


                                <div>

                                    <label className="form-label">
                                        Home Sub-County
                                    </label>

                                    <input
                                        type="text"
                                        name="home_sub_county"
                                        value={
                                            formData.home_sub_county
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="form-input"
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        MEDICAL
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                        <SectionHeader
                            icon={HeartPulse}
                            title="Medical Information"
                            description="Allergies, illnesses and medical conditions."
                        />

                        <div className="p-5 sm:p-6">

                            <label className="flex items-center gap-3 cursor-pointer mb-5">

                                <input
                                    type="checkbox"
                                    name="has_allergies_or_illness"
                                    checked={
                                        formData.has_allergies_or_illness
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                                />

                                <span className="font-medium text-gray-700">
                                    Does the student have any allergies or illness?
                                </span>

                            </label>


                            {formData.has_allergies_or_illness && (

                                <div>

                                    <label className="form-label">
                                        Medical Conditions / Details
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        name="medical_conditions"
                                        value={
                                            formData.medical_conditions
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        className="form-input resize-none"
                                    />

                                </div>

                            )}

                        </div>

                    </section>


                    {/* ==================================================
                        SPECIAL ABILITIES
                    ================================================== */}

                    <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">

                        <SectionHeader
                            icon={GraduationCap}
                            title="Special Abilities"
                            description="Special talents and abilities."
                            purple
                        />

                        <div className="p-5 sm:p-6">

                            <label className="flex items-center gap-3 cursor-pointer mb-5">

                                <input
                                    type="checkbox"
                                    name="has_special_abilities"
                                    checked={
                                        formData.has_special_abilities
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                                />

                                <span className="font-medium text-gray-700">
                                    Does the student have any special abilities?
                                </span>

                            </label>


                            {formData.has_special_abilities && (

                                <div>

                                    <label className="form-label">
                                        Special Abilities / Details
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        name="special_abilities"
                                        value={
                                            formData.special_abilities
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        className="form-input resize-none"
                                    />

                                </div>

                            )}

                        </div>

                    </section>


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">

                        <Link
                            to={`/sms/students/${id}`}
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-200 transition"
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >

                            {saving ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />

                                    Save Changes
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>


            {/* ==========================================================
                FORM STYLES
            ========================================================== */}

            <style>{`
                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .required {
                    color: #9333ea;
                    margin-left: 0.25rem;
                }

                .form-input {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    background: #f3f4f6;
                    padding: 0.75rem 1rem;
                    color: #1f2937;
                    outline: none;
                    transition: all 0.2s;
                }

                .form-input::placeholder {
                    color: #9ca3af;
                }

                .form-input:focus {
                    border-color: #9333ea;
                    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.15);
                    background: #f9fafb;
                }

                .form-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>

        </div>
    );
};


export default EditStudentPage;

