import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


/*
==================================================
DRIVER REPORTS PAGE
==================================================

Weekly driver-report workspace.

API:
GET /transport/driver-reports/

Filters:
- Driver
- Vehicle
- Week/date
- Status
- Search

The page expects reports to contain information
similar to:

{
    id,
    driver,
    driver_name,
    vehicle,
    vehicle_name,
    report_date,
    week_start,
    week_end,
    status,
    starting_mileage,
    ending_mileage,
    mileage,
    fuel_quantity,
    fuel_cost,
    incidents,
    comments,
    submitted_at,
    created_at,
}

The helper functions intentionally tolerate
slightly different serializer representations.
==================================================
*/


// ==================================================
// HELPERS
// ==================================================

const getId = (item) => {
  if (!item) return null;

  return item.id ?? item.pk ?? null;
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


const formatDate = (value) => {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value).slice(0, 10);
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


const formatNumber = (value) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "0";
  }

  return number.toLocaleString(
    "en-KE",
    {
      maximumFractionDigits: 2,
    }
  );
};


const formatCurrency = (value) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "KSh 0.00";
  }

  return `KSh ${number.toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const getDriverName = (report) => {

  if (
    report?.driver_name
  ) {
    return report.driver_name;
  }

  if (
    report?.driver?.full_name
  ) {
    return report.driver.full_name;
  }

  if (
    report?.driver?.name
  ) {
    return report.driver.name;
  }

  if (
    report?.driver?.staff_name
  ) {
    return report.driver.staff_name;
  }

  if (
    typeof report?.driver ===
    "string"
  ) {
    return report.driver;
  }

  return "Unknown driver";
};


const getVehicleName = (report) => {

  if (
    report?.vehicle_name
  ) {
    return report.vehicle_name;
  }

  if (
    report?.vehicle?.registration_number
  ) {
    return report.vehicle.registration_number;
  }

  if (
    report?.vehicle?.name
  ) {
    return report.vehicle.name;
  }

  if (
    typeof report?.vehicle ===
    "string"
  ) {
    return report.vehicle;
  }

  return "Unknown vehicle";
};


const getStatus = (report) => {

  if (
    report?.status
  ) {
    return String(
      report.status
    ).toLowerCase();
  }

  if (
    report?.is_approved === true
  ) {
    return "approved";
  }

  if (
    report?.is_submitted === true
  ) {
    return "submitted";
  }

  return "draft";
};


const getStatusLabel = (status) => {

  const labels = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
    reviewed: "Reviewed",
  };

  return (
    labels[status] ||
    status
      ?.replaceAll("_", " ")
      ?.replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      ) ||
    "Unknown"
  );
};


const getStatusClasses = (status) => {

  switch (status) {

    case "approved":
    case "reviewed":
      return "bg-green-100 text-green-700 border-green-200";

    case "submitted":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";

    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};


const getReportDate = (report) => {

  return (
    report.week_start ||
    report.report_date ||
    report.date ||
    report.created_at ||
    null
  );
};


const getReportMileage = (report) => {

  if (
    report.mileage !== undefined &&
    report.mileage !== null
  ) {
    return report.mileage;
  }

  if (
    report.starting_mileage !== undefined &&
    report.ending_mileage !== undefined &&
    report.starting_mileage !== null &&
    report.ending_mileage !== null
  ) {
    return (
      Number(
        report.ending_mileage
      ) -
      Number(
        report.starting_mileage
      )
    );
  }

  return 0;
};


const getErrorMessage = (error) => {

  const detail =
    error?.response?.data?.detail;

  if (
    typeof detail ===
    "string"
  ) {
    return detail;
  }

  const data =
    error?.response?.data;

  if (
    data &&
    typeof data ===
    "object"
  ) {

    return Object.entries(data)
      .map(
        ([field, messages]) => {

          const message =
            Array.isArray(messages)
              ? messages.join(" ")
              : String(messages);

          return `${field}: ${message}`;
        }
      )
      .join(" ");
  }

  return (
    error?.message ||
    "An unexpected error occurred."
  );
};


// ==================================================
// COMPONENT
// ==================================================

const DriverReportsPage = () => {

  const navigate =
    useNavigate();


  // ==================================================
  // DATA
  // ==================================================

  const [reports, setReports] =
    useState([]);

  const [drivers, setDrivers] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);


  // ==================================================
  // FILTERS
  // ==================================================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [driverFilter, setDriverFilter] =
    useState("");

  const [vehicleFilter, setVehicleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [weekFilter, setWeekFilter] =
    useState("");


  // ==================================================
  // UI
  // ==================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==================================================
  // LOAD REPORTS
  // ==================================================

  const loadReports =
    async (
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
          reportsResponse,
          driversResponse,
          vehiclesResponse,
        ] = await Promise.all([

          axiosInstance.get(
            "/transport/driver-reports/"
          ),

          axiosInstance
            .get(
              "/transport/driver-profiles/"
            )
            .catch(
              () => null
            ),

          axiosInstance
            .get(
              "/transport/vehicles/"
            )
            .catch(
              () => null
            ),

        ]);


        setReports(
          extractList(
            reportsResponse
          )
        );


        if (driversResponse) {

          setDrivers(
            extractList(
              driversResponse
            )
          );

        } else {

          setDrivers([]);

        }


        if (vehiclesResponse) {

          setVehicles(
            extractList(
              vehiclesResponse
            )
          );

        } else {

          setVehicles([]);

        }

      } catch (err) {

        console.error(
          "Failed to load driver reports:",
          err
        );

        setError(
          getErrorMessage(err)
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }
    };


  useEffect(() => {

    loadReports(true);

  }, []);


  // ==================================================
  // FILTERED REPORTS
  // ==================================================

  const filteredReports =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return reports.filter(
        (report) => {

          // --------------------------------------------
          // SEARCH
          // --------------------------------------------

          if (search) {

            const driver =
              getDriverName(
                report
              ).toLowerCase();

            const vehicle =
              getVehicleName(
                report
              ).toLowerCase();

            const comments =
              String(
                report.comments ||
                report.notes ||
                ""
              ).toLowerCase();

            const matchesSearch =
              driver.includes(
                search
              ) ||
              vehicle.includes(
                search
              ) ||
              comments.includes(
                search
              );

            if (
              !matchesSearch
            ) {
              return false;
            }
          }


          // --------------------------------------------
          // DRIVER
          // --------------------------------------------

          if (
            driverFilter
          ) {

            const reportDriverId =
              getId(
                report.driver
              ) ||
              report.driver_id ||
              report.driver;

            if (
              String(
                reportDriverId
              ) !==
              String(
                driverFilter
              )
            ) {
              return false;
            }
          }


          // --------------------------------------------
          // VEHICLE
          // --------------------------------------------

          if (
            vehicleFilter
          ) {

            const reportVehicleId =
              getId(
                report.vehicle
              ) ||
              report.vehicle_id ||
              report.vehicle;

            if (
              String(
                reportVehicleId
              ) !==
              String(
                vehicleFilter
              )
            ) {
              return false;
            }
          }


          // --------------------------------------------
          // STATUS
          // --------------------------------------------

          if (
            statusFilter
          ) {

            if (
              getStatus(
                report
              ) !==
              statusFilter
            ) {
              return false;
            }
          }


          // --------------------------------------------
          // WEEK / DATE
          // --------------------------------------------

          if (
            weekFilter
          ) {

            const reportDate =
              getReportDate(
                report
              );

            if (
              !reportDate ||
              !String(
                reportDate
              ).startsWith(
                weekFilter
              )
            ) {
              return false;
            }
          }


          return true;
        }
      );

    }, [
      reports,
      searchTerm,
      driverFilter,
      vehicleFilter,
      statusFilter,
      weekFilter,
    ]);


  // ==================================================
  // STATS
  // ==================================================

  const stats =
    useMemo(() => {

      const total =
        reports.length;

      const submitted =
        reports.filter(
          (report) =>
            getStatus(
              report
            ) === "submitted"
        ).length;

      const approved =
        reports.filter(
          (report) =>
            getStatus(
              report
            ) === "approved" ||
            getStatus(
              report
            ) === "reviewed"
        ).length;

      const draft =
        reports.filter(
          (report) =>
            getStatus(
              report
            ) === "draft"
        ).length;

      const totalMileage =
        reports.reduce(
          (sum, report) =>
            sum +
            Number(
              getReportMileage(
                report
              )
            ),
          0
        );

      const totalFuelCost =
        reports.reduce(
          (sum, report) =>
            sum +
            Number(
              report.fuel_cost ||
              report.total_fuel_cost ||
              0
            ),
          0
        );


      return {
        total,
        submitted,
        approved,
        draft,
        totalMileage,
        totalFuelCost,
      };

    }, [
      reports,
    ]);


  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  const clearFilters = () => {

    setSearchTerm("");
    setDriverFilter("");
    setVehicleFilter("");
    setStatusFilter("");
    setWeekFilter("");
  };


  const hasFilters =
    Boolean(
      searchTerm ||
      driverFilter ||
      vehicleFilter ||
      statusFilter ||
      weekFilter
    );


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">

        <div className="flex items-center gap-3 text-gray-600">

          <RefreshCw
            size={19}
            className="animate-spin"
          />

          <span>
            Loading driver reports...
          </span>

        </div>

      </div>
    );
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport
          </Link>

          <ChevronRight
            size={15}
          />

          <span className="text-gray-700 font-medium">
            Driver Reports
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <ClipboardList
                size={25}
              />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Driver Reports
              </h1>

              <p className="text-gray-600 mt-1">
                Review weekly driver activity, mileage,
                fueling and operational reports.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={() =>
                loadReports()
              }
              disabled={
                refreshing
              }
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
              to="/transport/reports/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Plus
                size={18}
              />

              New Driver Report

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
            Routes
          </Link>

          <Link
            to="/transport/assignments"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Assignments
          </Link>

          <Link
            to="/transport/expenses"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Expenses
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Driver Reports
          </span>

        </div>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==================================================
          STATS
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Reports
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.total}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">

              <FileText
                size={21}
              />

            </div>

          </div>

        </div>


        {/* Submitted */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Submitted
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.submitted}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">

              <CheckCircle2
                size={21}
              />

            </div>

          </div>

        </div>


        {/* Approved */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Reviewed
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.approved}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-green-100 text-green-700">

              <CheckCircle2
                size={21}
              />

            </div>

          </div>

        </div>


        {/* Draft */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Drafts
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.draft}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-gray-200 text-gray-700">

              <ClipboardList
                size={21}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          OPERATIONAL SUMMARY
      ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

          <p className="text-xs uppercase font-semibold text-purple-600">
            Reported Mileage
          </p>

          <p className="text-2xl font-bold text-purple-900 mt-1">
            {formatNumber(
              stats.totalMileage
            )}
            {" km"}
          </p>

          <p className="text-sm text-purple-700 mt-1">
            Combined mileage represented by the loaded reports.
          </p>

        </div>


        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <p className="text-xs uppercase font-semibold text-gray-500">
            Reported Fuel Cost
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatCurrency(
              stats.totalFuelCost
            )}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Fuel expenditure recorded within driver reports.
          </p>

        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

          <div>

            <h2 className="font-semibold text-gray-800">
              Find Reports
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Filter weekly reports by driver, vehicle,
              date and status.
            </p>

          </div>


          {hasFilters && (

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
            >

              <X
                size={16}
              />

              Clear Filters

            </button>

          )}

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Search */}
          <div className="lg:col-span-2">

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
                placeholder="Search driver, vehicle or comments..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>


          {/* Driver */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Driver
            </label>

            <select
              value={driverFilter}
              onChange={(event) =>
                setDriverFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="">
                All drivers
              </option>

              {drivers.map(
                (driver) => (

                  <option
                    key={
                      getId(
                        driver
                      )
                    }
                    value={
                      getId(
                        driver
                      )
                    }
                  >
                    {driver.staff_name ||
                      driver.name ||
                      driver.staff?.full_name ||
                      `Driver #${getId(
                        driver
                      )}`}
                  </option>

                )
              )}

            </select>

          </div>


          {/* Vehicle */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vehicle
            </label>

            <select
              value={vehicleFilter}
              onChange={(event) =>
                setVehicleFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="">
                All vehicles
              </option>

              {vehicles.map(
                (vehicle) => (

                  <option
                    key={
                      getId(
                        vehicle
                      )
                    }
                    value={
                      getId(
                        vehicle
                      )
                    }
                  >
                    {getVehicleName({
                      vehicle,
                    })}
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

              <option value="">
                All statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="submitted">
                Submitted
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="reviewed">
                Reviewed
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

          </div>

        </div>


        {/* Week */}
        <div className="mt-4 max-w-xs">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Week / Report Date
          </label>

          <div className="relative">

            <CalendarDays
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="date"
              value={weekFilter}
              onChange={(event) =>
                setWeekFilter(
                  event.target.value
                )
              }
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

        </div>

      </div>


      {/* ==================================================
          RESULTS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

          <div>

            <h2 className="font-semibold text-gray-800">
              Driver Reports
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {filteredReports.length}
              </span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">
                {reports.length}
              </span>
              {" "}report(s)
            </p>

          </div>

        </div>


        {filteredReports.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

              <ClipboardList
                size={28}
              />

            </div>

            <h3 className="font-semibold text-gray-800 text-lg">
              No driver reports found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {hasFilters
                ? "Try changing or clearing your filters."
                : "No driver reports have been recorded yet."}
            </p>


            {!hasFilters && (

              <Link
                to="/transport/reports/new"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >

                <Plus
                  size={17}
                />

                Create First Report

              </Link>

            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Report
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Driver
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Vehicle
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Mileage
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Fuel
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

                {filteredReports.map(
                  (report) => {

                    const reportId =
                      getId(
                        report
                      );

                    const status =
                      getStatus(
                        report
                      );

                    const mileage =
                      getReportMileage(
                        report
                      );

                    const fuelQuantity =
                      report.fuel_quantity ??
                      report.quantity ??
                      report.litres ??
                      0;

                    const fuelCost =
                      report.fuel_cost ??
                      report.total_fuel_cost ??
                      0;

                    return (

                      <tr
                        key={
                          reportId
                        }
                        className="hover:bg-gray-100"
                      >

                        {/* Report */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">

                              <FileText
                                size={18}
                              />

                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">

                                {report.week_start &&
                                report.week_end
                                  ? `${formatDate(
                                      report.week_start
                                    )} — ${formatDate(
                                      report.week_end
                                    )}`
                                  : formatDate(
                                      getReportDate(
                                        report
                                      )
                                    )}

                              </p>

                              <p className="text-xs text-gray-500">
                                Report #{reportId}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Driver */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <User
                              size={16}
                              className="text-gray-400"
                            />

                            <span className="text-sm text-gray-700">
                              {getDriverName(
                                report
                              )}
                            </span>

                          </div>

                        </td>


                        {/* Vehicle */}
                        <td className="px-5 py-4">

                          <span className="text-sm text-gray-700">
                            {getVehicleName(
                              report
                            )}
                          </span>

                        </td>


                        {/* Mileage */}
                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-800">
                            {formatNumber(
                              mileage
                            )}
                            {" km"}
                          </p>

                          {report.starting_mileage !== undefined &&
                          report.ending_mileage !== undefined && (

                            <p className="text-xs text-gray-500 mt-1">

                              {formatNumber(
                                report.starting_mileage
                              )}
                              {" → "}
                              {formatNumber(
                                report.ending_mileage
                              )}

                            </p>

                          )}

                        </td>


                        {/* Fuel */}
                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-800">

                            {formatNumber(
                              fuelQuantity
                            )}
                            {" L"}

                          </p>

                          <p className="text-xs text-gray-500 mt-1">

                            {formatCurrency(
                              fuelCost
                            )}

                          </p>

                        </td>


                        {/* Status */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >

                            {status ===
                              "approved" ||
                            status ===
                              "reviewed" ? (

                              <CheckCircle2
                                size={13}
                                className="mr-1"
                              />

                            ) : status ===
                              "rejected" ? (

                              <XCircle
                                size={13}
                                className="mr-1"
                              />

                            ) : (

                              <ClipboardList
                                size={13}
                                className="mr-1"
                              />

                            )}

                            {getStatusLabel(
                              status
                            )}

                          </span>

                        </td>


                        {/* Actions */}
                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/transport/reports/${reportId}`
                                )
                              }
                              title="View report"
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-purple-700"
                            >

                              <Eye
                                size={17}
                              />

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/transport/reports/${reportId}/edit`
                                )
                              }
                              title="Edit report"
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-purple-700"
                            >

                              <Edit
                                size={17}
                              />

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


      {/* ==================================================
          BOTTOM INFORMATION
      ================================================== */}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">

        <div className="flex items-start gap-3">

          <Users
            size={21}
            className="text-purple-700 mt-0.5 shrink-0"
          />

          <div>

            <h3 className="font-semibold text-gray-800">
              Driver reporting
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Weekly driver reports provide an operational
              history of vehicle mileage, fuel usage,
              incidents and driver observations. These
              records are retained independently so they
              can be reviewed alongside fueling,
              maintenance and vehicle records.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};


export default DriverReportsPage;

