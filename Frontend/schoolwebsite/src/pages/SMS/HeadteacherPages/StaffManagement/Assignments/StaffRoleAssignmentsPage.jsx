import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
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

  if (assignment.staff_name) {
    return assignment.staff_name;
  }

  if (assignment.staff?.full_name) {
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

  if (assignment?.staff?.staff_id) {
    return assignment.staff.staff_id;
  }

  if (assignment?.staff_id) {
    return assignment.staff_id;
  }

  return "—";
};


const getRoleName = (assignment) => {

  if (!assignment) {
    return "Unknown Role";
  }

  return (
    assignment.role_name ||
    assignment.role?.name ||
    assignment.role?.role_name ||
    "Unknown Role"
  );
};


const getEmploymentType = (assignment) => {

  const value =
    assignment?.employment_type;

  if (!value) {
    return "—";
  }

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
    value
  );
};


const getAssignmentStatus = (
  assignment
) => {

  return (
    assignment?.status ||
    "active"
  );
};


const isAssignmentActive = (
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


const formatDate = (value) => {

  if (!value) {
    return "—";
  }

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
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  status,
}) => {

  const active =
    status === "active";


  const labels = {
    active: "Active",
    inactive: "Inactive",
  };


  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-semibold"
          : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold"
      }
    >

      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <X size={13} />
      )}

      {labels[status] ||
        status ||
        "Unknown"}

    </span>
  );
};


// ============================================================
// PRIMARY BADGE
// ============================================================

const PrimaryBadge = () => {

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold">

      <ShieldCheck size={12} />

      Primary

    </span>
  );
};


// ============================================================
// COMPONENT
// ============================================================

const StaffRoleAssignmentsPage = () => {

  const navigate = useNavigate();


  // ==========================================================
  // DATA
  // ==========================================================

  const [assignments, setAssignments] =
    useState([]);

  const [staff, setStaff] =
    useState([]);

  const [roles, setRoles] =
    useState([]);


  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [primaryFilter, setPrimaryFilter] =
    useState("all");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    loadData();

  }, []);


  const loadData = async () => {

    try {

      setError("");

      if (
        assignments.length === 0
      ) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }


      const [
        assignmentsResponse,
        staffResponse,
        rolesResponse,
      ] = await Promise.all([

        axiosInstance.get(
          "/staff/role-assignments/"
        ),

        axiosInstance.get(
          "/staff/"
        ),

        axiosInstance.get(
          "/staff/roles/"
        ),

      ]);


      setAssignments(
        extractList(
          assignmentsResponse
        )
      );

      setStaff(
        extractList(
          staffResponse
        )
      );

      setRoles(
        extractList(
          rolesResponse
        )
      );

    } catch (err) {

      console.error(
        "Failed to load role assignments:",
        err
      );

      setError(
        "Unable to load staff role assignments."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // FILTERED ASSIGNMENTS
  // ==========================================================

  const filteredAssignments =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return assignments.filter(
        (assignment) => {

          const staffName =
            getStaffName(
              assignment
            ).toLowerCase();

          const staffId =
            String(
              getStaffId(
                assignment
              )
            ).toLowerCase();

          const roleName =
            getRoleName(
              assignment
            ).toLowerCase();

          const status =
            getAssignmentStatus(
              assignment
            );

          const roleId =
            getId(
              assignment.role
            ) ||
            assignment.role_id;

          const primary =
            Boolean(
              assignment.is_primary
            );


          const matchesSearch =
            !search ||
            staffName.includes(search) ||
            staffId.includes(search) ||
            roleName.includes(search);


          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              statusFilter;


          const matchesRole =
            roleFilter ===
              "all" ||
            String(roleId) ===
              String(roleFilter);


          const matchesPrimary =
            primaryFilter ===
              "all" ||
            (
              primaryFilter ===
                "primary" &&
              primary
            ) ||
            (
              primaryFilter ===
                "secondary" &&
              !primary
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesRole &&
            matchesPrimary
          );

        }
      );

    }, [
      assignments,
      searchTerm,
      statusFilter,
      roleFilter,
      primaryFilter,
    ]);


  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalAssignments =
    assignments.length;


  const activeAssignments =
    assignments.filter(
      (assignment) =>
        isAssignmentActive(
          assignment
        )
    ).length;


  const primaryAssignments =
    assignments.filter(
      (assignment) =>
        isAssignmentActive(
          assignment
        ) &&
        Boolean(
          assignment.is_primary
        )
    ).length;


  const inactiveAssignments =
    assignments.filter(
      (assignment) =>
        !isAssignmentActive(
          assignment
        )
    ).length;


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setPrimaryFilter("all");

  };


  const hasFilters =
    Boolean(
      searchTerm ||
      statusFilter !==
        "all" ||
      roleFilter !==
        "all" ||
      primaryFilter !==
        "all"
    );


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
            Loading role assignments...
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

        {/* Breadcrumb */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/staff"
            className="hover:text-purple-700"
          >
            Staff Management
          </Link>

          <span>/</span>

          <span className="text-gray-700 font-medium">
            Role Assignments
          </span>

        </div>


        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <UserCheck size={25} />

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Role Assignments
              </h1>

              <p className="text-gray-600 mt-1">
                Assign and manage responsibilities for staff members.
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
              to="/staff/role-assignments/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Plus size={18} />

              Assign Role

            </Link>

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
            className="mt-0.5 flex-shrink-0"
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


        {/* Total */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <Users size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Total Assignments
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalAssignments}
              </p>

            </div>

          </div>

        </div>


        {/* Active */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-green-100 text-green-700">

              <CheckCircle2 size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Active
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {activeAssignments}
              </p>

            </div>

          </div>

        </div>


        {/* Primary */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <ShieldCheck size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Primary Roles
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {primaryAssignments}
              </p>

            </div>

          </div>

        </div>


        {/* Historical */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-gray-200 text-gray-600">

              <CalendarDays size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Inactive / Historical
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {inactiveAssignments}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">

        <div className="flex items-center gap-2 mb-4">

          <Filter
            size={18}
            className="text-purple-700"
          />

          <h2 className="font-semibold text-gray-800">
            Filters
          </h2>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">


          {/* Search */}

          <div className="relative lg:col-span-2">

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
              placeholder="Search staff or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>


          {/* Role */}

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >

            <option value="all">
              All roles
            </option>

            {roles.map(
              (role) => (

                <option
                  key={getId(role)}
                  value={getId(role)}
                >
                  {role.name ||
                    role.role_name ||
                    role.title ||
                    `Role ${getId(role)}`}
                </option>

              )
            )}

          </select>


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >

            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

          </select>


          {/* Primary */}

          <select
            value={primaryFilter}
            onChange={(event) =>
              setPrimaryFilter(
                event.target.value
              )
            }
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >

            <option value="all">
              All assignments
            </option>

            <option value="primary">
              Primary roles
            </option>

            <option value="secondary">
              Secondary roles
            </option>

          </select>


          {/* Clear */}

          {hasFilters && (

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <X size={17} />

              Clear Filters

            </button>

          )}

        </div>


        <div className="mt-4 text-sm text-gray-500">

          Showing{" "}

          <span className="font-semibold text-gray-700">
            {filteredAssignments.length}
          </span>{" "}

          of{" "}

          <span className="font-semibold text-gray-700">
            {assignments.length}
          </span>{" "}

          assignments

        </div>

      </div>


      {/* ======================================================
          ASSIGNMENTS TABLE
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">


        {filteredAssignments.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

              <UserCheck size={28} />

            </div>


            <h3 className="font-semibold text-gray-800 text-lg mt-4">

              {assignments.length === 0
                ? "No role assignments yet"
                : "No assignments match your filters"}

            </h3>


            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">

              {assignments.length === 0
                ? "Assign a role to a staff member to begin managing staff responsibilities."
                : "Try changing your search or filter selections."}

            </p>


            {assignments.length === 0 && (

              <Link
                to="/staff/role-assignments/new"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus size={17} />

                Assign First Role

              </Link>

            )}


            {assignments.length > 0 &&
              hasFilters && (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >

                  <X size={17} />

                  Clear Filters

                </button>

              )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100 border-b border-gray-200">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Staff Member
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Role
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Employment
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Period
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
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

                    const active =
                      isAssignmentActive(
                        assignment
                      );


                    return (

                      <tr
                        key={
                          assignmentId
                        }
                        className="hover:bg-gray-100 transition"
                      >


                        {/* ==================================================
                            STAFF
                        ================================================== */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <Users size={18} />

                            </div>


                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="font-semibold text-gray-800">
                                  {getStaffName(
                                    assignment
                                  )}
                                </p>


                                {assignment.is_primary &&
                                  active && (
                                    <PrimaryBadge />
                                  )}

                              </div>


                              <p className="text-xs text-gray-500 mt-0.5">

                                Staff ID:{" "}

                                {getStaffId(
                                  assignment
                                )}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* ==================================================
                            ROLE
                        ================================================== */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <ShieldCheck
                              size={16}
                              className="text-purple-700"
                            />

                            <span className="font-medium text-gray-800">
                              {getRoleName(
                                assignment
                              )}
                            </span>

                          </div>

                        </td>


                        {/* ==================================================
                            EMPLOYMENT
                        ================================================== */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {getEmploymentType(
                            assignment
                          )}

                        </td>


                        {/* ==================================================
                            PERIOD
                        ================================================== */}

                        <td className="px-5 py-4">

                          <div className="text-sm">

                            <p className="text-gray-700">

                              {formatDate(
                                assignment.start_date
                              )}

                            </p>


                            {assignment.end_date ? (

                              <p className="text-xs text-gray-500 mt-0.5">

                                to{" "}

                                {formatDate(
                                  assignment.end_date
                                )}

                              </p>

                            ) : (

                              <p className="text-xs text-gray-400 mt-0.5">
                                No end date
                              </p>

                            )}

                          </div>

                        </td>


                        {/* ==================================================
                            STATUS
                        ================================================== */}

                        <td className="px-5 py-4 text-center">

                          <StatusBadge
                            status={
                              getAssignmentStatus(
                                assignment
                              )
                            }
                          />

                        </td>


                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              to={`/staff/role-assignments/${assignmentId}`}
                              title="View assignment"
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                            >

                              <Eye size={17} />

                            </Link>


                            <Link
                              to={`/staff/role-assignments/${assignmentId}/edit`}
                              title="Edit assignment"
                              className="p-2 rounded-lg text-purple-700 hover:bg-purple-100"
                            >

                              <Edit size={17} />

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

      <div className="mt-6 bg-gray-800 rounded-xl p-5 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <UserCheck size={19} />

              <h3 className="font-semibold">
                Role Assignment Management
              </h3>

            </div>

            <p className="text-sm text-gray-300 mt-1">
              A staff member can have multiple roles, with only one active primary role.
            </p>

          </div>


          <Link
            to="/staff/roles"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >

            <ShieldCheck size={17} />

            Manage Roles

          </Link>

        </div>

      </div>

    </div>
  );
};


export default StaffRoleAssignmentsPage;

