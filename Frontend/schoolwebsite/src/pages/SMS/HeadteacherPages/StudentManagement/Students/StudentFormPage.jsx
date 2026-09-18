import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    FileText,
    GraduationCap,
    HeartPulse,
    Home,
    Save,
    School,
    Search,
    UserPlus,
    UserRound,
    Users,
    X,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


const StudentFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);

    const [loadingStudent, setLoadingStudent] =
        useState(isEditMode);

    const [loadingAdmissionConfig, setLoadingAdmissionConfig] =
        useState(true);

    const [loadingReferenceData, setLoadingReferenceData] =
        useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==================================================
    // DATA
    // ==================================================

    const [families, setFamilies] = useState([]);

    const [counties, setCounties] = useState([]);

    const [religions, setReligions] = useState([]);


    // ==================================================
    // SEARCHABLE FIELD STATE
    // ==================================================

    const [familySearch, setFamilySearch] =
        useState("");

    const [showFamilyDropdown, setShowFamilyDropdown] =
        useState(false);

    const [countySearch, setCountySearch] =
        useState("");

    const [showCountyDropdown, setShowCountyDropdown] =
        useState(false);

    const [subCountySearch, setSubCountySearch] =
        useState("");

    const [showSubCountyDropdown, setShowSubCountyDropdown] =
        useState(false);


    // ==================================================
    // ADMISSION NUMBER CONFIGURATION
    // ==================================================
    //
    // GET /students/admission-number-config/
    //
    // Example:
    //
    // {
    //     "prefix": "ADM",
    //     "separator": "-",
    //     "digits": 5,
    //     "formatted_prefix": "ADM-",
    //     "example": "ADM-00001"
    // }
    //
    // ==================================================

    const [admissionConfig, setAdmissionConfig] =
        useState(null);


    // ==================================================
    // FORM DATA
    // ==================================================

    const [formData, setFormData] = useState({

        // Complete admission number stored by backend.
        admission_number: "",

        // Numeric portion used only by frontend.
        admission_number_part: "",

        family: "",

        first_name: "",
        middle_name: "",
        last_name: "",

        date_of_birth: "",
        place_of_birth: "",

        gender: "male",
        nationality: "Kenyan",
        religion: "",

        birth_certificate_entry_number: "",
        birth_certificate_number: "",
        birth_certificate_submitted: false,

        home_county: "",
        home_subcounty: "",

        nemis_kemis_number: "",
        child_assessment_number: "",

        has_allergies_or_illness: false,
        allergies_or_illness_details: "",

        has_special_abilities: false,
        special_abilities_details: "",

        status: "active",
    });


    const [fieldErrors, setFieldErrors] =
        useState({});


    // ==================================================
    // HELPERS
    // ==================================================

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

        Object.entries(data).forEach(
            ([field, value]) => {

                if (Array.isArray(value)) {
                    messages.push(
                        `${field}: ${value.join(", ")}`
                    );
                } else if (
                    typeof value === "string"
                ) {
                    messages.push(
                        `${field}: ${value}`
                    );
                }
            }
        );

        return messages.length
            ? messages.join(" | ")
            : "Unable to save the student.";
    };


    // ==================================================
    // ADMISSION NUMBER HELPERS
    // ==================================================

    const admissionPrefix =
        admissionConfig?.formatted_prefix || "";

    const admissionDigits =
        Number(admissionConfig?.digits) || 5;


    const formatAdmissionNumber = (numberPart) => {

        if (!numberPart) {
            return "";
        }

        const numericPart = String(numberPart)
            .replace(/\D/g, "")
            .slice(0, admissionDigits);

        if (!numericPart) {
            return "";
        }

        return `${admissionPrefix}${numericPart.padStart(
            admissionDigits,
            "0"
        )}`;
    };


    const handleAdmissionNumberChange = (
        event
    ) => {

        const value =
            event.target.value;

        const numericValue = value
            .replace(/\D/g, "")
            .slice(0, admissionDigits);

        setFormData((previous) => ({
            ...previous,
            admission_number_part:
                numericValue,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            admission_number: "",
        }));

        setError("");
    };


    // ==================================================
    // LOAD ADMISSION NUMBER CONFIGURATION
    // ==================================================

    useEffect(() => {

        const loadAdmissionNumberConfig =
            async () => {

                try {

                    setLoadingAdmissionConfig(
                        true
                    );

                    const response =
                        await axiosInstance.get(
                            "/students/admission-number-config/"
                        );

                    setAdmissionConfig(
                        response.data
                    );

                } catch (err) {

                    console.error(
                        "Failed to load admission number configuration:",
                        err
                    );

                    setError(
                        "Unable to load the admission number format. Please refresh the page and try again."
                    );

                } finally {

                    setLoadingAdmissionConfig(
                        false
                    );
                }
            };

        loadAdmissionNumberConfig();

    }, []);


    // ==================================================
    // LOAD FAMILIES
    // ==================================================

    useEffect(() => {

        const loadFamilies = async () => {

            try {

                const response =
                    await axiosInstance.get(
                        "/students/families/",
                        {
                            params: {
                                _t: Date.now(),
                            },
                        }
                    );

                setFamilies(
                    getResults(response)
                );

            } catch (err) {

                console.error(
                    "Failed to load families:",
                    err
                );

                setError(
                    "Unable to load families. Please refresh the page and try again."
                );
            }
        };

        loadFamilies();

    }, []);


    // ==================================================
    // LOAD REFERENCE DATA
    // ==================================================
    //
    // GET /students/reference-data/
    //
    // Expected:
    //
    // {
    //     "counties": [
    //         {
    //             "name": "Mombasa",
    //             "sub_counties": [...]
    //         }
    //     ],
    //     "religions": [
    //         {
    //             "value": "christianity",
    //             "label": "Christianity"
    //         }
    //     ]
    // }
    //
    // ==================================================

    useEffect(() => {

        const loadReferenceData =
            async () => {

                try {

                    setLoadingReferenceData(
                        true
                    );

                    const response =
                        await axiosInstance.get(
                            "/students/reference-data/",
                            {
                                params: {
                                    _t: Date.now(),
                                },
                            }
                        );

                    const data =
                        response?.data || {};

                    setCounties(
                        Array.isArray(
                            data.counties
                        )
                            ? data.counties
                            : []
                    );

                    setReligions(
                        Array.isArray(
                            data.religions
                        )
                            ? data.religions
                            : []
                    );

                } catch (err) {

                    console.error(
                        "Failed to load student reference data:",
                        err
                    );

                    setError(
                        "Unable to load counties, sub-counties and religions. Please refresh the page and try again."
                    );

                } finally {

                    setLoadingReferenceData(
                        false
                    );
                }
            };

        loadReferenceData();

    }, []);


    // ==================================================
    // LOAD STUDENT IN EDIT MODE
    // ==================================================

    useEffect(() => {

        if (!isEditMode) {

            setLoadingStudent(false);

            return;
        }


        // Wait for admission configuration
        // before loading the student.

        if (loadingAdmissionConfig) {
            return;
        }


        const loadStudent = async () => {

            try {

                setLoadingStudent(true);

                setError("");

                const response =
                    await axiosInstance.get(
                        `/students/students/${id}/`
                    );

                const student =
                    response.data;


                const existingAdmissionNumber =
                    student.admission_number || "";


                // ------------------------------------------
                // Extract numeric admission number portion.
                // ------------------------------------------

                let admissionNumberPart =
                    existingAdmissionNumber;


                if (
                    admissionConfig?.formatted_prefix &&
                    existingAdmissionNumber.startsWith(
                        admissionConfig.formatted_prefix
                    )
                ) {

                    admissionNumberPart =
                        existingAdmissionNumber.slice(
                            admissionConfig
                                .formatted_prefix
                                .length
                        );
                }


                setFormData({

                    admission_number:
                        existingAdmissionNumber,

                    admission_number_part:
                        admissionNumberPart,

                    family:
                        student.family || "",

                    first_name:
                        student.first_name || "",

                    middle_name:
                        student.middle_name || "",

                    last_name:
                        student.last_name || "",

                    date_of_birth:
                        formatDateForInput(
                            student.date_of_birth
                        ),

                    place_of_birth:
                        student.place_of_birth || "",

                    gender:
                        student.gender || "male",

                    nationality:
                        student.nationality ||
                        "Kenyan",

                    religion:
                        student.religion || "",

                    birth_certificate_entry_number:
                        student.birth_certificate_entry_number ||
                        "",

                    birth_certificate_number:
                        student.birth_certificate_number ||
                        "",

                    birth_certificate_submitted:
                        Boolean(
                            student.birth_certificate_submitted
                        ),

                    home_county:
                        student.home_county || "",

                    home_subcounty:
                        student.home_subcounty || "",

                    nemis_kemis_number:
                        student.nemis_kemis_number ||
                        "",

                    child_assessment_number:
                        student.child_assessment_number ||
                        "",

                    has_allergies_or_illness:
                        Boolean(
                            student.has_allergies_or_illness
                        ),

                    allergies_or_illness_details:
                        student.allergies_or_illness_details ||
                        "",

                    has_special_abilities:
                        Boolean(
                            student.has_special_abilities
                        ),

                    special_abilities_details:
                        student.special_abilities_details ||
                        "",

                    status:
                        student.status || "active",
                });


                // ------------------------------------------------
                // Pre-fill searchable fields.
                // ------------------------------------------------

                const selectedFamily =
                    families.find(
                        (family) =>
                            String(family.id) ===
                            String(student.family)
                    );

                if (selectedFamily) {

                    setFamilySearch(
                        `${selectedFamily.family_name} — ${selectedFamily.family_id}`
                    );
                }


                setCountySearch(
                    student.home_county || ""
                );

                setSubCountySearch(
                    student.home_subcounty || ""
                );

            } catch (err) {

                console.error(
                    "Failed to load student:",
                    err
                );

                setError(
                    "Unable to load the student record. Please try again."
                );

            } finally {

                setLoadingStudent(false);
            }
        };

        loadStudent();

    }, [
        id,
        isEditMode,
        loadingAdmissionConfig,
        admissionConfig,
        families,
    ]);


    // ==================================================
    // PRESELECT FAMILY FROM QUERY PARAMETER
    // ==================================================

    useEffect(() => {

        if (isEditMode) {
            return;
        }

        const familyId =
            searchParams.get("family");

        if (
            familyId &&
            familyId !== "undefined" &&
            familyId !== "null"
        ) {

            setFormData((previous) => ({
                ...previous,
                family: familyId,
            }));


            const selectedFamily =
                families.find(
                    (family) =>
                        String(family.id) ===
                        String(familyId)
                );

            if (selectedFamily) {

                setFamilySearch(
                    `${selectedFamily.family_name} — ${selectedFamily.family_id}`
                );
            }
        }

    }, [
        searchParams,
        isEditMode,
        families,
    ]);


    // ==================================================
    // ACTIVE FAMILIES
    // ==================================================

    const availableFamilies =
        useMemo(() => {

            return families.filter(
                (family) => {

                    if (
                        family.is_active !== false
                    ) {
                        return true;
                    }

                    return (
                        String(family.id) ===
                        String(formData.family)
                    );
                }
            );

        }, [
            families,
            formData.family,
        ]);


    // ==================================================
    // SEARCHABLE FAMILIES
    // ==================================================

    const filteredFamilies =
        useMemo(() => {

            const search =
                familySearch
                    .trim()
                    .toLowerCase();

            if (!search) {
                return availableFamilies;
            }

            return availableFamilies.filter(
                (family) => {

                    const familyName =
                        String(
                            family.family_name || ""
                        ).toLowerCase();

                    const familyId =
                        String(
                            family.family_id || ""
                        ).toLowerCase();

                    const parentName =
                        String(
                            family.primary_parent_name ||
                            family.parent_name ||
                            ""
                        ).toLowerCase();

                    return (
                        familyName.includes(
                            search
                        ) ||
                        familyId.includes(
                            search
                        ) ||
                        parentName.includes(
                            search
                        )
                    );
                }
            );

        }, [
            availableFamilies,
            familySearch,
        ]);


    // ==================================================
    // SELECTED FAMILY
    // ==================================================

    const selectedFamily =
        useMemo(() => {

            return families.find(
                (family) =>
                    String(family.id) ===
                    String(formData.family)
            );

        }, [
            families,
            formData.family,
        ]);


    // ==================================================
    // SEARCHABLE COUNTIES
    // ==================================================

    const filteredCounties =
        useMemo(() => {

            const search =
                countySearch
                    .trim()
                    .toLowerCase();

            if (!search) {
                return counties;
            }

            return counties.filter(
                (county) =>
                    String(
                        county.name || ""
                    )
                        .toLowerCase()
                        .includes(search)
            );

        }, [
            counties,
            countySearch,
        ]);


    // ==================================================
    // SELECTED COUNTY
    // ==================================================

    const selectedCounty =
        useMemo(() => {

            return counties.find(
                (county) =>
                    String(
                        county.name
                    ).toLowerCase() ===
                    String(
                        formData.home_county
                    ).toLowerCase()
            );

        }, [
            counties,
            formData.home_county,
        ]);


    // ==================================================
    // SUB-COUNTIES FOR SELECTED COUNTY
    // ==================================================

    const availableSubCounties =
        useMemo(() => {

            if (!selectedCounty) {
                return [];
            }

            return Array.isArray(
                selectedCounty.sub_counties
            )
                ? selectedCounty.sub_counties
                : [];

        }, [
            selectedCounty,
        ]);


    // ==================================================
    // SEARCHABLE SUB-COUNTIES
    // ==================================================

    const filteredSubCounties =
        useMemo(() => {

            const search =
                subCountySearch
                    .trim()
                    .toLowerCase();

            if (!search) {
                return availableSubCounties;
            }

            return availableSubCounties.filter(
                (subCounty) =>
                    String(
                        subCounty
                    )
                        .toLowerCase()
                        .includes(search)
            );

        }, [
            availableSubCounties,
            subCountySearch,
        ]);


    // ==================================================
    // SELECT FAMILY
    // ==================================================

    const handleFamilySelect = (
        family
    ) => {

        setFormData((previous) => ({
            ...previous,
            family: family.id,
        }));

        setFamilySearch(
            `${family.family_name} — ${family.family_id}`
        );

        setShowFamilyDropdown(false);

        setFieldErrors((previous) => ({
            ...previous,
            family: "",
        }));

        setError("");
    };


    // ==================================================
    // CLEAR FAMILY
    // ==================================================

    const clearFamily = () => {

        setFormData((previous) => ({
            ...previous,
            family: "",
        }));

        setFamilySearch("");

        setShowFamilyDropdown(false);

        setError("");
    };


    // ==================================================
    // SELECT COUNTY
    // ==================================================

    const handleCountySelect = (
        county
    ) => {

        setFormData((previous) => ({
            ...previous,

            home_county:
                county.name,

            // Reset sub-county whenever
            // county changes.
            home_subcounty: "",
        }));

        setCountySearch(
            county.name
        );

        setSubCountySearch("");

        setShowCountyDropdown(false);

        setShowSubCountyDropdown(false);

        setFieldErrors((previous) => ({
            ...previous,
            home_county: "",
            home_subcounty: "",
        }));

        setError("");
    };


    // ==================================================
    // CLEAR COUNTY
    // ==================================================

    const clearCounty = () => {

        setFormData((previous) => ({
            ...previous,

            home_county: "",
            home_subcounty: "",
        }));

        setCountySearch("");

        setSubCountySearch("");

        setShowCountyDropdown(false);

        setShowSubCountyDropdown(false);

        setError("");
    };


    // ==================================================
    // SELECT SUB-COUNTY
    // ==================================================

    const handleSubCountySelect = (
        subCounty
    ) => {

        setFormData((previous) => ({
            ...previous,
            home_subcounty:
                subCounty,
        }));

        setSubCountySearch(
            subCounty
        );

        setShowSubCountyDropdown(
            false
        );

        setFieldErrors((previous) => ({
            ...previous,
            home_subcounty: "",
        }));

        setError("");
    };


    // ==================================================
    // CLEAR SUB-COUNTY
    // ==================================================

    const clearSubCounty = () => {

        setFormData((previous) => ({
            ...previous,
            home_subcounty: "",
        }));

        setSubCountySearch("");

        setShowSubCountyDropdown(
            false
        );

        setError("");
    };


    // ==================================================
    // GENERAL INPUT CHANGE
    // ==================================================

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


    // ==================================================
    // VALIDATION
    // ==================================================

    const validateForm = () => {

        const errors = {};


        // ------------------------------------------------
        // Admission number
        // ------------------------------------------------

        if (
            !formData.admission_number_part.trim()
        ) {

            errors.admission_number =
                "Admission number is required.";
        }


        if (
            formData.admission_number_part &&
            !/^\d+$/.test(
                formData.admission_number_part
            )
        ) {

            errors.admission_number =
                "Admission number must contain numbers only.";
        }


        // ------------------------------------------------
        // Names
        // ------------------------------------------------

        if (
            !formData.first_name.trim()
        ) {

            errors.first_name =
                "First name is required.";
        }


        if (
            !formData.last_name.trim()
        ) {

            errors.last_name =
                "Last name is required.";
        }


        // ------------------------------------------------
        // Date of birth
        // ------------------------------------------------

        if (!formData.date_of_birth) {

            errors.date_of_birth =
                "Date of birth is required.";
        }


        // ------------------------------------------------
        // Gender
        // ------------------------------------------------

        if (!formData.gender) {

            errors.gender =
                "Gender is required.";
        }


        // ------------------------------------------------
        // Medical details
        // ------------------------------------------------

        if (
            formData.has_allergies_or_illness &&
            !formData
                .allergies_or_illness_details
                .trim()
        ) {

            errors
                .allergies_or_illness_details =
                "Please provide details of the allergies or illness.";
        }


        // ------------------------------------------------
        // Special abilities
        // ------------------------------------------------

        if (
            formData.has_special_abilities &&
            !formData
                .special_abilities_details
                .trim()
        ) {

            errors
                .special_abilities_details =
                "Please provide details of the special abilities.";
        }


        setFieldErrors(errors);

        return (
            Object.keys(errors).length === 0
        );
    };


    // ==================================================
    // SUBMIT
    // ==================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!validateForm()) {

            setError(
                "Please correct the highlighted fields."
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }


        try {

            setLoading(true);


            // ------------------------------------------------
            // Build complete admission number.
            //
            // Example:
            //
            // User enters:
            // 117
            //
            // Result:
            // ADM-00117
            // ------------------------------------------------

            const admissionNumber =
                formatAdmissionNumber(
                    formData
                        .admission_number_part
                );


            const payload = {

                ...formData,


                // Frontend-only.
                admission_number_part:
                    undefined,


                admission_number:
                    admissionNumber,


                family:
                    formData.family
                        ? Number(
                            formData.family
                        )
                        : null,


                first_name:
                    formData.first_name.trim(),


                middle_name:
                    formData.middle_name.trim(),


                last_name:
                    formData.last_name.trim(),


                date_of_birth:
                    formData.date_of_birth ||
                    null,


                place_of_birth:
                    formData
                        .place_of_birth
                        .trim(),


                nationality:
                    formData
                        .nationality
                        .trim(),


                religion:
                    formData
                        .religion
                        .trim(),


                birth_certificate_entry_number:
                    formData
                        .birth_certificate_entry_number
                        .trim() ||
                    null,


                birth_certificate_number:
                    formData
                        .birth_certificate_number
                        .trim() ||
                    null,


                home_county:
                    formData
                        .home_county
                        .trim(),


                home_subcounty:
                    formData
                        .home_subcounty
                        .trim(),


                nemis_kemis_number:
                    formData
                        .nemis_kemis_number
                        .trim() ||
                    null,


                child_assessment_number:
                    formData
                        .child_assessment_number
                        .trim() ||
                    null,


                birth_certificate_submitted:
                    Boolean(
                        formData
                            .birth_certificate_submitted
                    ),


                has_allergies_or_illness:
                    Boolean(
                        formData
                            .has_allergies_or_illness
                    ),


                allergies_or_illness_details:
                    formData
                        .has_allergies_or_illness
                        ? formData
                            .allergies_or_illness_details
                            .trim()
                        : "",


                has_special_abilities:
                    Boolean(
                        formData
                            .has_special_abilities
                    ),


                special_abilities_details:
                    formData
                        .has_special_abilities
                        ? formData
                            .special_abilities_details
                            .trim()
                        : "",
            };


            // ------------------------------------------------
            // Remove frontend-only property.
            // ------------------------------------------------

            delete payload.admission_number_part;


            let response;


            if (isEditMode) {

                response =
                    await axiosInstance.patch(
                        `/students/students/${id}/`,
                        payload
                    );

            } else {

                response =
                    await axiosInstance.post(
                        "/students/students/",
                        payload
                    );
            }


            const savedStudent =
                response.data;


            setSuccess(
                isEditMode
                    ? "Student record updated successfully."
                    : "Student added successfully."
            );


            const savedId =
                savedStudent?.id ||
                savedStudent?.pk ||
                id;


            setTimeout(() => {

                if (savedId) {

                    navigate(
                        `/sms/students/${savedId}`
                    );

                } else {

                    navigate(
                        "/sms/students"
                    );
                }

            }, 700);


        } catch (err) {

            console.error(
                "Failed to save student:",
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

            setLoading(false);
        }
    };


    // ==================================================
    // NAVIGATION
    // ==================================================

    const handleCancel = () => {

        if (isEditMode) {

            navigate(
                `/sms/students/${id}`
            );

        } else {

            navigate(
                "/sms/students"
            );
        }
    };


    const navigateToStudents = () => {
        navigate("/sms/students");
    };


    const navigateToFamilies = () => {
        navigate("/sms/families");
    };


    const navigateToEnrollments = () => {
        navigate("/sms/enrollments");
    };


    // ==================================================
    // LOADING
    // ==================================================

    if (
        loadingStudent ||
        loadingAdmissionConfig ||
        loadingReferenceData
    ) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

                <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-center">

                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600">
                        Loading student form...
                    </p>

                </div>

            </div>
        );
    }


    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

            <div className="max-w-6xl mx-auto">


                {/* ==================================================
                    BREADCRUMB
                ================================================== */}

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student-management"
                            )
                        }
                        className="hover:text-purple-700 transition"
                    >
                        Student Management
                    </button>

                    <ChevronRight size={15} />

                    <button
                        type="button"
                        onClick={
                            navigateToStudents
                        }
                        className="hover:text-purple-700 transition"
                    >
                        Students
                    </button>

                    <ChevronRight size={15} />

                    <span className="font-medium text-gray-700">
                        {isEditMode
                            ? "Edit Student"
                            : "Add Student"}
                    </span>

                </div>


                {/* ==================================================
                    QUICK NAVIGATION
                ================================================== */}

                <div className="bg-gray-800 rounded-xl p-3 mb-5 shadow-sm">

                    <div className="flex gap-2 overflow-x-auto">

                        <button
                            type="button"
                            onClick={
                                navigateToStudents
                            }
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                        >
                            <Users size={16} />
                            Students
                        </button>


                        <button
                            type="button"
                            onClick={
                                navigateToFamilies
                            }
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                        >
                            <Home size={16} />
                            Families
                        </button>


                        <button
                            type="button"
                            onClick={
                                navigateToEnrollments
                            }
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                        >
                            <School size={16} />
                            Enrollments
                        </button>


                        {isEditMode && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/sms/students/${id}`
                                    )
                                }
                                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                            >
                                <UserRound
                                    size={16}
                                />
                                Student Profile
                            </button>
                        )}

                    </div>

                </div>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="bg-purple-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white">

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-5 transition"
                    >
                        <ArrowLeft
                            size={18}
                        />

                        {isEditMode
                            ? "Back to Student Profile"
                            : "Back to Students"}
                    </button>


                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        <div className="w-14 h-14 rounded-xl bg-purple-700 flex items-center justify-center">

                            {isEditMode ? (
                                <UserRound
                                    size={28}
                                />
                            ) : (
                                <UserPlus
                                    size={28}
                                />
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
                                    ? "Update the student's permanent profile and admission information."
                                    : "Create a permanent student profile for the school."}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

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


                {/* ==================================================
                    SUCCESS
                ================================================== */}

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


                    {/* ==================================================
                        BASIC INFORMATION
                    ================================================== */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-visible mb-6">

                        <div className="bg-gray-800 px-6 py-4 text-white rounded-t-2xl">

                            <div className="flex items-center gap-3">

                                <UserRound
                                    size={21}
                                />

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


                            {/* ==================================================
                                ADMISSION NUMBER
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Admission Number *
                                </label>

                                <div className="flex">

                                    <div className="flex items-center justify-center px-4 bg-gray-200 border border-gray-300 border-r-0 rounded-l-lg font-semibold text-gray-700 min-w-[80px]">
                                        {admissionPrefix}
                                    </div>


                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            formData.admission_number_part
                                        }
                                        onChange={
                                            handleAdmissionNumberChange
                                        }
                                        maxLength={
                                            admissionDigits
                                        }
                                        placeholder={
                                            "0".repeat(
                                                admissionDigits
                                            )
                                        }
                                        className={`input rounded-l-none ${
                                            fieldErrors.admission_number
                                                ? "border-red-400"
                                                : ""
                                        }`}
                                    />

                                </div>


                                <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg">

                                    <p className="text-xs text-purple-600">
                                        Admission number preview
                                    </p>

                                    <p className="font-mono font-bold text-purple-800">
                                        {formatAdmissionNumber(
                                            formData.admission_number_part
                                        ) ||
                                            admissionConfig?.example ||
                                            "ADM-00001"}
                                    </p>

                                </div>


                                <p className="text-xs text-gray-500 mt-1">
                                    Enter only the numeric portion. The system will apply the configured school format.
                                    {isEditMode &&
                                        " Correct it here if it was entered wrong."}
                                </p>


                                {fieldErrors.admission_number && (
                                    <p className="field-error">
                                        {
                                            fieldErrors.admission_number
                                        }
                                    </p>
                                )}

                            </div>


                            {/* ==================================================
                                SEARCHABLE FAMILY
                            ================================================== */}

                            <div className="md:col-span-2 relative">

                                <label className="label">
                                    Family
                                </label>

                                <div className="relative">

                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            familySearch
                                        }
                                        onChange={(event) => {

                                            setFamilySearch(
                                                event.target.value
                                            );

                                            setShowFamilyDropdown(
                                                true
                                            );

                                            if (
                                                formData.family
                                            ) {

                                                setFormData(
                                                    (previous) => ({
                                                        ...previous,
                                                        family: "",
                                                    })
                                                );
                                            }
                                        }}
                                        onFocus={() =>
                                            setShowFamilyDropdown(
                                                true
                                            )
                                        }
                                        placeholder="Search family name or family ID..."
                                        className="input pl-10 pr-10"
                                    />


                                    {familySearch && (
                                        <button
                                            type="button"
                                            onClick={
                                                clearFamily
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                        >
                                            <X
                                                size={17}
                                            />
                                        </button>
                                    )}

                                </div>


                                {showFamilyDropdown && (
                                    <>

                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                                setShowFamilyDropdown(
                                                    false
                                                )
                                            }
                                        />

                                        <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">

                                            {filteredFamilies.length >
                                            0 ? (

                                                filteredFamilies.map(
                                                    (family) => (

                                                        <button
                                                            type="button"
                                                            key={
                                                                family.id
                                                            }
                                                            onClick={() =>
                                                                handleFamilySelect(
                                                                    family
                                                                )
                                                            }
                                                            className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition border-b border-gray-100 last:border-b-0 ${
                                                                String(
                                                                    family.id
                                                                ) ===
                                                                String(
                                                                    formData.family
                                                                )
                                                                    ? "bg-purple-50"
                                                                    : ""
                                                            }`}
                                                        >

                                                            <p className="font-semibold text-gray-800">
                                                                {
                                                                    family.family_name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Family ID:{" "}
                                                                {
                                                                    family.family_id
                                                                }
                                                            </p>

                                                        </button>

                                                    )
                                                )

                                            ) : (

                                                <div className="px-4 py-6 text-center">

                                                    <Search
                                                        size={24}
                                                        className="mx-auto text-gray-300 mb-2"
                                                    />

                                                    <p className="text-sm text-gray-500">
                                                        No matching families found.
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                    </>
                                )}


                                <p className="text-xs text-gray-500 mt-1">
                                    Type the family name or family ID to search. Family information is managed separately.
                                </p>

                            </div>


                            {/* ==================================================
                                FIRST NAME
                            ================================================== */}

                            <div>

                                <label className="label">
                                    First Name *
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
                                    placeholder="First name"
                                    className={`input ${
                                        fieldErrors.first_name
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.first_name && (
                                    <p className="field-error">
                                        {
                                            fieldErrors.first_name
                                        }
                                    </p>
                                )}

                            </div>


                            {/* ==================================================
                                MIDDLE NAME
                            ================================================== */}

                            <div>

                                <label className="label">
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
                                    placeholder="Middle name"
                                    className="input"
                                />

                            </div>


                            {/* ==================================================
                                LAST NAME
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Last Name *
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
                                    placeholder="Last name"
                                    className={`input ${
                                        fieldErrors.last_name
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.last_name && (
                                    <p className="field-error">
                                        {
                                            fieldErrors.last_name
                                        }
                                    </p>
                                )}

                            </div>


                            {/* ==================================================
                                DOB
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Date of Birth *
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
                                    className={`input ${
                                        fieldErrors.date_of_birth
                                            ? "border-red-400"
                                            : ""
                                    }`}
                                />

                                {fieldErrors.date_of_birth && (
                                    <p className="field-error">
                                        {
                                            fieldErrors.date_of_birth
                                        }
                                    </p>
                                )}

                            </div>


                            {/* ==================================================
                                PLACE OF BIRTH
                            ================================================== */}

                            <div>

                                <label className="label">
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
                                    placeholder="Place of birth"
                                    className="input"
                                />

                            </div>


                            {/* ==================================================
                                GENDER
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Gender *
                                </label>

                                <select
                                    name="gender"
                                    value={
                                        formData.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="input"
                                >

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


                            {/* ==================================================
                                NATIONALITY
                            ================================================== */}

                            <div>

                                <label className="label">
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
                                    placeholder="Nationality"
                                    className="input"
                                />

                            </div>


                            {/* ==================================================
                                RELIGION
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Religion
                                </label>

                                <select
                                    name="religion"
                                    value={
                                        formData.religion
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="input"
                                >

                                    <option value="">
                                        Select religion
                                    </option>

                                    {religions.map(
                                        (religion) => (

                                            <option
                                                key={
                                                    religion.value
                                                }
                                                value={
                                                    religion.value
                                                }
                                            >
                                                {
                                                    religion.label
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        BIRTH CERTIFICATE
                    ================================================== */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">

                        <div className="bg-purple-800 px-6 py-4 text-white">

                            <div className="flex items-center gap-3">

                                <FileText
                                    size={21}
                                />

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
                                        formData
                                            .birth_certificate_number
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                        formData
                                            .birth_certificate_entry_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Birth entry number"
                                    className="input"
                                />

                            </div>


                            <label className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200 cursor-pointer">

                                <input
                                    type="checkbox"
                                    name="birth_certificate_submitted"
                                    checked={
                                        formData
                                            .birth_certificate_submitted
                                    }
                                    onChange={
                                        handleChange
                                    }
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


                    {/* ==================================================
                        HOME & IDENTIFICATION
                    ================================================== */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-visible mb-6">

                        <div className="bg-gray-800 px-6 py-4 text-white rounded-t-2xl">

                            <div className="flex items-center gap-3">

                                <Users
                                    size={21}
                                />

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


                            {/* ==================================================
                                SEARCHABLE COUNTY
                            ================================================== */}

                            <div className="relative">

                                <label className="label">
                                    Home County
                                </label>

                                <div className="relative">

                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            countySearch
                                        }
                                        onChange={(
                                            event
                                        ) => {

                                            setCountySearch(
                                                event.target.value
                                            );

                                            setShowCountyDropdown(
                                                true
                                            );

                                            if (
                                                formData.home_county
                                            ) {

                                                setFormData(
                                                    (previous) => ({
                                                        ...previous,
                                                        home_county: "",
                                                        home_subcounty: "",
                                                    })
                                                );

                                                setSubCountySearch(
                                                    ""
                                                );
                                            }
                                        }}
                                        onFocus={() =>
                                            setShowCountyDropdown(
                                                true
                                            )
                                        }
                                        placeholder="Search county..."
                                        className="input pl-10 pr-10"
                                    />


                                    {countySearch && (
                                        <button
                                            type="button"
                                            onClick={
                                                clearCounty
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                        >
                                            <X
                                                size={17}
                                            />
                                        </button>
                                    )}

                                </div>


                                {showCountyDropdown && (
                                    <>

                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                                setShowCountyDropdown(
                                                    false
                                                )
                                            }
                                        />

                                        <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">

                                            {filteredCounties.length >
                                            0 ? (

                                                filteredCounties.map(
                                                    (county) => (

                                                        <button
                                                            type="button"
                                                            key={
                                                                county.name
                                                            }
                                                            onClick={() =>
                                                                handleCountySelect(
                                                                    county
                                                                )
                                                            }
                                                            className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition border-b border-gray-100 last:border-b-0 ${
                                                                String(
                                                                    county.name
                                                                ).toLowerCase() ===
                                                                String(
                                                                    formData.home_county
                                                                ).toLowerCase()
                                                                    ? "bg-purple-50"
                                                                    : ""
                                                            }`}
                                                        >

                                                            <p className="font-semibold text-gray-800">
                                                                {
                                                                    county.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {
                                                                    Array.isArray(
                                                                        county.sub_counties
                                                                    )
                                                                        ? county
                                                                            .sub_counties
                                                                            .length
                                                                        : 0
                                                                }{" "}
                                                                sub-counties
                                                            </p>

                                                        </button>

                                                    )
                                                )

                                            ) : (

                                                <div className="px-4 py-6 text-center">

                                                    <Search
                                                        size={24}
                                                        className="mx-auto text-gray-300 mb-2"
                                                    />

                                                    <p className="text-sm text-gray-500">
                                                        No county found.
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                    </>
                                )}

                            </div>


                            {/* ==================================================
                                SEARCHABLE SUB-COUNTY
                            ================================================== */}

                            <div className="relative">

                                <label className="label">
                                    Home Sub-County
                                </label>

                                <div className="relative">

                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            subCountySearch
                                        }
                                        disabled={
                                            !formData.home_county
                                        }
                                        onChange={(
                                            event
                                        ) => {

                                            setSubCountySearch(
                                                event.target.value
                                            );

                                            setShowSubCountyDropdown(
                                                true
                                            );

                                            if (
                                                formData.home_subcounty
                                            ) {

                                                setFormData(
                                                    (previous) => ({
                                                        ...previous,
                                                        home_subcounty: "",
                                                    })
                                                );
                                            }
                                        }}
                                        onFocus={() => {

                                            if (
                                                formData.home_county
                                            ) {

                                                setShowSubCountyDropdown(
                                                    true
                                                );
                                            }
                                        }}
                                        placeholder={
                                            formData.home_county
                                                ? "Search sub-county..."
                                                : "Select a county first"
                                        }
                                        className={`input pl-10 pr-10 ${
                                            !formData.home_county
                                                ? "opacity-60 cursor-not-allowed"
                                                : ""
                                        }`}
                                    />


                                    {subCountySearch &&
                                        formData.home_county && (
                                            <button
                                                type="button"
                                                onClick={
                                                    clearSubCounty
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                            >
                                                <X
                                                    size={17}
                                                />
                                            </button>
                                        )}

                                </div>


                                {showSubCountyDropdown &&
                                    formData.home_county && (
                                        <>

                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() =>
                                                    setShowSubCountyDropdown(
                                                        false
                                                    )
                                                }
                                            />

                                            <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">

                                                {filteredSubCounties.length >
                                                0 ? (

                                                    filteredSubCounties.map(
                                                        (
                                                            subCounty
                                                        ) => (

                                                            <button
                                                                type="button"
                                                                key={
                                                                    subCounty
                                                                }
                                                                onClick={() =>
                                                                    handleSubCountySelect(
                                                                        subCounty
                                                                    )
                                                                }
                                                                className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition border-b border-gray-100 last:border-b-0 ${
                                                                    String(
                                                                        subCounty
                                                                    ).toLowerCase() ===
                                                                    String(
                                                                        formData.home_subcounty
                                                                    ).toLowerCase()
                                                                        ? "bg-purple-50"
                                                                        : ""
                                                                }`}
                                                            >

                                                                <p className="font-medium text-gray-800">
                                                                    {
                                                                        subCounty
                                                                    }
                                                                </p>

                                                            </button>

                                                        )
                                                    )

                                                ) : (

                                                    <div className="px-4 py-6 text-center">

                                                        <Search
                                                            size={24}
                                                            className="mx-auto text-gray-300 mb-2"
                                                        />

                                                        <p className="text-sm text-gray-500">
                                                            No sub-county found.
                                                        </p>

                                                    </div>
                                                )}

                                            </div>

                                        </>
                                    )}


                                <p className="text-xs text-gray-500 mt-1">
                                    Select a county first, then search within its sub-counties.
                                </p>

                            </div>


                            {/* ==================================================
                                NEMIS / KEMIS
                            ================================================== */}

                            <div>

                                <label className="label">
                                    NEMIS / KEMIS Number
                                </label>

                                <input
                                    type="text"
                                    name="nemis_kemis_number"
                                    value={
                                        formData
                                            .nemis_kemis_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="NEMIS / KEMIS number"
                                    className="input"
                                />

                            </div>


                            {/* ==================================================
                                CHILD ASSESSMENT
                            ================================================== */}

                            <div>

                                <label className="label">
                                    Child Assessment Number
                                </label>

                                <input
                                    type="text"
                                    name="child_assessment_number"
                                    value={
                                        formData
                                            .child_assessment_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Assessment number"
                                    className="input"
                                />

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        MEDICAL
                    ================================================== */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">

                        <div className="bg-purple-800 px-6 py-4 text-white">

                            <div className="flex items-center gap-3">

                                <HeartPulse
                                    size={21}
                                />

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
                                        formData
                                            .has_allergies_or_illness
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                        name="allergies_or_illness_details"
                                        value={
                                            formData
                                                .allergies_or_illness_details
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        placeholder="Describe the allergies, illness or medical condition..."
                                        className={`input resize-none ${
                                            fieldErrors
                                                .allergies_or_illness_details
                                                ? "border-red-400"
                                                : ""
                                        }`}
                                    />

                                    {fieldErrors
                                        .allergies_or_illness_details && (
                                        <p className="field-error">
                                            {
                                                fieldErrors
                                                    .allergies_or_illness_details
                                            }
                                        </p>
                                    )}

                                </div>
                            )}

                        </div>

                    </section>


                    {/* ==================================================
                        SPECIAL ABILITIES
                    ================================================== */}

                    <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">

                        <div className="bg-gray-800 px-6 py-4 text-white">

                            <div className="flex items-center gap-3">

                                <GraduationCap
                                    size={21}
                                />

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
                                        formData
                                            .has_special_abilities
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                        name="special_abilities_details"
                                        value={
                                            formData
                                                .special_abilities_details
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        placeholder="Describe the student's special abilities..."
                                        className={`input resize-none ${
                                            fieldErrors
                                                .special_abilities_details
                                                ? "border-red-400"
                                                : ""
                                        }`}
                                    />

                                    {fieldErrors
                                        .special_abilities_details && (
                                        <p className="field-error">
                                            {
                                                fieldErrors
                                                    .special_abilities_details
                                            }
                                        </p>
                                    )}

                                </div>
                            )}

                        </div>

                    </section>


                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    {isEditMode && (
                        <section className="bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-6">

                            <div className="bg-gray-800 px-6 py-4 text-white">

                                <div className="flex items-center gap-3">

                                    <UserRound
                                        size={21}
                                    />

                                    <div>

                                        <h2 className="font-bold text-lg">
                                            Student Status
                                        </h2>

                                        <p className="text-gray-300 text-sm">
                                            Overall status of the permanent student record
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-6">

                                <label className="label">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                                <p className="text-xs text-gray-500 mt-2 max-w-xl">
                                    This controls the student's overall profile status. Academic enrollment history is managed separately through the Enrollment module.
                                </p>

                            </div>

                        </section>
                    )}


                    {/* ==================================================
                        FORM ACTIONS
                    ================================================== */}

                    <div className="bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col sm:flex-row justify-between gap-3">

                        <button
                            type="button"
                            onClick={
                                handleCancel
                            }
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold transition disabled:opacity-50"
                        >
                            <span className="inline-flex items-center gap-2">

                                <ArrowLeft
                                    size={18}
                                />

                                Cancel

                            </span>
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

                                    <Save
                                        size={18}
                                    />

                                    {isEditMode
                                        ? "Update Student"
                                        : "Save Student"}

                                </>
                            )}

                        </button>

                    </div>

                </form>


                {/* ==================================================
                    BOTTOM NAVIGATION
                ================================================== */}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-300">

                    <button
                        type="button"
                        onClick={
                            handleCancel
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                    >

                        <ArrowLeft
                            size={18}
                        />

                        {isEditMode
                            ? "Back to Student Profile"
                            : "Back to Students"}

                    </button>


                    <div className="flex flex-wrap gap-2">

                        <button
                            type="button"
                            onClick={
                                navigateToFamilies
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >

                            <Home
                                size={17}
                            />

                            Families

                        </button>


                        <button
                            type="button"
                            onClick={
                                navigateToStudents
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition"
                        >

                            <Users
                                size={17}
                            />

                            All Students

                        </button>

                    </div>

                </div>

            </div>


            {/* ==================================================
                SHARED INPUT STYLES
            ================================================== */}

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
                    box-shadow:
                        0 0 0 3px
                        rgba(
                            126,
                            34,
                            206,
                            0.12
                        );
                    background: #fafafa;
                }

                .input::placeholder {
                    color: #9ca3af;
                }

                .input:disabled {
                    background: #e5e7eb;
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