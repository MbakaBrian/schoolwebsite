import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// VEHICLES PAGE
// ============================================================
//
// Displays all school vehicles.
//
// Features:
// - Search vehicles
// - Filter by status
// - Filter by compliance
// - Vehicle statistics
// - Registration details
// - Insurance status
// - Inspection status
// - Service status
// - Mileage
// - Assigned driver
// - View vehicle
// - Edit vehicle
// - Add vehicle
//
// Historical records such as:
// - Maintenance
// - Fueling
// - Insurance
//
// are handled separately and should not overwrite the
// vehicle's historical information.
//
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

  if (typeof item === "object") {
    return item.id ?? item.pk ?? null;
  }

  return item;
};


const formatStatus = (value) => {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toLocaleString(
    "en-KE"
  );
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
    "en-KE",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};


const getExpiryState = (dateValue) => {
  if (!dateValue) {
    return {
      label: "Not provided",
      type: "missing",
    };
  }

  const expiry = new Date(dateValue);
  const today = new Date();

  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference =
    expiry.getTime() -
    today.getTime();

  const daysRemaining =
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

  if (daysRemaining < 0) {
    return {
      label: "Expired",
      type: "expired",
    };
  }

  if (daysRemaining <= 30) {
    return {
      label: `Expires in ${daysRemaining} day${
        daysRemaining === 1 ? "" : "s"
      }`,
      type: "warning",
    };
  }

  return {
    label: "Valid",
    type: "valid",
  };
};


const getComplianceClasses = (type) => {
  switch (type) {
    case "valid":
      return "bg-green-100 text-green-800 border-green-200";

    case "warning":
      return "bg-amber-100 text-amber-800 border-amber-200";

    case "expired":
      return "bg-red-100 text-red-800 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};


const getVehicleStatusClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";

    case "inactive":
      return "bg-gray-100 text-gray-700 border-gray-200";

    case "maintenance":
      return "bg-amber-100 text-amber-800 border-amber-200";

    case "retired":
      return "bg-red-100 text-red-800 border-red-200";

    case "disposed":
      return "bg-red-100 text-red-800 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};


const getDriverName = (vehicle) => {
  if (!vehicle) {
    return "Unassigned";
  }

  if (vehicle.driver_name) {
    return vehicle.driver_name;
  }

  if (vehicle.assigned_driver_name) {
    return vehicle.assigned_driver_name;
  }

  const driver =
    vehicle.driver ||
    vehicle.assigned_driver;

  if (typeof driver === "object") {
    return (
      driver.full_name ||
      driver.staff_name ||
      [
        driver.first_name,
        driver.middle_name,
        driver.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Unassigned"
    );
  }

  return "Unassigned";
};


const getVehicleName = (vehicle) => {
  if (!vehicle) {
    return "Vehicle";
  }

  if (vehicle.vehicle_name) {
    return vehicle.vehicle_name;
  }

  const makeModel = [
    vehicle.make,
    vehicle.model,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    makeModel ||
    vehicle.registration_number ||
    "Vehicle"
  );
};


// ============================================================
// COMPONENT
// ============================================================

const VehiclesPage = () => {
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [vehicles, setVehicles] =
    useState([]);

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

  const [complianceFilter, setComplianceFilter] =
    useState("all");


  // ==========================================================
  // LOAD VEHICLES
  // ==========================================================

  const loadVehicles = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await axiosInstance.get(
          "/transport/vehicles/"
        );

      setVehicles(
        extractList(response)
      );

    } catch (err) {
      console.error(
        "Failed to load vehicles:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load vehicles."
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
    loadVehicles();
  }, []);


  // ==========================================================
  // VEHICLE COMPLIANCE
  // ==========================================================

  const getVehicleCompliance =
    (vehicle) => {

      const checks = [
        vehicle.insurance_expiry_date,
        vehicle.inspection_expiry_date,
        vehicle.speed_governor_expiry_date,
        vehicle.road_service_expiry_date,
      ].filter(Boolean);

      if (checks.length === 0) {
        return {
          type: "missing",
          label: "Incomplete",
        };
      }

      const states =
        checks.map(
          (date) =>
            getExpiryState(date)
        );

      if (
        states.some(
          (state) =>
            state.type === "expired"
        )
      ) {
        return {
          type: "expired",
          label: "Expired",
        };
      }

      if (
        states.some(
          (state) =>
            state.type === "warning"
        )
      ) {
        return {
          type: "warning",
          label: "Expiring Soon",
        };
      }

      return {
        type: "valid",
        label: "Compliant",
      };
    };


  // ==========================================================
  // FILTERED VEHICLES
  // ==========================================================

  const filteredVehicles =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      return vehicles.filter(
        (vehicle) => {

          // -----------------------------------------------
          // SEARCH
          // -----------------------------------------------

          if (search) {

            const searchableText = [
              vehicle.registration_number,
              vehicle.vehicle_number,
              vehicle.make,
              vehicle.model,
              vehicle.vehicle_name,
              vehicle.chassis_number,
              vehicle.engine_number,
              getDriverName(vehicle),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchableText.includes(
                search
              )
            ) {
              return false;
            }
          }


          // -----------------------------------------------
          // STATUS
          // -----------------------------------------------

          if (
            statusFilter !== "all" &&
            vehicle.status !== statusFilter
          ) {
            return false;
          }


          // -----------------------------------------------
          // COMPLIANCE
          // -----------------------------------------------

          if (
            complianceFilter !== "all"
          ) {

            const compliance =
              getVehicleCompliance(
                vehicle
              );

            if (
              compliance.type !==
              complianceFilter
            ) {
              return false;
            }
          }


          return true;
        }
      );

    }, [
      vehicles,
      searchTerm,
      statusFilter,
      complianceFilter,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {

    const active =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "active"
      ).length;

    const maintenance =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "maintenance"
      ).length;

    const inactive =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "inactive"
      ).length;

    const retired =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "retired" ||
          vehicle.status === "disposed"
      ).length;

    const compliant =
      vehicles.filter(
        (vehicle) =>
          getVehicleCompliance(
            vehicle
          ).type === "valid"
      ).length;

    const expiringSoon =
      vehicles.filter(
        (vehicle) =>
          getVehicleCompliance(
            vehicle
          ).type === "warning"
      ).length;

    const expired =
      vehicles.filter(
        (vehicle) =>
          getVehicleCompliance(
            vehicle
          ).type === "expired"
      ).length;

    return {
      total: vehicles.length,
      active,
      maintenance,
      inactive,
      retired,
      compliant,
      expiringSoon,
      expired,
    };

  }, [vehicles]);


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-10 h-10 mx-auto mb-3 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin" />

          <p className="text-gray-600">
            Loading vehicles...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">


        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Vehicles
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Car size={25} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Vehicles
              </h1>

              <p className="text-gray-600 mt-1">
                Manage school vehicles, compliance and operational status.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                loadVehicles(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
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
              to="/transport/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >
              <Plus size={18} />
              Add Vehicle
            </Link>

          </div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

            <XCircle
              size={19}
              className="mt-0.5 flex-shrink-0"
            />

            <span>{error}</span>

          </div>
        )}


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">

          {/* Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Total
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-1">
              {statistics.total}
            </p>

          </div>


          {/* Active */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Active
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {statistics.active}
            </p>

          </div>


          {/* Maintenance */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Maintenance
            </p>

            <p className="text-2xl font-bold text-amber-700 mt-1">
              {statistics.maintenance}
            </p>

          </div>


          {/* Inactive */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Inactive
            </p>

            <p className="text-2xl font-bold text-gray-600 mt-1">
              {statistics.inactive}
            </p>

          </div>


          {/* Retired */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Retired
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {statistics.retired}
            </p>

          </div>


          {/* Compliant */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Compliant
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {statistics.compliant}
            </p>

          </div>


          {/* Expiring */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Expiring
            </p>

            <p className="text-2xl font-bold text-amber-700 mt-1">
              {statistics.expiringSoon}
            </p>

          </div>


          {/* Expired */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <p className="text-xs uppercase font-semibold text-gray-500">
              Expired
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {statistics.expired}
            </p>

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


            <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
              Vehicles
            </span>


            <Link
              to="/transport/routes"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              Routes & Stages
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


            <Link
              to="/transport/driver-reports"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
            >
              Driver Reports
            </Link>

          </div>

        </div>


        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}
            <div className="md:col-span-1">

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search Vehicles
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
                  placeholder="Registration, make, model, driver..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>


            {/* Status */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vehicle Status
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
                  All statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="retired">
                  Retired
                </option>

                <option value="disposed">
                  Disposed
                </option>

              </select>

            </div>


            {/* Compliance */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Compliance
              </label>

              <select
                value={complianceFilter}
                onChange={(event) =>
                  setComplianceFilter(
                    event.target.value
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="all">
                  All compliance states
                </option>

                <option value="valid">
                  Compliant
                </option>

                <option value="warning">
                  Expiring Soon
                </option>

                <option value="expired">
                  Expired
                </option>

                <option value="missing">
                  Incomplete
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* ==================================================
            RESULTS HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

          <div>

            <h2 className="text-lg font-semibold text-gray-800">
              Vehicle Register
            </h2>

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredVehicles.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {vehicles.length}
              </span>{" "}
              vehicles
            </p>

          </div>

        </div>


        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredVehicles.length === 0 ? (

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Car size={28} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No vehicles found
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {vehicles.length === 0
                ? "No vehicles have been registered yet."
                : "No vehicles match the current search and filters."}
            </p>

            {vehicles.length === 0 && (
              <Link
                to="/transport/vehicles/new"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >
                <Plus size={17} />
                Add First Vehicle
              </Link>
            )}

          </div>

        ) : (

          /* ==================================================
             VEHICLE TABLE
          ================================================== */

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100 border-b border-gray-200">

                  <tr>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Vehicle
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Registration
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Driver
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Mileage
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Insurance
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Inspection
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

                  {filteredVehicles.map(
                    (vehicle) => {

                      const vehicleId =
                        getId(vehicle);

                      const insurance =
                        getExpiryState(
                          vehicle.insurance_expiry_date
                        );

                      const inspection =
                        getExpiryState(
                          vehicle.inspection_expiry_date
                        );

                      const compliance =
                        getVehicleCompliance(
                          vehicle
                        );

                      return (
                        <tr
                          key={vehicleId}
                          className="hover:bg-gray-100 transition"
                        >

                          {/* --------------------------------
                              VEHICLE
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                                <Car size={19} />
                              </div>

                              <div>

                                <Link
                                  to={`/transport/vehicles/${vehicleId}`}
                                  className="font-semibold text-gray-800 hover:text-purple-800"
                                >
                                  {getVehicleName(
                                    vehicle
                                  )}
                                </Link>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  {vehicle.vehicle_number ||
                                    vehicle.chassis_number ||
                                    "No vehicle number"}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* --------------------------------
                              REGISTRATION
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <p className="font-semibold text-gray-800">
                              {vehicle.registration_number ||
                                "—"}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {[
                                vehicle.make,
                                vehicle.model,
                                vehicle.year_of_manufacture ||
                                  vehicle.manufacture_year,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "—"}
                            </p>

                          </td>


                          {/* --------------------------------
                              DRIVER
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <p className="text-sm text-gray-800">
                              {getDriverName(
                                vehicle
                              )}
                            </p>

                            {getDriverName(
                              vehicle
                            ) !== "Unassigned" && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Current assignment
                              </p>
                            )}

                          </td>


                          {/* --------------------------------
                              MILEAGE
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <Clock
                                size={15}
                                className="text-gray-400"
                              />

                              <div>

                                <p className="text-sm font-semibold text-gray-800">
                                  {formatNumber(
                                    vehicle.current_mileage ??
                                      vehicle.odometer_reading ??
                                      vehicle.mileage
                                  )}
                                </p>

                                <p className="text-xs text-gray-500">
                                  km
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* --------------------------------
                              INSURANCE
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="space-y-1">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${getComplianceClasses(
                                  insurance.type
                                )}`}
                              >

                                {insurance.type ===
                                  "valid" && (
                                  <CheckCircle2
                                    size={12}
                                  />
                                )}

                                {insurance.type ===
                                  "warning" && (
                                  <AlertTriangle
                                    size={12}
                                  />
                                )}

                                {insurance.type ===
                                  "expired" && (
                                  <XCircle
                                    size={12}
                                  />
                                )}

                                {insurance.label}

                              </span>

                              <p className="text-xs text-gray-500">
                                {formatDate(
                                  vehicle.insurance_expiry_date
                                )}
                              </p>

                            </div>

                          </td>


                          {/* --------------------------------
                              INSPECTION
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="space-y-1">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${getComplianceClasses(
                                  inspection.type
                                )}`}
                              >

                                {inspection.type ===
                                  "valid" && (
                                  <CheckCircle2
                                    size={12}
                                  />
                                )}

                                {inspection.type ===
                                  "warning" && (
                                  <AlertTriangle
                                    size={12}
                                  />
                                )}

                                {inspection.type ===
                                  "expired" && (
                                  <XCircle
                                    size={12}
                                  />
                                )}

                                {inspection.label}

                              </span>

                              <p className="text-xs text-gray-500">
                                {formatDate(
                                  vehicle.inspection_expiry_date
                                )}
                              </p>

                            </div>

                          </td>


                          {/* --------------------------------
                              STATUS
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="space-y-1">

                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getVehicleStatusClasses(
                                  vehicle.status
                                )}`}
                              >
                                {formatStatus(
                                  vehicle.status
                                )}
                              </span>

                              <div>

                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                                    compliance.type ===
                                    "valid"
                                      ? "text-green-700"
                                      : compliance.type ===
                                        "warning"
                                      ? "text-amber-700"
                                      : compliance.type ===
                                        "expired"
                                      ? "text-red-700"
                                      : "text-gray-600"
                                  }`}
                                >

                                  {compliance.type ===
                                    "valid" && (
                                    <ShieldCheck
                                      size={12}
                                    />
                                  )}

                                  {compliance.type ===
                                    "warning" && (
                                    <AlertTriangle
                                      size={12}
                                    />
                                  )}

                                  {compliance.type ===
                                    "expired" && (
                                    <XCircle
                                      size={12}
                                    />
                                  )}

                                  {compliance.label}

                                </span>

                              </div>

                            </div>

                          </td>


                          {/* --------------------------------
                              ACTIONS
                          -------------------------------- */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-2">

                              <Link
                                to={`/transport/vehicles/${vehicleId}`}
                                title="View vehicle"
                                className="p-2 rounded-lg text-gray-600 hover:text-purple-800 hover:bg-purple-100"
                              >
                                <Eye size={17} />
                              </Link>


                              <Link
                                to={`/transport/vehicles/${vehicleId}/edit`}
                                title="Edit vehicle"
                                className="p-2 rounded-lg text-gray-600 hover:text-purple-800 hover:bg-purple-100"
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

          </div>
        )}


        {/* ==================================================
            COMPLIANCE LEGEND
        ================================================== */}

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-500">

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Compliant
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Expiring within 30 days
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Expired
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            Information missing
          </div>

        </div>


        {/* ==================================================
            FOOTER NAVIGATION
        ================================================== */}

        <div className="mt-8 pt-5 border-t border-gray-200">

          <Link
            to="/transport"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft size={16} />
            Back to Transport Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
};


export default VehiclesPage;

