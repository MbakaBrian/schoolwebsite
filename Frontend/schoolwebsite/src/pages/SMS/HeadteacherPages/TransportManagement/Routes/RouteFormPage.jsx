import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Map,
  RefreshCw,
  Save,
  XCircle,
  RouteIcon
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const data =
    error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    typeof data === "string"
  ) {
    return data;
  }

  if (
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

  return fallback;
};


// ============================================================
// PAGE
// ============================================================

const RouteFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode =
    Boolean(id);


  // ==========================================================
  // FORM
  // ==========================================================

  const [formData, setFormData] =
    useState({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });


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
  // LOAD ROUTE
  // ==========================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }

    const loadRoute =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await axiosInstance.get(
              `/transport/routes/${id}/`
            );

          const route =
            response.data;

          setFormData({
            name:
              route?.name ||
              route?.route_name ||
              "",

            code:
              route?.code ||
              route?.route_code ||
              "",

            description:
              route?.description ||
              route?.notes ||
              "",

            is_active:
              route?.is_active !==
              undefined
                ? Boolean(
                    route.is_active
                  )
                : String(
                    route?.status ||
                      "active"
                  ).toLowerCase() ===
                  "active",
          });

        } catch (err) {

          console.error(
            "Failed to load route:",
            err
          );

          setError(
            getErrorMessage(
              err,
              "Failed to load route information."
            )
          );

        } finally {
          setLoading(false);
        }
      };

    loadRoute();

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

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {

    if (
      !formData.name.trim()
    ) {
      return "Route name is required.";
    }

    if (
      !formData.code.trim()
    ) {
      return "Route code is required.";
    }

    return null;
  };


  // ==========================================================
  // SAVE ROUTE
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name:
          formData.name.trim(),

        code:
          formData.code.trim(),

        description:
          formData.description.trim(),

        is_active:
          formData.is_active,
      };


      let response;

      if (isEditMode) {

        response =
          await axiosInstance.patch(
            `/transport/routes/${id}/`,
            payload
          );

      } else {

        response =
          await axiosInstance.post(
            "/transport/routes/",
            payload
          );
      }


      const savedRoute =
        response.data;

      const savedId =
        savedRoute?.id ||
        savedRoute?.pk ||
        id;


      setSuccess(
        isEditMode
          ? "Route updated successfully."
          : "Route created successfully."
      );


      // --------------------------------------------------------
      // REDIRECT
      // --------------------------------------------------------

      setTimeout(() => {

        if (savedId) {
          navigate(
            `/transport/routes/${savedId}`
          );
        } else {
          navigate(
            "/transport/routes"
          );
        }

      }, 500);

    } catch (err) {

      console.error(
        "Failed to save route:",
        err
      );

      setError(
        getErrorMessage(
          err,
          isEditMode
            ? "The route could not be updated."
            : "The route could not be created."
        )
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-800 animate-spin" />

          <p className="text-gray-600 mt-4">
            Loading route information...
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

      <div className="max-w-4xl mx-auto">


        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport
          </Link>

          <ChevronRight
            size={15}
          />

          <Link
            to="/transport/routes"
            className="hover:text-purple-700"
          >
            Routes & Stages
          </Link>

          <ChevronRight
            size={15}
          />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Route"
              : "New Route"}
          </span>

        </div>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-purple-800 text-white flex items-center justify-center">
                <Map size={25} />
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isEditMode
                    ? "Edit Transport Route"
                    : "Create Transport Route"}
                </h1>

                <p className="text-gray-600 mt-1">
                  {isEditMode
                    ? "Update the route's basic information."
                    : "Create a route before adding its transport stages."}
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/transport/routes"
                )
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <ArrowLeft
                size={17}
              />
              Back
            </button>

          </div>

        </div>


        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

            <XCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>
        )}


        {success && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

            <Check
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
        >

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">


            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Map size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Route Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter the basic information used to identify this route.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6 space-y-6">


              {/* ==================================================
                  ROUTE NAME
              ================================================== */}

              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Route Name
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Bomet Town Route"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Use a clear name that staff can easily recognize.
                </p>

              </div>


              {/* ==================================================
                  ROUTE CODE
              ================================================== */}

              <div>

                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Route Code
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={
                    formData.code
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. BMT-01"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  A short unique identifier for the route.
                </p>

              </div>


              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              <div>

                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the general area or coverage of this route..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Optional. You can use this to describe the route's general coverage.
                </p>

              </div>


              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

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
                    className="w-4 h-4 mt-1 accent-purple-700"
                  />

                  <span>

                    <span className="block font-medium text-gray-800">
                      Active Route
                    </span>

                    <span className="block text-sm text-gray-500 mt-0.5">
                      Active routes can be used for current transport operations.
                    </span>

                  </span>

                </label>

              </div>

            </div>


            {/* ==================================================
                FORM ACTIONS
            ================================================== */}

            <div className="px-5 py-4 bg-gray-100 border-t border-gray-200">

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/transport/routes"
                    )
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      {isEditMode
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save
                        size={18}
                      />

                      {isEditMode
                        ? "Update Route"
                        : "Create Route"}
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </form>


        {/* ====================================================
            AFTER CREATION NOTE
        ==================================================== */}

        {!isEditMode && (
          <div className="mt-5 p-4 rounded-xl bg-purple-50 border border-purple-200">

            <div className="flex items-start gap-3">

              <RouteIcon
                size={19}
                className="text-purple-700 mt-0.5"
              />

              <div>

                <p className="font-semibold text-purple-800">
                  What's next?
                </p>

                <p className="text-sm text-purple-700 mt-1">
                  After creating the route, you can add its individual
                  pickup and drop-off stages from the route details page.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};


export default RouteFormPage;

