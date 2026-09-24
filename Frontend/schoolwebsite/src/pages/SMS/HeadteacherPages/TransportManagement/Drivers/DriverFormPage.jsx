import React, { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Calendar,
    Car,
    CheckCircle,
    ChevronRight,
    FileText,
    Loader2,
    Save,
    ShieldCheck,
    User,
    X,
} from "lucide-react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ======================================================
// HELPERS
// ======================================================

const getId = (item) => {
    if (!item) return "";

    return (
        item.id ??
        item.pk ??
        item.staff_id ??
        item.vehicle_id ??
        ""
    );
};


const extractList = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};


const getStaffName = (staff) => {
    if (!staff) return "Unknown Staff";

    return (
        staff.full_name ||
        `${staff.first_name || ""} ${staff.last_name || ""}`.trim() ||
        staff.name ||
        staff.staff_id ||
        "Unknown Staff"
    );
};


const getStaffDisplay = (staff) => {
    if (!staff) return "Unknown Staff";

    const name = getStaffName(staff);

    if (staff.staff_id) {
        return `${name} (${staff.staff_id})`;
    }

    return name;
};


const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString();
};


const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleString();
};


const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return (
            error?.message ||
            "Something went wrong. Please try again."
        );
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(", ")
            : data.non_field_errors;
    }

    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
            messages.push(
                `${field}: ${value.join(", ")}`
            );
        } else if (typeof value === "object" && value !== null) {
            messages.push(
                `${field}: ${JSON.stringify(value)}`
            );
        } else {
            messages.push(`${field}: ${value}`);
        }
    });

    return messages.join(" | ");
};


// ======================================================
// STATUS HELPERS
// ======================================================

const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};


const getStatusClasses = (status) => {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-700 border-green-200";

        case "inactive":
            return "bg-gray-100 text-gray-700 border-gray-200";

        case "suspended":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";

        case "resigned":
            return "bg-orange-100 text-orange-700 border-orange-200";

        case "terminated":
            return "bg-red-100 text-red-700 border-red-200";

        case "retired":
            return "bg-purple-100 text-purple-700 border-purple-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};


// ======================================================
// INPUT FIELD
// ======================================================

const InputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
    error = "",
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition
                    ${
                        error
                            ? "border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }
                    ${
                        disabled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white"
                    }
                `}
            />

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};


// ======================================================
// SELECT FIELD
// ======================================================

const SelectField = ({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    disabled = false,
    error = "",
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <select
                name={name}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition
                    ${
                        error
                            ? "border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }
                    ${
                        disabled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white"
                    }
                `}
            >
                <option value="">
                    Select...
                </option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};


// ======================================================
// SECTION HEADER
// ======================================================

const SectionHeader = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="flex items-start gap-3 mb-5">
            <div className="p-2 rounded-lg bg-green-50 text-green-700">
                <Icon size={20} />
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>

                {description && (
                    <p className="text-sm text-gray-500 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};


// ======================================================
// MAIN COMPONENT
// ======================================================

const DriverFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    const [loading, setLoading] = useState(
        isEditMode
    );

    const [saving, setSaving] = useState(false);

    const [staffList, setStaffList] = useState([]);

    const [existingDriver, setExistingDriver] =
        useState(null);

    const [error, setError] = useState("");

    const [fieldErrors, setFieldErrors] =
        useState({});

    const [formData, setFormData] = useState({
        staff: "",
        license_number: "",
        license_class: "",
        license_issue_date: "",
        license_expiry_date: "",
        psv_license_number: "",
        psv_expiry_date: "",
        years_of_experience: "",
        previous_driving_experience: "",
        medical_certificate_expiry: "",
        driver_badge_number: "",
        is_verified: false,
        notes: "",
    });

    // --------------------------------------------------
    // LOAD DATA
    // --------------------------------------------------

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const staffResponse =
                    await axiosInstance.get("/staff/");

                const staff = extractList(
                    staffResponse
                );

                setStaffList(staff);

                if (isEditMode) {
                    const driverResponse =
                        await axiosInstance.get(
                            `/transport/driver-profiles/${id}/`
                        );

                    const driver =
                        driverResponse.data;

                    setExistingDriver(driver);

                    setFormData({
                        staff:
                            getId(driver.staff) ||
                            driver.staff ||
                            "",

                        license_number:
                            driver.license_number || "",

                        license_class:
                            driver.license_class || "",

                        license_issue_date:
                            driver.license_issue_date || "",

                        license_expiry_date:
                            driver.license_expiry_date || "",

                        psv_license_number:
                            driver.psv_license_number || "",

                        psv_expiry_date:
                            driver.psv_expiry_date || "",

                        years_of_experience:
                            driver.years_of_experience ??
                            "",

                        previous_driving_experience:
                            driver.previous_driving_experience ||
                            "",

                        medical_certificate_expiry:
                            driver.medical_certificate_expiry ||
                            "",

                        driver_badge_number:
                            driver.driver_badge_number || "",

                        is_verified:
                            Boolean(
                                driver.is_verified
                            ),

                        notes:
                            driver.notes || "",
                    });
                }
            } catch (err) {
                console.error(err);

                setError(
                    getErrorMessage(err)
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode]);

    // --------------------------------------------------
    // STAFF OPTIONS
    // --------------------------------------------------

    const availableStaff = React.useMemo(() => {
        const activeStaff = staffList.filter(
            (member) =>
                member.status === "active" ||
                member.is_active === true ||
                !member.status
        );

        // During creation, only active staff can
        // become drivers.
        if (!isEditMode) {
            return activeStaff;
        }

        // During editing, make sure the currently
        // selected staff remains available even if
        // their status later changed.
        const currentStaffId =
            String(formData.staff || "");

        const currentStaff =
            staffList.find(
                (member) =>
                    String(getId(member)) ===
                    currentStaffId
            );

        if (
            currentStaff &&
            !activeStaff.some(
                (member) =>
                    String(getId(member)) ===
                    currentStaffId
            )
        ) {
            return [
                currentStaff,
                ...activeStaff,
            ];
        }

        return activeStaff;
    }, [
        staffList,
        formData.staff,
        isEditMode,
    ]);

    // --------------------------------------------------
    // SELECTED STAFF
    // --------------------------------------------------

    const selectedStaff =
        staffList.find(
            (member) =>
                String(getId(member)) ===
                String(formData.staff)
        );

    // --------------------------------------------------
    // CURRENT DRIVER STATUS
    // --------------------------------------------------

    const driverStatus =
        existingDriver?.status ||
        selectedStaff?.status ||
        "";

    // --------------------------------------------------
    // HANDLE INPUT
    // --------------------------------------------------

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

        setFieldErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setError("");
    };

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    const validateForm = () => {
        const errors = {};

        if (!formData.staff) {
            errors.staff =
                "Please select a staff member.";
        }

        if (!formData.license_number.trim()) {
            errors.license_number =
                "License number is required.";
        }

        if (!formData.license_class.trim()) {
            errors.license_class =
                "License class is required.";
        }

        if (
            formData.license_issue_date &&
            formData.license_expiry_date &&
            formData.license_expiry_date <
                formData.license_issue_date
        ) {
            errors.license_expiry_date =
                "License expiry date cannot be earlier than the issue date.";
        }

        if (
            formData.psv_expiry_date &&
            formData.license_issue_date &&
            formData.psv_expiry_date <
                formData.license_issue_date
        ) {
            errors.psv_expiry_date =
                "PSV expiry date cannot be earlier than the license issue date.";
        }

        if (
            formData.years_of_experience !== "" &&
            Number(formData.years_of_experience) < 0
        ) {
            errors.years_of_experience =
                "Years of experience cannot be negative.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                staff: formData.staff,

                license_number:
                    formData.license_number.trim(),

                license_class:
                    formData.license_class.trim(),

                license_issue_date:
                    formData.license_issue_date || null,

                license_expiry_date:
                    formData.license_expiry_date || null,

                psv_license_number:
                    formData.psv_license_number.trim(),

                psv_expiry_date:
                    formData.psv_expiry_date || null,

                years_of_experience:
                    formData.years_of_experience === ""
                        ? null
                        : Number(
                              formData.years_of_experience
                          ),

                previous_driving_experience:
                    formData.previous_driving_experience.trim(),

                medical_certificate_expiry:
                    formData.medical_certificate_expiry ||
                    null,

                driver_badge_number:
                    formData.driver_badge_number.trim(),

                // --------------------------------------
                // VERIFICATION
                // --------------------------------------
                //
                // IMPORTANT:
                // We only send is_verified.
                //
                // Django automatically determines:
                // verified_by = request.user
                // verified_at = timezone.now()
                //
                is_verified:
                    Boolean(formData.is_verified),

                notes:
                    formData.notes.trim(),
            };

            if (isEditMode) {
                await axiosInstance.patch(
                    `/transport/driver-profiles/${id}/`,
                    payload
                );

                navigate(
                    `/transport/drivers/${id}`
                );
            } else {
                await axiosInstance.post(
                    "/transport/driver-profiles/",
                    payload
                );

                navigate("/transport/drivers");
            }
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(err)
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />

                    <span>
                        Loading driver information...
                    </span>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // STAFF OPTIONS
    // --------------------------------------------------

    const staffOptions =
        availableStaff.map((member) => ({
            value: getId(member),
            label: getStaffDisplay(member),
        }));

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="max-w-5xl mx-auto pb-12">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-3">

                    <Link
                        to={
                            isEditMode
                                ? `/transport/drivers/${id}`
                                : "/transport/drivers"
                        }
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode
                                ? "Edit Driver"
                                : "Add Driver"}
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode
                                ? "Update the driver's transport profile."
                                : "Create a transport profile for a staff member."}
                        </p>
                    </div>
                </div>

                {isEditMode &&
                    existingDriver && (
                        <div
                            className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusClasses(
                                driverStatus
                            )}`}
                        >
                            {getStatusLabel(
                                driverStatus
                            )}
                        </div>
                    )}
            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <div className="text-sm">
                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="ml-auto"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* ======================================
                    STAFF MEMBER
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={User}
                        title="Staff Member"
                        description="Select the staff member who will be registered as a driver."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <SelectField
                            label="Staff Member"
                            name="staff"
                            value={formData.staff}
                            onChange={handleChange}
                            options={staffOptions}
                            required
                            disabled={isEditMode}
                            error={
                                fieldErrors.staff
                            }
                        />

                        {/* Driver Status */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Driver Status
                            </label>

                            <div className="min-h-[46px] flex items-center">

                                {driverStatus ? (
                                    <span
                                        className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusClasses(
                                            driverStatus
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            driverStatus
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-400">
                                        Select a staff member
                                    </span>
                                )}

                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Driver status is automatically
                                inherited from the staff member's
                                status.
                            </p>
                        </div>

                    </div>

                    {selectedStaff &&
                        selectedStaff.status !==
                            "active" && (
                            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                This staff member is currently{" "}
                                <strong>
                                    {getStatusLabel(
                                        selectedStaff.status
                                    )}
                                </strong>
                                . Driver status is derived from
                                the staff record.
                            </div>
                        )}

                </div>

                {/* ======================================
                    DRIVING LICENCE
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={FileText}
                        title="Driving Licence"
                        description="Enter the driver's main driving licence information."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <InputField
                            label="License Number"
                            name="license_number"
                            value={
                                formData.license_number
                            }
                            onChange={handleChange}
                            required
                            error={
                                fieldErrors.license_number
                            }
                        />

                        <InputField
                            label="License Class"
                            name="license_class"
                            value={
                                formData.license_class
                            }
                            onChange={handleChange}
                            required
                            placeholder="e.g. BCE"
                            error={
                                fieldErrors.license_class
                            }
                        />

                        <InputField
                            label="License Issue Date"
                            name="license_issue_date"
                            type="date"
                            value={
                                formData.license_issue_date
                            }
                            onChange={handleChange}
                        />

                        <InputField
                            label="License Expiry Date"
                            name="license_expiry_date"
                            type="date"
                            value={
                                formData.license_expiry_date
                            }
                            onChange={handleChange}
                            error={
                                fieldErrors.license_expiry_date
                            }
                        />

                    </div>
                </div>

                {/* ======================================
                    PSV LICENCE
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={Car}
                        title="PSV Licence"
                        description="Enter PSV-specific licensing information."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <InputField
                            label="PSV License Number"
                            name="psv_license_number"
                            value={
                                formData.psv_license_number
                            }
                            onChange={handleChange}
                            placeholder="Optional"
                        />

                        <InputField
                            label="PSV Expiry Date"
                            name="psv_expiry_date"
                            type="date"
                            value={
                                formData.psv_expiry_date
                            }
                            onChange={handleChange}
                            error={
                                fieldErrors.psv_expiry_date
                            }
                        />

                        <InputField
                            label="Driver Badge Number"
                            name="driver_badge_number"
                            value={
                                formData.driver_badge_number
                            }
                            onChange={handleChange}
                            placeholder="Optional"
                        />

                    </div>
                </div>

                {/* ======================================
                    EXPERIENCE & MEDICAL
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={Calendar}
                        title="Experience & Medical"
                        description="Record the driver's experience and medical certification."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <InputField
                            label="Years of Experience"
                            name="years_of_experience"
                            type="number"
                            min="0"
                            value={
                                formData.years_of_experience
                            }
                            onChange={handleChange}
                            error={
                                fieldErrors.years_of_experience
                            }
                        />

                        <InputField
                            label="Medical Certificate Expiry"
                            name="medical_certificate_expiry"
                            type="date"
                            value={
                                formData.medical_certificate_expiry
                            }
                            onChange={handleChange}
                        />

                    </div>

                    <div className="mt-5">

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Driving Experience
                        </label>

                        <textarea
                            name="previous_driving_experience"
                            value={
                                formData.previous_driving_experience
                            }
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe previous driving experience..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />

                    </div>
                </div>

                {/* ======================================
                    VERIFICATION
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={ShieldCheck}
                        title="Driver Verification"
                        description="Verify the driver using your currently logged-in account."
                    />

                    <label
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                            formData.is_verified
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                        <input
                            type="checkbox"
                            name="is_verified"
                            checked={
                                formData.is_verified
                            }
                            onChange={handleChange}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />

                        <div className="flex-1">

                            <div className="flex items-center gap-2">

                                <span className="font-medium text-gray-900">
                                    Driver is Verified
                                </span>

                                {formData.is_verified && (
                                    <BadgeCheck
                                        size={18}
                                        className="text-green-600"
                                    />
                                )}

                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                                When checked, the system will
                                automatically record your
                                currently logged-in account as
                                the person who verified this
                                driver.
                            </p>

                        </div>
                    </label>

                    {/* Existing verification details */}

                    {isEditMode &&
                        existingDriver &&
                        existingDriver.is_verified && (
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">

                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Verified By
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {existingDriver.verified_by_name ||
                                            "Current user"}
                                    </p>

                                </div>

                                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">

                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Verified At
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {formatDateTime(
                                            existingDriver.verified_at
                                        )}
                                    </p>

                                </div>

                            </div>
                        )}

                    {formData.is_verified &&
                        (!isEditMode ||
                            !existingDriver?.is_verified) && (
                            <div className="mt-4 flex items-start gap-2 text-sm text-green-700">

                                <CheckCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />

                                <p>
                                    This driver will be verified
                                    under your logged-in account
                                    when you save the form. The
                                    verification date and time will
                                    be recorded automatically.
                                </p>

                            </div>
                        )}

                </div>

                {/* ======================================
                    NOTES
                ====================================== */}

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <SectionHeader
                        icon={FileText}
                        title="Additional Notes"
                        description="Add any other information relevant to this driver."
                    />

                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Additional notes..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                </div>

                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div className="flex items-center justify-end gap-3">

                    <Link
                        to={
                            isEditMode
                                ? `/transport/drivers/${id}`
                                : "/transport/drivers"
                        }
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                        {saving ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />

                                {isEditMode
                                    ? "Update Driver"
                                    : "Save Driver"}
                            </>
                        )}
                    </button>

                </div>

            </form>
        </div>
    );
};

export default DriverFormPage;