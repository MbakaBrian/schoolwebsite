import React, {
  useEffect,
  useState,
} from "react";

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


// ============================================================
// DRIVER FORM PAGE
// ============================================================
//
// Creates or updates a DriverProfile.
//
// IMPORTANT
// ----------
//
// Staff and DriverProfile are separate records.
//
// This page selects an EXISTING Staff member and creates
// the corresponding DriverProfile.
//
// It does NOT create a Staff record.
//
// DriverProfile information:
//
// - Staff
// - Driving licence number
// - Driving licence class
// - Licence issue date
// - Licence expiry date
// - PSV licence number
// - PSV expiry date
// - Years of experience
// - Previous driving experience
// - Medical certificate expiry
// - Driver badge number
// - Notes
//
// Backend-controlled fields:
//
// - Verification status
// - Verification date
// - Verified by
// - Created/updated timestamps
//
// API:
//
// GET    /transport/driver-profiles/
// POST   /transport/driver-profiles/
// GET    /transport/driver-profiles/:id/
// PATCH  /transport/driver-profiles/:id/
//
// Staff:
//
// GET    /staff/
//
// ============================================================


// ============================================================
// HELPERS
// ============================================================

const getId = (item) => {
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const extractList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const getStaffName = (staff) => {
  if (!staff) {
    return "Unknown Staff";
  }

  if (staff.full_name) {
    return staff.full_name;
  }

  const name = [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Unknown Staff";
};


const getStaffDisplay = (staff) => {
  if (!staff) {
    return "Unknown Staff";
  }

  const name =
    getStaffName(staff);

  const employeeNumber =
    staff.employee_number ||
    staff.staff_id ||
    "";

  if (
    name &&
    employeeNumber
  ) {
    return `${name} — ${employeeNumber}`;
  }

  return name;
};
const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-KE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};

const getErrorMessage = (error) => {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  const data =
    error?.response?.data;

  if (
    data &&
    typeof data === "object"
  ) {

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

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return (
    error?.message ||
    "An unexpected error occurred."
  );
};


// ============================================================
// FORM INPUT
// ============================================================

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  helpText,
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
      />

      {helpText && (
        <p className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}

    </div>
  );
};


// ============================================================
// SELECT FIELD
// ============================================================

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = "Select...",
  helpText,
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
      >

        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}

      </select>

      {helpText && (
        <p className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}

    </div>
  );
};


// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3 mb-5">

      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
        <Icon size={20} />
      </div>

      <div>

        <h2 className="font-semibold text-gray-800">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        )}

      </div>

    </div>
  );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const DriverFormPage = () => {

  const navigate = useNavigate();

  const { id } =
    useParams();

  const isEditMode =
    Boolean(id);


  // ==========================================================
  // STAFF
  // ==========================================================

  const [staff, setStaff] =
    useState([]);

  const [loadingStaff, setLoadingStaff] =
    useState(true);


  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] =
    useState({

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

      notes: "",

    });


  // ==========================================================
  // EXISTING DRIVER
  // ==========================================================

  const [existingDriver, setExistingDriver] =
    useState(null);


  // ==========================================================
  // UI
  // ==========================================================

  const [loadingDriver, setLoadingDriver] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  useEffect(() => {

    const loadStaff = async () => {

      try {

        setLoadingStaff(true);

        const response =
          await axiosInstance.get(
            "/staff/"
          );

        const staffList =
          extractList(response);

        setStaff(
          staffList.filter(
            (member) =>
              member.status === "active" ||
              member.is_active === true ||
              !member.status
          )
        );

      } catch (err) {

        console.error(
          "Failed to load staff:",
          err
        );

        setError(
          "Failed to load staff members."
        );

      } finally {

        setLoadingStaff(false);

      }

    };

    loadStaff();

  }, []);


  // ==========================================================
  // LOAD DRIVER FOR EDITING
  // ==========================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }


    const loadDriver = async () => {

      try {

        setLoadingDriver(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/transport/driver-profiles/${id}/`
          );

        const driver =
          response.data;

        setExistingDriver(
          driver
        );


        setFormData({

          staff:
            typeof driver.staff === "object"
              ? getId(driver.staff)
              : driver.staff ||
                driver.staff_id ||
                "",

          license_number:
            driver.license_number ||
            "",

          license_class:
            driver.license_class ||
            "",

          license_issue_date:
            driver.license_issue_date ||
            "",

          license_expiry_date:
            driver.license_expiry_date ||
            "",

          psv_license_number:
            driver.psv_license_number ||
            "",

          psv_expiry_date:
            driver.psv_expiry_date ||
            "",

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
            driver.driver_badge_number ||
            "",

          notes:
            driver.notes ||
            "",

        });

      } catch (err) {

        console.error(
          "Failed to load driver:",
          err
        );

        setError(
          getErrorMessage(err)
        );

      } finally {

        setLoadingDriver(false);

      }

    };

    loadDriver();

  }, [
    id,
    isEditMode,
  ]);


  // ==========================================================
  // HANDLE CHANGE
  // ==========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

  };


  // ==========================================================
  // CLIENT-SIDE VALIDATION
  // ==========================================================

  const validateForm = () => {

    if (!formData.staff) {
      return (
        "Please select a staff member."
      );
    }


    if (!formData.license_number.trim()) {
      return (
        "Driving licence number is required."
      );
    }


    if (!formData.license_class.trim()) {
      return (
        "Driving licence class is required."
      );
    }


    if (
      formData.license_issue_date &&
      formData.license_expiry_date
    ) {

      const issueDate =
        new Date(
          formData.license_issue_date
        );

      const expiryDate =
        new Date(
          formData.license_expiry_date
        );

      if (
        expiryDate < issueDate
      ) {
        return (
          "Licence expiry date cannot be before the licence issue date."
        );
      }

    }


    if (
      formData.years_of_experience !== ""
    ) {

      const years =
        Number(
          formData.years_of_experience
        );

      if (
        Number.isNaN(years) ||
        years < 0
      ) {
        return (
          "Years of experience must be zero or greater."
        );
      }

    }


    return null;
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }


    // --------------------------------------------------------
    // PREPARE PAYLOAD
    // --------------------------------------------------------

    const payload = {

      staff:
        Number(
          formData.staff
        ),

      license_number:
        formData.license_number.trim(),

      license_class:
        formData.license_class.trim(),

      license_issue_date:
        formData.license_issue_date ||
        null,

      license_expiry_date:
        formData.license_expiry_date ||
        null,

      psv_license_number:
        formData.psv_license_number.trim(),

      psv_expiry_date:
        formData.psv_expiry_date ||
        null,

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

      notes:
        formData.notes.trim(),

    };


    try {

      setSaving(true);


      // ======================================================
      // CREATE
      // ======================================================

      if (!isEditMode) {

        await axiosInstance.post(
          "/transport/driver-profiles/",
          payload
        );

        setSuccess(
          "Driver profile created successfully."
        );


        setTimeout(() => {

          navigate(
            "/transport/drivers"
          );

        }, 800);

        return;
      }


      // ======================================================
      // UPDATE
      // ======================================================

      await axiosInstance.patch(
        `/transport/driver-profiles/${id}/`,
        payload
      );


      setSuccess(
        "Driver profile updated successfully."
      );


      setTimeout(() => {

        navigate(
          `/transport/drivers/${id}`
        );

      }, 800);


    } catch (err) {

      console.error(
        "Failed to save driver:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (
    loadingStaff ||
    loadingDriver
  ) {

    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">

        <div className="text-center">

          <Loader2
            size={32}
            className="mx-auto text-purple-700 animate-spin"
          />

          <p className="text-gray-600 mt-3">
            {isEditMode
              ? "Loading driver..."
              : "Loading staff members..."
            }
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/transport/drivers"
            className="hover:text-purple-700"
          >
            Drivers
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Driver"
              : "Add Driver"
            }
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Car size={25} />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Driver"
                  : "Add Driver"
                }

              </h1>

              <p className="text-gray-600 mt-1">

                {isEditMode
                  ? "Update the driver's transport profile."
                  : "Create a transport profile for an existing staff member."
                }

              </p>

            </div>

          </div>


          <Link
            to="/transport/drivers"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >

            <ArrowLeft size={17} />

            Back to Drivers

          </Link>

        </div>

      </div>


      {/* ====================================================
          ALERTS
      ==================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <AlertCircle
            size={19}
            className="mt-0.5 flex-shrink-0"
          />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-500 hover:text-red-700"
          >

            <X size={18} />

          </button>

        </div>

      )}


      {success && (

        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

          <CheckCircle
            size={19}
            className="mt-0.5"
          />

          <span>
            {success}
          </span>

        </div>

      )}


      {/* ====================================================
          FORM
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ==================================================
            STAFF MEMBER
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={User}
            title="Staff Member"
            description="Select the existing staff member who will operate as a school driver."
          />


          <SelectField
            label="Staff Member"
            name="staff"
            value={formData.staff}
            onChange={handleChange}
            required
            disabled={isEditMode}
            placeholder={
              loadingStaff
                ? "Loading staff..."
                : "Select staff member"
            }
            options={staff.map(
              (member) => ({
                value:
                  getId(member),
                label:
                  getStaffDisplay(
                    member
                  ),
              })
            )}
            helpText={
              isEditMode
                ? "The staff member cannot be changed after a driver profile has been created."
                : "Only existing staff members should be selected here."
            }
          />


          {isEditMode &&
            existingDriver && (
              <div className="mt-4 p-4 rounded-lg bg-purple-50 border border-purple-200">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={19}
                    className="text-purple-700 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-purple-800">
                      Existing Staff Relationship
                    </p>

                    <p className="text-sm text-purple-700 mt-1">
                      This driver profile belongs to{" "}
                      <strong>
                        {getStaffName(
                          existingDriver.staff
                        )}
                      </strong>
                      .
                    </p>

                  </div>

                </div>

              </div>
            )}

        </div>


        {/* ==================================================
            DRIVING LICENCE
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={BadgeCheck}
            title="Driving Licence"
            description="Record the driver's primary driving licence information."
          />


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <InputField
              label="Licence Number"
              name="license_number"
              value={
                formData.license_number
              }
              onChange={
                handleChange
              }
              required
              placeholder="e.g. DL12345678"
            />


            <InputField
              label="Licence Class"
              name="license_class"
              value={
                formData.license_class
              }
              onChange={
                handleChange
              }
              required
              placeholder="e.g. B, C1, C"
            />


            <InputField
              label="Issue Date"
              name="license_issue_date"
              type="date"
              value={
                formData.license_issue_date
              }
              onChange={
                handleChange
              }
            />


            <InputField
              label="Expiry Date"
              name="license_expiry_date"
              type="date"
              value={
                formData.license_expiry_date
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>


        {/* ==================================================
            PSV LICENCE
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={ShieldCheck}
            title="PSV Licence"
            description="Record public service vehicle licensing information where applicable."
          />


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <InputField
              label="PSV Licence Number"
              name="psv_license_number"
              value={
                formData.psv_license_number
              }
              onChange={
                handleChange
              }
              placeholder="Enter PSV licence number"
              helpText="Leave blank if not applicable."
            />


            <InputField
              label="PSV Expiry Date"
              name="psv_expiry_date"
              type="date"
              value={
                formData.psv_expiry_date
              }
              onChange={
                handleChange
              }
              helpText="Leave blank if not applicable."
            />

          </div>

        </div>


        {/* ==================================================
            EXPERIENCE & MEDICAL
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={Calendar}
            title="Experience & Medical"
            description="Record driving experience and medical certificate information."
          />


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <InputField
              label="Years of Experience"
              name="years_of_experience"
              type="number"
              value={
                formData.years_of_experience
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 5"
              helpText="Enter the driver's total driving experience."
            />


            <InputField
              label="Medical Certificate Expiry"
              name="medical_certificate_expiry"
              type="date"
              value={
                formData.medical_certificate_expiry
              }
              onChange={
                handleChange
              }
            />


            <InputField
              label="Driver Badge Number"
              name="driver_badge_number"
              value={
                formData.driver_badge_number
              }
              onChange={
                handleChange
              }
              placeholder="e.g. DRV-001"
            />

          </div>


          <div className="mt-4">

            <label
              htmlFor="previous_driving_experience"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Previous Driving Experience
            </label>

            <textarea
              id="previous_driving_experience"
              name="previous_driving_experience"
              value={
                formData.previous_driving_experience
              }
              onChange={
                handleChange
              }
              rows={4}
              placeholder="Describe relevant previous driving experience, employers, vehicle types or other useful information..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
            />

          </div>

        </div>


        {/* ==================================================
            NOTES
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={FileText}
            title="Additional Notes"
            description="Store additional information relevant to the driver's transport profile."
          />


          <textarea
            id="notes"
            name="notes"
            value={
              formData.notes
            }
            onChange={
              handleChange
            }
            rows={5}
            placeholder="Enter any additional notes..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
          />

        </div>


        {/* ==================================================
            VERIFICATION INFORMATION
        ================================================== */}

        {isEditMode &&
          existingDriver && (

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

              <SectionHeader
                icon={ShieldCheck}
                title="Verification"
                description="Verification information is controlled by the backend and cannot be edited here."
              />


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Verification Status
                  </p>

                  <div className="mt-2">

                    {existingDriver.is_verified ? (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

                        <CheckCircle size={14} />

                        Verified

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">

                        <AlertCircle size={14} />

                        Not Verified

                      </span>

                    )}

                  </div>

                </div>


                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Verification Date
                  </p>

                  <p className="font-medium text-gray-800 mt-2">

                    {formatDate(
                      existingDriver.verification_date
                    )}

                  </p>

                </div>


                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Verified By
                  </p>

                  <p className="font-medium text-gray-800 mt-2">

                    {typeof existingDriver.verified_by ===
                      "object"
                      ? (
                        existingDriver
                          .verified_by
                          ?.full_name ||
                        existingDriver
                          .verified_by
                          ?.username ||
                        "—"
                      )
                      : (
                        existingDriver.verified_by ||
                        "—"
                      )}

                  </p>

                </div>

              </div>

            </div>

          )}


        {/* ==================================================
            FORM ACTIONS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm font-medium text-gray-700">
                {isEditMode
                  ? "Save your changes"
                  : "Create Driver Profile"
                }
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Required fields are marked with an asterisk.
              </p>

            </div>


            <div className="flex flex-col sm:flex-row gap-3">

              <Link
                to={
                  isEditMode
                    ? `/transport/drivers/${id}`
                    : "/transport/drivers"
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >

                <X size={17} />

                Cancel

              </Link>


              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? "Save Changes"
                      : "Create Driver"
                    }

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      </form>

    </div>
  );
};


export default DriverFormPage;

