import React, {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Edit,
  FileText,
  RefreshCw,
  ShieldCheck,
  User,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// CONSTANTS
// ==================================================

const STATUS_OPTIONS = {
  active: "Active",
  completed: "Completed",
  inactive: "Inactive",
};


// ==================================================
// HELPERS
// ==================================================

const getStaffName = (assignment) => {
  if (!assignment) {
    return "Unknown Staff Member";
  }

  if (assignment.staff_name) {
    return assignment.staff_name;
  }

  if (
    assignment.staff &&
    typeof assignment.staff === "object"
  ) {
    return (
      assignment.staff.full_name ||
      [
        assignment.staff.first_name,
        assignment.staff.middle_name,
        assignment.staff.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Unknown Staff Member"
    );
  }

  return "Unknown Staff Member";
};


const getRoleName = (assignment) => {
  if (!assignment) {
    return "Unknown Role";
  }

  if (assignment.role_name) {
    return assignment.role_name;
  }

  if (
    assignment.role &&
    typeof assignment.role === "object"
  ) {
    return (
      assignment.role.name ||
      assignment.role.code ||
      "Unknown Role"
    );
  }

  return "Unknown Role";
};


const getId = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    return value.id ?? value.pk ?? null;
  }

  return value;
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return value;
  }
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return value;
  }
};


const formatEmploymentType = (
  value
) => {
  const labels = {
    permanent: "Permanent",
    contract: "Contract",
    part_time: "Part-time",
    casual: "Casual",
    intern: "Intern",
    volunteer: "Volunteer",
  };

  return (
    labels[value] ||
    value ||
    "—"
  );
};


const extractErrorMessage = (
  error
) => {
  const data =
    error?.response?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
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
    typeof data === "string"
  ) {
    return data;
  }

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

  return (
    messages.join(" ") ||
    "Unable to complete the request."
  );
};


// ==================================================
// STATUS BADGE
// ==================================================

const StatusBadge = ({
  status,
}) => {

  const normalizedStatus =
    status || "inactive";


  if (
    normalizedStatus === "active"
  ) {

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">

        <CheckCircle2 size={15} />

        Active

      </span>
    );

  }


  if (
    normalizedStatus === "completed"
  ) {

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">

        <CheckCircle2 size={15} />

        Completed

      </span>
    );

  }


  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">

      <XCircle size={15} />

      {STATUS_OPTIONS[
        normalizedStatus
      ] || "Inactive"}

    </span>
  );
};


// ==================================================
// COMPONENT
// ==================================================

const StaffRoleAssignmentDetailsPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();


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
    deactivating,
    setDeactivating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // ==================================================
  // LOAD ASSIGNMENT
  // ==================================================

  const loadAssignment = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/staff/role-assignments/${id}/`
        );

      setAssignment(
        response.data
      );

    } catch (err) {

      console.error(
        "Failed to load role assignment:",
        err
      );

      setError(
        extractErrorMessage(err)
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
        "Are you sure you want to deactivate this role assignment?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeactivating(true);
      setError("");
      setSuccess("");


      /*
       * The backend service handles deactivation
       * by setting:
       *
       * status = inactive
       * is_primary = false
       *
       * We use PATCH here so that the existing
       * assignment record is preserved.
       */

      await axiosInstance.patch(
        `/staff/role-assignments/${id}/`,
        {
          status: "inactive",
          is_primary: false,
        }
      );


      setSuccess(
        "Role assignment deactivated successfully."
      );


      await loadAssignment();

    } catch (err) {

      console.error(
        "Failed to deactivate role assignment:",
        err
      );

      setError(
        extractErrorMessage(err)
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="flex items-center gap-3 text-gray-600">

          <RefreshCw
            size={20}
            className="animate-spin"
          />

          <span>
            Loading role assignment...
          </span>

        </div>

      </div>
    );

  }


  // ==================================================
  // ERROR / NOT FOUND
  // ==================================================

  if (!assignment) {

    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto">

          <div className="mb-5">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700"
            >

              <ArrowLeft size={17} />

              Back

            </button>

          </div>


          <div className="bg-red-50 border border-red-200 rounded-xl p-6">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={21}
                className="text-red-600 mt-0.5"
              />

              <div>

                <h2 className="font-semibold text-red-800">
                  Unable to load assignment
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  {error ||
                    "The requested role assignment could not be found."}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );

  }


  // ==================================================
  // RELATED IDS
  // ==================================================

  const staffId =
    getId(
      assignment.staff
    );

  const roleId =
    getId(
      assignment.role
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-6xl mx-auto">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">

            <Link
              to="/staff"
              className="hover:text-purple-700"
            >
              Staff Management
            </Link>

            <ChevronRight size={15} />

            <Link
              to="/staff/role-assignments"
              className="hover:text-purple-700"
            >
              Role Assignments
            </Link>

            <ChevronRight size={15} />

            <span className="text-gray-700 font-medium">
              Assignment Details
            </span>

          </div>


          {/* Title */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="p-3 rounded-xl bg-purple-800 text-white">
                <ShieldCheck size={25} />
              </div>

              <div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Role Assignment Details
                </h1>

                <p className="text-gray-600 mt-1">
                  View the complete staff role assignment record.
                </p>

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

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


              <Link
                to={`/staff/role-assignments/${id}/edit`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Edit size={17} />

                Edit

              </Link>

            </div>

          </div>

        </div>


        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (

          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

            <AlertCircle
              size={19}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              {error}
            </span>

          </div>

        )}


        {success && (

          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

            <CheckCircle2
              size={19}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* ==================================================
            TOP SUMMARY
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">


          {/* Staff */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
                <User size={19} />
              </div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Staff Member
              </p>

            </div>

            <p className="text-lg font-bold text-gray-800">
              {getStaffName(
                assignment
              )}
            </p>

          </div>


          {/* Role */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
                <Briefcase size={19} />
              </div>

              <p className="text-xs uppercase font-semibold text-purple-600">
                Assigned Role
              </p>

            </div>

            <p className="text-lg font-bold text-purple-800">
              {getRoleName(
                assignment
              )}
            </p>

          </div>


          {/* Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">

              <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">
                <ShieldCheck size={19} />
              </div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Status
              </p>

            </div>

            <StatusBadge
              status={
                assignment.status
              }
            />

          </div>

        </div>


        {/* ==================================================
            ASSIGNMENT INFORMATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <Briefcase size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Assignment Information
              </h2>

              <p className="text-sm text-gray-500">
                Details of this staff-role relationship.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


            {/* Staff */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Staff Member
              </p>

              {staffId ? (

                <Link
                  to={`/staff/members/${staffId}`}
                  className="font-semibold text-purple-700 hover:text-purple-900"
                >
                  {getStaffName(
                    assignment
                  )}
                </Link>

              ) : (

                <p className="font-semibold text-gray-800">
                  {getStaffName(
                    assignment
                  )}
                </p>

              )}

            </div>


            {/* Role */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Role
              </p>

              {roleId ? (

                <Link
                  to={`/staff/roles/${roleId}`}
                  className="font-semibold text-purple-700 hover:text-purple-900"
                >
                  {getRoleName(
                    assignment
                  )}
                </Link>

              ) : (

                <p className="font-semibold text-gray-800">
                  {getRoleName(
                    assignment
                  )}
                </p>

              )}

            </div>


            {/* Employment */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Employment Type
              </p>

              <p className="font-semibold text-gray-800">
                {formatEmploymentType(
                  assignment.employment_type
                )}
              </p>

            </div>


            {/* Primary */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Primary Role
              </p>

              {assignment.is_primary ? (

                <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold">

                  <UserCheck size={17} />

                  Primary Role

                </span>

              ) : (

                <span className="text-gray-500">
                  Secondary Role
                </span>

              )}

            </div>


            {/* Start Date */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Start Date
              </p>

              <p className="font-semibold text-gray-800">
                {formatDate(
                  assignment.start_date
                )}
              </p>

            </div>


            {/* End Date */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                End Date
              </p>

              <p className="font-semibold text-gray-800">
                {formatDate(
                  assignment.end_date
                )}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            PRIMARY ROLE NOTICE
        ================================================== */}

        {assignment.is_primary && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">

            <div className="flex items-start gap-3">

              <UserCheck
                size={20}
                className="text-purple-700 mt-0.5"
              />

              <div>

                <h3 className="font-semibold text-purple-800">
                  Primary Role
                </h3>

                <p className="text-sm text-purple-700 mt-1">
                  This is currently recorded as the staff member's primary role.
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ==================================================
            NOTES
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <FileText size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Notes
              </h2>

              <p className="text-sm text-gray-500">
                Additional information recorded for this assignment.
              </p>

            </div>

          </div>


          <div className="rounded-lg bg-white border border-gray-200 p-4 min-h-[100px]">

            {assignment.notes ? (

              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment.notes}
              </p>

            ) : (

              <p className="text-gray-400 italic">
                No notes have been added to this assignment.
              </p>

            )}

          </div>

        </div>


        {/* ==================================================
            RECORD INFORMATION
        ================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">
              <CalendarDays size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Record Information
              </h2>

              <p className="text-sm text-gray-500">
                System timestamps for this assignment.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ID */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Assignment ID
              </p>

              <p className="font-mono text-sm text-gray-800">
                #{assignment.id}
              </p>

            </div>


            {/* Created */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Created
              </p>

              <p className="text-sm font-medium text-gray-800">
                {formatDateTime(
                  assignment.created_at
                )}
              </p>

            </div>


            {/* Updated */}
            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Last Updated
              </p>

              <p className="text-sm font-medium text-gray-800">
                {formatDateTime(
                  assignment.updated_at
                )}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h2 className="font-semibold text-gray-800">
                Assignment Actions
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Update or deactivate this role assignment.
              </p>

            </div>


            <div className="flex flex-col sm:flex-row gap-3">

              <Link
                to={`/staff/role-assignments/${id}/edit`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Edit size={17} />

                Edit Assignment

              </Link>


              {assignment.status ===
                "active" && (

                <button
                  type="button"
                  onClick={
                    handleDeactivate
                  }
                  disabled={
                    deactivating
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="flex flex-wrap gap-3 pb-8">

          <Link
            to="/staff/role-assignments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >

            <ArrowLeft size={17} />

            All Role Assignments

          </Link>


          {staffId && (

            <Link
              to={`/staff/members/${staffId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <User size={17} />

              View Staff Member

            </Link>

          )}


          {roleId && (

            <Link
              to={`/staff/roles/${roleId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <Briefcase size={17} />

              View Role

            </Link>

          )}

        </div>

      </div>

    </div>
  );
};


export default StaffRoleAssignmentDetailsPage;

