import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Map,
  RefreshCw,
  Route as RouteIcon,
  Save,
  XCircle,
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
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
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

  const isEditMode = Boolean(id);


  // ==========================================================
  // FORM
  // ==========================================================

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    direction: "both",
    distance_km: "",
    estimated_duration_minutes: "",
    status: "active",
    notes: "",
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

    const loadRoute = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/transport/routes/${id}/`
          );

        const route = response.data;

        setFormData({
          name:
            route?.name || "",

          code:
            route?.code || "",

          description:
            route?.description || "",

          direction:
            route?.direction || "both",

          distance_km:
            route?.distance_km !== null &&
            route?.distance_km !== undefined
              ? route.distance_km
              : "",

          estimated_duration_minutes:
            route?.estimated_duration_minutes !==
              null &&
            route?.estimated_duration_minutes !==
              undefined
              ? route.estimated_duration_minutes
              : "",

          status:
            route?.status || "active",

          notes:
            route?.notes || "",
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

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Route name is required.";
    }

    if (!formData.code.trim()) {
      return "Route code is required.";
    }

    if (
      formData.distance_km !== "" &&
      Number(formData.distance_km) < 0
    ) {
      return "Route distance cannot be negative.";
    }

    if (
      formData.estimated_duration_minutes !==
        "" &&
      Number(
        formData.estimated_duration_minutes
      ) < 0
    ) {
      return "Estimated duration cannot be negative.";
    }

    return null;
  };


  // ==========================================================
  // SAVE ROUTE
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // BUILD PAYLOAD
      // ------------------------------------------------------

      const payload = {
        name: formData.name.trim(),

        code: formData.code.trim(),

        description:
          formData.description.trim(),

        direction:
          formData.direction,

        distance_km:
          formData.distance_km === ""
            ? null
            : Number(
                formData.distance_km
              ),

        estimated_duration_minutes:
          formData.estimated_duration_minutes ===
          ""
            ? null
            : Number(
                formData
                  .estimated_duration_minutes
            ),

        status:
          formData.status,

        notes:
          formData.notes.trim(),
      };


      let response;


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (isEditMode) {
        response =
          await axiosInstance.patch(
            `/transport/routes/${id}/`,
            payload
          );

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      } else {
        response =
          await axiosInstance.post(
            "/transport/routes/",
            payload
          );
      }


      // ------------------------------------------------------
      // GET SAVED ROUTE ID
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // REDIRECT
      // ------------------------------------------------------

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

          <ChevronRight size={15} />

          <Link
            to="/transport/routes"
            className="hover:text-purple-700"
          >
            Routes & Stages
          </Link>

          <ChevronRight size={15} />

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
                    ? "Update the route information and operational settings."
                    : "Create a route before adding its individual transport stages."}
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
              <ArrowLeft size={17} />
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
                    Enter the main information used to identify and operate this route.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6 space-y-6">


              {/* ==================================================
                  ROUTE NAME + CODE
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* ROUTE NAME */}

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
                    A clear name staff can easily recognize.
                  </p>

                </div>


                {/* ROUTE CODE */}

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
                    A unique short identifier for the route.
                  </p>

                </div>

              </div>


              {/* ==================================================
                  DIRECTION + STATUS
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* DIRECTION */}

                <div>

                  <label
                    htmlFor="direction"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Route Direction
                  </label>

                  <select
                    id="direction"
                    name="direction"
                    value={
                      formData.direction
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >

                    <option value="both">
                      Both Directions
                    </option>

                    <option value="inbound">
                      Inbound
                    </option>

                    <option value="outbound">
                      Outbound
                    </option>

                  </select>

                  <p className="text-xs text-gray-500 mt-1.5">
                    Indicates the direction in which this route operates.
                  </p>

                </div>


                {/* STATUS */}

                <div>

                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Route Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                  <p className="text-xs text-gray-500 mt-1.5">
                    Inactive routes should not be used for current operations.
                  </p>

                </div>

              </div>


              {/* ==================================================
                  DISTANCE + DURATION
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* DISTANCE */}

                <div>

                  <label
                    htmlFor="distance_km"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Route Distance
                  </label>

                  <div className="relative">

                    <input
                      id="distance_km"
                      name="distance_km"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.distance_km
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 24.50"
                      className="w-full px-3 py-2.5 pr-14 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      km
                    </span>

                  </div>

                  <p className="text-xs text-gray-500 mt-1.5">
                    Approximate total route distance in kilometres.
                  </p>

                </div>


                {/* ESTIMATED DURATION */}

                <div>

                  <label
                    htmlFor="estimated_duration_minutes"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Estimated Duration
                  </label>

                  <div className="relative">

                    <input
                      id="estimated_duration_minutes"
                      name="estimated_duration_minutes"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        formData.estimated_duration_minutes
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 90"
                      className="w-full px-3 py-2.5 pr-20 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      minutes
                    </span>

                  </div>

                  <p className="text-xs text-gray-500 mt-1.5">
                    Approximate time required to complete the route.
                  </p>

                </div>

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
                  rows={4}
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
                  Optional. Describe the general coverage or area served by this route.
                </p>

              </div>


              {/* ==================================================
                  NOTES
              ================================================== */}

              <div>

                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Add any additional operational notes about this route..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Optional. Use this for internal transport or administrative notes.
                </p>

              </div>


              {/* ==================================================
                  INFORMATION NOTE
              ================================================== */}

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

                <div className="flex items-start gap-3">

                  <Clock
                    size={19}
                    className="text-purple-700 mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="font-medium text-purple-800">
                      Route timing
                    </p>

                    <p className="text-sm text-purple-700 mt-1">
                      The estimated duration above describes the overall
                      route. Individual pickup and drop-off times should
                      be configured on the route stages.
                    </p>

                  </div>

                </div>

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
                  disabled={saving}
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
                      <Save size={18} />

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
                  Each stage can have its own location, landmark and
                  pickup/drop-off times.
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