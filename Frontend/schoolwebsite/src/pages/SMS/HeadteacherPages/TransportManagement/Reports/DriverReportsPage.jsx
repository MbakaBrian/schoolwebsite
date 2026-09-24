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
  Clock3,
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

Current DriverWeeklyReport serializer fields:

{
    id,
    driver,
    driver_name,
    vehicle,
    vehicle_id,
    vehicle_registration,
    week_start,
    week_end,
    starting_mileage,
    ending_mileage,
    total_mileage,
    fuel_used_quantity,
    fueling_location,
    fuel_cost_per_liter,
    vehicle_condition,
    incidents,
    maintenance_required,
    maintenance_notes,
    comments,
    submitted_at,
    reviewed,
    reviewed_at,
    reviewed_by,
    reviewed_by_name,
    review_comments,
}

Important:

- "reviewed" is the report review state.
- There is no status field.
- There are no draft/submitted/approved/rejected
  statuses in the current backend model.
- fuel_used_quantity represents operational fuel
  consumption in litres.
- fuel_cost_per_liter represents the price per litre.
- Reference fuel value is calculated in the UI only:
      fuel_used_quantity * fuel_cost_per_liter

That calculated value is NOT a financial fueling
transaction.
==================================================
*/


// ==================================================
// HELPERS
// ==================================================

const getId = (item) => {
  if (item === null || item === undefined) {
    return null;
  }

  if (typeof item === "object") {
    return item.id ?? item.pk ?? null;
  }

  return item;
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
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
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


const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
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
  const number = Number(value);

  if (!Number.isFinite(number)) {
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


// --------------------------------------------------
// DRIVER
// --------------------------------------------------

const getDriverName = (report) => {
  if (report?.driver_name) {
    return report.driver_name;
  }

  if (report?.driver?.full_name) {
    return report.driver.full_name;
  }

  if (report?.driver?.name) {
    return report.driver.name;
  }

  if (report?.driver?.staff_name) {
    return report.driver.staff_name;
  }

  if (
    typeof report?.driver === "string"
  ) {
    return report.driver;
  }

  if (
    report?.driver !== null &&
    report?.driver !== undefined
  ) {
    return `Driver #${report.driver}`;
  }

  return "Unknown driver";
};


// --------------------------------------------------
// VEHICLE
// --------------------------------------------------

const getVehicleName = (report) => {
  if (report?.vehicle_registration) {
    return report.vehicle_registration;
  }

  if (report?.vehicle_id) {
    return report.vehicle_id;
  }

  if (report?.vehicle?.registration_number) {
    return report.vehicle.registration_number;
  }

  if (report?.vehicle?.name) {
    return report.vehicle.name;
  }

  if (
    typeof report?.vehicle === "string"
  ) {
    return report.vehicle;
  }

  if (
    report?.vehicle !== null &&
    report?.vehicle !== undefined
  ) {
    return `Vehicle #${report.vehicle}`;
  }

  return "Unknown vehicle";
};


// --------------------------------------------------
// REVIEW STATE
// --------------------------------------------------

const getReviewState = (report) => {
  return report?.reviewed === true
    ? "reviewed"
    : "pending";
};


const getReviewLabel = (state) => {
  if (state === "reviewed") {
    return "Reviewed";
  }

  return "Pending Review";
};


const getReviewClasses = (state) => {
  if (state === "reviewed") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-yellow-100 text-yellow-700 border-yellow-200";
};


// --------------------------------------------------
// REPORT DATE
// --------------------------------------------------

const getReportDate = (report) => {
  return (
    report?.week_start ||
    report?.week_end ||
    report?.submitted_at ||
    null
  );
};


// --------------------------------------------------
// MILEAGE
// --------------------------------------------------

const getReportMileage = (report) => {
  if (
    report?.total_mileage !== undefined &&
    report?.total_mileage !== null
  ) {
    return Number(report.total_mileage);
  }

  if (
    report?.starting_mileage !== undefined &&
    report?.ending_mileage !== undefined &&
    report?.starting_mileage !== null &&
    report?.ending_mileage !== null
  ) {
    return (
      Number(report.ending_mileage) -
      Number(report.starting_mileage)
    );
  }

  return 0;
};


// --------------------------------------------------
// ERROR
// --------------------------------------------------

const getErrorMessage = (error) => {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  const data =
    error?.response?.data;

  if (
    data &&
    typeof data === "object"
  ) {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message =
          Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);

        return `${field}: ${message}`;
      })
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
  const navigate = useNavigate();


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

  const [reviewFilter, setReviewFilter] =
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

  const loadReports = async (
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
          .catch(() => null),

        axiosInstance
          .get(
            "/transport/vehicles/"
          )
          .catch(() => null),
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

  const filteredReports = useMemo(() => {
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

          const fuelingLocation =
            String(
              report.fueling_location ||
              ""
            ).toLowerCase();

          const incidents =
            String(
              report.incidents ||
              ""
            ).toLowerCase();

          const comments =
            String(
              report.comments ||
              ""
            ).toLowerCase();

          const maintenanceNotes =
            String(
              report.maintenance_notes ||
              ""
            ).toLowerCase();

          const reviewComments =
            String(
              report.review_comments ||
              ""
            ).toLowerCase();

          const matchesSearch =
            driver.includes(search) ||
            vehicle.includes(search) ||
            fuelingLocation.includes(search) ||
            incidents.includes(search) ||
            comments.includes(search) ||
            maintenanceNotes.includes(search) ||
            reviewComments.includes(search);

          if (!matchesSearch) {
            return false;
          }
        }


        // --------------------------------------------
        // DRIVER
        // --------------------------------------------

        if (driverFilter) {
          const reportDriverId =
            getId(
              report.driver
            ) ??
            report.driver_id;

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

        if (vehicleFilter) {
          const reportVehicleId =
            getId(
              report.vehicle
            ) ??
            report.vehicle_id;

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
        // REVIEW
        // --------------------------------------------

        if (reviewFilter) {
          const reviewState =
            getReviewState(
              report
            );

          if (
            reviewState !==
            reviewFilter
          ) {
            return false;
          }
        }


        // --------------------------------------------
        // WEEK / DATE
        // --------------------------------------------

        if (weekFilter) {
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
    reviewFilter,
    weekFilter,
  ]);


  // ==================================================
  // STATS
  // ==================================================

  const stats = useMemo(() => {
    const total =
      reports.length;


    const reviewed =
      reports.filter(
        (report) =>
          report.reviewed === true
      ).length;


    const pending =
      reports.filter(
        (report) =>
          report.reviewed !== true
      ).length;


    const maintenanceRequired =
      reports.filter(
        (report) =>
          report.maintenance_required === true
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


    const totalFuelUsed =
      reports.reduce(
        (sum, report) =>
          sum +
          Number(
            report.fuel_used_quantity || 0
          ),
        0
      );


    const referenceFuelValue =
      reports.reduce(
        (sum, report) => {
          const quantity =
            Number(
              report.fuel_used_quantity
            );

          const costPerLiter =
            Number(
              report.fuel_cost_per_liter
            );

          if (
            !Number.isFinite(quantity) ||
            !Number.isFinite(costPerLiter)
          ) {
            return sum;
          }

          return (
            sum +
            quantity *
            costPerLiter
          );
        },
        0
      );


    return {
      total,
      reviewed,
      pending,
      maintenanceRequired,
      totalMileage,
      totalFuelUsed,
      referenceFuelValue,
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
    setReviewFilter("");
    setWeekFilter("");
  };


  const hasFilters =
    Boolean(
      searchTerm ||
      driverFilter ||
      vehicleFilter ||
      reviewFilter ||
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
                fuel usage and operational observations.
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={() =>
                loadReports()
              }
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


        {/* Reviewed */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Reviewed
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.reviewed}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-green-100 text-green-700">

              <CheckCircle2
                size={21}
              />

            </div>

          </div>

        </div>


        {/* Pending */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Pending Review
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.pending}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700">

              <Clock3
                size={21}
              />

            </div>

          </div>

        </div>


        {/* Maintenance */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Maintenance Required
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.maintenanceRequired}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-red-100 text-red-700">

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Mileage */}
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


        {/* Fuel */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <p className="text-xs uppercase font-semibold text-gray-500">
            Fuel Used
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatNumber(
              stats.totalFuelUsed
            )}
            {" L"}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Operational fuel consumption reported by drivers.
          </p>

        </div>


        {/* Reference value */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <p className="text-xs uppercase font-semibold text-gray-500">
            Reference Fuel Value
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatCurrency(
              stats.referenceFuelValue
            )}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Fuel used × price per litre. Not a financial transaction.
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
              week and review status.
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
                placeholder="Search driver, vehicle, fueling location or notes..."
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
                (driver) => {

                  const driverId =
                    getId(driver);

                  return (
                    <option
                      key={driverId}
                      value={driverId}
                    >
                      {driver.staff_name ||
                        driver.name ||
                        driver.staff?.full_name ||
                        `Driver #${driverId}`}
                    </option>
                  );
                }
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
                (vehicle) => {

                  const vehicleId =
                    getId(vehicle);

                  return (
                    <option
                      key={vehicleId}
                      value={vehicleId}
                    >
                      {vehicle.registration_number ||
                        vehicle.vehicle_id ||
                        vehicle.name ||
                        `Vehicle #${vehicleId}`}
                    </option>
                  );
                }
              )}

            </select>

          </div>


          {/* Review status */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Review Status
            </label>

            <select
              value={reviewFilter}
              onChange={(event) =>
                setReviewFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="">
                All reports
              </option>

              <option value="pending">
                Pending Review
              </option>

              <option value="reviewed">
                Reviewed
              </option>

            </select>

          </div>

        </div>


        {/* Week */}
        <div className="mt-4 max-w-xs">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Week Start
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
                    Review
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
                      getId(report);

                    const reviewState =
                      getReviewState(
                        report
                      );

                    const mileage =
                      getReportMileage(
                        report
                      );

                    const fuelQuantity =
                      Number(
                        report.fuel_used_quantity || 0
                      );

                    const fuelCostPerLiter =
                      Number(
                        report.fuel_cost_per_liter || 0
                      );

                    const referenceFuelValue =
                      Number.isFinite(
                        fuelQuantity
                      ) &&
                      Number.isFinite(
                        fuelCostPerLiter
                      )
                        ? fuelQuantity *
                          fuelCostPerLiter
                        : 0;


                    return (
                      <tr
                        key={reportId}
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

                              <p className="text-xs text-gray-400 mt-0.5">
                                Submitted{" "}
                                {formatDate(
                                  report.submitted_at
                                )}
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

                            <div>

                              <p className="text-sm text-gray-700">
                                {getDriverName(
                                  report
                                )}
                              </p>

                              {report.driver !==
                                undefined &&
                                report.driver !==
                                  null && (

                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Driver #{report.driver}
                                  </p>

                                )}

                            </div>

                          </div>

                        </td>


                        {/* Vehicle */}
                        <td className="px-5 py-4">

                          <div>

                            <p className="text-sm font-medium text-gray-700">
                              {getVehicleName(
                                report
                              )}
                            </p>

                            {report.vehicle_id && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {report.vehicle_id}
                              </p>
                            )}

                          </div>

                        </td>


                        {/* Mileage */}
                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-800">

                            {formatNumber(
                              mileage
                            )}
                            {" km"}

                          </p>

                          {report.starting_mileage !==
                            undefined &&
                            report.ending_mileage !==
                              undefined && (

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

                          {report.fuel_cost_per_liter !==
                            null &&
                            report.fuel_cost_per_liter !==
                              undefined && (

                              <p className="text-xs text-gray-500 mt-1">

                                {formatCurrency(
                                  fuelCostPerLiter
                                )}
                                {" / L"}

                              </p>

                            )}

                          {referenceFuelValue >
                            0 && (

                              <p className="text-xs text-gray-400 mt-0.5">

                                Ref.{" "}
                                {formatCurrency(
                                  referenceFuelValue
                                )}

                              </p>

                            )}

                        </td>


                        {/* Review */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getReviewClasses(
                              reviewState
                            )}`}
                          >

                            {reviewState ===
                            "reviewed" ? (

                              <CheckCircle2
                                size={13}
                                className="mr-1"
                              />

                            ) : (

                              <Clock3
                                size={13}
                                className="mr-1"
                              />

                            )}

                            {getReviewLabel(
                              reviewState
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
              incidents, vehicle condition and driver
              observations. Reports can be reviewed
              independently from financial fueling and
              maintenance transactions.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};


export default DriverReportsPage;