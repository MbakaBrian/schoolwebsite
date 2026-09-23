import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  UserRoundX,
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
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {

  const isActive =
    status === "active";

  const isSuspended =
    status === "suspended";

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 size={13} />
        Active
      </span>
    );
  }

  if (isSuspended) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <UserRoundX size={13} />
        Suspended
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
      <UserRoundX size={13} />
      {formatLabel(status)}
    </span>
  );
};


// ============================================================
// COMPONENT
// ============================================================

const StaffListPage = () => {

  const navigate = useNavigate();


  // ==========================================================
  // DATA
  // ==========================================================

  const [staff, setStaff] = useState([]);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [employmentTypeFilter, setEmploymentTypeFilter] =
    useState("all");


  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [deactivatingId, setDeactivatingId] =
    useState(null);


  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  const loadStaff = async (
    showInitialLoader = false
  ) => {

    try {

      if (showInitialLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response =
        await axiosInstance.get(
          "/staff/"
        );

      setStaff(
        extractList(response)
      );

    } catch (err) {

      console.error(
        "Failed to load staff:",
        err
      );

      setError(
        "Unable to load staff members."
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

    loadStaff(true);

  }, []);


  // ==========================================================
  // FILTERED STAFF
  // ==========================================================

  const filteredStaff = useMemo(() => {

    const search =
      searchTerm
        .toLowerCase()
        .trim();

    return staff.filter(
      (member) => {

        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        if (search) {

          const name =
            getFullName(member)
              .toLowerCase();

          const staffId =
            String(
              member.staff_id || ""
            ).toLowerCase();

          const employeeNumber =
            String(
              member.employee_number || ""
            ).toLowerCase();

          const phone =
            String(
              member.phone || ""
            ).toLowerCase();

          const email =
            String(
              member.email || ""
            ).toLowerCase();

          const matchesSearch =
            name.includes(search) ||
            staffId.includes(search) ||
            employeeNumber.includes(search) ||
            phone.includes(search) ||
            email.includes(search);

          if (!matchesSearch) {
            return false;
          }
        }


        // -----------------------------------------------
        // STATUS FILTER
        // -----------------------------------------------

        if (
          statusFilter !== "all" &&
          member.status !== statusFilter
        ) {
          return false;
        }


        // -----------------------------------------------
        // EMPLOYMENT TYPE FILTER
        // -----------------------------------------------

        if (
          employmentTypeFilter !== "all" &&
          member.employment_type !==
            employmentTypeFilter
        ) {
          return false;
        }


        return true;
      }
    );

  }, [
    staff,
    searchTerm,
    statusFilter,
    employmentTypeFilter,
  ]);


  // ==========================================================
  // COUNTS
  // ==========================================================

  const activeCount = useMemo(() => {

    return staff.filter(
      (member) =>
        member.status === "active"
    ).length;

  }, [staff]);


  const inactiveCount = useMemo(() => {

    return staff.filter(
      (member) =>
        member.status === "inactive"
    ).length;

  }, [staff]);


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearchTerm("");
    setStatusFilter("all");
    setEmploymentTypeFilter("all");

  };


  const hasFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    employmentTypeFilter !== "all";


  // ==========================================================
  // DEACTIVATE STAFF
  // ==========================================================

  const handleDeactivate = async (
    member
  ) => {

    const staffName =
      getFullName(member);

    const confirmed =
      window.confirm(
        `Are you sure you want to deactivate ${staffName}?`
      );

    if (!confirmed) {
      return;
    }


    const staffId =
      getId(member);


    try {

      setDeactivatingId(
        staffId
      );

      setError("");


      await axiosInstance.patch(
        `/staff/${staffId}/`,
        {
          status: "inactive",
        }
      );


      await loadStaff(false);

    } catch (err) {

      console.error(
        "Failed to deactivate staff:",
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
          "The staff member could not be deactivated."
        );
      }

    } finally {

      setDeactivatingId(null);

    }
  };


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
            Loading staff members...
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

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Staff Members
          </span>

        </div>


        {/* Heading */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Users size={25} />

            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Staff Members
              </h1>

              <p className="text-gray-600 mt-1">
                View and manage all staff members.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={() =>
                loadStaff(false)
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


            <Link
              to="/staff/members/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Plus size={18} />

              Add Staff

            </Link>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start justify-between gap-3">

          <div className="flex items-start gap-3">

            <X
              size={19}
              className="mt-0.5 flex-shrink-0"
            />

            <span>
              {error}
            </span>

          </div>


          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-500 hover:text-red-700"
          >

            <X size={17} />

          </button>

        </div>

      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Total */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Staff
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {staff.length}
              </p>

            </div>


            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">

              <Users size={22} />

            </div>

          </div>

        </div>


        {/* Active */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Active
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {activeCount}
              </p>

            </div>


            <div className="p-3 rounded-xl bg-green-100 text-green-700">

              <CheckCircle2 size={22} />

            </div>

          </div>

        </div>


        {/* Inactive */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Inactive
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {inactiveCount}
              </p>

            </div>


            <div className="p-3 rounded-xl bg-gray-200 text-gray-700">

              <UserRoundX size={22} />

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex flex-col lg:flex-row lg:items-end gap-4">

          {/* Search */}

          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search Staff
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
                placeholder="Name, staff ID, employee number, phone or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>


          {/* Status */}

          <div className="w-full lg:w-52">

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

              <option value="suspended">
                Suspended
              </option>

              <option value="resigned">
                Resigned
              </option>

              <option value="terminated">
                Terminated
              </option>

              <option value="retired">
                Retired
              </option>

            </select>

          </div>


          {/* Employment Type */}

          <div className="w-full lg:w-56">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Employment Type
            </label>

            <select
              value={
                employmentTypeFilter
              }
              onChange={(event) =>
                setEmploymentTypeFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All Employment Types
              </option>

              <option value="permanent">
                Permanent
              </option>

              <option value="contract">
                Contract
              </option>

              <option value="part_time">
                Part-time
              </option>

              <option value="casual">
                Casual
              </option>

              <option value="intern">
                Intern
              </option>

              <option value="volunteer">
                Volunteer
              </option>

            </select>

          </div>


          {/* Clear */}

          {hasFilters && (

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >

              <Filter size={17} />

              Clear Filters

            </button>

          )}

        </div>

      </div>


      {/* ======================================================
          RESULTS SUMMARY
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

        <p className="text-sm text-gray-600">

          Showing{" "}
          <span className="font-semibold text-gray-800">
            {filteredStaff.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800">
            {staff.length}
          </span>{" "}
          staff members

        </p>


        {hasFilters && (

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-purple-700 hover:text-purple-900 font-medium"
          >
            Clear filters
          </button>

        )}

      </div>


      {/* ======================================================
          STAFF TABLE
      ====================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        {filteredStaff.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

              <Users size={28} />

            </div>


            <h3 className="text-lg font-semibold text-gray-800">
              No staff members found
            </h3>


            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">

              {hasFilters
                ? "No staff members match your current search and filters."
                : "There are currently no staff members registered in the system."}

            </p>


            {hasFilters ? (

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >

                <X size={17} />

                Clear Filters

              </button>

            ) : (

              <Link
                to="/staff/members/new"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus size={17} />

                Add First Staff Member

              </Link>

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
                    Employee No.
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Phone
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Employment
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {filteredStaff.map(
                  (member) => {

                    const staffId =
                      getId(member);

                    const isDeactivating =
                      deactivatingId ===
                      staffId;


                    return (

                      <tr
                        key={staffId}
                        className="hover:bg-gray-100 transition"
                      >

                        {/* ----------------------------------
                            STAFF
                        ---------------------------------- */}

                        <td className="px-5 py-4">

                          <Link
                            to={`/staff/members/${staffId}`}
                            className="flex items-center gap-3"
                          >

                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <Users size={18} />

                            </div>


                            <div className="min-w-0">

                              <p className="font-semibold text-gray-800 hover:text-purple-800 truncate">

                                {getFullName(
                                  member
                                )}

                              </p>


                              <p className="text-xs text-gray-500 mt-0.5">

                                {member.staff_id ||
                                  "No staff ID"}

                              </p>

                            </div>

                          </Link>

                        </td>


                        {/* ----------------------------------
                            EMPLOYEE NUMBER
                        ---------------------------------- */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {member.employee_number ||
                            "—"}

                        </td>


                        {/* ----------------------------------
                            PHONE
                        ---------------------------------- */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          {member.phone ||
                            "—"}

                        </td>


                        {/* ----------------------------------
                            EMPLOYMENT
                        ---------------------------------- */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">

                            {formatLabel(
                              member.employment_type
                            )}

                          </span>

                        </td>


                        {/* ----------------------------------
                            STATUS
                        ---------------------------------- */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              member.status
                            }
                          />

                        </td>


                        {/* ----------------------------------
                            ACTIONS
                        ---------------------------------- */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-1.5">

                            {/* View */}

                            <Link
                              to={`/staff/members/${staffId}`}
                              title="View staff"
                              className="p-2 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                            >

                              <Eye size={17} />

                            </Link>


                            {/* Edit */}

                            <Link
                              to={`/staff/members/${staffId}/edit`}
                              title="Edit staff"
                              className="p-2 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                            >

                              <Edit size={17} />

                            </Link>


                            {/* Deactivate */}

                            {member.status ===
                              "active" && (

                              <button
                                type="button"
                                title="Deactivate staff"
                                onClick={() =>
                                  handleDeactivate(
                                    member
                                  )
                                }
                                disabled={
                                  isDeactivating
                                }
                                className="p-2 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >

                                {isDeactivating ? (

                                  <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                  />

                                ) : (

                                  <UserRoundX
                                    size={17}
                                  />

                                )}

                              </button>

                            )}

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

      {filteredStaff.length > 0 && (

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">

          <p>
            Staff directory
          </p>

          <p>
            {activeCount} active staff member
            {activeCount === 1
              ? ""
              : "s"}
          </p>

        </div>

      )}

    </div>
  );
};


export default StaffListPage;

