import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// DRIVERS PAGE
// ============================================================
//
// Driver management.
//
// DriverProfile is linked to the general Staff record.
//
// IMPORTANT STATUS ARCHITECTURE:
// --------------------------------
// DriverProfile does NOT have its own status field.
//
// Driver status is derived from the linked Staff record:
//
//     driver.status
//
// The backend serializer exposes Staff.status as a read-only
// field on DriverProfile.
//
// Therefore:
// - Do NOT use driver.is_active
// - Do NOT use DriverProfile.status for writing
// - Status changes must be made through the Staff API
//
// Driver information includes:
//
// - Staff
// - Driving licence number
// - Licence class
// - Licence issue date
// - Licence expiry date
// - PSV licence number
// - PSV expiry date
// - Years of experience
// - Previous driving experience
// - Medical certificate expiry
// - Driver badge number
// - Verification status
// - Verification date
// - Verified by
// - Notes
//
// VERIFICATION ARCHITECTURE:
// --------------------------
// Verification is stored on DriverProfile.
//
// When the logged-in user verifies a driver:
//
// - is_verified = true
// - verified_by = request.user
// - verified_at = current time
//
// The frontend does NOT manually select the verifying user.
//
// API:
//
// GET    /transport/driver-profiles/
// POST   /transport/driver-profiles/
// GET    /transport/driver-profiles/:id/
// PATCH  /transport/driver-profiles/:id/
// DELETE /transport/driver-profiles/:id/
//
// The exact serializer representation of the related Staff
// object may vary between nested and ID representations.
// The helper functions below handle the common representations.
// ============================================================


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


const getStaffId = (driver) => {
  if (!driver) {
    return null;
  }

  if (
    typeof driver.staff === "object" &&
    driver.staff !== null
  ) {
    return getId(driver.staff);
  }

  return (
    driver.staff ??
    driver.staff_id ??
    null
  );
};


const getStaffName = (driver) => {
  if (!driver) {
    return "Unknown Staff";
  }

  if (driver.staff_name) {
    return driver.staff_name;
  }

  if (
    typeof driver.staff === "object" &&
    driver.staff !== null
  ) {
    if (driver.staff.full_name) {
      return driver.staff.full_name;
    }

    const name = [
      driver.staff.first_name,
      driver.staff.middle_name,
      driver.staff.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (name) {
      return name;
    }
  }

  if (driver.name) {
    return driver.name;
  }

  return "Unknown Staff";
};


const getStaffPhone = (driver) => {
  if (!driver) {
    return "—";
  }

  if (driver.staff_phone) {
    return driver.staff_phone;
  }

  if (
    typeof driver.staff === "object" &&
    driver.staff !== null
  ) {
    return (
      driver.staff.phone ||
      driver.staff.mobile ||
      "—"
    );
  }

  return driver.phone || "—";
};


const getStaffEmail = (driver) => {
  if (!driver) {
    return "—";
  }

  if (driver.staff_email) {
    return driver.staff_email;
  }

  if (
    typeof driver.staff === "object" &&
    driver.staff !== null
  ) {
    return driver.staff.email || "—";
  }

  return driver.email || "—";
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
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getDaysUntil = (value) => {
  if (!value) {
    return null;
  }

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  target.setHours(
    0,
    0,
    0,
    0
  );

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );
};


const getExpiryState = (value) => {
  const days = getDaysUntil(value);

  if (days === null) {
    return "unknown";
  }

  if (days < 0) {
    return "expired";
  }

  if (days <= 30) {
    return "warning";
  }

  return "valid";
};


const getExpiryLabel = (value) => {
  const days = getDaysUntil(value);

  if (days === null) {
    return "No expiry date";
  }

  if (days < 0) {
    return `Expired ${Math.abs(days)} day${
      Math.abs(days) === 1 ? "" : "s"
    } ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  if (days <= 30) {
    return `Expires in ${days} day${
      days === 1 ? "" : "s"
    }`;
  }

  return `Valid for ${days} days`;
};


// ============================================================
// STATUS HELPERS
// ============================================================

const getStatusLabel = (status) => {
  const labels = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    resigned: "Resigned",
    terminated: "Terminated",
    retired: "Retired",
  };

  return (
    labels[status] ||
    "Unknown"
  );
};


const getStatusClasses = (status) => {
  switch (status) {
    case "active":
      return {
        badge:
          "bg-green-100 text-green-700",
        dot:
          "bg-green-500",
      };

    case "suspended":
      return {
        badge:
          "bg-amber-100 text-amber-700",
        dot:
          "bg-amber-500",
      };

    case "inactive":
      return {
        badge:
          "bg-gray-100 text-gray-600",
        dot:
          "bg-gray-400",
      };

    case "resigned":
      return {
        badge:
          "bg-orange-100 text-orange-700",
        dot:
          "bg-orange-500",
      };

    case "terminated":
      return {
        badge:
          "bg-red-100 text-red-700",
        dot:
          "bg-red-500",
      };

    case "retired":
      return {
        badge:
          "bg-slate-100 text-slate-600",
        dot:
          "bg-slate-400",
      };

    default:
      return {
        badge:
          "bg-gray-100 text-gray-600",
        dot:
          "bg-gray-400",
      };
  }
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const DriversListPage = () => {


  // ==========================================================
  // DATA
  // ==========================================================

  const [drivers, setDrivers] = useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [verificationFilter, setVerificationFilter] =
    useState("all");

  const [expiryFilter, setExpiryFilter] =
    useState("all");


  // ==========================================================
  // LOAD DRIVERS
  // ==========================================================

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          "/transport/driver-profiles/"
        );

      setDrivers(
        extractList(response)
      );

    } catch (err) {
      console.error(
        "Failed to load drivers:",
        err
      );

      setError(
        "Failed to load drivers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDrivers();
  }, []);


  // ==========================================================
  // DRIVER STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {

    const total =
      drivers.length;

    // Driver status comes from Staff.status.
    // DriverProfile does not have is_active.
    const active =
      drivers.filter(
        (driver) =>
          driver.status === "active"
      ).length;

    const verified =
      drivers.filter(
        (driver) =>
          driver.is_verified === true
      ).length;

    const unverified =
      drivers.filter(
        (driver) =>
          driver.is_verified !== true
      ).length;

    const licenceExpired =
      drivers.filter(
        (driver) =>
          getExpiryState(
            driver.license_expiry_date
          ) === "expired"
      ).length;

    const licenceExpiring =
      drivers.filter(
        (driver) =>
          getExpiryState(
            driver.license_expiry_date
          ) === "warning"
      ).length;

    const psvExpired =
      drivers.filter(
        (driver) =>
          getExpiryState(
            driver.psv_expiry_date
          ) === "expired"
      ).length;

    const medicalExpired =
      drivers.filter(
        (driver) =>
          getExpiryState(
            driver.medical_certificate_expiry
          ) === "expired"
      ).length;

    return {
      total,
      active,
      verified,
      unverified,
      licenceExpired,
      licenceExpiring,
      psvExpired,
      medicalExpired,
    };

  }, [
    drivers,
  ]);


  // ==========================================================
  // FILTER DRIVERS
  // ==========================================================

  const filteredDrivers = useMemo(() => {

    const search =
      searchTerm
        .toLowerCase()
        .trim();

    return drivers.filter(
      (driver) => {

        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        const name =
          getStaffName(
            driver
          ).toLowerCase();

        const licence =
          String(
            driver.license_number || ""
          ).toLowerCase();

        const psvLicence =
          String(
            driver.psv_license_number || ""
          ).toLowerCase();

        const badge =
          String(
            driver.driver_badge_number || ""
          ).toLowerCase();

        const matchesSearch =
          !search ||
          name.includes(search) ||
          licence.includes(search) ||
          psvLicence.includes(search) ||
          badge.includes(search);


        if (!matchesSearch) {
          return false;
        }


        // ----------------------------------------------------
        // STATUS FILTER
        // ----------------------------------------------------
        //
        // Status is Staff.status.
        //
        // There is intentionally no is_active fallback.
        // ----------------------------------------------------

        if (
          statusFilter !== "all"
        ) {

          if (
            driver.status !==
            statusFilter
          ) {
            return false;
          }
        }


        // ----------------------------------------------------
        // VERIFICATION FILTER
        // ----------------------------------------------------

        if (
          verificationFilter !== "all"
        ) {

          const verified =
            driver.is_verified === true;

          if (
            verificationFilter === "verified" &&
            !verified
          ) {
            return false;
          }

          if (
            verificationFilter === "unverified" &&
            verified
          ) {
            return false;
          }
        }


        // ----------------------------------------------------
        // EXPIRY FILTER
        // ----------------------------------------------------

        if (
          expiryFilter !== "all"
        ) {

          const expiryDates = [
            driver.license_expiry_date,
            driver.psv_expiry_date,
            driver.medical_certificate_expiry,
          ].filter(Boolean);

          if (
            expiryDates.length === 0
          ) {
            return (
              expiryFilter ===
              "no-date"
            );
          }

          const states =
            expiryDates.map(
              getExpiryState
            );

          if (
            expiryFilter === "expired" &&
            !states.includes("expired")
          ) {
            return false;
          }

          if (
            expiryFilter === "warning" &&
            !states.includes("warning")
          ) {
            return false;
          }

          if (
            expiryFilter === "valid" &&
            !states.includes("valid")
          ) {
            return false;
          }
        }


        return true;
      }
    );

  }, [
    drivers,
    searchTerm,
    statusFilter,
    verificationFilter,
    expiryFilter,
  ]);


  // ==========================================================
  // DRIVER STATUS
  // ==========================================================

  const getDriverStatus =
    (driver) => {
      return (
        driver?.status ||
        "unknown"
      );
    };


  // ==========================================================
  // EXPIRY BADGE
  // ==========================================================

  const ExpiryBadge = ({
    label,
    date,
  }) => {

    if (!date) {
      return (
        <div className="text-xs text-gray-500">

          <span className="block">
            {label}
          </span>

          <span className="block mt-0.5">
            Not provided
          </span>

        </div>
      );
    }

    const state =
      getExpiryState(date);

    if (state === "expired") {
      return (
        <div>

          <span className="block text-xs font-medium text-gray-600">
            {label}
          </span>

          <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <AlertTriangle size={12} />
            {getExpiryLabel(date)}
          </span>

        </div>
      );
    }

    if (state === "warning") {
      return (
        <div>

          <span className="block text-xs font-medium text-gray-600">
            {label}
          </span>

          <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <AlertTriangle size={12} />
            {getExpiryLabel(date)}
          </span>

        </div>
      );
    }

    return (
      <div>

        <span className="block text-xs font-medium text-gray-600">
          {label}
        </span>

        <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <ShieldCheck size={12} />
          {formatDate(date)}
        </span>

      </div>
    );
  };


  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const StatusBadge = ({
    status,
  }) => {

    const classes =
      getStatusClasses(
        status
      );

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${classes.badge}`}
      >

        <span
          className={`w-2 h-2 rounded-full ${classes.dot}`}
        />

        {getStatusLabel(status)}

      </span>
    );
  };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            size={30}
            className="mx-auto text-purple-700 animate-spin"
          />

          <p className="text-gray-600 mt-3">
            Loading drivers...
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


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Drivers
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Users size={25} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Drivers
              </h1>

              <p className="text-gray-600 mt-1">
                Manage school transport drivers and their compliance records.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={loadDrivers}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <Link
              to="/transport/drivers/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >
              <Plus size={18} />
              Add Driver
            </Link>

          </div>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <AlertTriangle size={19} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={loadDrivers}
            className="text-sm font-semibold hover:underline"
          >
            Retry
          </button>

        </div>
      )}


      {/* ====================================================
          STATISTICS
      ==================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">


        {/* Total */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Drivers
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {statistics.total}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Registered driver profiles
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users size={22} />
            </div>

          </div>

        </div>


        {/* Active */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Active Drivers
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {statistics.active}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Currently available for transport duties
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <UserCheck size={22} />
            </div>

          </div>

        </div>


        {/* Verified */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Verified Drivers
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {statistics.verified}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Driver profiles verified by the school
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BadgeCheck size={22} />
            </div>

          </div>

        </div>


        {/* Compliance */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Compliance Alerts
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {
                  statistics.licenceExpired +
                  statistics.licenceExpiring +
                  statistics.psvExpired +
                  statistics.medicalExpired
                }
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Expired or approaching expiry
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          COMPLIANCE SUMMARY
      ==================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle size={19} />
            </div>

            <div>

              <p className="text-sm font-medium text-red-800">
                Expired Licences
              </p>

              <p className="text-xl font-bold text-red-900">
                {statistics.licenceExpired}
              </p>

            </div>

          </div>

        </div>


        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={19} />
            </div>

            <div>

              <p className="text-sm font-medium text-amber-800">
                Expiring Licences
              </p>

              <p className="text-xl font-bold text-amber-900">
                {statistics.licenceExpiring}
              </p>

            </div>

          </div>

        </div>


        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
              <UserX size={19} />
            </div>

            <div>

              <p className="text-sm font-medium text-gray-700">
                Unverified Drivers
              </p>

              <p className="text-xl font-bold text-gray-900">
                {statistics.unverified}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          FILTERS
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex items-center gap-2 mb-4">

          <Filter
            size={18}
            className="text-purple-700"
          />

          <h2 className="font-semibold text-gray-800">
            Search & Filters
          </h2>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


          {/* Search */}

          <div className="lg:col-span-1">

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
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Name, licence or badge..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

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


          {/* Verification */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Verification
            </label>

            <select
              value={verificationFilter}
              onChange={(event) =>
                setVerificationFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="unverified">
                Unverified
              </option>

            </select>

          </div>


          {/* Expiry */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Compliance
            </label>

            <select
              value={expiryFilter}
              onChange={(event) =>
                setExpiryFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="warning">
                Expiring Soon
              </option>

              <option value="valid">
                Valid
              </option>

              <option value="no-date">
                Missing Expiry Date
              </option>

            </select>

          </div>

        </div>


        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">

          <p className="text-sm text-gray-500">

            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredDrivers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {drivers.length}
            </span>{" "}
            drivers

          </p>


          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setVerificationFilter("all");
              setExpiryFilter("all");
            }}
            className="text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            Clear Filters
          </button>

        </div>

      </div>


      {/* ====================================================
          DRIVER TABLE
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h2 className="font-semibold text-gray-800">
              Driver Profiles
            </h2>

            <p className="text-sm text-gray-500 mt-0.5">
              Transport drivers registered in the school system.
            </p>

          </div>


          <Link
            to="/transport/drivers/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-800 text-white hover:bg-purple-900 text-sm"
          >
            <Plus size={16} />
            Add Driver
          </Link>

        </div>


        {filteredDrivers.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

              <Users size={28} />

            </div>

            <h3 className="font-semibold text-gray-800 text-lg mt-4">
              No drivers found
            </h3>

            <p className="text-sm text-gray-500 mt-1">

              {drivers.length === 0
                ? "No driver profiles have been registered yet."
                : "No drivers match the selected search and filters."
              }

            </p>

            {drivers.length === 0 && (
              <Link
                to="/transport/drivers/new"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >
                <Plus size={17} />
                Add First Driver
              </Link>
            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Driver
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Licence
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    PSV
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Experience
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Compliance
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Verification
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {filteredDrivers.map(
                  (driver) => {

                    const driverId =
                      getId(driver);

                    const status =
                      getDriverStatus(
                        driver
                      );

                    const verified =
                      driver.is_verified === true;

                    const statusClasses =
                      getStatusClasses(
                        status
                      );

                    return (
                      <tr
                        key={driverId}
                        className="hover:bg-gray-100 transition-colors"
                      >


                        {/* DRIVER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

                              <Users size={18} />

                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-gray-800 truncate">
                                {getStaffName(
                                  driver
                                )}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                {getStaffPhone(
                                  driver
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                {getStaffEmail(
                                  driver
                                )}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* LICENCE */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-800">
                            {driver.license_number ||
                              "—"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Class:{" "}
                            {driver.license_class ||
                              "—"}
                          </p>

                          <div className="mt-2">

                            <ExpiryBadge
                              label="Expiry"
                              date={
                                driver.license_expiry_date
                              }
                            />

                          </div>

                        </td>


                        {/* PSV */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-800">
                            {driver.psv_license_number ||
                              "—"}
                          </p>

                          <div className="mt-2">

                            <ExpiryBadge
                              label="PSV Expiry"
                              date={
                                driver.psv_expiry_date
                              }
                            />

                          </div>

                        </td>


                        {/* EXPERIENCE */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-gray-800">

                            {driver.years_of_experience !==
                              undefined &&
                            driver.years_of_experience !==
                              null
                              ? `${driver.years_of_experience} year${
                                  Number(
                                    driver.years_of_experience
                                  ) === 1
                                    ? ""
                                    : "s"
                                }`
                              : "—"}

                          </p>

                          {driver.driver_badge_number && (
                            <p className="text-xs text-gray-500 mt-1">
                              Badge:{" "}
                              {driver.driver_badge_number}
                            </p>
                          )}

                        </td>


                        {/* COMPLIANCE */}

                        <td className="px-5 py-4">

                          <ExpiryBadge
                            label="Medical Certificate"
                            date={
                              driver.medical_certificate_expiry
                            }
                          />

                        </td>


                        {/* VERIFICATION */}

                        <td className="px-5 py-4">

                          <div className="space-y-2">

                            {verified ? (

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

                                <BadgeCheck
                                  size={13}
                                />

                                Verified

                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">

                                <AlertTriangle
                                  size={13}
                                />

                                Unverified

                              </span>

                            )}


                            <div>

                              <StatusBadge
                                status={
                                  status
                                }
                              />

                            </div>

                          </div>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              to={`/transport/drivers/${driverId}`}
                              title="View Driver"
                              className="w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-600 hover:text-purple-700 hover:border-purple-300 flex items-center justify-center"
                            >
                              <Eye size={17} />
                            </Link>


                            <Link
                              to={`/transport/drivers/${driverId}/edit`}
                              title="Edit Driver"
                              className="w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-600 hover:text-purple-700 hover:border-purple-300 flex items-center justify-center"
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


      {/* ====================================================
          FOOTER NAVIGATION
      ==================================================== */}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <Link
          to="/transport"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-700"
        >
          <ArrowLeft size={16} />
          Back to Transport Dashboard
        </Link>


        <Link
          to="/transport/vehicles"
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          Manage Vehicles
          <ArrowRight size={16} />
        </Link>

      </div>

    </div>
  );
};


export default DriversListPage;