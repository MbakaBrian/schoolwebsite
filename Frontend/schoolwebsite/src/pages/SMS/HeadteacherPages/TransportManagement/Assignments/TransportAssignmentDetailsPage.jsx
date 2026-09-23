import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bus,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Edit,
  FileText,
  RefreshCw,
  Route as RouteIcon,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// HELPERS
// ==================================================

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


const getRouteName = (route) => {
  if (!route) {
    return "Unnamed Route";
  }

  if (
    typeof route === "string" ||
    typeof route === "number"
  ) {
    return "Transport Route";
  }

  return (
    route.name ||
    route.route_name ||
    route.title ||
    "Unnamed Route"
  );
};


const getRouteCode = (route) => {
  if (!route) {
    return "";
  }

  if (
    typeof route === "string" ||
    typeof route === "number"
  ) {
    return "";
  }

  return (
    route.code ||
    route.route_code ||
    ""
  );
};


const getStageName = (stage) => {
  if (!stage) {
    return "No stage";
  }

  if (
    typeof stage === "string" ||
    typeof stage === "number"
  ) {
    return "Transport Stage";
  }

  return (
    stage.name ||
    stage.stage_name ||
    stage.title ||
    "Unnamed Stage"
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

  return "unknown";
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
      month: "long",
      year: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const getErrorMessage = (error) => {
  const data =
    error?.response?.data;

  if (!data) {
    return "An unexpected error occurred.";
  }

  if (
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    Array.isArray(data.detail)
  ) {
    return data.detail.join(" ");
  }

  if (
    typeof data === "object"
  ) {
    const messages = [];

    Object.entries(data).forEach(
      ([field, value]) => {

        if (Array.isArray(value)) {
          messages.push(
            `${field}: ${value.join(" ")}`
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

  return "Failed to load the transport assignment.";
};


// ==================================================
// COMPONENT
// ==================================================

const TransportAssignmentDetailsPage = () => {
  const navigate = useNavigate();

  const {
    id,
  } = useParams();


  // ==================================================
  // STATE
  // ==================================================

  const [
    assignment,
    setAssignment,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    actionSuccess,
    setActionSuccess,
  ] = useState("");

  const [
    deactivating,
    setDeactivating,
  ] = useState(false);


  // ==================================================
  // LOAD ASSIGNMENT
  // ==================================================

  const loadAssignment = async () => {

    if (!id) {
      setError(
        "Transport assignment ID is missing."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/transport/assignments/${id}/`
        );

      setAssignment(
        response.data
      );

    } catch (err) {

      console.error(
        "Failed to load transport assignment:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadAssignment();
  }, [id]);


  // ==================================================
  // DEACTIVATE
  // ==================================================

  const handleDeactivate = async () => {

    if (!assignment) {
      return;
    }

    const confirmed =
      window.confirm(
        "Deactivate this student's transport assignment?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeactivating(true);
      setActionError("");
      setActionSuccess("");

      const payload = {};

      if (
        typeof assignment.is_active ===
        "boolean"
      ) {

        payload.is_active = false;

      } else {

        payload.status = "inactive";

      }


      const response =
        await axiosInstance.patch(
          `/transport/assignments/${id}/`,
          payload
        );


      setAssignment(
        response.data
      );

      setActionSuccess(
        "Transport assignment deactivated successfully."
      );

    } catch (err) {

      console.error(
        "Failed to deactivate assignment:",
        err
      );

      setActionError(
        getErrorMessage(err)
      );

    } finally {

      setDeactivating(false);

    }

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            size={28}
            className="mx-auto text-purple-700 animate-spin mb-3"
          />

          <p className="text-gray-600">
            Loading transport assignment...
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR STATE
  // ==================================================

  if (error || !assignment) {

    return (

      <div className="min-h-screen bg-gray-100 p-4 md:p-8">

        <div className="max-w-3xl mx-auto">

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">

            <div className="flex items-start gap-3">

              <X
                size={21}
                className="text-red-600 mt-0.5"
              />

              <div>

                <h2 className="font-semibold text-red-800">
                  Unable to load assignment
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  {error ||
                    "The requested assignment could not be found."}
                </p>

              </div>

            </div>


            <div className="flex gap-3 mt-5">

              <button
                type="button"
                onClick={loadAssignment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
              >

                <RefreshCw size={16} />

                Try Again

              </button>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/transport/assignments"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >

                <ArrowLeft size={16} />

                Back

              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==================================================
  // DERIVED DATA
  // ==================================================

  const student =
    assignment.student;

  const route =
    assignment.route;

  const stage =
    assignment.stage;

  const status =
    getStatus(
      assignment
    );

  const studentId =
    getId(student) ??
    student;

  const routeId =
    getId(route) ??
    route;

  const stageId =
    getId(stage) ??
    stage;


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        {/* Breadcrumb */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/transport/assignments"
            className="hover:text-purple-700"
          >
            Student Assignments
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Assignment Details
          </span>

        </div>


        {/* Main Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Bus size={25} />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Transport Assignment
              </h1>

              <p className="text-gray-600 mt-1">
                View the student's current transport arrangement.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={loadAssignment}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >

              <RefreshCw size={17} />

              Refresh

            </button>


            <Link
              to={`/transport/assignments/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Edit size={17} />

              Edit Assignment

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
          ACTION ALERTS
      ================================================== */}

      {actionError && (

        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={19}
            className="mt-0.5"
          />

          <span>
            {actionError}
          </span>

        </div>

      )}


      {actionSuccess && (

        <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

          <CheckCircle
            size={19}
            className="mt-0.5"
          />

          <span>
            {actionSuccess}
          </span>

        </div>

      )}


      {/* ==================================================
          STUDENT SUMMARY
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

              <User size={30} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Student
              </p>

              <h2 className="text-xl font-bold text-gray-800 mt-0.5">

                {getStudentName(
                  student
                )}

              </h2>

              <p className="text-sm text-gray-500 mt-1">

                Admission No:{" "}

                <span className="font-medium text-gray-700">
                  {getAdmissionNumber(
                    student
                  )}
                </span>

              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusClasses(
                status
              )}`}
            >

              {formatStatus(
                status
              )}

            </span>


            {studentId && (
              <Link
                to={`/students/${studentId}`}
                className="text-sm font-medium text-purple-700 hover:text-purple-900"
              >
                View Student
              </Link>
            )}

          </div>

        </div>

      </div>


      {/* ==================================================
          ASSIGNMENT DETAILS
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Route */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <RouteIcon size={21} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Transport Route
              </p>

              <h3 className="font-semibold text-gray-800 mt-0.5">
                {getRouteName(route)}
              </h3>

            </div>

          </div>


          {getRouteCode(route) && (

            <div className="text-sm text-gray-600">

              <span className="font-medium">
                Route Code:
              </span>{" "}

              {getRouteCode(route)}

            </div>

          )}


          {route?.description && (

            <p className="text-sm text-gray-500 mt-3">
              {route.description}
            </p>

          )}


          {routeId && (
            <Link
              to={`/transport/routes/${routeId}`}
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-purple-700 hover:text-purple-900"
            >

              View Route

              <ChevronRight size={15} />

            </Link>
          )}

        </div>


        {/* Stage */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">

              <Bus size={21} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Transport Stage
              </p>

              <h3 className="font-semibold text-gray-800 mt-0.5">
                {getStageName(stage)}
              </h3>

            </div>

          </div>


          {stage?.location && (

            <div className="text-sm text-gray-600">

              <span className="font-medium">
                Location:
              </span>{" "}

              {stage.location}

            </div>

          )}


          {stage?.stage_type && (

            <div className="text-sm text-gray-600 mt-2">

              <span className="font-medium">
                Type:
              </span>{" "}

              <span className="capitalize">
                {stage.stage_type.replaceAll(
                  "_",
                  " "
                )}
              </span>

            </div>

          )}


          {stageId && routeId && (
            <Link
              to={`/transport/routes/${routeId}`}
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-purple-700 hover:text-purple-900"
            >

              View Route Stages

              <ChevronRight size={15} />

            </Link>
          )}

        </div>


        {/* Period */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-2.5 rounded-lg bg-green-100 text-green-700">

              <CalendarDays size={21} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Assignment Period
              </p>

              <h3 className="font-semibold text-gray-800 mt-0.5">
                Current Arrangement
              </h3>

            </div>

          </div>


          <div className="space-y-3">

            <div>

              <p className="text-xs text-gray-500">
                Start Date
              </p>

              <p className="font-medium text-gray-800">
                {formatDate(
                  assignment.start_date ||
                  assignment.assignment_start_date
                )}
              </p>

            </div>


            <div>

              <p className="text-xs text-gray-500">
                End Date
              </p>

              <p className="font-medium text-gray-800">
                {formatDate(
                  assignment.end_date ||
                  assignment.assignment_end_date
                )}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          NOTES
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex items-center gap-3 mb-4">

          <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">

            <FileText size={20} />

          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              Assignment Notes
            </h2>

            <p className="text-sm text-gray-500">
              Additional information recorded for this assignment.
            </p>

          </div>

        </div>


        {assignment.notes ? (

          <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {assignment.notes}
            </p>

          </div>

        ) : (

          <p className="text-sm text-gray-500 italic">
            No notes have been recorded for this assignment.
          </p>

        )}

      </div>


      {/* ==================================================
          RECORD INFORMATION
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">

            <FileText size={20} />

          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              Record Information
            </h2>

            <p className="text-sm text-gray-500">
              System information for this assignment.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <div>

            <p className="text-xs uppercase font-semibold text-gray-500">
              Assignment ID
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {getId(assignment) || id}
            </p>

          </div>


          <div>

            <p className="text-xs uppercase font-semibold text-gray-500">
              Created
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {formatDateTime(
                assignment.created_at
              )}
            </p>

          </div>


          <div>

            <p className="text-xs uppercase font-semibold text-gray-500">
              Last Updated
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {formatDateTime(
                assignment.updated_at
              )}
            </p>

          </div>


          <div>

            <p className="text-xs uppercase font-semibold text-gray-500">
              Status
            </p>

            <p className="font-medium text-gray-800 mt-1">
              {formatStatus(
                status
              )}
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h3 className="font-semibold text-gray-800">
              Assignment Actions
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Update or deactivate this student's transport assignment.
            </p>

          </div>


          <div className="flex flex-col sm:flex-row gap-3">

            <Link
              to="/transport/assignments"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <ArrowLeft size={17} />

              Back to Assignments

            </Link>


            <Link
              to={`/transport/assignments/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Edit size={17} />

              Edit

            </Link>


            {status === "active" && (

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
              >

                {deactivating ? (

                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />

                ) : (

                  <X size={17} />

                )}

                {deactivating
                  ? "Deactivating..."
                  : "Deactivate"}

              </button>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};


export default TransportAssignmentDetailsPage;

