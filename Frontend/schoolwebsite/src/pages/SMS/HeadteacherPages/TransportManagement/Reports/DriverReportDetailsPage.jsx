
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit,
  Gauge,
  Fuel,
  MapPin,
  RefreshCw,
  User,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


/*
==================================================
DRIVER REPORT DETAILS
==================================================

GET
/transport/driver-reports/:id/

The page displays one historical weekly driver report.

Sections:
- Report summary
- Driver
- Vehicle
- Reporting period
- Mileage
- Fuel
- Vehicle condition
- Maintenance
- Incidents
- Driver comments
- Record metadata

The report itself is historical and should not be
deleted merely because it is no longer current.
==================================================
*/


// ==================================================
// HELPERS
// ==================================================

const getId = (item) => {
  if (!item) return null;

  return item.id ?? item.pk ?? null;
};


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-KE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
    "en-KE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
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

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString(
    "en-KE",
    {
      maximumFractionDigits: 2,
    }
  );
};


const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `KSh ${number.toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


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


const getDriverName = (driver) => {

  if (!driver) {
    return "Unknown Driver";
  }

  if (driver.staff_name) {
    return driver.staff_name;
  }

  if (driver.name) {
    return driver.name;
  }

  if (driver.full_name) {
    return driver.full_name;
  }

  if (driver.staff?.full_name) {
    return driver.staff.full_name;
  }

  if (
    driver.staff?.first_name ||
    driver.staff?.last_name
  ) {
    return [
      driver.staff.first_name,
      driver.staff.middle_name,
      driver.staff.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return `Driver #${getId(driver)}`;
};


const getVehicleName = (vehicle) => {

  if (!vehicle) {
    return "Unknown Vehicle";
  }

  const registration =
    vehicle.registration_number ||
    vehicle.registration ||
    "";

  const make =
    vehicle.make ||
    "";

  const model =
    vehicle.model ||
    "";

  const description = [
    make,
    model,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    registration &&
    description
  ) {
    return `${registration} — ${description}`;
  }

  return (
    registration ||
    description ||
    vehicle.vehicle_number ||
    `Vehicle #${getId(vehicle)}`
  );
};


const getStatusLabel = (status) => {

  if (!status) {
    return "Draft";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const getConditionLabel = (
  condition
) => {

  if (!condition) {
    return "Not recorded";
  }

  return String(condition)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// ==================================================
// COMPONENT
// ==================================================

const DriverReportDetailsPage = () => {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  // ==================================================
  // DATA
  // ==================================================

  const [report, setReport] =
    useState(null);


  // ==================================================
  // UI
  // ==================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deactivating, setDeactivating] =
    useState(false);


  // ==================================================
  // FETCH REPORT
  // ==================================================

  useEffect(() => {

    const loadReport =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await axiosInstance.get(
              `/transport/driver-reports/${id}/`
            );

          setReport(
            response.data
          );

        } catch (err) {

          console.error(
            "Failed to load driver report:",
            err
          );

          setError(
            getErrorMessage(err)
          );

        } finally {

          setLoading(false);

        }
      };


    if (id) {
      loadReport();
    }

  }, [id]);


  // ==================================================
  // REPORT VALUES
  // ==================================================

  const driver =
    report?.driver;

  const vehicle =
    report?.vehicle;


  const startingMileage =
    report?.starting_mileage ??
    report?.start_mileage;


  const endingMileage =
    report?.ending_mileage ??
    report?.end_mileage;


  const mileage =
    report?.mileage ??
    (
      startingMileage !== undefined &&
      endingMileage !== undefined
        ? Number(endingMileage) -
          Number(startingMileage)
        : null
    );


  const fuelQuantity =
    report?.fuel_quantity ??
    report?.fuel_litres ??
    report?.litres ??
    report?.quantity;


  const fuelCost =
    report?.fuel_cost ??
    report?.total_fuel_cost ??
    report?.cost;


  const condition =
    report?.vehicle_condition ??
    report?.condition;


  const maintenanceRequired =
    Boolean(
      report?.maintenance_required
    );


  const incidents =
    report?.incidents ||
    report?.incident_notes ||
    "";


  const maintenanceNotes =
    report?.maintenance_notes ||
    "";


  const comments =
    report?.comments ||
    report?.notes ||
    "";


  // ==================================================
  // REPORT STATUS
  // ==================================================

  const status =
    report?.status ||
    "draft";


  const isInactive =
    report?.is_active === false ||
    status === "inactive";


  // ==================================================
  // STATUS STYLING
  // ==================================================

  const statusClasses =
    useMemo(() => {

      switch (String(status).toLowerCase()) {

        case "submitted":
          return "bg-blue-100 text-blue-800";

        case "reviewed":
          return "bg-purple-100 text-purple-800";

        case "approved":
          return "bg-green-100 text-green-800";

        case "inactive":
          return "bg-gray-200 text-gray-700";

        case "rejected":
          return "bg-red-100 text-red-800";

        default:
          return "bg-yellow-100 text-yellow-800";
      }

    }, [status]);


  // ==================================================
  // CONDITION STYLING
  // ==================================================

  const conditionClasses =
    useMemo(() => {

      switch (
        String(condition).toLowerCase()
      ) {

        case "excellent":
          return "bg-green-100 text-green-800";

        case "good":
          return "bg-green-50 text-green-700";

        case "fair":
          return "bg-yellow-100 text-yellow-800";

        case "poor":
          return "bg-orange-100 text-orange-800";

        case "critical":
          return "bg-red-100 text-red-800";

        default:
          return "bg-gray-100 text-gray-700";
      }

    }, [condition]);


  // ==================================================
  // DEACTIVATE
  // ==================================================

  const handleDeactivate =
    async () => {

      const confirmed =
        window.confirm(
          "Deactivate this driver report? The historical record will be retained."
        );

      if (!confirmed) {
        return;
      }


      try {

        setDeactivating(true);
        setError("");


        let payload;

        if (
          typeof report?.is_active ===
          "boolean"
        ) {

          payload = {
            is_active: false,
          };

        } else {

          payload = {
            status: "inactive",
          };

        }


        const response =
          await axiosInstance.patch(
            `/transport/driver-reports/${id}/`,
            payload
          );


        setReport(
          response.data
        );

      } catch (err) {

        console.error(
          "Failed to deactivate report:",
          err
        );

        setError(
          getErrorMessage(err)
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
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">

        <div className="flex items-center gap-3 text-gray-600">

          <RefreshCw
            size={19}
            className="animate-spin"
          />

          <span>
            Loading driver report...
          </span>

        </div>

      </div>
    );
  }


  // ==================================================
  // ERROR / NOT FOUND
  // ==================================================

  if (
    error &&
    !report
  ) {

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

              <ArrowLeft
                size={17}
              />

              Back

            </button>

          </div>


          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">

            <div className="flex items-start gap-3">

              <X
                size={20}
              />

              <div>

                <h2 className="font-semibold">
                  Unable to load driver report
                </h2>

                <p className="text-sm mt-1">
                  {error}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }


  if (!report) {
    return null;
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-6xl mx-auto">


        {/* ==================================================
            BREADCRUMBS
        ================================================== */}

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport
          </Link>

          <span>
            /
          </span>

          <Link
            to="/transport/reports"
            className="hover:text-purple-700"
          >
            Driver Reports
          </Link>

          <span>
            /
          </span>

          <span className="text-gray-700">
            Report Details
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div className="flex items-start gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <ClipboardList
                size={25}
              />

            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Driver Weekly Report
                </h1>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses}`}
                >
                  {getStatusLabel(
                    status
                  )}
                </span>

              </div>

              <p className="text-gray-600 mt-1">
                Historical weekly transport activity record.
              </p>

              {report.id && (
                <p className="text-xs text-gray-500 mt-1">
                  Report #{report.id}
                </p>
              )}

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              to={`/transport/reports/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Edit
                size={17}
              />

              Edit Report

            </Link>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >

              <ArrowLeft
                size={17}
              />

              Back

            </button>

          </div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ==================================================
            REPORT SUMMARY
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">


          {/* Driver */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-2 text-purple-700">

              <User
                size={19}
              />

              <span className="text-xs font-semibold uppercase">
                Driver
              </span>

            </div>

            <p className="font-bold text-gray-800 mt-2">
              {getDriverName(
                driver
              )}
            </p>

          </div>


          {/* Vehicle */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-2 text-purple-700">

              <Truck
                size={19}
              />

              <span className="text-xs font-semibold uppercase">
                Vehicle
              </span>

            </div>

            <p className="font-bold text-gray-800 mt-2">
              {getVehicleName(
                vehicle
              )}
            </p>

          </div>


          {/* Mileage */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-2 text-purple-700">

              <Gauge
                size={19}
              />

              <span className="text-xs font-semibold uppercase">
                Weekly Mileage
              </span>

            </div>

            <p className="font-bold text-gray-800 mt-2">
              {formatNumber(
                mileage
              )}
              {mileage !== null &&
                mileage !== undefined &&
                mileage !== "" &&
                " km"}
            </p>

          </div>


          {/* Fuel */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-2 text-purple-700">

              <Fuel
                size={19}
              />

              <span className="text-xs font-semibold uppercase">
                Fuel Cost
              </span>

            </div>

            <p className="font-bold text-gray-800 mt-2">
              {formatCurrency(
                fuelCost
              )}
            </p>

          </div>

        </div>


        {/* ==================================================
            DRIVER & VEHICLE
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


          {/* Driver Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <User
                  size={20}
                />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Driver Information
                </h2>

                <p className="text-sm text-gray-500">
                  Driver associated with this report.
                </p>

              </div>

            </div>


            <div className="space-y-4">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Name
                </p>

                <p className="text-gray-800 font-medium mt-1">
                  {getDriverName(
                    driver
                  )}
                </p>

              </div>


              {(driver?.license_number ||
                driver?.psv_license_number) && (

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {driver?.license_number && (

                    <div>

                      <p className="text-xs uppercase font-semibold text-gray-500">
                        Driving Licence
                      </p>

                      <p className="text-gray-800 mt-1">
                        {driver.license_number}
                      </p>

                    </div>

                  )}


                  {driver?.psv_license_number && (

                    <div>

                      <p className="text-xs uppercase font-semibold text-gray-500">
                        PSV Licence
                      </p>

                      <p className="text-gray-800 mt-1">
                        {driver.psv_license_number}
                      </p>

                    </div>

                  )}

                </div>

              )}


              {driver?.staff_phone && (

                <div>

                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Phone
                  </p>

                  <p className="text-gray-800 mt-1">
                    {driver.staff_phone}
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* Vehicle Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <Truck
                  size={20}
                />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Vehicle Information
                </h2>

                <p className="text-sm text-gray-500">
                  Vehicle used during this reporting period.
                </p>

              </div>

            </div>


            <div className="space-y-4">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Vehicle
                </p>

                <p className="text-gray-800 font-medium mt-1">
                  {getVehicleName(
                    vehicle
                  )}
                </p>

              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {vehicle?.make && (

                  <div>

                    <p className="text-xs uppercase font-semibold text-gray-500">
                      Make
                    </p>

                    <p className="text-gray-800 mt-1">
                      {vehicle.make}
                    </p>

                  </div>

                )}


                {vehicle?.model && (

                  <div>

                    <p className="text-xs uppercase font-semibold text-gray-500">
                      Model
                    </p>

                    <p className="text-gray-800 mt-1">
                      {vehicle.model}
                    </p>

                  </div>

                )}

              </div>


              {vehicle?.current_mileage !==
                undefined && (

                <div>

                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Current Mileage
                  </p>

                  <p className="text-gray-800 mt-1">
                    {formatNumber(
                      vehicle.current_mileage
                    )}{" "}
                    km
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            REPORTING PERIOD
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <CalendarDays
                size={20}
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Reporting Period
              </h2>

              <p className="text-sm text-gray-500">
                Week covered by this report.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Week Start
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {formatDate(
                  report.week_start ||
                  report.report_date ||
                  report.date
                )}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Week End
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {formatDate(
                  report.week_end
                )}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            MILEAGE & FUEL
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


          {/* Mileage */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <Gauge
                  size={20}
                />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Mileage
                </h2>

                <p className="text-sm text-gray-500">
                  Vehicle odometer readings.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Starting
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatNumber(
                    startingMileage
                  )}
                  {startingMileage !== null &&
                    startingMileage !== undefined &&
                    " km"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Ending
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatNumber(
                    endingMileage
                  )}
                  {endingMileage !== null &&
                    endingMileage !== undefined &&
                    " km"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase font-semibold text-purple-600">
                  Distance
                </p>

                <p className="text-lg font-bold text-purple-800 mt-1">
                  {formatNumber(
                    mileage
                  )}
                  {mileage !== null &&
                    mileage !== undefined &&
                    " km"}
                </p>

              </div>

            </div>

          </div>


          {/* Fuel */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

                <Fuel
                  size={20}
                />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Fuel Usage
                </h2>

                <p className="text-sm text-gray-500">
                  Fuel consumed during the period.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Quantity
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatNumber(
                    fuelQuantity
                  )}
                  {fuelQuantity !== null &&
                    fuelQuantity !== undefined &&
                    " L"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Cost
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(
                    fuelCost
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            CONDITION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <Wrench
                size={20}
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Vehicle Condition
              </h2>

              <p className="text-sm text-gray-500">
                Condition reported for the vehicle.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap items-center gap-4">

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${conditionClasses}`}
            >
              {getConditionLabel(
                condition
              )}
            </span>


            {maintenanceRequired ? (

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold">

                <Wrench
                  size={16}
                />

                Maintenance Required

              </span>

            ) : (

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold">

                <CheckCircle2
                  size={16}
                />

                No Maintenance Flag

              </span>

            )}

          </div>


          {maintenanceNotes && (

            <div className="mt-5 p-4 rounded-lg bg-orange-50 border border-orange-200">

              <p className="text-xs uppercase font-semibold text-orange-700">
                Maintenance Notes
              </p>

              <p className="text-sm text-orange-900 mt-2 whitespace-pre-wrap">
                {maintenanceNotes}
              </p>

            </div>

          )}

        </div>


        {/* ==================================================
            INCIDENTS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-red-100 text-red-700">

              <AlertTriangle
                size={20}
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Incidents
              </h2>

              <p className="text-sm text-gray-500">
                Incidents recorded during the reporting period.
              </p>

            </div>

          </div>


          {incidents ? (

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">

              <p className="text-sm text-red-900 whitespace-pre-wrap">
                {incidents}
              </p>

            </div>

          ) : (

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">

              <div className="flex items-center gap-2 text-green-700">

                <CheckCircle2
                  size={18}
                />

                <p className="text-sm font-medium">
                  No incidents were recorded for this reporting period.
                </p>

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            DRIVER COMMENTS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <ClipboardList
                size={20}
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Driver Comments
              </h2>

              <p className="text-sm text-gray-500">
                Additional observations recorded by the driver.
              </p>

            </div>

          </div>


          {comments ? (

            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {comments}
              </p>

            </div>

          ) : (

            <p className="text-sm text-gray-500">
              No additional comments were recorded.
            </p>

          )}

        </div>


        {/* ==================================================
            RECORD INFORMATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <h2 className="font-semibold text-gray-800 mb-5">
            Record Information
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Report ID
              </p>

              <p className="text-gray-800 font-medium mt-1">
                #{report.id}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Status
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {getStatusLabel(
                  status
                )}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Created
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {formatDateTime(
                  report.created_at
                )}
              </p>

            </div>


            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Last Updated
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {formatDateTime(
                  report.updated_at
                )}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            HISTORICAL NOTICE
        ================================================== */}

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">

          <div className="flex items-start gap-3">

            <ClipboardList
              size={21}
              className="text-purple-700 mt-0.5 shrink-0"
            />

            <div>

              <h3 className="font-semibold text-purple-800">
                Historical operational record
              </h3>

              <p className="text-sm text-purple-700 mt-1">
                This weekly report is part of the transport history.
                It can be used alongside fueling, maintenance,
                insurance and vehicle mileage records to review
                vehicle operations over time.
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-8">

          <Link
            to="/transport/reports"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >

            <ArrowLeft
              size={18}
            />

            Back to Reports

          </Link>


          <div className="flex flex-col sm:flex-row gap-3">

            <Link
              to={`/transport/reports/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >

              <Edit
                size={18}
              />

              Edit Report

            </Link>


            {!isInactive && (

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
              >

                {deactivating ? (

                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <X
                    size={18}
                  />

                )}

                {deactivating
                  ? "Deactivating..."
                  : "Deactivate Report"}

              </button>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};


export default DriverReportDetailsPage;

