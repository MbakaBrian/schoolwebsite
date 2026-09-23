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


const formatTimeForInput = (
  value
) => {
  if (!value) {
    return "";
  }

  /*
   * Handles:
   * 08:30
   * 08:30:00
   * ISO datetime values containing a time.
   */

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
      stage_type: "pickup",
      location: "",
      description: "",
      sequence: "",
      pickup_time: "",
      dropoff_time: "",
      distance_from_previous: "",
      latitude: "",
      longitude: "",
      is_active: true,
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
                stage?.name ||
                stage?.stage_name ||
                "",

              stage_type:
                stage?.stage_type ||
                stage?.type ||
                "pickup",

              location:
                stage?.location ||
                stage?.address ||
                "",

              description:
                stage?.description ||
                stage?.notes ||
                "",

              sequence:
                formatNumber(
                  stage?.sequence ??
                    stage?.order ??
                    stage?.stage_order ??
                    stage?.position ??
                    ""
                ),

              pickup_time:
                formatTimeForInput(
                  stage?.pickup_time
                ),

              dropoff_time:
                formatTimeForInput(
                  stage?.dropoff_time
                ),

              distance_from_previous:
                formatNumber(
                  stage?.distance_from_previous ??
                    stage?.distance ??
                    ""
                ),

              latitude:
                formatNumber(
                  stage?.latitude
                ),

              longitude:
                formatNumber(
                  stage?.longitude
                ),

              is_active:
                stage?.is_active !==
                undefined
                  ? Boolean(
                      stage.is_active
                    )
                  : String(
                      stage?.status ||
                        "active"
                    ).toLowerCase() ===
                    "active",
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
      return "Stage name is required.";
    }

    if (
      !formData.location.trim()
    ) {
      return "Stage location is required.";
    }

    if (
      !formData.stage_type
    ) {
      return "Stage type is required.";
    }

    if (
      formData.sequence !== ""
    ) {

      const sequence =
        Number(
          formData.sequence
        );

      if (
        Number.isNaN(
          sequence
        ) ||
        sequence < 1
      ) {
        return "Stage sequence must be a positive number.";
      }
    }


    if (
      formData.distance_from_previous !==
      ""
    ) {

      const distance =
        Number(
          formData.distance_from_previous
        );

      if (
        Number.isNaN(
          distance
        ) ||
        distance < 0
      ) {
        return "Distance must be zero or greater.";
      }
    }


    if (
      formData.latitude !== ""
    ) {

      const latitude =
        Number(
          formData.latitude
        );

      if (
        Number.isNaN(
          latitude
        ) ||
        latitude < -90 ||
        latitude > 90
      ) {
        return "Latitude must be between -90 and 90.";
      }
    }


    if (
      formData.longitude !== ""
    ) {

      const longitude =
        Number(
          formData.longitude
        );

      if (
        Number.isNaN(
          longitude
        ) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return "Longitude must be between -180 and 180.";
      }
    }


    if (
      formData.pickup_time &&
      formData.dropoff_time
    ) {

      if (
        formData.dropoff_time <
        formData.pickup_time
      ) {
        return "Drop-off time cannot be earlier than pickup time.";
      }
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

        stage_type:
          formData.stage_type,

        location:
          formData.location.trim(),

        description:
          formData.description.trim(),

        is_active:
          formData.is_active,
      };


      // ------------------------------------------------------
      // OPTIONAL NUMERIC FIELDS
      // ------------------------------------------------------

      if (
        formData.sequence !== ""
      ) {
        payload.sequence =
          Number(
            formData.sequence
          );
      }


      if (
        formData.distance_from_previous !==
        ""
      ) {
        payload.distance_from_previous =
          Number(
            formData.distance_from_previous
          );
      }


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
      // OPTIONAL TIME FIELDS
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
         * Route is intentionally included only if the API
         * permits route reassignment. Normally the stage
         * remains attached to the same route.
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

      }, 500);


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
    route?.route_name ||
    route?.title ||
    "Transport Route";


  const routeCode =
    route?.code ||
    route?.route_code ||
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
                BASIC STAGE INFORMATION
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
                    Define the location and position of this stage on the route.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6 space-y-6">


              {/* =================================================
                  STAGE NAME
              ================================================= */}

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


              {/* =================================================
                  STAGE TYPE
              ================================================= */}

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

                <p className="text-xs text-gray-500 mt-1.5">
                  Select how this location is used during transport operations.
                </p>

              </div>


              {/* =================================================
                  LOCATION
              ================================================= */}

              <div>

                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Location
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Bomet Town Bus Stage"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

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
                  placeholder="Additional information about this stage..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* =================================================
                  SEQUENCE
              ================================================= */}

              <div>

                <label
                  htmlFor="sequence"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Sequence / Order
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
                    placeholder="e.g. 1"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  Determines the order in which stages appear on the route.
                </p>

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
                    Optional pickup and drop-off times.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 md:p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* Pickup time */}
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


                {/* Drop-off time */}
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
                    Optional geographic and route-distance information.
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
                    placeholder="-1.123456"
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
                    placeholder="35.123456"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>

              <p className="text-xs text-gray-500 mt-3">
                Coordinates are optional. They can later be used for route mapping and location-based transport features.
              </p>

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
                    Active Stage
                  </span>

                  <span className="block text-sm text-gray-500 mt-0.5">
                    Active stages can be used for current student transport assignments.
                  </span>

                </span>

              </label>

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
                After saving, you will return to the route details page.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default StageFormPage;

