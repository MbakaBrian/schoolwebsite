import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  UserPlus,
  Users,
  UserRoundCheck,
  UserRoundX,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import axiosInstance from "../../../../utils/axiosInstance";


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
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const getFullName = (staff) => {
  if (!staff) {
    return "Unknown Staff";
  }

  if (staff.full_name) {
    return staff.full_name;
  }

  return [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown Staff";
};


const formatLabel = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// ============================================================
// COMPONENT
// ============================================================

const StaffDashboard = () => {

  // ==========================================================
  // DATA
  // ==========================================================

  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleAssignments, setRoleAssignments] =
    useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD STAFF DATA
  // ==========================================================

  const loadDashboardData = async (
    showInitialLoader = false
  ) => {

    try {

      if (showInitialLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");


      const [
        staffResponse,
        rolesResponse,
        assignmentsResponse,
      ] = await Promise.all([

        axiosInstance.get(
          "/staff/"
        ),

        axiosInstance.get(
          "/staff/roles/"
        ),

        axiosInstance.get(
          "/staff/role-assignments/"
        ),

      ]);


      setStaff(
        extractList(staffResponse)
      );

      setRoles(
        extractList(rolesResponse)
      );

      setRoleAssignments(
        extractList(
          assignmentsResponse
        )
      );


    } catch (err) {

      console.error(
        "Failed to load staff dashboard:",
        err
      );

      setError(
        "Unable to load staff management information."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadDashboardData(true);

  }, []);


  // ==========================================================
  // STAFF STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {

    const active = staff.filter(
      (member) =>
        member.status === "active"
    ).length;


    const inactive = staff.filter(
      (member) =>
        member.status === "inactive"
    ).length;


    const suspended = staff.filter(
      (member) =>
        member.status === "suspended"
    ).length;


    const permanent = staff.filter(
      (member) =>
        member.employment_type === "permanent"
    ).length;


    const contract = staff.filter(
      (member) =>
        member.employment_type === "contract"
    ).length;


    const interns = staff.filter(
      (member) =>
        member.employment_type === "intern"
    ).length;


    const activeAssignments =
      roleAssignments.filter(
        (assignment) =>
          assignment.is_active === true ||
          assignment.status === "active"
      ).length;


    return {
      active,
      inactive,
      suspended,
      permanent,
      contract,
      interns,
      activeAssignments,
    };

  }, [
    staff,
    roleAssignments,
  ]);


  // ==========================================================
  // RECENT STAFF
  // ==========================================================

  const recentStaff = useMemo(() => {

    return [...staff]
      .sort((a, b) => {

        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateB - dateA;

      })
      .slice(0, 5);

  }, [staff]);


  // ==========================================================
  // RECENT ROLE ASSIGNMENTS
  // ==========================================================

  const recentAssignments =
    useMemo(() => {

      return [...roleAssignments]
        .sort((a, b) => {

          const dateA =
            new Date(
              a.created_at || 0
            ).getTime();

          const dateB =
            new Date(
              b.created_at || 0
            ).getTime();

          return dateB - dateA;

        })
        .slice(0, 5);

    }, [
      roleAssignments,
    ]);


  // ==========================================================
  // EMPLOYMENT BREAKDOWN
  // ==========================================================

  const employmentBreakdown = useMemo(() => {

    return [
      {
        label: "Permanent",
        value: statistics.permanent,
      },
      {
        label: "Contract",
        value: statistics.contract,
      },
      {
        label: "Intern",
        value: statistics.interns,
      },
      {
        label: "Part-time",
        value: staff.filter(
          (member) =>
            member.employment_type ===
            "part_time"
        ).length,
      },
      {
        label: "Casual",
        value: staff.filter(
          (member) =>
            member.employment_type ===
            "casual"
        ).length,
      },
    ];

  }, [
    staff,
    statistics,
  ]);


  // ==========================================================
  // STATUS BREAKDOWN
  // ==========================================================

  const statusBreakdown = useMemo(() => {

    return [
      {
        label: "Active",
        value: statistics.active,
      },
      {
        label: "Inactive",
        value: statistics.inactive,
      },
      {
        label: "Suspended",
        value: statistics.suspended,
      },
      {
        label: "Resigned",
        value: staff.filter(
          (member) =>
            member.status === "resigned"
        ).length,
      },
      {
        label: "Terminated",
        value: staff.filter(
          (member) =>
            member.status === "terminated"
        ).length,
      },
      {
        label: "Retired",
        value: staff.filter(
          (member) =>
            member.status === "retired"
        ).length,
      },
    ];

  }, [
    staff,
    statistics,
  ]);


  // ==========================================================
  // LOADING STATE
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
            Loading staff management...
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

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Users size={26} />

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Staff Management
              </h1>

              <p className="text-gray-600 mt-1">
                Manage staff members, roles and responsibilities.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              loadDashboardData(false)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <AlertCircle
            size={20}
            className="mt-0.5 flex-shrink-0"
          />

          <div>

            <p className="font-semibold">
              Unable to load dashboard
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          TOP SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Active Staff */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Active Staff
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {statistics.active}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-green-100 text-green-700">

              <UserRoundCheck size={23} />

            </div>

          </div>

        </div>


        {/* Permanent */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Permanent Staff
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {statistics.permanent}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">

              <BriefcaseBusiness size={23} />

            </div>

          </div>

        </div>


        {/* Contract */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Contract Staff
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {statistics.contract}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">

              <Clock3 size={23} />

            </div>

          </div>

        </div>


        {/* Interns */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Interns
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {statistics.interns}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-gray-200 text-gray-700">

              <Users size={23} />

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Common staff management tasks.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Add Staff */}

          <Link
            to="/staff/members/new"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition"
          >

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-purple-800 text-white">

                <UserPlus size={19} />

              </div>

              <div>

                <p className="font-semibold text-gray-800">
                  Add Staff
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Register a new staff member
                </p>

              </div>

            </div>

            <ArrowRight
              size={18}
              className="text-purple-700"
            />

          </Link>


          {/* Manage Roles */}

          <Link
            to="/staff/roles"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition"
          >

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-gray-800 text-white">

                <ShieldCheck size={19} />

              </div>

              <div>

                <p className="font-semibold text-gray-800">
                  Manage Roles
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Create and manage staff roles
                </p>

              </div>

            </div>

            <ArrowRight
              size={18}
              className="text-gray-500"
            />

          </Link>


          {/* Role Assignments */}

          <Link
            to="/staff/role-assignments"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition"
          >

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-lg bg-gray-700 text-white">

                <UserRoundCheck size={19} />

              </div>

              <div>

                <p className="font-semibold text-gray-800">
                  Assign Roles
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Assign roles to staff members
                </p>

              </div>

            </div>

            <ArrowRight
              size={18}
              className="text-gray-500"
            />

          </Link>

        </div>

      </div>


      {/* ======================================================
          RECENT STAFF
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h2 className="font-semibold text-gray-800">
              Recent Staff
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Recently registered staff members.
            </p>

          </div>


          <Link
            to="/staff/members"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            View all
            <ArrowRight size={16} />
          </Link>

        </div>


        {recentStaff.length === 0 ? (

          <div className="p-8 text-center">

            <Users
              size={30}
              className="mx-auto text-gray-400"
            />

            <p className="text-gray-500 mt-2">
              No staff members found.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Staff
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Employee No.
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Employment
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {recentStaff.map(
                  (member) => {

                    const staffId =
                      getId(member);

                    return (

                      <tr
                        key={staffId}
                        className="hover:bg-gray-100"
                      >

                        <td className="px-5 py-4">

                          <Link
                            to={`/staff/members/${staffId}`}
                            className="flex items-center gap-3"
                          >

                            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

                              <Users size={17} />

                            </div>

                            <div>

                              <p className="font-semibold text-gray-800 hover:text-purple-800">
                                {getFullName(
                                  member
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                {member.staff_id ||
                                  "No staff ID"}
                              </p>

                            </div>

                          </Link>

                        </td>


                        <td className="px-5 py-4 text-sm text-gray-700">
                          {member.employee_number ||
                            "—"}
                        </td>


                        <td className="px-5 py-4 text-sm text-gray-700">
                          {formatLabel(
                            member.employment_type
                          )}
                        </td>


                        <td className="px-5 py-4">

                          <span
                            className={
                              member.status === "active"
                                ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
                            }
                          >

                            {member.status === "active" ? (
                              <CheckCircle2
                                size={13}
                              />
                            ) : (
                              <UserRoundX
                                size={13}
                              />
                            )}

                            {formatLabel(
                              member.status
                            )}

                          </span>

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
          RECENT ROLE ASSIGNMENTS
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h2 className="font-semibold text-gray-800">
              Recent Role Assignments
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Recently assigned staff responsibilities.
            </p>

          </div>


          <Link
            to="/staff/role-assignments"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            View all
            <ArrowRight size={16} />
          </Link>

        </div>


        {recentAssignments.length === 0 ? (

          <div className="p-8 text-center">

            <ShieldCheck
              size={30}
              className="mx-auto text-gray-400"
            />

            <p className="text-gray-500 mt-2">
              No role assignments found.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Staff
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Role
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Primary
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {recentAssignments.map(
                  (assignment) => {

                    const assignmentId =
                      getId(
                        assignment
                      );


                    const staffName =
                      assignment.staff_name ||
                      getFullName(
                        assignment.staff
                      );


                    const roleName =
                      assignment.role_name ||
                      assignment.role?.name ||
                      "Unknown Role";


                    return (

                      <tr
                        key={
                          assignmentId
                        }
                        className="hover:bg-gray-100"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">

                              <Users size={17} />

                            </div>

                            <span className="font-medium text-gray-800">
                              {staffName}
                            </span>

                          </div>

                        </td>


                        <td className="px-5 py-4">

                          <span className="text-sm font-medium text-gray-700">
                            {roleName}
                          </span>

                        </td>


                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">

                            <CheckCircle2
                              size={13}
                            />

                            Active

                          </span>

                        </td>


                        <td className="px-5 py-4">

                          {assignment.is_primary ? (

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">

                              <CheckCircle2
                                size={13}
                              />

                              Primary

                            </span>

                          ) : (

                            <span className="text-sm text-gray-500">
                              Secondary
                            </span>

                          )}

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
          BREAKDOWNS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Employment Type */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <BriefcaseBusiness size={20} />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Staff by Employment Type
              </h2>

              <p className="text-sm text-gray-500">
                Current staff employment categories.
              </p>

            </div>

          </div>


          <div className="space-y-4">

            {employmentBreakdown.map(
              (item) => (

                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >

                  <span className="text-sm text-gray-600">
                    {item.label}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {item.value}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* Status */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-gray-200 text-gray-700">

              <UserRoundCheck size={20} />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Staff by Status
              </h2>

              <p className="text-sm text-gray-500">
                Current staff status distribution.
              </p>

            </div>

          </div>


          <div className="space-y-4">

            {statusBreakdown.map(
              (item) => (

                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >

                  <span className="text-sm text-gray-600">
                    {item.label}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {item.value}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          STAFF OVERVIEW — BOTTOM
      ====================================================== */}

      <div className="bg-gray-800 rounded-xl p-6 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <div className="flex items-center gap-3">

              <div className="p-3 rounded-xl bg-purple-700">

                <Users size={23} />

              </div>

              <div>

                <p className="text-sm text-gray-300">
                  Staff Overview
                </p>

                <p className="text-3xl font-bold mt-1">
                  {staff.length}
                </p>

              </div>

            </div>


            <p className="text-sm text-gray-300 mt-3">
              Total staff members registered in the system.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4">

            <div className="px-5 py-3 rounded-lg bg-gray-700">

              <p className="text-xs text-gray-300">
                Roles
              </p>

              <p className="text-xl font-bold mt-1">
                {roles.length}
              </p>

            </div>


            <div className="px-5 py-3 rounded-lg bg-gray-700">

              <p className="text-xs text-gray-300">
                Assignments
              </p>

              <p className="text-xl font-bold mt-1">
                {statistics.activeAssignments}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default StaffDashboard;

