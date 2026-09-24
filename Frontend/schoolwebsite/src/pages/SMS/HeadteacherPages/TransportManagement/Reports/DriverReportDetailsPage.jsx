import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit,
  Fuel,
  Gauge,
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
- Fuel usage
- Fueling location
- Fuel cost per litre
- Vehicle condition
- Maintenance
- Incidents
- Driver comments
- Review information
- Record metadata

IMPORTANT:

This page follows the DriverWeeklyReport model.

The weekly report stores:

- fuel_used_quantity
- fueling_location
- fuel_cost_per_liter

It does NOT store a total fuel expenditure.

The displayed "Reference Fuel Value" is calculated:

    fuel_used_quantity × fuel_cost_per_liter

It is only an operational reference.

Actual financial fueling transactions
are stored separately through VehicleFueling.
==================================================
*/


// ==================================================
// HELPERS
// ==================================================

const getId = (item) => {
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


// --------------------------------------------------
// DATE
// --------------------------------------------------

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

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


// --------------------------------------------------
// DATE + TIME
// --------------------------------------------------

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
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};


// --------------------------------------------------
// NUMBER
// --------------------------------------------------

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


// --------------------------------------------------
// CURRENCY
// --------------------------------------------------

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


// --------------------------------------------------
// DRIVER NAME
// --------------------------------------------------

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


// --------------------------------------------------
// VEHICLE NAME
// --------------------------------------------------

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


// --------------------------------------------------
// CONDITION LABEL
// --------------------------------------------------

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


  // --------------------------------------------------
  // MILEAGE
  // --------------------------------------------------

  const startingMileage =
    report?.starting_mileage ??
    report?.start_mileage;


  const endingMileage =
    report?.ending_mileage ??
    report?.end_mileage;


  const mileage =
    report?.total_mileage ??
    (
      startingMileage !== undefined &&
      endingMileage !== undefined
        ? Number(endingMileage) -
          Number(startingMileage)
        : null
    );


  // --------------------------------------------------
  // FUEL
  // --------------------------------------------------

  const fuelUsedQuantity =
    report?.fuel_used_quantity ??
    report?.fuel_quantity ??
    report?.fuel_litres ??
    report?.litres ??
    report?.quantity ??
    null;


  const fuelingLocation =
    report?.fueling_location ||
    "";


  const fuelCostPerLiter =
    report?.fuel_cost_per_liter ??
    null;


  // --------------------------------------------------
  // REFERENCE FUEL VALUE
  // --------------------------------------------------

  const referenceFuelValue =
    useMemo(() => {

      if (
        fuelUsedQuantity === null ||
        fuelUsedQuantity === undefined ||
        fuelUsedQuantity === "" ||
        fuelCostPerLiter === null ||
        fuelCostPerLiter === undefined ||
        fuelCostPerLiter === ""
      ) {
        return null;
      }

      const quantity =
        Number(
          fuelUsedQuantity
        );

      const costPerLiter =
        Number(
          fuelCostPerLiter
        );

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(costPerLiter)
      ) {
        return null;
      }

      return quantity * costPerLiter;

    }, [
      fuelUsedQuantity,
      fuelCostPerLiter,
    ]);


  // --------------------------------------------------
  // CONDITION
  // --------------------------------------------------

  const condition =
    report?.vehicle_condition ??
    report?.condition ??
    null;


  // --------------------------------------------------
  // MAINTENANCE
  // --------------------------------------------------

  const maintenanceRequired =
    Boolean(
      report?.maintenance_required
    );


  const maintenanceNotes =
    report?.maintenance_notes ||
    "";


  // --------------------------------------------------
  // INCIDENTS
  // --------------------------------------------------

  const incidents =
    report?.incidents ||
    report?.incident_notes ||
    "";


  // --------------------------------------------------
  // COMMENTS
  // --------------------------------------------------

  const comments =
    report?.comments ||
    report?.notes ||
    "";


  // ==================================================
  // REVIEW STATUS
  // ==================================================

  const reviewed =
    Boolean(
      report?.reviewed
    );


  const reviewedByName =
    report?.reviewed_by_name ||
    (
      report?.reviewed_by &&
      typeof report.reviewed_by === "object"
        ? report.reviewed_by.full_name ||
          report.reviewed_by.name
        : null
    ) ||
    "";


  const reviewComments =
    report?.review_comments ||
    "";


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

                {reviewed ? (

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">

                    <CheckCircle2
                      size={14}
                    />

                    Reviewed

                  </span>

                ) : (

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">

                    <ClipboardList
                      size={14}
                    />

                    Pending Review

                  </span>

                )}

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


          {/* DRIVER */}

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


          {/* VEHICLE */}

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


          {/* MILEAGE */}

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


          {/* FUEL */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-center gap-2 text-purple-700">

              <Fuel
                size={19}
              />

              <span className="text-xs font-semibold uppercase">
                Fuel Used
              </span>

            </div>

            <p className="font-bold text-gray-800 mt-2">

              {formatNumber(
                fuelUsedQuantity
              )}

              {fuelUsedQuantity !== null &&
                fuelUsedQuantity !== undefined &&
                fuelUsedQuantity !== "" &&
                " L"}

            </p>

          </div>

        </div>


        {/* ==================================================
            DRIVER & VEHICLE
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


          {/* DRIVER CARD */}

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


              {(
                driver?.license_number ||
                driver?.psv_license_number
              ) && (

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


          {/* VEHICLE CARD */}

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


              {vehicle?.vehicle_id && (

                <div>

                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Vehicle ID
                  </p>

                  <p className="text-gray-800 mt-1">
                    {vehicle.vehicle_id}
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
                  report.week_start
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


          {/* MILEAGE */}

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


          {/* FUEL */}

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
                  Fuel information recorded by the driver.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* QUANTITY */}

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Fuel Used
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">

                  {formatNumber(
                    fuelUsedQuantity
                  )}

                  {fuelUsedQuantity !== null &&
                    fuelUsedQuantity !== undefined &&
                    " L"}

                </p>

              </div>


              {/* COST PER LITRE */}

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Cost per Litre
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">

                  {formatCurrency(
                    fuelCostPerLiter
                  )}

                </p>

              </div>

            </div>


            {/* FUELING LOCATION */}

            <div className="mt-5 pt-5 border-t border-gray-200">

              <div className="flex items-center gap-2 mb-2">

                <MapPin
                  size={17}
                  className="text-purple-700"
                />

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Fueling Location
                </p>

              </div>

              {fuelingLocation ? (

                <p className="text-gray-800 font-medium">
                  {fuelingLocation}
                </p>

              ) : (

                <p className="text-gray-500">
                  Not recorded
                </p>

              )}

            </div>


            {/* REFERENCE FUEL VALUE */}

            {referenceFuelValue !== null && (

              <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

                <p className="text-xs uppercase font-semibold text-purple-600">
                  Reference Fuel Value
                </p>

                <p className="text-2xl font-bold text-purple-900 mt-1">

                  {formatCurrency(
                    referenceFuelValue
                  )}

                </p>

                <p className="text-xs text-purple-700 mt-1">

                  Fuel used × cost per litre.
                  This is an operational reference only
                  and is not a stored financial transaction.

                </p>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            VEHICLE CONDITION
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
                Condition reported by the driver.
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

                No Maintenance Required

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
            REVIEW INFORMATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">

              <CheckCircle2
                size={20}
              />

            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Review Information
              </h2>

              <p className="text-sm text-gray-500">
                Review status for this weekly report.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


            {/* REVIEW STATUS */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Review Status
              </p>

              {reviewed ? (

                <span className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-semibold">

                  <CheckCircle2
                    size={15}
                  />

                  Reviewed

                </span>

              ) : (

                <span className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">

                  <ClipboardList
                    size={15}
                  />

                  Pending Review

                </span>

              )}

            </div>


            {/* REVIEWED BY */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Reviewed By
              </p>

              <p className="text-gray-800 font-medium mt-1">

                {reviewedByName ||
                  "Not yet reviewed"}

              </p>

            </div>


            {/* REVIEWED AT */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Reviewed At
              </p>

              <p className="text-gray-800 font-medium mt-1">

                {formatDateTime(
                  report.reviewed_at
                )}

              </p>

            </div>

          </div>


          {reviewComments && (

            <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

              <p className="text-xs uppercase font-semibold text-purple-700">
                Review Comments
              </p>

              <p className="text-sm text-purple-900 mt-2 whitespace-pre-wrap">
                {reviewComments}
              </p>

            </div>

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


            {/* REPORT ID */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Report ID
              </p>

              <p className="text-gray-800 font-medium mt-1">
                #{report.id}
              </p>

            </div>


            {/* SUBMITTED */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Submitted
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {formatDateTime(
                  report.submitted_at
                )}
              </p>

            </div>


            {/* REVIEWED */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Reviewed
              </p>

              <p className="text-gray-800 font-medium mt-1">

                {reviewed
                  ? "Yes"
                  : "No"}

              </p>

            </div>


            {/* WEEK */}

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Reporting Week
              </p>

              <p className="text-gray-800 font-medium mt-1">

                {formatDate(
                  report.week_start
                )}

                {" — "}

                {formatDate(
                  report.week_end
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

                This weekly report is retained as part of
                the transport history. Mileage and fuel
                information can be compared with fueling,
                maintenance and other transport records
                over time.

              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-8">


          {/* BACK */}

          <Link
            to="/transport/reports"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >

            <ArrowLeft
              size={18}
            />

            Back to Reports

          </Link>


          {/* EDIT */}

          <Link
            to={`/transport/reports/${id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
          >

            <Edit
              size={18}
            />

            Edit Report

          </Link>

        </div>

      </div>

    </div>
  );
};


export default DriverReportDetailsPage;

