
import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_REFEREE = {
  id: null,
  name: "",
  relationship: "",
  phone: "",
  alternative_phone: "",
  email: "",
  occupation: "",
  company: "",
  address: "",
  notes: "",
};


// ============================================================
// HELPERS
// ============================================================

const getId = (item) => {
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const getFullName = (staff) => {
  if (!staff) {
    return "";
  }

  return [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
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


// ============================================================
// COMPONENT
// ============================================================

const StaffFormPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);


  // ==========================================================
  // STAFF FORM
  // ==========================================================

  const [formData, setFormData] = useState({
    employee_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "Kenyan",
    national_id: "",
    religion: "",
    phone: "",
    alternative_phone: "",
    email: "",
    address: "",
    county: "",
    subcounty: "",
    date_joined: "",
    date_left: "",
    employment_type: "permanent",
    status: "active",
    previous_employment: "",
  });


  // ==========================================================
  // PHOTO
  // ==========================================================

  const [photo, setPhoto] = useState(null);

  const [existingPhoto, setExistingPhoto] =
    useState("");


  // ==========================================================
  // REFEREES
  // ==========================================================

  const [referees, setReferees] = useState([
    {
      ...INITIAL_REFEREE,
    },
  ]);


  /*
  ------------------------------------------------------------
  Track existing referees removed from the UI.

  This is important during edit mode.

  Example:

  Database:
      Referee A
      Referee B

  User removes Referee B from the form.

  Referee B disappears from the React state, so we must
  remember its ID and delete it from the backend when the
  staff record is saved.
  ------------------------------------------------------------
  */

  const [deletedRefereeIds, setDeletedRefereeIds] =
    useState([]);


  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // FORM ERRORS
  // ==========================================================

  const [fieldErrors, setFieldErrors] =
    useState({});


  // ==========================================================
  // LOAD STAFF FOR EDITING
  // ==========================================================

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    loadStaff();
  }, [id]);


  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");
      setFieldErrors({});


      // ------------------------------------------------------
      // LOAD STAFF
      // ------------------------------------------------------

      const staffResponse =
        await axiosInstance.get(
          `/staff/${id}/`
        );

      const staff =
        staffResponse.data;


      // ------------------------------------------------------
      // STAFF DATA
      // ------------------------------------------------------

      setFormData({
        employee_number:
          staff.employee_number || "",

        first_name:
          staff.first_name || "",

        middle_name:
          staff.middle_name || "",

        last_name:
          staff.last_name || "",

        date_of_birth:
          staff.date_of_birth || "",

        gender:
          staff.gender || "",

        nationality:
          staff.nationality || "Kenyan",

        national_id:
          staff.national_id || "",

        religion:
          staff.religion || "",

        phone:
          staff.phone || "",

        alternative_phone:
          staff.alternative_phone || "",

        email:
          staff.email || "",

        address:
          staff.address || "",

        county:
          staff.county || "",

        subcounty:
          staff.subcounty || "",

        date_joined:
          staff.date_joined || "",

        date_left:
          staff.date_left || "",

        employment_type:
          staff.employment_type ||
          "permanent",

        status:
          staff.status ||
          "active",

        previous_employment:
          staff.previous_employment ||
          "",
      });


      // ------------------------------------------------------
      // PHOTO
      // ------------------------------------------------------

      if (staff.photo) {
        setExistingPhoto(
          staff.photo
        );
      }


      // ------------------------------------------------------
      // LOAD REFEREES
      // ------------------------------------------------------

      const refereesResponse =
        await axiosInstance.get(
          "/staff/referees/",
          {
            params: {
              staff: id,
            },
          }
        );


      const refereeData =
        extractList(
          refereesResponse
        );


      if (refereeData.length > 0) {
        setReferees(
          refereeData.map(
            (referee) => ({
              id:
                referee.id,

              name:
                referee.name || "",

              relationship:
                referee.relationship || "",

              phone:
                referee.phone || "",

              alternative_phone:
                referee.alternative_phone || "",

              email:
                referee.email || "",

              occupation:
                referee.occupation || "",

              company:
                referee.company || "",

              address:
                referee.address || "",

              notes:
                referee.notes || "",
            })
          )
        );
      } else {
        setReferees([
          {
            ...INITIAL_REFEREE,
          },
        ]);
      }


      // ------------------------------------------------------
      // RESET DELETED REFEREES
      // ------------------------------------------------------

      setDeletedRefereeIds([]);

    } catch (err) {
      console.error(
        "Failed to load staff:",
        err
      );

      setError(
        "Unable to load the staff member."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // STAFF FIELD CHANGE
  // ==========================================================

  const handleChange = (event) => {
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


    setFieldErrors(
      (current) => ({
        ...current,
        [name]: undefined,
      })
    );
  };


  // ==========================================================
  // PHOTO CHANGE
  // ==========================================================

  const handlePhotoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhoto(file);
  };


  // ==========================================================
  // REFEREE FIELD CHANGE
  // ==========================================================

  const handleRefereeChange = (
    index,
    field,
    value
  ) => {
    setReferees(
      (current) =>
        current.map(
          (
            referee,
            refereeIndex
          ) =>
            refereeIndex === index
              ? {
                  ...referee,
                  [field]: value,
                }
              : referee
        )
    );


    // Clear the specific referee field error
    setFieldErrors(
      (current) => ({
        ...current,
        [`referee_${index}_${field}`]:
          undefined,
      })
    );
  };


  // ==========================================================
  // ADD REFEREE
  // ==========================================================

  const addReferee = () => {
    setReferees(
      (current) => [
        ...current,
        {
          ...INITIAL_REFEREE,
        },
      ]
    );
  };


  // ==========================================================
  // REMOVE REFEREE
  // ==========================================================

  const removeReferee = (
    index
  ) => {
    setReferees(
      (current) => {

        const referee =
          current[index];


        // ----------------------------------------------------
        // Existing database referee
        // ----------------------------------------------------

        if (referee?.id) {
          setDeletedRefereeIds(
            (currentIds) => {

              if (
                currentIds.includes(
                  referee.id
                )
              ) {
                return currentIds;
              }

              return [
                ...currentIds,
                referee.id,
              ];
            }
          );
        }


        // ----------------------------------------------------
        // Keep at least one form visible
        // ----------------------------------------------------

        if (current.length === 1) {
          return [
            {
              ...INITIAL_REFEREE,
            },
          ];
        }


        return current.filter(
          (_, refereeIndex) =>
            refereeIndex !== index
        );
      }
    );
  };


  // ==========================================================
  // REFEREE EMPTY CHECK
  // ==========================================================

  const isRefereeEmpty = (
    referee
  ) => {
    return (
      !referee.name.trim() &&
      !referee.phone.trim() &&
      !referee.email.trim() &&
      !referee.relationship.trim() &&
      !referee.alternative_phone.trim() &&
      !referee.occupation.trim() &&
      !referee.company.trim() &&
      !referee.address.trim() &&
      !referee.notes.trim()
    );
  };


  // ==========================================================
  // REFEREE HAS DATA
  // ==========================================================

  const refereeHasData = (
    referee
  ) => {
    return !isRefereeEmpty(
      referee
    );
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const errors = {};


    // ------------------------------------------------------
    // REQUIRED STAFF FIELDS
    // ------------------------------------------------------

    if (
      !formData.employee_number.trim()
    ) {
      errors.employee_number =
        "Employee number is required.";
    }


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


    if (
      !formData.phone.trim()
    ) {
      errors.phone =
        "Phone number is required.";
    }


    if (!formData.date_joined) {
      errors.date_joined =
        "Date joined is required.";
    }


    // ------------------------------------------------------
    // DATE LEFT
    // ------------------------------------------------------

    if (
      formData.date_left &&
      formData.date_joined &&
      formData.date_left <
        formData.date_joined
    ) {
      errors.date_left =
        "Date left cannot be earlier than date joined.";
    }


    // ------------------------------------------------------
    // ACTIVE STAFF
    // ------------------------------------------------------

    if (
      formData.status === "active" &&
      formData.date_left
    ) {
      errors.date_left =
        "Active staff cannot have a date left.";
    }


    // ------------------------------------------------------
    // EXIT STATUS
    // ------------------------------------------------------

    const exitStatuses = [
      "resigned",
      "terminated",
      "retired",
    ];


    if (
      exitStatuses.includes(
        formData.status
      ) &&
      !formData.date_left
    ) {
      errors.date_left =
        "Date left is required for resigned, terminated or retired staff.";
    }


    // ------------------------------------------------------
    // REFEREES
    // ------------------------------------------------------
    //
    // Referees are optional.
    //
    // However, once a user starts entering a referee,
    // the referee must have:
    //
    // - Name
    // - Phone
    //
    // This fixes the previous problem where the initial
    // blank referee form prevented the staff record from
    // being saved.
    // ------------------------------------------------------

    referees.forEach(
      (referee, index) => {

        if (
          isRefereeEmpty(
            referee
          )
        ) {
          return;
        }


        if (
          !referee.name.trim()
        ) {
          errors[
            `referee_${index}_name`
          ] =
            "Referee name is required.";
        }


        if (
          !referee.phone.trim()
        ) {
          errors[
            `referee_${index}_phone`
          ] =
            "Referee phone number is required.";
        }
      }
    );


    setFieldErrors(errors);


    return (
      Object.keys(errors).length ===
      0
    );
  };


  // ==========================================================
  // BUILD STAFF FORM DATA
  // ==========================================================

  const buildStaffFormData = () => {
    const data =
      new FormData();


    // ------------------------------------------------------
    // STAFF FIELDS
    // ------------------------------------------------------

    Object.entries(
      formData
    ).forEach(
      ([field, value]) => {

        /*
        ------------------------------------------------------
        Don't send empty date_left.

        This allows Django to preserve the field as null
        instead of receiving an empty string.
        ------------------------------------------------------
        */

        if (
          field === "date_left" &&
          !value
        ) {
          return;
        }


        data.append(
          field,
          value ?? ""
        );
      }
    );


    // ------------------------------------------------------
    // PHOTO
    // ------------------------------------------------------

    if (photo) {
      data.append(
        "photo",
        photo
      );
    }


    return data;
  };


  // ==========================================================
  // CREATE REFEREE
  // ==========================================================

  const createReferee = async (
    staffId,
    referee
  ) => {
    const payload = {
      staff: staffId,

      name:
        referee.name.trim(),

      relationship:
        referee.relationship.trim(),

      phone:
        referee.phone.trim(),

      alternative_phone:
        referee.alternative_phone.trim(),

      email:
        referee.email.trim(),

      occupation:
        referee.occupation.trim(),

      company:
        referee.company.trim(),

      address:
        referee.address.trim(),

      notes:
        referee.notes.trim(),
    };


    await axiosInstance.post(
      "/staff/referees/",
      payload
    );
  };


  // ==========================================================
  // UPDATE REFEREE
  // ==========================================================

  const updateReferee = async (
    referee
  ) => {
    const refereeId =
      referee.id;


    if (!refereeId) {
      return;
    }


    const payload = {
      name:
        referee.name.trim(),

      relationship:
        referee.relationship.trim(),

      phone:
        referee.phone.trim(),

      alternative_phone:
        referee.alternative_phone.trim(),

      email:
        referee.email.trim(),

      occupation:
        referee.occupation.trim(),

      company:
        referee.company.trim(),

      address:
        referee.address.trim(),

      notes:
        referee.notes.trim(),
    };


    await axiosInstance.patch(
      `/staff/referees/${refereeId}/`,
      payload
    );
  };


  // ==========================================================
  // DELETE REFEREE
  // ==========================================================

  const deleteReferee = async (
    refereeId
  ) => {
    if (!refereeId) {
      return;
    }


    await axiosInstance.delete(
      `/staff/referees/${refereeId}/`
    );
  };


  // ==========================================================
  // SAVE STAFF
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();


    setError("");
    setSuccess("");


    if (!validateForm()) {
      setError(
        "Please correct the highlighted fields before saving."
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });


      return;
    }


    try {
      setSaving(true);


      let staffId;


      // ====================================================
      // CREATE
      // ====================================================

      if (!isEditMode) {

        // --------------------------------------------------
        // CREATE STAFF
        // --------------------------------------------------

        const response =
          await axiosInstance.post(
            "/staff/",
            buildStaffFormData(),
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );


        staffId =
          getId(
            response.data
          );


        if (!staffId) {
          throw new Error(
            "Staff was created but no staff ID was returned."
          );
        }


        // --------------------------------------------------
        // CREATE REFEREES
        // --------------------------------------------------

        for (
          const referee of referees
        ) {

          /*
          ----------------------------------------------------
          Completely empty referee forms are optional and
          therefore skipped.
          ----------------------------------------------------
          */

          if (
            isRefereeEmpty(
              referee
            )
          ) {
            continue;
          }


          await createReferee(
            staffId,
            referee
          );
        }


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        setSuccess(
          "Staff member and referee information saved successfully."
        );


        // --------------------------------------------------
        // REDIRECT
        // --------------------------------------------------

        setTimeout(() => {
          navigate(
            `/staff/members/${staffId}`
          );
        }, 700);


      } else {

        // ==================================================
        // UPDATE STAFF
        // ==================================================

        await axiosInstance.patch(
          `/staff/${id}/`,
          buildStaffFormData(),
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


        // ==================================================
        // DELETE REMOVED REFEREES
        // ==================================================

        /*
        ------------------------------------------------------
        This is the important fix.

        Any existing referee removed from the form is
        deleted from the database here.
        ------------------------------------------------------
        */

        for (
          const refereeId of
          deletedRefereeIds
        ) {
          await deleteReferee(
            refereeId
          );
        }


        // ==================================================
        // SYNCHRONISE CURRENT REFEREES
        // ==================================================

        for (
          const referee of referees
        ) {

          const empty =
            isRefereeEmpty(
              referee
            );


          // ------------------------------------------------
          // Existing referee
          // ------------------------------------------------

          if (referee.id) {

            /*
            --------------------------------------------------
            If the referee was marked for deletion, it has
            already been deleted above.

            Do not attempt to update it again.
            --------------------------------------------------
            */

            if (
              deletedRefereeIds.includes(
                referee.id
              )
            ) {
              continue;
            }


            /*
            --------------------------------------------------
            An existing referee that has been cleared after
            loading is deleted.
            --------------------------------------------------
            */

            if (empty) {
              await deleteReferee(
                referee.id
              );
            } else {
              await updateReferee(
                referee
              );
            }


            continue;
          }


          // ------------------------------------------------
          // New referee
          // ------------------------------------------------

          if (!empty) {
            await createReferee(
              id,
              referee
            );
          }
        }


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        setSuccess(
          "Staff member and referee information updated successfully."
        );


        // --------------------------------------------------
        // REDIRECT
        // --------------------------------------------------

        setTimeout(() => {
          navigate(
            `/staff/members/${id}`
          );
        }, 700);
      }

    } catch (err) {

      console.error(
        "Failed to save staff:",
        err
      );


      const responseData =
        err.response?.data;


      // ==================================================
      // BACKEND VALIDATION ERRORS
      // ==================================================

      if (
        responseData &&
        typeof responseData ===
          "object"
      ) {

        const backendErrors = {};


        Object.entries(
          responseData
        ).forEach(
          ([field, value]) => {

            if (
              Array.isArray(value)
            ) {

              backendErrors[field] =
                value.join(" ");

            } else if (
              typeof value ===
              "string"
            ) {

              backendErrors[field] =
                value;

            } else {

              backendErrors[field] =
                JSON.stringify(value);
            }
          }
        );


        setFieldErrors(
          backendErrors
        );


        const firstError =
          Object.values(
            backendErrors
          )[0];


        if (firstError) {

          setError(
            firstError
          );

        } else {

          setError(
            "The staff member could not be saved."
          );
        }

      } else {

        setError(
          "The staff member could not be saved."
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


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <RefreshCw
            size={28}
            className="text-purple-800 animate-spin"
          />

          <p className="text-gray-600">
            Loading staff information...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // INPUT CLASS HELPER
  // ==========================================================

  const inputClass = (
    field
  ) => {

    return `
      w-full
      px-3
      py-2.5
      rounded-lg
      border
      bg-white
      text-gray-800
      focus:outline-none
      focus:ring-2
      focus:ring-purple-500
      ${
        fieldErrors[field]
          ? "border-red-400"
          : "border-gray-300"
      }
    `;
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        {/* Breadcrumb */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/staff"
            className="hover:text-purple-700"
          >
            Staff Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/staff/members"
            className="hover:text-purple-700"
          >
            Staff Members
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">

            {isEditMode
              ? "Edit Staff"
              : "Add Staff"}

          </span>

        </div>


        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              {isEditMode ? (
                <Users size={25} />
              ) : (
                <UserPlus size={25} />
              )}

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Staff Member"
                  : "Add Staff Member"}

              </h1>


              <p className="text-gray-600 mt-1">

                {isEditMode
                  ? `Update ${getFullName(formData)}'s staff information.`
                  : "Register a new staff member and their referees."}

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >

            <ArrowLeft size={17} />

            Back

          </button>

        </div>

      </div>


      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={20}
            className="mt-0.5 flex-shrink-0"
          />

          <div>

            <p className="font-semibold">
              Please review the form
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>

          </div>

        </div>

      )}


      {success && (

        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

          <Check
            size={20}
            className="mt-0.5 flex-shrink-0"
          />

          <span>
            {success}
          </span>

        </div>

      )}


      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >


        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <Users size={20} />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500">
                  Basic identity information for the staff member.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


              {/* First Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "first_name"
                    )
                  }
                />

                {fieldErrors.first_name && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.first_name}
                  </p>

                )}

              </div>


              {/* Middle Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "middle_name"
                    )
                  }
                />

              </div>


              {/* Last Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "last_name"
                    )
                  }
                />

                {fieldErrors.last_name && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.last_name}
                  </p>

                )}

              </div>


              {/* Date of Birth */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Birth
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
                  className={
                    inputClass(
                      "date_of_birth"
                    )
                  }
                />

              </div>


              {/* Gender */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gender
                </label>

                <select
                  name="gender"
                  value={
                    formData.gender
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "gender"
                    )
                  }
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

                </select>

              </div>


              {/* Nationality */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "nationality"
                    )
                  }
                />

              </div>


              {/* Religion */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "religion"
                    )
                  }
                />

              </div>


              {/* Photo */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Staff Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePhotoChange
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                />

                {existingPhoto &&
                  !photo && (

                    <p className="text-xs text-gray-500 mt-1">
                      A staff photo is already uploaded. Select a new file to replace it.
                    </p>

                  )}

                {photo && (

                  <p className="text-xs text-purple-700 mt-1">
                    Selected: {photo.name}
                  </p>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            IDENTIFICATION
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-gray-200 text-gray-700">

                <FileText size={20} />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Identification
                </h2>

                <p className="text-sm text-gray-500">
                  Employment and national identification details.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Employee Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employee Number *
                </label>

                <input
                  type="text"
                  name="employee_number"
                  value={
                    formData.employee_number
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "employee_number"
                    )
                  }
                  placeholder="e.g. EMP-001"
                />

                {fieldErrors.employee_number && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.employee_number}
                  </p>

                )}

              </div>


              {/* National ID */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  National ID
                </label>

                <input
                  type="text"
                  name="national_id"
                  value={
                    formData.national_id
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "national_id"
                    )
                  }
                />

                {fieldErrors.national_id && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.national_id}
                  </p>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            CONTACT INFORMATION
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <BriefcaseBusiness size={20} />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Contact Information
                </h2>

                <p className="text-sm text-gray-500">
                  Contact and residential information.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Phone */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number *
                </label>

                <input
                  type="text"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "phone"
                    )
                  }
                  placeholder="e.g. 0712345678"
                />

                {fieldErrors.phone && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.phone}
                  </p>

                )}

              </div>


              {/* Alternative Phone */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Alternative Phone
                </label>

                <input
                  type="text"
                  name="alternative_phone"
                  value={
                    formData.alternative_phone
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "alternative_phone"
                    )
                  }
                />

              </div>


              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "email"
                    )
                  }
                />

              </div>


              {/* County */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  County
                </label>

                <input
                  type="text"
                  name="county"
                  value={
                    formData.county
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "county"
                    )
                  }
                />

              </div>


              {/* Subcounty */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subcounty
                </label>

                <input
                  type="text"
                  name="subcounty"
                  value={
                    formData.subcounty
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "subcounty"
                    )
                  }
                />

              </div>


              {/* Address */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>

                <textarea
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  rows={3}
                  className={
                    inputClass(
                      "address"
                    )
                  }
                  placeholder="Residential or postal address"
                />

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            EMPLOYMENT INFORMATION
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <BriefcaseBusiness size={20} />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Employment Information
                </h2>

                <p className="text-sm text-gray-500">
                  Employment dates, type and current status.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


              {/* Date Joined */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date Joined *
                </label>

                <input
                  type="date"
                  name="date_joined"
                  value={
                    formData.date_joined
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "date_joined"
                    )
                  }
                />

                {fieldErrors.date_joined && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.date_joined}
                  </p>

                )}

              </div>


              {/* Date Left */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date Left
                </label>

                <input
                  type="date"
                  name="date_left"
                  value={
                    formData.date_left
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "date_left"
                    )
                  }
                />

                {fieldErrors.date_left && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.date_left}
                  </p>

                )}

              </div>


              {/* Employment Type */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employment Type
                </label>

                <select
                  name="employment_type"
                  value={
                    formData.employment_type
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass(
                      "employment_type"
                    )
                  }
                >

                  <option value="permanent">
                    Permanent
                  </option>

                  <option value="contract">
                    Contract
                  </option>

                  <option value="part_time">
                    Part-time
                  </option>

                  <option value="casual">
                    Casual
                  </option>

                  <option value="intern">
                    Intern
                  </option>

                  <option value="volunteer">
                    Volunteer
                  </option>

                </select>

              </div>


              {/* Status */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className={
                    inputClass(
                      "status"
                    )
                  }
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="suspended">
                    Suspended
                  </option>

                  <option value="resigned">
                    Resigned
                  </option>

                  <option value="terminated">
                    Terminated
                  </option>

                  <option value="retired">
                    Retired
                  </option>

                </select>

              </div>


              {/* Previous Employment */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Previous Employment
                </label>

                <textarea
                  name="previous_employment"
                  value={
                    formData.previous_employment
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  className={
                    inputClass(
                      "previous_employment"
                    )
                  }
                  placeholder="Previous employers, positions or relevant employment history..."
                />

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            REFEREES
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">


          {/* Section Header */}

          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                  <Users size={20} />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Referees
                  </h2>

                  <p className="text-sm text-gray-500">
                    Add one or more referees for this staff member.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={addReferee}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus size={17} />

                Add Another Referee

              </button>

            </div>

          </div>


          {/* Referee Cards */}

          <div className="p-5 space-y-5">

            {referees.map(
              (
                referee,
                index
              ) => (

                <div
                  key={
                    referee.id ||
                    `new-referee-${index}`
                  }
                  className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                >


                  {/* Referee Header */}

                  <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">

                        {index + 1}

                      </div>

                      <div>

                        <h3 className="font-semibold text-gray-800">
                          Referee {index + 1}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Reference contact information
                        </p>

                      </div>

                    </div>


                    {referees.length > 1 && (

                      <button
                        type="button"
                        onClick={() =>
                          removeReferee(
                            index
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                      >

                        <Trash2 size={16} />

                        Remove

                      </button>

                    )}

                  </div>


                  {/* Referee Fields */}

                  <div className="p-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


                      {/* Name */}

                      <div className="lg:col-span-2">

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={
                            referee.name
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_name`
                            )
                          }
                          placeholder="Referee full name"
                        />

                        {fieldErrors[
                          `referee_${index}_name`
                        ] && (

                          <p className="text-xs text-red-600 mt-1">

                            {
                              fieldErrors[
                                `referee_${index}_name`
                              ]
                            }

                          </p>

                        )}

                      </div>


                      {/* Relationship */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Relationship
                        </label>

                        <input
                          type="text"
                          value={
                            referee.relationship
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "relationship",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_relationship`
                            )
                          }
                          placeholder="e.g. Former Employer"
                        />

                      </div>


                      {/* Phone */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone
                        </label>

                        <input
                          type="text"
                          value={
                            referee.phone
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "phone",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_phone`
                            )
                          }
                          placeholder="Phone number"
                        />

                        {fieldErrors[
                          `referee_${index}_phone`
                        ] && (

                          <p className="text-xs text-red-600 mt-1">

                            {
                              fieldErrors[
                                `referee_${index}_phone`
                              ]
                            }

                          </p>

                        )}

                      </div>


                      {/* Alternative Phone */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Alternative Phone
                        </label>

                        <input
                          type="text"
                          value={
                            referee.alternative_phone
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "alternative_phone",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_alternative_phone`
                            )
                          }
                        />

                      </div>


                      {/* Email */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email
                        </label>

                        <input
                          type="email"
                          value={
                            referee.email
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "email",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_email`
                            )
                          }
                        />

                      </div>


                      {/* Occupation */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Occupation
                        </label>

                        <input
                          type="text"
                          value={
                            referee.occupation
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "occupation",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_occupation`
                            )
                          }
                        />

                      </div>


                      {/* Company */}

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Company / Organisation
                        </label>

                        <input
                          type="text"
                          value={
                            referee.company
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "company",
                              event.target.value
                            )
                          }
                          className={
                            inputClass(
                              `referee_${index}_company`
                            )
                          }
                        />

                      </div>


                      {/* Address */}

                      <div className="md:col-span-2">

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Address
                        </label>

                        <textarea
                          value={
                            referee.address
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "address",
                              event.target.value
                            )
                          }
                          rows={2}
                          className={
                            inputClass(
                              `referee_${index}_address`
                            )
                          }
                        />

                      </div>


                      {/* Notes */}

                      <div className="md:col-span-2 lg:col-span-3">

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Notes
                        </label>

                        <textarea
                          value={
                            referee.notes
                          }
                          onChange={(event) =>
                            handleRefereeChange(
                              index,
                              "notes",
                              event.target.value
                            )
                          }
                          rows={3}
                          className={
                            inputClass(
                              `referee_${index}_notes`
                            )
                          }
                          placeholder="Additional information about this referee..."
                        />

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}


            {/* Add Another Referee */}

            <div className="flex justify-center">

              <button
                type="button"
                onClick={addReferee}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100"
              >

                <Plus size={17} />

                Add Another Referee

              </button>

            </div>


            {/* Referee Information */}

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

              <p className="text-sm text-purple-800">

                <span className="font-semibold">
                  Referee information is optional.
                </span>{" "}

                If you add a referee, provide at least their
                full name and phone number.

              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            FORM ACTIONS
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <p className="text-sm text-gray-500">
                Fields marked with * are required.
              </p>

              {isEditMode && (

                <p className="text-xs text-gray-400 mt-1">
                  Staff ID and system timestamps are managed automatically.
                </p>

              )}

            </div>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >

                <X size={17} />

                Cancel

              </button>


              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {saving ? (

                  <>

                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    Saving...

                  </>

                ) : (

                  <>

                    <Check size={17} />

                    {isEditMode
                      ? "Update Staff"
                      : "Save Staff"}

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


export default StaffFormPage;

