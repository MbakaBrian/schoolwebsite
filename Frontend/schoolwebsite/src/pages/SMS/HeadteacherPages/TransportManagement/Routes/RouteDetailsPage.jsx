
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronRight,
  Edit,
  GripVertical,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Users,
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

const getId = (item) => {
  if (!item) return null;

  return item.id ?? item.pk ?? null;
};


const getValue = (
  object,
  ...keys
) => {
  if (!object) return null;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return null;
};


const extractList = (
  response
) => {
  const data =
    response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.results
    )
  ) {
    return data.results;
  }

  return [];
};


const getRouteName = (
  route
) => {
  return (
    getValue(
      route,
      "name",
      "route_name",
      "title"
    ) ||
    "Unnamed Route"
  );
};


const getRouteCode = (
  route
) => {
  return (
    getValue(
      route,
      "code",
      "route_code"
    ) ||
    "—"
  );
};


const getRouteDescription = (
  route
) => {
  return (
    getValue(
      route,
      "description",
      "notes"
    ) ||
    "No description provided."
  );
};


const getIsActive = (
  route
) => {
  if (
    route?.is_active !==
      undefined &&
    route?.is_active !==
      null
  ) {
    return Boolean(
      route.is_active
    );
  }

  if (
    route?.status !==
      undefined &&
    route?.status !==
      null
  ) {
    return (
      String(
        route.status
      ).toLowerCase() ===
      "active"
    );
  }

  return true;
};


const getStageName = (
  stage
) => {
  return (
    getValue(
      stage,
      "name",
      "stage_name",
      "title"
    ) ||
    "Unnamed Stage"
  );
};


const getStageLocation = (
  stage
) => {
  return (
    getValue(
      stage,
      "location",
      "address",
      "description"
    ) ||
    "Location not specified"
  );
};


const getStageOrder = (
  stage,
  index
) => {
  const order =
    getValue(
      stage,
      "order",
      "sequence",
      "stage_order",
      "position"
    );

  return (
    order ??
    index + 1
  );
};


const getStageActive = (
  stage
) => {
  if (
    stage?.is_active !==
      undefined &&
    stage?.is_active !==
      null
  ) {
    return Boolean(
      stage.is_active
    );
  }

  if (
    stage?.status !==
      undefined &&
    stage?.status !==
      null
  ) {
    return (
      String(
        stage.status
      ).toLowerCase() ===
      "active"
    );
  }

  return true;
};


const formatDate = (
  value
) => {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatTime = (
  value
) => {
  if (!value) return null;

  const date =
    new Date(
      `1970-01-01T${value}`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-KE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  active,
}) => {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      Inactive
    </span>
  );
};


// ============================================================
// PAGE
// ============================================================

const RouteDetailsPage = () => {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [route, setRoute] =
    useState(null);

  const [stages, setStages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [updatingStageId, setUpdatingStageId] =
    useState(null);


  // ==========================================================
  // LOAD ROUTE
  // ==========================================================

  const loadRoute = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const response =
        await axiosInstance.get(
          `/transport/routes/${id}/`
        );

      const routeData =
        response.data;

      setRoute(
        routeData
      );


      // ------------------------------------------------------
      // STAGES
      // ------------------------------------------------------

      /*
       * Depending on the serializer, stages may already be
       * embedded inside the route detail response.
       *
       * If they are not embedded, fetch them separately.
       */

      if (
        Array.isArray(
          routeData?.stages
        )
      ) {

        setStages(
          routeData.stages
        );

      } else {

        try {

          const stageResponse =
            await axiosInstance.get(
              "/transport/stages/",
              {
                params: {
                  route: id,
                },
              }
            );

          setStages(
            extractList(
              stageResponse
            )
          );

        } catch (
          stageError
        ) {

          /*
           * Do not fail the entire route details page if
           * stages are not exposed through the current API.
           */

          console.warn(
            "Could not load route stages:",
            stageError
          );

          setStages([]);
        }
      }

    } catch (err) {

      console.error(
        "Failed to load route:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (
        typeof detail ===
        "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Failed to load route information."
        );
      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    if (id) {
      loadRoute();
    }

  }, [id]);


  // ==========================================================
  // SORT STAGES
  // ==========================================================

  const sortedStages =
    useMemo(() => {

      return [
        ...stages,
      ].sort(
        (
          first,
          second
        ) =>
          Number(
            getStageOrder(
              first,
              0
            )
          ) -
          Number(
            getStageOrder(
              second,
              0
            )
          )
      );

    }, [
      stages,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const activeStages =
    stages.filter(
      (stage) =>
        getStageActive(
          stage
        )
    ).length;


  const inactiveStages =
    stages.length -
    activeStages;


  // ==========================================================
  // TOGGLE STAGE STATUS
  // ==========================================================

  const toggleStageStatus =
    async (
      stage
    ) => {

      const stageId =
        getId(stage);

      if (!stageId) {
        return;
      }

      const currentlyActive =
        getStageActive(
          stage
        );

      const confirmed =
        window.confirm(
          currentlyActive
            ? `Deactivate "${getStageName(
                stage
              )}"?`
            : `Activate "${getStageName(
                stage
              )}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setUpdatingStageId(
          stageId
        );

        setError("");
        setSuccess("");

        await axiosInstance.patch(
          `/transport/stages/${stageId}/`,
          {
            is_active:
              !currentlyActive,
          }
        );

        setSuccess(
          currentlyActive
            ? "Stage deactivated successfully."
            : "Stage activated successfully."
        );

        await loadRoute(
          true
        );

      } catch (err) {

        console.error(
          "Failed to update stage:",
          err
        );

        const detail =
          err.response?.data?.detail;

        if (
          typeof detail ===
          "string"
        ) {
          setError(detail);
        } else {
          setError(
            "The stage status could not be updated."
          );
        }

      } finally {

        setUpdatingStageId(
          null
        );

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
  // ERROR
  // ==========================================================

  if (
    error ||
    !route
  ) {

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
                "The requested route could not be loaded."}
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ROUTE DATA
  // ==========================================================

  const routeName =
    getRouteName(
      route
    );

  const routeCode =
    getRouteCode(
      route
    );

  const routeActive =
    getIsActive(
      route
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">


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
            {routeName}
          </span>

        </div>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0">

                <RouteIcon
                  size={28}
                />

              </div>


              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {routeName}
                  </h1>

                  <StatusBadge
                    active={
                      routeActive
                    }
                  />

                </div>

                <p className="text-gray-600 mt-1">
                  Route Code:{" "}
                  <span className="font-medium">
                    {routeCode}
                  </span>
                </p>

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  loadRoute(
                    true
                  )
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >

                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>


              <Link
                to={`/transport/routes/${id}/edit`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >

                <Edit
                  size={17}
                />

                Edit Route

              </Link>


              <Link
                to={`/transport/routes/${id}/stages/new`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus
                  size={17}
                />

                Add Stage

              </Link>

            </div>

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
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">

            {success}

          </div>
        )}


        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">


          {/* Route status */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Route Status
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {routeActive
                    ? "Active"
                    : "Inactive"}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                <Activity
                  size={21}
                />

              </div>

            </div>

          </div>


          {/* Total stages */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Total Stages
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stages.length}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                <MapPin
                  size={21}
                />

              </div>

            </div>

          </div>


          {/* Active stages */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Active Stages
                </p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {activeStages}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">

                <Activity
                  size={21}
                />

              </div>

            </div>

          </div>


          {/* Inactive stages */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Inactive Stages
                </p>

                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {inactiveStages}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">

                <XCircle
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


          {/* ==================================================
              ROUTE INFORMATION
          ================================================== */}

          <div className="xl:col-span-1">

            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">

                    <Map
                      size={20}
                    />

                  </div>

                  <div>

                    <h2 className="font-semibold text-gray-800">
                      Route Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Basic route details.
                    </p>

                  </div>

                </div>

              </div>


              <div className="p-5">

                <div className="space-y-1">

                  <div className="flex justify-between gap-4 py-3 border-b border-gray-100">

                    <span className="text-sm text-gray-500">
                      Route Name
                    </span>

                    <span className="text-sm font-medium text-gray-800 text-right">
                      {routeName}
                    </span>

                  </div>


                  <div className="flex justify-between gap-4 py-3 border-b border-gray-100">

                    <span className="text-sm text-gray-500">
                      Route Code
                    </span>

                    <span className="text-sm font-medium text-gray-800">
                      {routeCode}
                    </span>

                  </div>


                  <div className="flex justify-between gap-4 py-3 border-b border-gray-100">

                    <span className="text-sm text-gray-500">
                      Status
                    </span>

                    <StatusBadge
                      active={
                        routeActive
                      }
                    />

                  </div>


                  <div className="flex justify-between gap-4 py-3 border-b border-gray-100">

                    <span className="text-sm text-gray-500">
                      Created
                    </span>

                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(
                        route.created_at
                      )}
                    </span>

                  </div>


                  <div className="flex justify-between gap-4 py-3">

                    <span className="text-sm text-gray-500">
                      Last Updated
                    </span>

                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(
                        route.updated_at
                      )}
                    </span>

                  </div>

                </div>


                <div className="mt-5">

                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </p>

                  <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                    {getRouteDescription(
                      route
                    )}
                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-6">

              <h3 className="font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">

                <Link
                  to={`/transport/routes/${id}/stages/new`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100"
                >

                  <Plus
                    size={18}
                  />

                  <span className="text-sm font-medium">
                    Add Stage
                  </span>

                </Link>


                <Link
                  to="/transport/assignments"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >

                  <Users
                    size={18}
                  />

                  <span className="text-sm font-medium">
                    Transport Assignments
                  </span>

                </Link>


                <Link
                  to="/transport/vehicles"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >

                  <Car
                    size={18}
                  />

                  <span className="text-sm font-medium">
                    Vehicles
                  </span>

                </Link>

              </div>

            </div>

          </div>


          {/* ==================================================
              STAGES
          ================================================== */}

          <div className="xl:col-span-2">

            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>

                    <h2 className="font-semibold text-gray-800 text-lg">
                      Route Stages
                    </h2>

                    <p className="text-sm text-gray-500 mt-0.5">
                      Pickup and drop-off points in route order.
                    </p>

                  </div>


                  <Link
                    to={`/transport/routes/${id}/stages/new`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-800 text-white hover:bg-purple-900 text-sm"
                  >

                    <Plus
                      size={16}
                    />

                    Add Stage

                  </Link>

                </div>

              </div>


              {sortedStages.length ===
              0 ? (

                <div className="p-10 text-center">

                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

                    <MapPin
                      size={28}
                    />

                  </div>

                  <h3 className="font-semibold text-gray-800 text-lg">
                    No stages yet
                  </h3>

                  <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                    Add the first pickup or drop-off stage to this route.
                  </p>

                  <Link
                    to={`/transport/routes/${id}/stages/new`}
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
                  >

                    <Plus
                      size={17}
                    />

                    Add First Stage

                  </Link>

                </div>

              ) : (

                <div className="p-5">

                  <div className="relative">

                    {/* Vertical line */}
                    <div className="absolute left-[22px] top-7 bottom-7 w-px bg-gray-300" />


                    <div className="space-y-3">

                      {sortedStages.map(
                        (
                          stage,
                          index
                        ) => {

                          const stageId =
                            getId(
                              stage
                            );

                          const active =
                            getStageActive(
                              stage
                            );

                          const order =
                            getStageOrder(
                              stage,
                              index
                            );

                          const time =
                            getValue(
                              stage,
                              "pickup_time",
                              "dropoff_time",
                              "time"
                            );

                          const stageType =
                            getValue(
                              stage,
                              "stage_type",
                              "type"
                            );

                          return (
                            <div
                              key={
                                stageId ||
                                index
                              }
                              className="relative flex gap-4"
                            >

                              {/* Order */}
                              <div className="relative z-10 w-11 h-11 shrink-0 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">

                                {order}

                              </div>


                              {/* Stage card */}
                              <div className="flex-1 min-w-0 border border-gray-200 rounded-xl p-4 bg-white hover:border-purple-200 transition">

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                                  <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">

                                      <h3 className="font-semibold text-gray-800">
                                        {getStageName(
                                          stage
                                        )}
                                      </h3>

                                      <StatusBadge
                                        active={
                                          active
                                        }
                                      />

                                    </div>


                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">

                                      <span className="inline-flex items-center gap-1.5">

                                        <MapPin
                                          size={
                                            14
                                          }
                                        />

                                        {getStageLocation(
                                          stage
                                        )}

                                      </span>


                                      {stageType && (
                                        <span className="inline-flex items-center gap-1.5">

                                          <RouteIcon
                                            size={
                                              14
                                            }
                                          />

                                          {String(
                                            stageType
                                          )
                                            .replace(
                                              /_/g,
                                              " "
                                            )}

                                        </span>
                                      )}


                                      {time && (
                                        <span className="inline-flex items-center gap-1.5">

                                          <CalendarDays
                                            size={
                                              14
                                            }
                                          />

                                          {formatTime(
                                            time
                                          )}

                                        </span>
                                      )}

                                    </div>


                                    {getValue(
                                      stage,
                                      "description",
                                      "notes"
                                    ) && (
                                      <p className="text-sm text-gray-500 mt-2">
                                        {getValue(
                                          stage,
                                          "description",
                                          "notes"
                                        )}
                                      </p>
                                    )}

                                  </div>


                                  {/* Actions */}
                                  <div className="flex items-center gap-1 shrink-0">

                                    {stageId && (
                                      <Link
                                        to={`/transport/routes/${id}/stages/${stageId}/edit`}
                                        title="Edit stage"
                                        className="p-2 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                                      >

                                        <Edit
                                          size={
                                            16
                                          }
                                        />

                                      </Link>
                                    )}


                                    {stageId && (
                                      <button
                                        type="button"
                                        title={
                                          active
                                            ? "Deactivate stage"
                                            : "Activate stage"
                                        }
                                        onClick={() =>
                                          toggleStageStatus(
                                            stage
                                          )
                                        }
                                        disabled={
                                          updatingStageId ===
                                          stageId
                                        }
                                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                      >

                                        {updatingStageId ===
                                        stageId ? (
                                          <RefreshCw
                                            size={
                                              16
                                            }
                                            className="animate-spin"
                                          />
                                        ) : active ? (
                                          <ChevronDown
                                            size={
                                              17
                                            }
                                          />
                                        ) : (
                                          <ChevronRight
                                            size={
                                              17
                                            }
                                          />
                                        )}

                                      </button>
                                    )}

                                  </div>

                                </div>


                                {/* Additional stage data */}
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                                  {getValue(
                                    stage,
                                    "distance_from_previous",
                                    "distance"
                                  ) !== null && (
                                    <span>
                                      Distance:{" "}
                                      <strong className="text-gray-700">
                                        {getValue(
                                          stage,
                                          "distance_from_previous",
                                          "distance"
                                        )}{" "}
                                        km
                                      </strong>
                                    </span>
                                  )}


                                  {getValue(
                                    stage,
                                    "latitude"
                                  ) !== null && (
                                    <span>
                                      Latitude:{" "}
                                      <strong className="text-gray-700">
                                        {getValue(
                                          stage,
                                          "latitude"
                                        )}
                                      </strong>
                                    </span>
                                  )}


                                  {getValue(
                                    stage,
                                    "longitude"
                                  ) !== null && (
                                    <span>
                                      Longitude:{" "}
                                      <strong className="text-gray-700">
                                        {getValue(
                                          stage,
                                          "longitude"
                                        )}
                                      </strong>
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* ====================================================
            FOOTER NAVIGATION
        ==================================================== */}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <Link
            to="/transport/routes"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >

            <ArrowLeft
              size={17}
            />

            Back to Routes

          </Link>


          <Link
            to={`/transport/routes/${id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
          >

            <Edit
              size={17}
            />

            Edit Route

          </Link>

        </div>

      </div>

    </div>
  );
};


export default RouteDetailsPage;

