import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Edit,
  Eye,
  Map,
  Plus,
  RefreshCw,
  Search,
  Route as RouteIcon,
  ToggleLeft,
  ToggleRight,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

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


const getRouteName = (route) => {
  return (
    getValue(
      route,
      "name",
      "route_name",
      "title"
    ) || "Unnamed Route"
  );
};


const getRouteCode = (route) => {
  return (
    getValue(
      route,
      "code",
      "route_code"
    ) || "—"
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
    ) || ""
  );
};


const getIsActive = (route) => {
  if (
    route?.is_active !== undefined &&
    route?.is_active !== null
  ) {
    return Boolean(
      route.is_active
    );
  }

  if (
    route?.status !== undefined &&
    route?.status !== null
  ) {
    return (
      String(route.status)
        .toLowerCase() === "active"
    );
  }

  return true;
};


const getStageCount = (route) => {
  if (
    Array.isArray(route?.stages)
  ) {
    return route.stages.length;
  }

  if (
    route?.stage_count !== undefined &&
    route?.stage_count !== null
  ) {
    return Number(
      route.stage_count
    );
  }

  if (
    route?.stages_count !== undefined &&
    route?.stages_count !== null
  ) {
    return Number(
      route.stages_count
    );
  }

  return 0;
};


const getCreatedDate = (
  route
) => {
  const value =
    getValue(
      route,
      "created_at"
    );

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


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  active,
}) => {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      Inactive
    </span>
  );
};


// ============================================================
// PAGE
// ============================================================

const RoutesPage = () => {
  const navigate = useNavigate();


  // ==========================================================
  // DATA
  // ==========================================================

  const [routes, setRoutes] =
    useState([]);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);


  // ==========================================================
  // LOAD ROUTES
  // ==========================================================

  const loadRoutes = async (
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
          "/transport/routes/"
        );

      setRoutes(
        extractList(response)
      );

    } catch (err) {
      console.error(
        "Failed to load transport routes:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Failed to load transport routes."
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
    loadRoutes();
  }, []);


  // ==========================================================
  // FILTERED ROUTES
  // ==========================================================

  const filteredRoutes =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      return routes.filter(
        (route) => {

          const name =
            getRouteName(
              route
            ).toLowerCase();

          const code =
            getRouteCode(
              route
            ).toLowerCase();

          const description =
            getRouteDescription(
              route
            ).toLowerCase();

          const active =
            getIsActive(route);

          const matchesSearch =
            !search ||
            name.includes(search) ||
            code.includes(search) ||
            description.includes(
              search
            );

          const matchesStatus =
            statusFilter === "all" ||
            (
              statusFilter === "active" &&
              active
            ) ||
            (
              statusFilter === "inactive" &&
              !active
            );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      routes,
      searchTerm,
      statusFilter,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalRoutes =
    routes.length;

  const activeRoutes =
    routes.filter(
      (route) =>
        getIsActive(route)
    ).length;

  const inactiveRoutes =
    routes.filter(
      (route) =>
        !getIsActive(route)
    ).length;

  const totalStages =
    routes.reduce(
      (
        total,
        route
      ) =>
        total +
        getStageCount(
          route
        ),
      0
    );


  // ==========================================================
  // TOGGLE ROUTE STATUS
  // ==========================================================

  const toggleRouteStatus =
    async (
      route
    ) => {

      const routeId =
        getId(route);

      if (!routeId) {
        return;
      }

      const currentlyActive =
        getIsActive(route);

      const confirmed =
        window.confirm(
          currentlyActive
            ? `Deactivate "${getRouteName(
                route
              )}"?`
            : `Activate "${getRouteName(
                route
              )}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setUpdatingId(
          routeId
        );

        setError("");
        setSuccess("");

        await axiosInstance.patch(
          `/transport/routes/${routeId}/`,
          {
            is_active:
              !currentlyActive,
          }
        );

        setSuccess(
          currentlyActive
            ? "Route deactivated successfully."
            : "Route activated successfully."
        );

        await loadRoutes(
          true
        );

      } catch (err) {

        console.error(
          "Failed to update route status:",
          err
        );

        const detail =
          err.response?.data?.detail;

        if (
          typeof detail === "string"
        ) {
          setError(detail);
        } else {
          setError(
            "The route status could not be updated."
          );
        }

      } finally {
        setUpdatingId(null);
      }
    };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-800 animate-spin" />

          <p className="text-gray-600 mt-4">
            Loading transport routes...
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

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Routes & Stages
          </span>

        </div>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0">
                <RouteIcon size={28} />
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Routes & Stages
                </h1>

                <p className="text-gray-600 mt-1">
                  Manage school transport routes and their pickup or drop-off stages.
                </p>

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  loadRoutes(true)
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
                to="/transport/routes/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus size={17} />

                Add Route

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
            STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">


          {/* Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Total Routes
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {totalRoutes}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Map size={21} />
              </div>

            </div>

          </div>


          {/* Active */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Active Routes
                </p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {activeRoutes}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                <Activity size={21} />
              </div>

            </div>

          </div>


          {/* Inactive */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Inactive Routes
                </p>

                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {inactiveRoutes}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
                <ToggleLeft size={21} />
              </div>

            </div>

          </div>


          {/* Stages */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Total Stages
                </p>

                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {totalStages}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <RouteIcon size={21} />
              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            {/* Search */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search
              </label>

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search route name, code or description..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>


            {/* Status */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="all">
                  All Routes
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* ====================================================
            ROUTES TABLE
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-gray-800">
                  Transport Routes
                </h2>

                <p className="text-sm text-gray-500 mt-0.5">
                  Showing{" "}
                  {filteredRoutes.length}
                  {" "}
                  of{" "}
                  {routes.length}
                  {" "}
                  route
                  {routes.length === 1
                    ? ""
                    : "s"}
                </p>

              </div>

            </div>

          </div>


          {filteredRoutes.length === 0 ? (

            <div className="p-10 text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

                <RouteIcon
                  size={28}
                />

              </div>

              <h3 className="font-semibold text-gray-800 text-lg">
                No routes found
              </h3>

              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                {routes.length === 0
                  ? "No transport routes have been created yet."
                  : "No routes match your current search or status filter."}
              </p>

              {routes.length === 0 && (
                <Link
                  to="/transport/routes/new"
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
                >
                  <Plus size={17} />
                  Create First Route
                </Link>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Route
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Code
                    </th>

                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Stages
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Created
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-200">

                  {filteredRoutes.map(
                    (route) => {

                      const routeId =
                        getId(
                          route
                        );

                      const active =
                        getIsActive(
                          route
                        );

                      return (
                        <tr
                          key={
                            routeId
                          }
                          className="hover:bg-gray-100 transition"
                        >

                          {/* Route */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">

                                <RouteIcon
                                  size={18}
                                />

                              </div>

                              <div>

                                <p className="font-semibold text-gray-800">
                                  {getRouteName(
                                    route
                                  )}
                                </p>

                                {getRouteDescription(
                                  route
                                ) && (
                                  <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                                    {getRouteDescription(
                                      route
                                    )}
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>


                          {/* Code */}
                          <td className="px-5 py-4">

                            <span className="text-sm font-medium text-gray-700">
                              {getRouteCode(
                                route
                              )}
                            </span>

                          </td>


                          {/* Stages */}
                          <td className="px-5 py-4 text-center">

                            <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
                              {getStageCount(
                                route
                              )}
                            </span>

                          </td>


                          {/* Created */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {getCreatedDate(
                              route
                            )}
                          </td>


                          {/* Status */}
                          <td className="px-5 py-4">

                            <StatusBadge
                              active={
                                active
                              }
                            />

                          </td>


                          {/* Actions */}
                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-2">


                              {/* View */}
                              <Link
                                to={`/transport/routes/${routeId}`}
                                title="View route"
                                className="p-2 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                              >

                                <Eye
                                  size={17}
                                />

                              </Link>


                              {/* Edit */}
                              <Link
                                to={`/transport/routes/${routeId}/edit`}
                                title="Edit route"
                                className="p-2 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                              >

                                <Edit
                                  size={17}
                                />

                              </Link>


                              {/* Toggle */}
                              <button
                                type="button"
                                title={
                                  active
                                    ? "Deactivate route"
                                    : "Activate route"
                                }
                                onClick={() =>
                                  toggleRouteStatus(
                                    route
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  routeId
                                }
                                className={`p-2 rounded-lg ${
                                  active
                                    ? "text-green-600 hover:bg-green-100"
                                    : "text-gray-500 hover:bg-gray-200"
                                } disabled:opacity-50`}
                              >

                                {updatingId ===
                                routeId ? (
                                  <RefreshCw
                                    size={
                                      17
                                    }
                                    className="animate-spin"
                                  />
                                ) : active ? (
                                  <ToggleRight
                                    size={
                                      19
                                    }
                                  />
                                ) : (
                                  <ToggleLeft
                                    size={
                                      19
                                    }
                                  />
                                )}

                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ====================================================
            QUICK NAVIGATION
        ==================================================== */}

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">

          <div className="flex flex-wrap items-center gap-2">

            <Link
              to="/transport"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              <ArrowLeft
                size={16}
              />
              Transport Dashboard
            </Link>

            <Link
              to="/transport/vehicles"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              Vehicles
            </Link>

            <Link
              to="/transport/drivers"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              Drivers
            </Link>

            <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
              Routes & Stages
            </span>

            <Link
              to="/transport/assignments"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              Assignments
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};


export default RoutesPage;

