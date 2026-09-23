
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
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// COMPONENT
// ============================================================

const StaffRoleFormPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);


  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});


  // ==========================================================
  // LOAD ROLE FOR EDITING
  // ==========================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }

    loadRole();

  }, [id]);


  // ==========================================================
  // LOAD ROLE
  // ==========================================================

  const loadRole = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/staff/roles/${id}/`
        );

      const role =
        response.data;


      setFormData({
        name:
          role.name || "",

        code:
          role.code || "",

        description:
          role.description || "",

        is_active:
          role.is_active !== false,
      });

    } catch (err) {

      console.error(
        "Failed to load staff role:",
        err
      );

      setError(
        "Unable to load this staff role."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setFormData(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
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
  // VALIDATE FORM
  // ==========================================================

  const validateForm = () => {

    const errors = {};


    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    if (
      !formData.name.trim()
    ) {

      errors.name =
        "Role name is required.";

    }


    // --------------------------------------------------------
    // CODE
    // --------------------------------------------------------

    if (
      !formData.code.trim()
    ) {

      errors.code =
        "Role code is required.";

    }


    // --------------------------------------------------------
    // CODE FORMAT
    // --------------------------------------------------------

    if (
      formData.code &&
      !/^[a-z0-9_-]+$/i.test(
        formData.code.trim()
      )
    ) {

      errors.code =
        "Role code may only contain letters, numbers, underscores and hyphens.";

    }


    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );

  };


  // ==========================================================
  // SAVE ROLE
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


      const payload = {
        name:
          formData.name.trim(),

        code:
          formData.code
            .trim()
            .toLowerCase(),

        description:
          formData.description.trim(),

        is_active:
          formData.is_active,
      };


      // ====================================================
      // CREATE
      // ====================================================

      if (!isEditMode) {

        const response =
          await axiosInstance.post(
            "/staff/roles/",
            payload
          );


        const createdRole =
          response.data;


        setSuccess(
          "Staff role created successfully."
        );


        setTimeout(() => {

          navigate(
            `/staff/roles/${createdRole.id}`
          );

        }, 700);

      } else {

        // ==================================================
        // UPDATE
        // ==================================================

        await axiosInstance.patch(
          `/staff/roles/${id}/`,
          payload
        );


        setSuccess(
          "Staff role updated successfully."
        );


        setTimeout(() => {

          navigate(
            `/staff/roles/${id}`
          );

        }, 700);

      }

    } catch (err) {

      console.error(
        "Failed to save staff role:",
        err
      );


      const responseData =
        err.response?.data;


      // ----------------------------------------------------
      // DRF VALIDATION ERRORS
      // ----------------------------------------------------

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


        setError(
          firstError ||
            "The staff role could not be saved."
        );

      } else {

        setError(
          "The staff role could not be saved."
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
  // LOADING
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
            Loading staff role...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // INPUT CLASS
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
            to="/staff/roles"
            className="hover:text-purple-700"
          >
            Staff Roles
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">

            {isEditMode
              ? "Edit Role"
              : "Add Role"}

          </span>

        </div>


        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <ShieldCheck size={25} />

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Staff Role"
                  : "Add Staff Role"}

              </h1>


              <p className="text-gray-600 mt-1">

                {isEditMode
                  ? "Update the role name, code, description or status."
                  : "Create a role that can be assigned to staff members."}

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
            size={19}
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
            size={19}
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
        className="max-w-4xl"
      >


        {/* ====================================================
            ROLE INFORMATION
        ==================================================== */}

        <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 bg-gray-100 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <BriefcaseBusiness size={20} />

              </div>


              <div>

                <h2 className="font-semibold text-gray-800">
                  Role Information
                </h2>

                <p className="text-sm text-gray-500">
                  Define the role that can be assigned to staff members.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* ==================================================
                  ROLE NAME
              ================================================== */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass(
                    "name"
                  )}
                  placeholder="e.g. Driver"
                />

                {fieldErrors.name && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.name}
                  </p>

                )}

              </div>


              {/* ==================================================
                  ROLE CODE
              ================================================== */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Code *
                </label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={inputClass(
                    "code"
                  )}
                  placeholder="e.g. driver"
                />

                {fieldErrors.code ? (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.code}
                  </p>

                ) : (

                  <p className="text-xs text-gray-500 mt-1">
                    Use lowercase letters, numbers, hyphens or underscores.
                  </p>

                )}

              </div>


              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass(
                    "description"
                  )}
                  placeholder="Describe the responsibilities or purpose of this role..."
                />

                {fieldErrors.description && (

                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.description}
                  </p>

                )}

              </div>


              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="md:col-span-2">

                <div className="border border-gray-200 rounded-xl p-4 bg-white">

                  <label className="flex items-start gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={
                        handleChange
                      }
                      className="mt-1 w-4 h-4 accent-purple-700"
                    />

                    <div>

                      <p className="font-medium text-gray-800">
                        Active Role
                      </p>

                      <p className="text-sm text-gray-500 mt-0.5">
                        Active roles are available when assigning responsibilities to staff members.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            INFORMATION CARD
        ==================================================== */}

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5">

          <div className="flex items-start gap-3">

            <ShieldCheck
              size={20}
              className="text-purple-700 mt-0.5 flex-shrink-0"
            />

            <div>

              <h3 className="font-semibold text-purple-800">
                About Staff Roles
              </h3>

              <p className="text-sm text-purple-700 mt-1">
                Roles describe what a staff member is responsible for.
                A role can later be assigned to one or more staff members
                through Role Assignments.
              </p>

              <p className="text-sm text-purple-700 mt-2">
                For example, a staff member may be assigned the
                <strong> Driver </strong>
                role, while another may be assigned
                <strong> Accountant </strong>
                or
                <strong> Secretary </strong>.
              </p>

            </div>

          </div>

        </div>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <p className="text-sm text-gray-500">
                Fields marked with * are required.
              </p>

              {isEditMode && (

                <p className="text-xs text-gray-400 mt-1">
                  Role ID and timestamps are managed automatically.
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
                      ? "Update Role"
                      : "Create Role"}

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


export default StaffRoleFormPage;

