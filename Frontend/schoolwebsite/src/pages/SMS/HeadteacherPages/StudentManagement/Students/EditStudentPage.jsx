import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

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
    Search,
    ChevronDown,
} from "lucide-react";


// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
    admission_number: "",

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
    home_subcounty: "",

    has_allergies_or_illness: false,
    allergies_or_illness_details: "",

    has_special_abilities: false,
    special_abilities_details: "",
};


// ============================================================
// SECTION HEADER
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


// ============================================================
// SEARCHABLE DROPDOWN
// ============================================================

const SearchableDropdown = ({
    value,
    displayValue,
    options,
    onSelect,
    placeholder,
    searchPlaceholder,
    disabled = false,
    loading = false,
    emptyMessage = "No results found.",
}) => {

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const containerRef = useRef(null);

    // --------------------------------------------------------
    // CLOSE WHEN CLICKING OUTSIDE
    // --------------------------------------------------------

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target
                )
            ) {
                setOpen(false);
                setSearch("");
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);


    // --------------------------------------------------------
    // FILTER OPTIONS
    // --------------------------------------------------------

    const filteredOptions = useMemo(() => {

        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return options;
        }

        return options.filter((option) => {

            const searchableText = (
                option.searchText ||
                option.label ||
                ""
            ).toLowerCase();

            return searchableText.includes(query);

        });

    }, [options, search]);


    // --------------------------------------------------------
    // OPEN
    // --------------------------------------------------------

    const handleOpen = () => {

        if (disabled) {
            return;
        }

        setOpen(true);
        setSearch("");

    };


    // --------------------------------------------------------
    // SELECT
    // --------------------------------------------------------

    const handleSelect = (option) => {

        onSelect(option);

        setOpen(false);
        setSearch("");

    };


    return (
        <div
            ref={containerRef}
            className="relative"
        >

            <div className="relative">

                <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <input
                    type="text"
                    value={
                        open
                            ? search
                            : displayValue || ""
                    }
                    onFocus={handleOpen}
                    onChange={(event) => {

                        if (disabled) {
                            return;
                        }

                        setOpen(true);
                        setSearch(
                            event.target.value
                        );

                    }}
                    placeholder={
                        open
                            ? searchPlaceholder
                            : placeholder
                    }
                    disabled={
                        disabled || loading
                    }
                    className="form-input pl-10 pr-10"
                    autoComplete="off"
                />

                <ChevronDown
                    size={18}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${
                        open
                            ? "rotate-180"
                            : ""
                    }`}
                />

            </div>


            {open &&
                !disabled &&
                !loading && (

                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                        <div className="max-h-64 overflow-y-auto">

                            {filteredOptions.length === 0 ? (

                                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                                    {emptyMessage}
                                </div>

                            ) : (

                                filteredOptions.map(
                                    (option) => (

                                        <button
                                            key={
                                                String(
                                                    option.value
                                                )
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleSelect(
                                                    option
                                                )
                                            }
                                            className={`w-full text-left px-4 py-3 text-sm transition hover:bg-purple-50 ${
                                                String(
                                                    option.value
                                                ) ===
                                                String(value)
                                                    ? "bg-purple-50 text-purple-800 font-semibold"
                                                    : "text-gray-700"
                                            }`}
                                        >

                                            <div className="font-medium">
                                                {
                                                    option.label
                                                }
                                            </div>

                                            {option.secondaryLabel && (

                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {
                                                        option.secondaryLabel
                                                    }
                                                </div>

                                            )}

                                        </button>

                                    )
                                )

                            )}

                        </div>

                    </div>

                )}

        </div>
    );
};


// ============================================================
// STUDENT NAME
// ============================================================

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
// ERROR MESSAGE
// ============================================================

const getErrorMessage = (err) => {

    const responseData =
        err?.response?.data;

    if (!responseData) {
        return "Unable to update the student. Please try again.";
    }

    if (typeof responseData === "string") {
        return responseData;
    }

    if (responseData.detail) {
        return responseData.detail;
    }

    if (responseData.message) {
        return responseData.message;
    }

    if (typeof responseData === "object") {

        const messages =
            Object.entries(responseData)
                .map(([field, message]) => {

                    const text =
                        Array.isArray(message)
                            ? message.join(", ")
                            : String(message);

                    return `${field}: ${text}`;

                })
                .join(" | ");

        return (
            messages ||
            "Unable to update the student."
        );
    }

    return "Unable to update the student.";
};


// ============================================================
// COMPONENT
// ============================================================

const EditStudentPage = () => {

    const { id } = useParams();

    const navigate = useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [student, setStudent] =
        useState(null);

    const [formData, setFormData] =
        useState(initialForm);

    const [families, setFamilies] =
        useState([]);

    const [referenceData, setReferenceData] =
        useState({
            counties: [],
            religions: [],
        });

    const [admissionConfig, setAdmissionConfig] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [loadingFamilies, setLoadingFamilies] =
        useState(true);

    const [loadingReferenceData, setLoadingReferenceData] =
        useState(true);

    const [loadingAdmissionConfig, setLoadingAdmissionConfig] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================================
    // ADMISSION CONFIG
    // ========================================================

    const admissionPrefix =
        admissionConfig?.formatted_prefix || "";

    const admissionDigits =
        Number(
            admissionConfig?.digits
        ) || 5;


    // ========================================================
    // FETCH STUDENT + REFERENCE DATA
    // ========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setLoadingFamilies(true);
                setLoadingReferenceData(true);
                setLoadingAdmissionConfig(true);

                setError("");


                const [
                    studentResponse,
                    familiesResponse,
                    referenceResponse,
                    admissionConfigResponse,
                ] = await Promise.all([

                    // STUDENT
                    axiosInstance.get(
                        `/students/students/${id}/`
                    ),

                    // FAMILIES
                    axiosInstance.get(
                        "/students/families/"
                    ),

                    // COUNTIES / RELIGIONS
                    axiosInstance.get(
                        "/students/reference-data/"
                    ),

                    // ADMISSION NUMBER CONFIG
                    axiosInstance.get(
                        "/students/admission-number-config/"
                    ),

                ]);


                // =================================================
                // STUDENT
                // =================================================

                const studentData =
                    studentResponse.data;

                setStudent(studentData);


                // =================================================
                // FAMILIES
                // =================================================

                const familyData =
                    familiesResponse.data;

                setFamilies(
                    Array.isArray(familyData)
                        ? familyData
                        : familyData?.results || []
                );


                // =================================================
                // REFERENCE DATA
                // =================================================

                const referenceResponseData =
                    referenceResponse.data;

                setReferenceData({

                    counties:
                        Array.isArray(
                            referenceResponseData?.counties
                        )
                            ? referenceResponseData.counties
                            : [],

                    religions:
                        Array.isArray(
                            referenceResponseData?.religions
                        )
                            ? referenceResponseData.religions
                            : [],

                });


                // =================================================
                // ADMISSION CONFIG
                // =================================================

                const config =
                    admissionConfigResponse.data;

                setAdmissionConfig(config);


                // =================================================
                // POPULATE FORM
                // =================================================

                setFormData({

                    admission_number:
                        studentData.admission_number ||
                        "",

                    first_name:
                        studentData.first_name ||
                        "",

                    middle_name:
                        studentData.middle_name ||
                        "",

                    last_name:
                        studentData.last_name ||
                        "",

                    date_of_birth:
                        studentData.date_of_birth
                            ? String(
                                  studentData.date_of_birth
                              ).split("T")[0]
                            : "",

                    place_of_birth:
                        studentData.place_of_birth ||
                        "",

                    gender:
                        studentData.gender ||
                        "",

                    nationality:
                        studentData.nationality ||
                        "Kenyan",

                    religion:
                        studentData.religion ||
                        "",

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
                        studentData.home_county ||
                        "",

                    home_subcounty:
                        studentData.home_subcounty ||
                        "",

                    has_allergies_or_illness:
                        Boolean(
                            studentData.has_allergies_or_illness
                        ),

                    allergies_or_illness_details:
                        studentData.allergies_or_illness_details ||
                        "",

                    has_special_abilities:
                        Boolean(
                            studentData.has_special_abilities
                        ),

                    special_abilities_details:
                        studentData.special_abilities_details ||
                        "",

                });


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
                setLoadingReferenceData(false);
                setLoadingAdmissionConfig(false);

            }

        };


        loadData();

    }, [id]);


    // ========================================================
    // FAMILY OPTIONS
    // ========================================================

    const familyOptions = useMemo(() => {

        return families.map((family) => {

            const familyName =
                family.family_name ||
                "Unnamed Family";

            const familyId =
                family.family_id ||
                "";

            return {

                value: String(
                    family.id
                ),

                label: familyName,

                secondaryLabel:
                    familyId
                        ? `Family ID: ${familyId}`
                        : "",

                searchText:
                    `${familyName} ${familyId}`,

            };

        });

    }, [families]);


    // ========================================================
    // SELECTED FAMILY
    // ========================================================

    const selectedFamily = useMemo(() => {

        return families.find(
            (family) =>
                String(family.id) ===
                String(student?.family)
        );

    }, [families, student]);


    const selectedFamilyId =
        formData.family ||
        (
            student?.family
                ? String(student.family)
                : ""
        );


    // ========================================================
    // COUNTY OPTIONS
    // ========================================================

    const countyOptions = useMemo(() => {

        return referenceData.counties.map(
            (county) => {

                const name =
                    county.name || "";

                return {

                    value: name,

                    label: name,

                    searchText: name,

                };

            }
        );

    }, [referenceData.counties]);


    // ========================================================
    // SELECTED COUNTY
    // ========================================================

    const selectedCountyData =
        useMemo(() => {

            return referenceData.counties.find(
                (county) =>
                    county.name ===
                    formData.home_county
            );

        }, [
            referenceData.counties,
            formData.home_county,
        ]);


    // ========================================================
    // SUB-COUNTY OPTIONS
    // ========================================================

    const subcountyOptions = useMemo(() => {

        const subCounties =
            selectedCountyData?.sub_counties ||
            [];

        return subCounties.map(
            (subcounty) => ({

                value: subcounty,

                label: subcounty,

                searchText: subcounty,

            })
        );

    }, [selectedCountyData]);


    // ========================================================
    // RELIGION OPTIONS
    // ========================================================

    const religionOptions = useMemo(() => {

        return referenceData.religions.map(
            (religion) => ({

                value:
                    religion.value,

                label:
                    religion.label,

                searchText:
                    `${religion.label} ${religion.value}`,

            })
        );

    }, [referenceData.religions]);


    // ========================================================
    // SELECTED RELIGION
    // ========================================================

    const selectedReligion =
        referenceData.religions.find(
            (religion) =>
                religion.value ===
                formData.religion
        );


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
    // ADMISSION NUMBER
    // ========================================================

    const handleAdmissionNumberChange = (
        event
    ) => {

        let value =
            event.target.value.toUpperCase();


        value = value.replace(
            /[^A-Z0-9-]/g,
            ""
        );


        setFormData((previous) => ({

            ...previous,

            admission_number: value,

        }));


        setError("");
        setSuccess("");

    };


    // ========================================================
    // FAMILY SELECTION
    // ========================================================

    const handleFamilySelect = (
        option
    ) => {

        setFormData((previous) => ({

            ...previous,

            family: option.value,

        }));

        setError("");
        setSuccess("");

    };


    // ========================================================
    // COUNTY SELECTION
    // ========================================================

    const handleCountySelect = (
        option
    ) => {

        setFormData((previous) => ({

            ...previous,

            home_county:
                option.value,

            // Changing county invalidates
            // the previous sub-county.
            home_subcounty:
                "",

        }));

        setError("");
        setSuccess("");

    };


    // ========================================================
    // SUB-COUNTY SELECTION
    // ========================================================

    const handleSubcountySelect = (
        option
    ) => {

        setFormData((previous) => ({

            ...previous,

            home_subcounty:
                option.value,

        }));

        setError("");
        setSuccess("");

    };


    // ========================================================
    // RELIGION SELECTION
    // ========================================================

    const handleReligionSelect = (
        option
    ) => {

        setFormData((previous) => ({

            ...previous,

            religion:
                option.value,

        }));

        setError("");
        setSuccess("");

    };


    // ========================================================
    // VALIDATE
    // ========================================================

    const validateForm = () => {

        // ----------------------------------------------------
        // ADMISSION NUMBER
        // ----------------------------------------------------

        if (
            !formData.admission_number.trim()
        ) {

            return "Admission number is required.";

        }


        // ----------------------------------------------------
        // BASIC INFORMATION
        // ----------------------------------------------------

        if (
            !formData.first_name.trim()
        ) {

            return "First name is required.";

        }


        if (
            !formData.last_name.trim()
        ) {

            return "Last name is required.";

        }


        if (!formData.date_of_birth) {

            return "Date of birth is required.";

        }


        if (!formData.gender) {

            return "Please select the student's gender.";

        }


        // ----------------------------------------------------
        // FAMILY
        // ----------------------------------------------------

        if (!selectedFamilyId) {

            return "Please select a family.";

        }


        // ----------------------------------------------------
        // MEDICAL
        // ----------------------------------------------------

        if (
            formData.has_allergies_or_illness &&
            !formData
                .allergies_or_illness_details
                .trim()
        ) {

            return "Please provide details about the allergy or illness.";

        }


        // ----------------------------------------------------
        // SPECIAL ABILITIES
        // ----------------------------------------------------

        if (
            formData.has_special_abilities &&
            !formData
                .special_abilities_details
                .trim()
        ) {

            return "Please provide details about the student's special abilities.";

        }


        return null;

    };


    // ========================================================
    // SAVE
    // ========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );

            window.scrollTo({

                top: 0,

                behavior: "smooth",

            });

            return;

        }


        try {

            setSaving(true);


            // ------------------------------------------------
            // CLEAN PAYLOAD
            // ------------------------------------------------

            const payload = {

                ...formData,


                admission_number:
                    formData.admission_number
                        .trim(),


                first_name:
                    formData.first_name
                        .trim(),


                middle_name:
                    formData.middle_name
                        .trim(),


                last_name:
                    formData.last_name
                        .trim(),


                place_of_birth:
                    formData.place_of_birth
                        .trim(),


                nationality:
                    formData.nationality
                        .trim(),


                religion:
                    formData.religion
                        .trim(),


                // Optional unique fields
                // must be NULL when blank.

                birth_certificate_entry_number:
                    formData
                        .birth_certificate_entry_number
                        .trim() || null,


                birth_certificate_number:
                    formData
                        .birth_certificate_number
                        .trim() || null,


                nemis_kemis_number:
                    formData
                        .nemis_kemis_number
                        .trim() || null,


                child_assessment_number:
                    formData
                        .child_assessment_number
                        .trim() || null,


                home_county:
                    formData.home_county
                        .trim(),


                home_subcounty:
                    formData.home_subcounty
                        .trim(),


                allergies_or_illness_details:
                    formData.has_allergies_or_illness
                        ? formData
                              .allergies_or_illness_details
                              .trim()
                        : "",


                special_abilities_details:
                    formData.has_special_abilities
                        ? formData
                              .special_abilities_details
                              .trim()
                        : "",


                family:
                    Number(
                        selectedFamilyId
                    ),

            };


            // ------------------------------------------------
            // UPDATE STUDENT
            // ------------------------------------------------

            await axiosInstance.put(
                `/students/students/${id}/`,
                payload
            );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            setSuccess(
                "Student information updated successfully."
            );


            // ------------------------------------------------
            // REDIRECT
            // ------------------------------------------------

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


            setError(
                getErrorMessage(err)
            );


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

    if (
        loading ||
        loadingFamilies ||
        loadingReferenceData ||
        loadingAdmissionConfig
    ) {

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

                                {getStudentName(
                                    student
                                )}

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


                <form
                    onSubmit={handleSubmit}
                >


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


                            {/* ==================================================
                                ADMISSION NUMBER
                            ================================================== */}

                            <div className="mb-6">

                                <label className="form-label">

                                    Admission Number

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <div className="max-w-md">

                                    <input
                                        type="text"
                                        name="admission_number"
                                        value={
                                            formData.admission_number
                                        }
                                        onChange={
                                            handleAdmissionNumberChange
                                        }
                                        placeholder={
                                            admissionConfig?.example ||
                                            `${admissionPrefix}${"0".repeat(
                                                admissionDigits
                                            )}`
                                        }
                                        className="form-input font-semibold tracking-wide"
                                    />

                                </div>


                                <p className="text-xs text-gray-500 mt-2">

                                    The student's permanent school admission
                                    number. You can correct it here if the
                                    existing number is incorrect.

                                </p>

                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                                {/* FIRST NAME */}

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


                                {/* MIDDLE NAME */}

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


                                {/* LAST NAME */}

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


                                {/* DATE OF BIRTH */}

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


                                {/* PLACE OF BIRTH */}

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


                                {/* GENDER */}

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


                                {/* NATIONALITY */}

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


                                {/* RELIGION */}

                                <div>

                                    <label className="form-label">
                                        Religion
                                    </label>


                                    <SearchableDropdown
                                        value={
                                            formData.religion
                                        }

                                        displayValue={
                                            selectedReligion?.label ||
                                            formData.religion
                                        }

                                        options={
                                            religionOptions
                                        }

                                        onSelect={
                                            handleReligionSelect
                                        }

                                        placeholder="Select religion"

                                        searchPlaceholder="Search religion..."

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


                            <SearchableDropdown

                                value={
                                    selectedFamilyId
                                }

                                displayValue={
                                    selectedFamily
                                        ? `${
                                              selectedFamily.family_name ||
                                              "Unnamed Family"
                                          }${
                                              selectedFamily.family_id
                                                  ? ` (${selectedFamily.family_id})`
                                                  : ""
                                          }`
                                        : ""
                                }

                                options={
                                    familyOptions
                                }

                                onSelect={
                                    handleFamilySelect
                                }

                                placeholder="Select family"

                                searchPlaceholder="Search family by name or Family ID..."

                                loading={
                                    loadingFamilies
                                }

                            />


                            <p className="text-xs text-gray-500 mt-2">

                                Search by family name or family ID.

                            </p>

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


                                {/* BIRTH CERTIFICATE NUMBER */}

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


                                {/* BIRTH ENTRY NUMBER */}

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


                                {/* SUBMITTED */}

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


                                {/* NEMIS / KEMIS */}

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


                                {/* ASSESSMENT */}

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


                                {/* COUNTY */}

                                <div>

                                    <label className="form-label">
                                        Home County
                                    </label>


                                    <SearchableDropdown

                                        value={
                                            formData.home_county
                                        }

                                        displayValue={
                                            formData.home_county
                                        }

                                        options={
                                            countyOptions
                                        }

                                        onSelect={
                                            handleCountySelect
                                        }

                                        placeholder="Select county"

                                        searchPlaceholder="Search county..."

                                    />

                                </div>


                                {/* SUB-COUNTY */}

                                <div>

                                    <label className="form-label">
                                        Home Sub-County
                                    </label>


                                    <SearchableDropdown

                                        value={
                                            formData.home_subcounty
                                        }

                                        displayValue={
                                            formData.home_subcounty
                                        }

                                        options={
                                            subcountyOptions
                                        }

                                        onSelect={
                                            handleSubcountySelect
                                        }

                                        placeholder={
                                            formData.home_county
                                                ? "Select sub-county"
                                                : "Select county first"
                                        }

                                        searchPlaceholder="Search sub-county..."

                                        disabled={
                                            !formData.home_county
                                        }

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

                                        Allergies / Illness Details

                                        <span className="required">
                                            *
                                        </span>

                                    </label>


                                    <textarea
                                        name="allergies_or_illness_details"
                                        value={
                                            formData.allergies_or_illness_details
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        className="form-input resize-none"
                                        placeholder="Provide details about the student's allergies, illness or medical condition."
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
                                        name="special_abilities_details"
                                        value={
                                            formData.special_abilities_details
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        className="form-input resize-none"
                                        placeholder="Describe the student's special abilities or talents."
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

