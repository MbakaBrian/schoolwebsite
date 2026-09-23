import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Edit,
  History,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
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

const getRoleName = (role) => {
  if (!role) {
    return "Unnamed Role";
  }

  return (
    role.name ||
    role.role_name ||
    role.title ||
    "Unnamed Role"
  );
};


const getRoleDescription = (role) => {
  if (!role) {
    return "";
  }

  return (
    role.description ||
    role.details ||
    ""
  );
};


const isRoleActive = (role) => {
  if (
    typeof role?.is_active ===
    "boolean"
  ) {
    return role.is_active;
  }

  if (role?.status) {
    return role.status === "active";
  }

  return true;
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
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


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

  return (
    item.id ??
    item.pk ??
    null
  );
};


const getStaffName = (assignment) => {

  if (!assignment) {
    return "Unknown Staff";
  }

  if (
    assignment.staff_name
  ) {
    return assignment.staff_name;
  }

  if (
    assignment.staff?.full_name
  ) {
    return assignment.staff.full_name;
  }

  const staff =
    assignment.staff;

  if (staff) {

    const name = [
      staff.first_name,
      staff.middle_name,
      staff.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (name) {
      return name;
    }

  }

  return "Unknown Staff";
};


const getStaffId = (assignment) => {

  if (
    assignment?.staff_id
  ) {
    return assignment.staff_id;
  }

  if (
    assignment?.staff?.staff_id
  ) {
    return assignment.staff.staff_id;
  }

  return "—";
};


const getAssignmentStatus = (
  assignment
) => {

  if (
    assignment?.status
  ) {
    return assignment.status;
  }

  if (
    typeof assignment?.is_active ===
    "boolean"
  ) {
    return assignment.is_active
      ? "active"
      : "inactive";
  }

  return "active";
};


const getAssignmentActive = (
  assignment
) => {

  if (
    typeof assignment?.is_active ===
    "boolean"
  ) {
    return assignment.is_active;
  }

  return (
    getAssignmentStatus(
      assignment
    ) === "active"
  );

};


// ============================================================
// STATUS BADGE
// ============================================================

const RoleStatusBadge = ({
  active,
}) => {

  if (active) {

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-sm font-semibold">

        <CheckCircle2 size={15} />

        Active

      </span>
    );
  }


  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-sm font-semibold">

      <X size={15} />

      Inactive

    </span>
  );
};


// ============================================================
// ASSIGNMENT STATUS BADGE
// ============================================================

const AssignmentStatusBadge = ({
  assignment,
}) => {

  const active =
    getAssignmentActive(
      assignment
    );


  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-semibold"
          : "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold"
      }
    >

      {active ? (
        <CheckCircle2 size={12} />
      ) : (
        <X size={12} />
      )}

      {active
        ? "Active"
        : "Inactive"}

    </span>
  );
};


// ============================================================
// COMPONENT
// ============================================================

const StaffRoleDetailsPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();


  // ==========================================================
  // DATA
  // ==========================================================

  const [role, setRole] =
    useState(null);

  const [assignments, setAssignments] =
    useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    loadData();

  }, [id]);


  const loadData = async () => {

    try {

      setError("");

      if (role) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      const [
        roleResponse,
        assignmentsResponse,
      ] = await Promise.all([
        axiosInstance.get(
          `/staff/roles/${id}/`
        ),

        axiosInstance.get(
          "/staff/role-assignments/",
          {
            params: {
              role: id,
            },
          }
        ),
      ]);


      setRole(
        roleResponse.data
      );

      setAssignments(
        extractList(
          assignmentsResponse
        )
      );

    } catch (err) {

      console.error(
        "Failed to load staff role details:",
        err
      );

      setError(
        "Unable to load this staff role."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // ACTIVE ASSIGNMENTS
  // ==========================================================

  const activeAssignments =
    useMemo(() => {

      return assignments.filter(
        (assignment) =>
          getAssignmentActive(
            assignment
          )
      );

    }, [
      assignments,
    ]);


  // ==========================================================
  // INACTIVE ASSIGNMENTS
  // ==========================================================

  const inactiveAssignments =
    useMemo(() => {

      return assignments.filter(
        (assignment) =>
          !getAssignmentActive(
            assignment
          )
      );

    }, [
      assignments,
    ]);


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
            Loading role details...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ROLE NOT FOUND
  // ==========================================================

  if (!role) {

    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto">

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">

              <X size={28} />

            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-4">
              Staff role not found
            </h2>

            <p className="text-gray-500 mt-1">
              The requested staff role could not be loaded.
            </p>

            <Link
              to="/staff/roles"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <ArrowLeft size={17} />

              Back to Roles

            </Link>

          </div>

        </div>

      </div>
    );
  }


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
            Role Details
          </span>

        </div>


        {/* Main Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <ShieldCheck size={25} />

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {getRoleName(role)}
              </h1>

              <p className="text-gray-600 mt-1">
                Staff role details and assigned staff members.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
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
              to={`/staff/roles/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Edit size={17} />

              Edit Role

            </Link>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <ArrowLeft size={17} />

              Back

            </button>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

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


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">


        {/* Status */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <ShieldCheck size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Status
              </p>

              <div className="mt-1">

                <RoleStatusBadge
                  active={
                    isRoleActive(role)
                  }
                />

              </div>

            </div>

          </div>

        </div>


        {/* Total Assignments */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">

              <Users size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Total Assignments
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {assignments.length}
              </p>

            </div>

          </div>

        </div>


        {/* Active Staff */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-green-100 text-green-700">

              <CheckCircle2 size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Active Staff
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {activeAssignments.length}
              </p>

            </div>

          </div>

        </div>


        {/* Historical Assignments */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-gray-200 text-gray-600">

              <History size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Historical
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {inactiveAssignments.length}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          ROLE INFORMATION
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

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
                Details about this staff role.
              </p>

            </div>

          </div>

        </div>


        <div className="p-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">


            {/* Role Name */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Role Name
              </p>

              <p className="text-gray-800 font-semibold mt-1">
                {getRoleName(role)}
              </p>

            </div>


            {/* Role Code */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Role Code
              </p>

              <p className="text-gray-800 font-mono mt-1">
                {role.code || "—"}
              </p>

            </div>


            {/* Description */}

            <div className="md:col-span-2">

              <p className="text-xs uppercase font-semibold text-gray-500">
                Description
              </p>

              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {getRoleDescription(role) ||
                  "No description provided."}
              </p>

            </div>


            {/* Status */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Status
              </p>

              <RoleStatusBadge
                active={
                  isRoleActive(role)
                }
              />

            </div>


            {/* ID */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Role ID
              </p>

              <p className="text-gray-800 mt-1">
                {getId(role)}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          RECORD INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">


        {/* Created */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <Calendar size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Created
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {formatDateTime(
                  role.created_at
                )}
              </p>

            </div>

          </div>

        </div>


        {/* Updated */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start gap-3">

            <div className="p-2.5 rounded-lg bg-gray-200 text-gray-600">

              <RefreshCw size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Last Updated
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {formatDateTime(
                  role.updated_at
                )}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          ASSIGNMENTS
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

        <div className="px-5 py-4 bg-gray-100 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">

                <Users size={20} />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Staff Assignments
                </h2>

                <p className="text-sm text-gray-500">
                  Staff members currently or previously assigned to this role.
                </p>

              </div>

            </div>


            <Link
              to="/staff/role-assignments/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 text-sm font-medium"
            >

              <UserPlus size={17} />

              Assign Staff

            </Link>

          </div>

        </div>


        {assignments.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

              <Users size={25} />

            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              No staff assigned
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              No staff members have been assigned to this role yet.
            </p>

            <Link
              to="/staff/role-assignments/new"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <UserPlus size={17} />

              Assign Staff

            </Link>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-white border-b border-gray-200">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Staff Member
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Start Date
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    End Date
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {assignments.map(
                  (assignment) => {

                    const assignmentId =
                      getId(
                        assignment
                      );


                    return (

                      <tr
                        key={
                          assignmentId
                        }
                        className="hover:bg-gray-100 transition"
                      >

                        {/* Staff */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <Users size={18} />

                            </div>


                            <div>

                              <p className="font-semibold text-gray-800">
                                {getStaffName(
                                  assignment
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                Staff ID:{" "}
                                {getStaffId(
                                  assignment
                                )}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Start */}

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {formatDate(
                            assignment.start_date
                          )}
                        </td>


                        {/* End */}

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {formatDate(
                            assignment.end_date
                          )}
                        </td>


                        {/* Status */}

                        <td className="px-5 py-4 text-center">

                          <AssignmentStatusBadge
                            assignment={
                              assignment
                            }
                          />

                        </td>


                        {/* Action */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end">

                            <Link
                              to={`/staff/role-assignments/${assignmentId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100"
                            >

                              View

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


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="bg-gray-800 rounded-xl p-5 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <ShieldCheck size={19} />

              <h3 className="font-semibold">
                Role Management
              </h3>

            </div>

            <p className="text-sm text-gray-300 mt-1">
              Use role assignments to connect this role to staff members.
            </p>

          </div>


          <Link
            to="/staff/role-assignments"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >

            <Users size={17} />

            Manage All Assignments

          </Link>

        </div>

      </div>

    </div>
  );
};


export default StaffRoleDetailsPage;

