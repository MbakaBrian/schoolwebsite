import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Route as RouteIcon,
  Save,
  XCircle,
  DollarSign,
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

        } else if (
          typeof value === "object" &&
          value !== null
        ) {

          messages.push(
            `${field}: ${JSON.stringify(value)}`
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


const formatTimeForInput = (
  value
) => {

  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {

    const timeMatch =
      value.match(
        /T?(\d{2}:\d{2})/
      );

    if (timeMatch) {
      return timeMatch[1];
    }

    if (
      /^\d{2}:\d{2}(:\d{2})?$/.test(
        value
      )
    ) {

      return value.slice(
        0,
        5
      );

    }
  }

  return "";
};


const formatNumber = (
  value
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};


// ============================================================
// PAGE
// ============================================================

const StageFormPage = () => {

  const navigate =
    useNavigate();

  const {
    id: routeId,
    stageId,
  } = useParams();

  const isEditMode =
    Boolean(stageId);


  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] =
    useState({

      name: "",

      code: "",

      stage_type: "both",

      sequence: "1",

      location_description: "",

      landmark: "",

      latitude: "",

      longitude: "",

      distance_from_previous: "",

      pickup_time: "",

      dropoff_time: "",

      monthly_fee: "0.00",

      status: "active",

      notes: "",

    });


  // ==========================================================
  // ROUTE
  // ==========================================================

  const [route, setRoute] =
    useState(null);


  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD ROUTE + STAGE
  // ==========================================================

  useEffect(() => {

    const loadData =
      async () => {

        try {

          setLoading(true);
          setError("");

          // --------------------------------------------------
          // LOAD ROUTE
          // --------------------------------------------------

          const routeResponse =
            await axiosInstance.get(
              `/transport/routes/${routeId}/`
            );

          setRoute(
            routeResponse.data
          );


          // --------------------------------------------------
          // LOAD STAGE WHEN EDITING
          // --------------------------------------------------

          if (isEditMode) {

            const stageResponse =
              await axiosInstance.get(
                `/transport/stages/${stageId}/`
              );

            const stage =
              stageResponse.data;

            setFormData({

              name:
                stage?.name || "",

              code:
                stage?.code || "",

              stage_type:
                stage?.stage_type ||
                "both",

              sequence:
                formatNumber(
                  stage?.sequence ??
                  "1"
                ),

              location_description:
                stage?.location_description ||
                "",

              landmark:
                stage?.landmark ||
                "",

              latitude:
                formatNumber(
                  stage?.latitude
                ),

              longitude:
                formatNumber(
                  stage?.longitude
                ),

              distance_from_previous:
                formatNumber(
                  stage?.distance_from_previous
                ),

              pickup_time:
                formatTimeForInput(
                  stage?.pickup_time
                ),

              dropoff_time:
                formatTimeForInput(
                  stage?.dropoff_time
                ),

              monthly_fee:
                formatNumber(
                  stage?.monthly_fee ??
                  "0.00"
                ),

              status:
                stage?.status ||
                "active",

              notes:
                stage?.notes ||
                "",

            });

          }

        } catch (err) {

          console.error(
            "Failed to load stage information:",
            err
          );

          setError(
            getErrorMessage(
              err,
              "Failed to load route or stage information."
            )
          );

        } finally {

          setLoading(false);

        }

      };


    if (routeId) {
      loadData();
    }

  }, [
    routeId,
    stageId,
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

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {

    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    if (
      !formData.name.trim()
    ) {

      return (
        "Stage name is required."
      );

    }


    // --------------------------------------------------------
    // Code
    // --------------------------------------------------------

    if (
      !formData.code.trim()
    ) {

      return (
        "Stage code is required."
      );

    }


    // --------------------------------------------------------
    // Sequence
    // --------------------------------------------------------

    if (
      formData.sequence === ""
    ) {

      return (
        "Stage sequence is required."
      );

    }

    const sequence =
      Number(
        formData.sequence
      );

    if (
      Number.isNaN(sequence) ||
      sequence < 1
    ) {

      return (
        "Stage sequence must be at least 1."
      );

    }


    // --------------------------------------------------------
    // Distance
    // --------------------------------------------------------

    if (
      formData.distance_from_previous !==
      ""
    ) {

      const distance =
        Number(
          formData.distance_from_previous
        );

      if (
        Number.isNaN(distance) ||
        distance < 0
      ) {

        return (
          "Distance must be zero or greater."
        );

      }

    }


    // --------------------------------------------------------
    // Latitude
    // --------------------------------------------------------

    if (
      formData.latitude !== ""
    ) {

      const latitude =
        Number(
          formData.latitude
        );

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {

        return (
          "Latitude must be between -90 and 90."
        );

      }

    }


    // --------------------------------------------------------
    // Longitude
    // --------------------------------------------------------

    if (
      formData.longitude !== ""
    ) {

      const longitude =
        Number(
          formData.longitude
        );

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {

        return (
          "Longitude must be between -180 and 180."
        );

      }

    }


    // --------------------------------------------------------
    // Monthly fee
    // --------------------------------------------------------

    if (
      formData.monthly_fee === ""
    ) {

      return (
        "Monthly transport fee is required."
      );

    }

    const monthlyFee =
      Number(
        formData.monthly_fee
      );

    if (
      Number.isNaN(monthlyFee) ||
      monthlyFee < 0
    ) {

      return (
        "Monthly transport fee cannot be negative."
      );

    }


    // --------------------------------------------------------
    // Time
    // --------------------------------------------------------

    if (
      formData.pickup_time &&
      formData.dropoff_time &&
      formData.dropoff_time <
      formData.pickup_time
    ) {

      return (
        "Drop-off time cannot be earlier than pickup time."
      );

    }


    return null;
  };


  // ==========================================================
  // SAVE
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


      // ------------------------------------------------------
      // BUILD PAYLOAD
      // ------------------------------------------------------

      const payload = {

        route:
          Number(routeId),

        name:
          formData.name.trim(),

        code:
          formData.code.trim(),

        stage_type:
          formData.stage_type,

        sequence:
          Number(
            formData.sequence
          ),

        location_description:
          formData.location_description.trim(),

        landmark:
          formData.landmark.trim(),

        monthly_fee:
          Number(
            formData.monthly_fee
          ),

        status:
          formData.status,

        notes:
          formData.notes.trim(),

      };


      // ------------------------------------------------------
      // OPTIONAL DISTANCE
      // ------------------------------------------------------

      if (
        formData.distance_from_previous !==
        ""
      ) {

        payload.distance_from_previous =
          Number(
            formData.distance_from_previous
          );

      }


      // ------------------------------------------------------
      // OPTIONAL COORDINATES
      // ------------------------------------------------------

      if (
        formData.latitude !== ""
      ) {

        payload.latitude =
          Number(
            formData.latitude
          );

      }

      if (
        formData.longitude !== ""
      ) {

        payload.longitude =
          Number(
            formData.longitude
          );

      }


      // ------------------------------------------------------
      // OPTIONAL TIMES
      // ------------------------------------------------------

      if (
        formData.pickup_time
      ) {

        payload.pickup_time =
          formData.pickup_time;

      }

      if (
        formData.dropoff_time
      ) {

        payload.dropoff_time =
          formData.dropoff_time;

      }


      // ------------------------------------------------------
      // CREATE / UPDATE
      // ------------------------------------------------------

      let response;

      if (isEditMode) {

        /*
         * A stage remains attached to its original route.
         * Route reassignment should be handled separately if
         * it is ever required.
         */

        delete payload.route;

        response =
          await axiosInstance.patch(
            `/transport/stages/${stageId}/`,
            payload
          );

      } else {

        response =
          await axiosInstance.post(
            "/transport/stages/",
            payload
          );

      }


      const savedStage =
        response.data;

      console.log(
        "Saved stage:",
        savedStage
      );


      setSuccess(
        isEditMode
          ? "Stage updated successfully."
          : "Stage created successfully."
      );


      // ------------------------------------------------------
      // RETURN TO ROUTE
      // ------------------------------------------------------

      setTimeout(() => {

        navigate(
          `/transport/routes/${routeId}`
        );

      }, 600);


    } catch (err) {

      console.error(
        "Failed to save stage:",
        err
      );

      setError(
        getErrorMessage(
          err,
          isEditMode
            ? "The stage could not be updated."
            : "The stage could not be created."
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
            Loading stage information...
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ERROR WITHOUT ROUTE
  // ==========================================================

  if (!route) {

    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/transport/routes"
              )
            }
            className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-5"
          >

            <ArrowLeft
              size={16}
            />

            Back to Routes

          </button>


          <div className="bg-gray-50 border border-red-200 rounded-xl p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">

              <XCircle
                size={28}
              />

            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-4">
              Route not found
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              {error ||
                "The route associated with this stage could not be loaded."}
            </p>

          </div>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ROUTE INFORMATION
  // ==========================================================

  const routeName =
    route?.name ||
    "Transport Route";

  const routeCode =
    route?.code ||
    "—";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-4xl mx-auto">


        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">

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

          <Link
            to={`/transport/routes/${routeId}`}
            className="hover:text-purple-700"
          >
            {routeName}
          </Link>

          <ChevronRight
            size={15}
          />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Stage"
              : "New Stage"}
          </span>

        </div>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-start gap-3">

              <div className="w-12 h-12 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0">

                <MapPin
                  size={25}
                />

              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isEditMode
                    ? "Edit Route Stage"
                    : "Add Route Stage"}
                </h1>

                <p className="text-gray-600 mt-1">
                  {routeName}
                  {" "}
                  <span className="text-gray-400">
                    ({routeCode})
                  </span>
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  `/transport/routes/${routeId}`
                )
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >

              <ArrowLeft
                size={17}
              />

              Back to Route

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
                STAGE INFORMATION
            ================================================== */}

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                  <MapPin
                    size={19}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Stage Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Define the identity, type and position of this stage.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6 space-y-6">


              {/* =================================================
                  NAME + CODE
              ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Stage Name
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
                    placeholder="e.g. Bomet Town"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />

                </div>


                <div>

                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Stage Code
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
                    Must be unique within this route.
                  </p>

                </div>

              </div>


              {/* =================================================
                  TYPE + SEQUENCE
              ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="stage_type"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Stage Type
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    id="stage_type"
                    name="stage_type"
                    value={
                      formData.stage_type
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >

                    <option value="pickup">
                      Pickup
                    </option>

                    <option value="dropoff">
                      Drop-off
                    </option>

                    <option value="both">
                      Pickup & Drop-off
                    </option>

                    <option value="school">
                      School
                    </option>

                    <option value="stop">
                      General Stop
                    </option>

                  </select>

                </div>


                <div>

                  <label
                    htmlFor="sequence"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Sequence / Order
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <RouteIcon
                      size={17}
                      className="absolute left-3 top-3 text-gray-400"
                    />

                    <input
                      id="sequence"
                      name="sequence"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formData.sequence
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  LOCATION DESCRIPTION
              ================================================= */}

              <div>

                <label
                  htmlFor="location_description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Location Description
                </label>

                <textarea
                  id="location_description"
                  name="location_description"
                  rows={3}
                  value={
                    formData.location_description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the exact location of the stage..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* =================================================
                  LANDMARK
              ================================================= */}

              <div>

                <label
                  htmlFor="landmark"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Landmark
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    value={
                      formData.landmark
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Opposite Bomet Green Stadium"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>

            </div>


            {/* ==================================================
                TIMING
            ================================================== */}

            <div className="px-5 py-4 border-t border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                  <Clock
                    size={19}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Stage Timing
                  </h2>

                  <p className="text-sm text-gray-500">
                    Set the expected pickup and drop-off times.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="pickup_time"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Pickup Time
                  </label>

                  <input
                    id="pickup_time"
                    name="pickup_time"
                    type="time"
                    value={
                      formData.pickup_time
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>


                <div>

                  <label
                    htmlFor="dropoff_time"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Drop-off Time
                  </label>

                  <input
                    id="dropoff_time"
                    name="dropoff_time"
                    type="time"
                    value={
                      formData.dropoff_time
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>

            </div>


            {/* ==================================================
                LOCATION & DISTANCE
            ================================================== */}

            <div className="px-5 py-4 border-t border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                  <MapPin
                    size={19}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Location & Distance
                  </h2>

                  <p className="text-sm text-gray-500">
                    Optional geographic information and distance from the previous stage.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Distance */}

                <div>

                  <label
                    htmlFor="distance_from_previous"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Distance From Previous
                  </label>

                  <div className="relative">

                    <input
                      id="distance_from_previous"
                      name="distance_from_previous"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.distance_from_previous
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 pr-12 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      km
                    </span>

                  </div>

                </div>


                {/* Latitude */}

                <div>

                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={
                      formData.latitude
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="-1.1234567"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>


                {/* Longitude */}

                <div>

                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={
                      formData.longitude
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="35.1234567"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>

            </div>


            {/* ==================================================
                PRICING
            ================================================== */}

            <div className="px-5 py-4 border-t border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                  <DollarSign
                    size={19}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Transport Pricing
                  </h2>

                  <p className="text-sm text-gray-500">
                    Configure the current monthly transport fee for this stage.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <div className="max-w-md">

                <label
                  htmlFor="monthly_fee"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Monthly Transport Fee
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    KSh
                  </span>

                  <input
                    id="monthly_fee"
                    name="monthly_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.monthly_fee
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5000.00"
                    className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />

                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  This is the currently configured transport price for students using this stage.
                </p>

              </div>

              <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">

                <p className="text-sm text-purple-800">
                  <strong>Important:</strong>{" "}
                  This price represents the transport service configuration. The Finance module should later use it when creating student transport charges and financial records.
                </p>

              </div>

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            <div className="px-5 py-4 border-t border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                  <Check
                    size={19}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Stage Status
                  </h2>

                  <p className="text-sm text-gray-500">
                    Control whether this stage is currently available.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <div className="max-w-md">

                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Status
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

              </div>

            </div>


            {/* ==================================================
                NOTES
            ================================================== */}

            <div className="px-5 py-4 border-t border-b border-gray-200">

              <div>

                <h2 className="font-semibold text-gray-800">
                  Additional Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add any additional notes about this stage.
                </p>

              </div>

            </div>


            <div className="p-5 md:p-6">

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
                placeholder="Additional notes about this stage..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="px-5 py-4 bg-gray-100 border-t border-gray-200">

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/transport/routes/${routeId}`
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
                        ? "Update Stage"
                        : "Create Stage"}

                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </form>


        {/* ====================================================
            ROUTE CONTEXT
        ==================================================== */}

        <div className="mt-5 p-4 rounded-xl bg-purple-50 border border-purple-200">

          <div className="flex items-start gap-3">

            <RouteIcon
              size={19}
              className="text-purple-700 mt-0.5"
            />

            <div>

              <p className="font-semibold text-purple-800">
                Route
              </p>

              <p className="text-sm text-purple-700 mt-1">

                This stage belongs to{" "}

                <strong>
                  {routeName}
                </strong>

                {" "}
                ({routeCode}).

                After saving, you will return to
                the route details page.

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default StageFormPage;