import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bus,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// HELPERS
// ==================================================

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
  if (!item) {
    return null;
  }

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return item;
  }

  return item.id ?? item.pk ?? null;
};


const getStudent = (assignment) => {
  return assignment?.student || null;
};


const getStudentName = (student) => {
  if (!student) {
    return "Unknown Student";
  }

  if (student.full_name) {
    return student.full_name;
  }

  return [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown Student";
};


const getAdmissionNumber = (student) => {
  if (!student) {
    return "No admission number";
  }

  return (
    student.admission_number ||
    student.admission_no ||
    "No admission number"
  );
};


const getRouteName = (assignment) => {
  const route =
    assignment?.route;

  if (
    route &&
    typeof route === "object"
  ) {
    return (
      route.name ||
      route.route_name ||
      route.title ||
      "Unnamed Route"
    );
  }

  return (
    assignment?.route_name ||
    assignment?.route_title ||
    "No route"
  );
};


const getRouteCode = (assignment) => {
  const route =
    assignment?.route;

  if (
    route &&
    typeof route === "object"
  ) {
    return (
      route.code ||
      route.route_code ||
      ""
    );
  }

  return (
    assignment?.route_code ||
    ""
  );
};


const getStageName = (assignment) => {
  const stage =
    assignment?.stage;

  if (
    stage &&
    typeof stage === "object"
  ) {
    return (
      stage.name ||
      stage.stage_name ||
      stage.title ||
      "Unnamed Stage"
    );
  }

  return (
    assignment?.stage_name ||
    "No stage"
  );
};


const getStatus = (assignment) => {
  if (
    assignment?.status
  ) {
    return assignment.status;
  }

  if (
    typeof assignment?.is_active === "boolean"
  ) {
    return assignment.is_active
      ? "active"
      : "inactive";
  }

  return "active";
};


const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const getStatusClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";

    case "inactive":
      return "bg-gray-100 text-gray-600";

    case "ended":
      return "bg-gray-100 text-gray-600";

    case "suspended":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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


// ==================================================
// COMPONENT
// ==================================================

const TransportAssignmentsPage = () => {
  const navigate = useNavigate();


  // ==================================================
  // DATA
  // ==================================================

  const [
    assignments,
    setAssignments,
  ] = useState([]);

  const [
    routes,
    setRoutes,
  ] = useState([]);


  // ==================================================
  // FILTERS
  // ==================================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    routeFilter,
    setRouteFilter,
  ] = useState("all");


  // ==================================================
  // UI
  // ==================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentsResponse,
        routesResponse,
      ] = await Promise.all([
        axiosInstance.get(
          "/transport/assignments/"
        ),

        axiosInstance.get(
          "/transport/routes/"
        ),
      ]);

      setAssignments(
        extractList(
          assignmentsResponse
        )
      );

      setRoutes(
        extractList(
          routesResponse
        )
      );

    } catch (err) {
      console.error(
        "Failed to load transport assignments:",
        err
      );

      setError(
        "Failed to load transport assignments."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==================================================
  // FILTERED ASSIGNMENTS
  // ==================================================

  const filteredAssignments =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      return assignments.filter(
        (assignment) => {

          const student =
            getStudent(
              assignment
            );

          const studentName =
            getStudentName(
              student
            ).toLowerCase();

          const admissionNumber =
            getAdmissionNumber(
              student
            ).toLowerCase();

          const routeName =
            getRouteName(
              assignment
            ).toLowerCase();

          const routeCode =
            getRouteCode(
              assignment
            ).toLowerCase();

          const stageName =
            getStageName(
              assignment
            ).toLowerCase();

          const status =
            getStatus(
              assignment
            );


          // --------------------------------------------
          // SEARCH
          // --------------------------------------------

          const matchesSearch =
            !search ||
            studentName.includes(
              search
            ) ||
            admissionNumber.includes(
              search
            ) ||
            routeName.includes(
              search
            ) ||
            routeCode.includes(
              search
            ) ||
            stageName.includes(
              search
            );


          // --------------------------------------------
          // STATUS
          // --------------------------------------------

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;


          // --------------------------------------------
          // ROUTE
          // --------------------------------------------

          const assignmentRouteId =
            getId(
              assignment?.route
            ) ??
            assignment?.route;

          const matchesRoute =
            routeFilter === "all" ||
            String(
              assignmentRouteId
            ) === String(
              routeFilter
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesRoute
          );
        }
      );

    }, [
      assignments,
      searchTerm,
      statusFilter,
      routeFilter,
    ]);


  // ==================================================
  // STATISTICS
  // ==================================================

  const totalAssignments =
    assignments.length;

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        getStatus(
          assignment
        ) === "active"
    ).length;

  const inactiveAssignments =
    assignments.filter(
      (assignment) =>
        getStatus(
          assignment
        ) !== "active"
    ).length;

  const routesInUse =
    new Set(
      assignments
        .map(
          (assignment) =>
            getId(
              assignment?.route
            ) ??
            assignment?.route
        )
        .filter(Boolean)
    ).size;


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        {/* Breadcrumbs */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Student Transport Assignments
          </span>

        </div>


        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Bus size={25} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Student Transport Assignments
              </h1>

              <p className="text-gray-600 mt-1">
                Manage students assigned to school transport routes and stages.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>


            <Link
              to="/transport/assignments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Plus size={18} />

              Add Assignment

            </Link>

          </div>

        </div>

      </div>


      {/* ==================================================
          QUICK NAVIGATION
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 overflow-x-auto">

        <div className="flex items-center gap-2 min-w-max">

          <Link
            to="/transport"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Dashboard
          </Link>

          <Link
            to="/transport/drivers"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Drivers
          </Link>

          <Link
            to="/transport/vehicles"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Vehicles
          </Link>

          <Link
            to="/transport/routes"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Routes & Stages
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Student Assignments
          </span>

          <Link
            to="/transport/expenses"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Vehicle Expenses
          </Link>

          <Link
            to="/transport/reports"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Driver Reports
          </Link>

        </div>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={19}
            className="mt-0.5"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Assignments
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalAssignments}
              </p>

            </div>

            <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
              <Users size={22} />
            </div>

          </div>

        </div>


        {/* Active */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Active Assignments
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {activeAssignments}
              </p>

            </div>

            <div className="p-3 rounded-lg bg-green-100 text-green-700">
              <Bus size={22} />
            </div>

          </div>

        </div>


        {/* Inactive */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Inactive / Ended
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {inactiveAssignments}
              </p>

            </div>

            <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
              <X size={22} />
            </div>

          </div>

        </div>


        {/* Routes */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Routes in Use
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {routesInUse}
              </p>

            </div>

            <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
              <RouteIcon size={22} />
            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search */}

          <div className="lg:col-span-2">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search
            </label>

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search student, admission number, route or stage..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>


          {/* Route */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Route
            </label>

            <select
              value={routeFilter}
              onChange={(event) =>
                setRouteFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All Routes
              </option>

              {routes.map(
                (route) => (

                  <option
                    key={getId(route)}
                    value={getId(route)}
                  >
                    {route.name ||
                      route.route_name ||
                      route.title ||
                      "Unnamed Route"}
                  </option>

                )
              )}

            </select>

          </div>


          {/* Status */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="ended">
                Ended
              </option>

              <option value="suspended">
                Suspended
              </option>

            </select>

          </div>

        </div>


        {/* Clear */}

        {(searchTerm ||
          statusFilter !== "all" ||
          routeFilter !== "all") && (

          <div className="mt-4">

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRouteFilter("all");
              }}
              className="text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              Clear filters
            </button>

          </div>

        )}

      </div>


      {/* ==================================================
          ASSIGNMENTS TABLE
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>

              <h2 className="font-semibold text-gray-800 text-lg">
                Transport Assignments
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                {filteredAssignments.length}
                {" "}of{" "}
                {assignments.length}
                {" "}assignments
              </p>

            </div>

            <Link
              to="/transport/assignments/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-800 text-white hover:bg-purple-900 text-sm"
            >

              <Plus size={16} />

              Add Assignment

            </Link>

          </div>

        </div>


        {loading ? (

          <div className="p-12 text-center">

            <RefreshCw
              size={28}
              className="mx-auto text-purple-700 animate-spin mb-3"
            />

            <p className="text-gray-600">
              Loading transport assignments...
            </p>

          </div>

        ) : filteredAssignments.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

              <Bus size={28} />

            </div>

            <h3 className="font-semibold text-gray-800 text-lg">
              No transport assignments found
            </h3>

            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
              No assignments match the current filters.
              You can clear the filters or create a new
              student transport assignment.
            </p>

            <div className="mt-5 flex justify-center gap-2">

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRouteFilter("all");
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
              >
                Clear Filters
              </button>

              <Link
                to="/transport/assignments/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800 text-white hover:bg-purple-900 text-sm"
              >

                <Plus size={16} />

                Add Assignment

              </Link>

            </div>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Student
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Route
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Stage
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Start Date
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    End Date
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

                {filteredAssignments.map(
                  (assignment) => {

                    const assignmentId =
                      getId(
                        assignment
                      );

                    const student =
                      getStudent(
                        assignment
                      );

                    const status =
                      getStatus(
                        assignment
                      );

                    return (

                      <tr
                        key={assignmentId}
                        className="hover:bg-gray-100"
                      >

                        {/* Student */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <Users size={18} />

                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">

                                {getStudentName(
                                  student
                                )}

                              </p>

                              <p className="text-xs text-gray-500">

                                {getAdmissionNumber(
                                  student
                                )}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Route */}

                        <td className="px-5 py-4">

                          <div className="flex items-start gap-2">

                            <RouteIcon
                              size={16}
                              className="text-purple-700 mt-0.5"
                            />

                            <div>

                              <p className="font-medium text-gray-800">
                                {getRouteName(
                                  assignment
                                )}
                              </p>

                              {getRouteCode(
                                assignment
                              ) && (
                                <p className="text-xs text-gray-500">
                                  {getRouteCode(
                                    assignment
                                  )}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* Stage */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {getStageName(
                            assignment
                          )}

                        </td>


                        {/* Start Date */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {formatDate(
                            assignment.start_date ||
                            assignment.assignment_start_date
                          )}

                        </td>


                        {/* End Date */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {formatDate(
                            assignment.end_date ||
                            assignment.assignment_end_date
                          )}

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >

                            {formatStatus(
                              status
                            )}

                          </span>

                        </td>


                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              to={`/transport/assignments/${assignmentId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                              title="View assignment"
                            >

                              <Eye size={15} />

                              View

                            </Link>


                            <Link
                              to={`/transport/assignments/${assignmentId}/edit`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm"
                              title="Edit assignment"
                            >

                              <Edit size={15} />

                              Edit

                            </Link>

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

    </div>
  );
};


export default TransportAssignmentsPage;

