
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
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

  return item.id ?? item.pk ?? null;
};


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


const isActiveRole = (role) => {
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


const getAssignmentCount = (role) => {
  return (
    role.assignment_count ??
    role.assignments_count ??
    role.staff_count ??
    role.assigned_staff_count ??
    0
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-100 text-green-700 text-xs font-semibold">

        <CheckCircle2 size={13} />

        Active

      </span>
    );
  }


  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold">

      <X size={13} />

      Inactive

    </span>
  );
};


// ============================================================
// COMPONENT
// ============================================================

const StaffRolesPage = () => {

  const navigate = useNavigate();


  // ==========================================================
  // DATA
  // ==========================================================

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


  // ==========================================================
  // LOAD ROLES
  // ==========================================================

  useEffect(() => {

    loadRoles();

  }, []);


  const loadRoles = async () => {

    try {

      setError("");

      if (roles.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }


      const response =
        await axiosInstance.get(
          "/staff/roles/"
        );


      setRoles(
        extractList(response)
      );

    } catch (err) {

      console.error(
        "Failed to load staff roles:",
        err
      );

      setError(
        "Unable to load staff roles."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // FILTER ROLES
  // ==========================================================

  const filteredRoles = useMemo(() => {

    const search =
      searchTerm
        .toLowerCase()
        .trim();


    return roles.filter(
      (role) => {

        const name =
          getRoleName(
            role
          ).toLowerCase();

        const description =
          getRoleDescription(
            role
          ).toLowerCase();


        const matchesSearch =
          !search ||
          name.includes(search) ||
          description.includes(search);


        const active =
          isActiveRole(role);


        const matchesStatus =
          statusFilter ===
          "all" ||
          (
            statusFilter ===
            "active" &&
            active
          ) ||
          (
            statusFilter ===
            "inactive" &&
            !active
          );


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }, [
    roles,
    searchTerm,
    statusFilter,
  ]);


  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalRoles =
    roles.length;


  const activeRoles =
    roles.filter(
      (role) =>
        isActiveRole(role)
    ).length;


  const inactiveRoles =
    roles.filter(
      (role) =>
        !isActiveRole(role)
    ).length;


  const totalAssignments =
    roles.reduce(
      (
        total,
        role
      ) =>
        total +
        Number(
          getAssignmentCount(
            role
          )
        ),
      0
    );


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearchTerm("");
    setStatusFilter("all");

  };


  const hasFilters =
    Boolean(
      searchTerm ||
      statusFilter !==
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
            Loading staff roles...
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
            Staff Roles
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
                Staff Roles
              </h1>

              <p className="text-gray-600 mt-1">
                Manage the roles and responsibilities available to staff members.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={loadRoles}
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
              to="/staff/roles/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Plus size={18} />

              Add Role

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
            className="mt-0.5"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total Roles */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <ShieldCheck size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Total Roles
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalRoles}
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
                Active Roles
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {activeRoles}
              </p>

            </div>

          </div>

        </div>


        {/* Inactive */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-gray-200 text-gray-600">

              <BriefcaseBusiness size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Inactive Roles
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {inactiveRoles}
              </p>

            </div>

          </div>

        </div>


        {/* Assignments */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">

              <Users size={20} />

            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Role Assignments
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalAssignments}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}

          <div className="relative flex-1">

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
              placeholder="Search roles or descriptions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>


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


          {/* Clear */}

          {hasFilters && (

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <X size={17} />

              Clear

            </button>

          )}

        </div>


        <div className="mt-3 text-sm text-gray-500">

          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filteredRoles.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {roles.length}
          </span>{" "}
          roles

        </div>

      </div>


      {/* ======================================================
          ROLES TABLE
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        {filteredRoles.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

              <ShieldCheck size={28} />

            </div>

            <h3 className="font-semibold text-gray-800 text-lg mt-4">

              {roles.length === 0
                ? "No staff roles yet"
                : "No roles match your filters"}

            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">

              {roles.length === 0
                ? "Create your first staff role to begin assigning responsibilities to staff members."
                : "Try changing your search or status filter."}

            </p>


            {roles.length === 0 && (

              <Link
                to="/staff/roles/new"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus size={17} />

                Create First Role

              </Link>

            )}


            {roles.length > 0 &&
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
                    Role
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Description
                  </th>

                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Staff
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

                {filteredRoles.map(
                  (role) => {

                    const roleId =
                      getId(role);

                    const active =
                      isActiveRole(
                        role
                      );

                    const description =
                      getRoleDescription(
                        role
                      );

                    const assignmentCount =
                      getAssignmentCount(
                        role
                      );


                    return (

                      <tr
                        key={roleId}
                        className="hover:bg-gray-100 transition"
                      >

                        {/* Role */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <ShieldCheck size={19} />

                            </div>


                            <div>

                              <p className="font-semibold text-gray-800">
                                {getRoleName(
                                  role
                                )}
                              </p>

                              {role.code && (

                                <p className="text-xs text-gray-500 mt-0.5">
                                  Code: {role.code}
                                </p>

                              )}

                            </div>

                          </div>

                        </td>


                        {/* Description */}

                        <td className="px-5 py-4 max-w-md">

                          <p className="text-sm text-gray-600 line-clamp-2">

                            {description ||
                              "No description provided."}

                          </p>

                        </td>


                        {/* Staff */}

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex items-center justify-center gap-1.5 min-w-10 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm">

                            <Users size={14} />

                            {assignmentCount}

                          </span>

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4 text-center">

                          <StatusBadge
                            active={active}
                          />

                        </td>


                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              to={`/staff/roles/${roleId}`}
                              title="View role"
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                            >

                              <Eye size={17} />

                            </Link>


                            <Link
                              to={`/staff/roles/${roleId}/edit`}
                              title="Edit role"
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
          FOOTER INFORMATION
      ====================================================== */}

      <div className="mt-6 bg-gray-800 rounded-xl p-5 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <ShieldCheck size={19} />

              <h3 className="font-semibold">
                Staff Role Management
              </h3>

            </div>

            <p className="text-sm text-gray-300 mt-1">
              Roles define the responsibilities that can be assigned to staff members.
            </p>

          </div>


          <Link
            to="/staff/role-assignments"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >

            <Users size={17} />

            View Role Assignments

          </Link>

        </div>

      </div>

    </div>
  );
};


export default StaffRolesPage;

