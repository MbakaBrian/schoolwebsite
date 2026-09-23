import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  RefreshCw,
  User,
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
DRIVER WEEKLY REPORT FORM
==================================================

CREATE
POST /transport/driver-reports/

EDIT
GET   /transport/driver-reports/:id/
PATCH /transport/driver-reports/:id/

Purpose:
- Record weekly driver activity
- Record vehicle mileage
- Record fuel usage
- Record vehicle condition
- Record incidents
- Record driver observations
- Preserve historical operational information

The report belongs to:
    Driver
        +
    Vehicle
        +
    Reporting period
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


const formatDateForInput = (value) => {
  if (!value) return "";

  return String(value).slice(0, 10);
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


const getDriverName = (driver) => {
  if (!driver) {
    return "Unknown driver";
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

  return `Driver #${getId(driver)}`;
};


const getVehicleName = (vehicle) => {
  if (!vehicle) {
    return "Unknown vehicle";
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


// ==================================================
// INITIAL FORM
// ==================================================

const INITIAL_FORM = {
  driver: "",
  vehicle: "",

  week_start: "",
  week_end: "",

  starting_mileage: "",
  ending_mileage: "",

  fuel_quantity: "",
  fuel_cost: "",

  vehicle_condition: "good",

  incidents: "",

  maintenance_required: false,

  maintenance_notes: "",

  comments: "",
};


// ==================================================
// COMPONENT
// ==================================================

const DriverReportFormPage = () => {

  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const isEditMode =
    Boolean(id);


  // ==================================================
  // DATA
  // ==================================================

  const [drivers, setDrivers] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);


  // ==================================================
  // FORM
  // ==================================================

  const [formData, setFormData] =
    useState(INITIAL_FORM);


  // ==================================================
  // UI
  // ==================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {

    const loadFormData =
      async () => {

        try {

          setLoading(true);
          setError("");


          const [
            driversResponse,
            vehiclesResponse,
          ] = await Promise.all([

            axiosInstance.get(
              "/transport/driver-profiles/"
            ),

            axiosInstance.get(
              "/transport/vehicles/"
            ),

          ]);


          setDrivers(
            extractList(
              driversResponse
            )
          );

          setVehicles(
            extractList(
              vehiclesResponse
            )
          );


          // --------------------------------------------
          // EDIT MODE
          // --------------------------------------------

          if (isEditMode) {

            const reportResponse =
              await axiosInstance.get(
                `/transport/driver-reports/${id}/`
              );

            const report =
              reportResponse.data;


            if (report) {

              setFormData({

                driver:
                  getId(
                    report.driver
                  ) ||
                  report.driver_id ||
                  report.driver ||
                  "",

                vehicle:
                  getId(
                    report.vehicle
                  ) ||
                  report.vehicle_id ||
                  report.vehicle ||
                  "",

                week_start:
                  formatDateForInput(
                    report.week_start ||
                    report.report_date ||
                    report.date
                  ),

                week_end:
                  formatDateForInput(
                    report.week_end
                  ),

                starting_mileage:
                  report.starting_mileage ??
                  report.start_mileage ??
                  "",

                ending_mileage:
                  report.ending_mileage ??
                  report.end_mileage ??
                  "",

                fuel_quantity:
                  report.fuel_quantity ??
                  report.quantity ??
                  report.litres ??
                  "",

                fuel_cost:
                  report.fuel_cost ??
                  report.total_fuel_cost ??
                  report.cost ??
                  "",

                vehicle_condition:
                  report.vehicle_condition ||
                  report.condition ||
                  "good",

                incidents:
                  report.incidents ||
                  "",

                maintenance_required:
                  Boolean(
                    report.maintenance_required
                  ),

                maintenance_notes:
                  report.maintenance_notes ||
                  "",

                comments:
                  report.comments ||
                  report.notes ||
                  "",

              });
            }
          }

        } catch (err) {

          console.error(
            "Failed to load driver report form:",
            err
          );

          setError(
            getErrorMessage(err)
          );

        } finally {

          setLoading(false);

        }
      };


    loadFormData();

  }, [
    id,
    isEditMode,
  ]);


  // ==================================================
  // SELECTED DRIVER
  // ==================================================

  const selectedDriver =
    useMemo(() => {

      return drivers.find(
        (driver) =>
          String(
            getId(driver)
          ) ===
          String(
            formData.driver
          )
      );

    }, [
      drivers,
      formData.driver,
    ]);


  // ==================================================
  // SELECTED VEHICLE
  // ==================================================

  const selectedVehicle =
    useMemo(() => {

      return vehicles.find(
        (vehicle) =>
          String(
            getId(vehicle)
          ) ===
          String(
            formData.vehicle
          )
      );

    }, [
      vehicles,
      formData.vehicle,
    ]);


  // ==================================================
  // CALCULATED MILEAGE
  // ==================================================

  const calculatedMileage =
    useMemo(() => {

      const start =
        Number(
          formData.starting_mileage
        );

      const end =
        Number(
          formData.ending_mileage
        );

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
      ) {
        return null;
      }

      return end - start;

    }, [
      formData.starting_mileage,
      formData.ending_mileage,
    ]);


  // ==================================================
  // HANDLE CHANGE
  // ==================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setError("");
    setSuccess("");
  };


  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {

    if (!formData.driver) {
      return "Select a driver.";
    }


    if (!formData.vehicle) {
      return "Select a vehicle.";
    }


    if (!formData.week_start) {
      return "Select the report week start date.";
    }


    if (!formData.week_end) {
      return "Select the report week end date.";
    }


    if (
      formData.week_end <
      formData.week_start
    ) {
      return (
        "The report week end date cannot be earlier than the start date."
      );
    }


    if (
      formData.starting_mileage === ""
    ) {
      return "Enter the starting mileage.";
    }


    if (
      formData.ending_mileage === ""
    ) {
      return "Enter the ending mileage.";
    }


    const startingMileage =
      Number(
        formData.starting_mileage
      );

    const endingMileage =
      Number(
        formData.ending_mileage
      );


    if (
      !Number.isFinite(
        startingMileage
      ) ||
      startingMileage < 0
    ) {
      return (
        "Starting mileage must be a valid non-negative number."
      );
    }


    if (
      !Number.isFinite(
        endingMileage
      ) ||
      endingMileage < 0
    ) {
      return (
        "Ending mileage must be a valid non-negative number."
      );
    }


    if (
      endingMileage <
      startingMileage
    ) {
      return (
        "Ending mileage cannot be less than starting mileage."
      );
    }


    if (
      formData.fuel_quantity !== ""
    ) {

      const quantity =
        Number(
          formData.fuel_quantity
        );

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity < 0
      ) {
        return (
          "Fuel quantity must be a valid non-negative number."
        );
      }
    }


    if (
      formData.fuel_cost !== ""
    ) {

      const fuelCost =
        Number(
          formData.fuel_cost
        );

      if (
        !Number.isFinite(
          fuelCost
        ) ||
        fuelCost < 0
      ) {
        return (
          "Fuel cost must be a valid non-negative amount."
        );
      }
    }


    return null;
  };


  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    const validationError =
      validateForm();


    if (validationError) {

      setError(
        validationError
      );

      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");


      const payload = {

        driver:
          Number(
            formData.driver
          ),

        vehicle:
          Number(
            formData.vehicle
          ),

        week_start:
          formData.week_start,

        week_end:
          formData.week_end,

        starting_mileage:
          Number(
            formData.starting_mileage
          ),

        ending_mileage:
          Number(
            formData.ending_mileage
          ),

        fuel_quantity:
          formData.fuel_quantity !== ""
            ? Number(
                formData.fuel_quantity
              )
            : 0,

        fuel_cost:
          formData.fuel_cost !== ""
            ? Number(
                formData.fuel_cost
              )
            : 0,

        vehicle_condition:
          formData.vehicle_condition,

        incidents:
          formData.incidents.trim(),

        maintenance_required:
          formData.maintenance_required,

        maintenance_notes:
          formData.maintenance_notes.trim(),

        comments:
          formData.comments.trim(),
      };


      if (isEditMode) {

        await axiosInstance.patch(
          `/transport/driver-reports/${id}/`,
          payload
        );

        setSuccess(
          "Driver report updated successfully."
        );

      } else {

        await axiosInstance.post(
          "/transport/driver-reports/",
          payload
        );

        setSuccess(
          "Driver report created successfully."
        );

        setFormData(
          INITIAL_FORM
        );
      }


      setTimeout(() => {

        navigate(
          "/transport/reports"
        );

      }, 700);

    } catch (err) {

      console.error(
        "Failed to save driver report:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setSaving(false);

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
            Loading driver report form...
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

      <div className="max-w-5xl mx-auto">


        {/* ==================================================
            BREADCRUMBS
        ================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">

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
            {isEditMode
              ? "Edit Report"
              : "New Report"}
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <ClipboardList
                size={25}
              />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Driver Report"
                  : "New Driver Report"}

              </h1>

              <p className="text-gray-600 mt-1">
                Record the driver's weekly transport activity.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
          >

            <ArrowLeft
              size={17}
            />

            Back

          </button>

        </div>


        {/* ==================================================
            ALERTS
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


        {success && (

          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

            <Check
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {success}
            </span>

          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >


          {/* ==================================================
              DRIVER & VEHICLE
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Driver & Vehicle
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Select the driver and vehicle associated with this report.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Driver */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Driver

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <select
                  name="driver"
                  value={
                    formData.driver
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="">
                    Select driver
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
                        {getDriverName(
                          driver
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* Vehicle */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Vehicle

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <select
                  name="vehicle"
                  value={
                    formData.vehicle
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="">
                    Select vehicle
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
                        {getVehicleName(
                          vehicle
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* Selected information */}
            {(selectedDriver ||
              selectedVehicle) && (

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">


                {selectedDriver && (

                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

                    <div className="flex items-center gap-2">

                      <User
                        size={17}
                        className="text-purple-700"
                      />

                      <span className="text-xs font-semibold uppercase text-purple-600">
                        Selected Driver
                      </span>

                    </div>

                    <p className="font-semibold text-purple-900 mt-1">
                      {getDriverName(
                        selectedDriver
                      )}
                    </p>

                  </div>

                )}


                {selectedVehicle && (

                  <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Selected Vehicle
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {getVehicleName(
                        selectedVehicle
                      )}
                    </p>

                  </div>

                )}

              </div>

            )}

          </div>


          {/* ==================================================
              REPORT PERIOD
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Reporting Period
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Define the week covered by this report.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Week Start */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Week Start

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  name="week_start"
                  value={
                    formData.week_start
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Week End */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Week End

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  name="week_end"
                  value={
                    formData.week_end
                  }
                  onChange={handleChange}
                  min={
                    formData.week_start ||
                    undefined
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              MILEAGE
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Mileage
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record the vehicle odometer readings for the reporting period.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Starting Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Starting Mileage (km)

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="number"
                  name="starting_mileage"
                  value={
                    formData.starting_mileage
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                  placeholder="e.g. 125000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Ending Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Ending Mileage (km)

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="number"
                  name="ending_mileage"
                  value={
                    formData.ending_mileage
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                  placeholder="e.g. 126250"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>


            {calculatedMileage !== null && (

              <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

                <p className="text-xs uppercase font-semibold text-purple-600">
                  Calculated Weekly Mileage
                </p>

                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {calculatedMileage.toLocaleString(
                    "en-KE",
                    {
                      maximumFractionDigits: 1,
                    }
                  )}
                  {" km"}
                </p>

              </div>

            )}

          </div>


          {/* ==================================================
              FUEL
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Fuel Usage
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record fuel consumed and the associated expenditure.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Fuel Quantity */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fuel Quantity (Litres)
                </label>

                <input
                  type="number"
                  name="fuel_quantity"
                  value={
                    formData.fuel_quantity
                  }
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 85.50"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Fuel Cost */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fuel Cost
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    KSh
                  </span>

                  <input
                    type="number"
                    name="fuel_cost"
                    value={
                      formData.fuel_cost
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              VEHICLE CONDITION
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Vehicle Condition
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record the driver's assessment of the vehicle.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* Condition */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Overall Condition
                </label>

                <select
                  name="vehicle_condition"
                  value={
                    formData.vehicle_condition
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="excellent">
                    Excellent
                  </option>

                  <option value="good">
                    Good
                  </option>

                  <option value="fair">
                    Fair
                  </option>

                  <option value="poor">
                    Poor
                  </option>

                  <option value="critical">
                    Critical
                  </option>

                </select>

              </div>


              {/* Maintenance */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Maintenance Required
                </label>

                <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-300 bg-white cursor-pointer">

                  <input
                    type="checkbox"
                    name="maintenance_required"
                    checked={
                      formData.maintenance_required
                    }
                    onChange={handleChange}
                    className="w-4 h-4 accent-purple-700"
                  />

                  <span className="text-sm text-gray-700">
                    Vehicle requires maintenance
                  </span>

                </label>

              </div>

            </div>


            {formData.maintenance_required && (

              <div className="mt-5">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Maintenance Notes
                </label>

                <textarea
                  name="maintenance_notes"
                  value={
                    formData.maintenance_notes
                  }
                  onChange={handleChange}
                  rows={4}
                  maxLength={3000}
                  placeholder="Describe the maintenance required..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

              </div>

            )}

          </div>


          {/* ==================================================
              INCIDENTS
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Incidents
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record accidents, breakdowns, delays or other transport incidents.
              </p>

            </div>


            <textarea
              name="incidents"
              value={
                formData.incidents
              }
              onChange={handleChange}
              rows={5}
              maxLength={5000}
              placeholder="Describe any incidents during the reporting period..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

          </div>


          {/* ==================================================
              COMMENTS
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Driver Comments
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add any additional observations from the driver.
              </p>

            </div>


            <textarea
              name="comments"
              value={
                formData.comments
              }
              onChange={handleChange}
              rows={5}
              maxLength={5000}
              placeholder="Driver observations, route issues, suggestions..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

          </div>


          {/* ==================================================
              HISTORICAL RECORD NOTICE
          ================================================== */}

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <ClipboardList
                size={21}
                className="text-purple-700 mt-0.5 shrink-0"
              />

              <div>

                <h3 className="font-semibold text-purple-800">
                  Weekly operational record
                </h3>

                <p className="text-sm text-purple-700 mt-1">
                  This report is retained as part of the vehicle's
                  operational history. Mileage and fuel information can
                  later be compared with fueling, maintenance and other
                  transport records.
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-8">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >

              <ArrowLeft
                size={18}
              />

              Cancel

            </button>


            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {saving ? (

                <>

                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                  Saving...

                </>

              ) : (

                <>

                  <Check
                    size={18}
                  />

                  {isEditMode
                    ? "Update Driver Report"
                    : "Save Driver Report"}

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default DriverReportFormPage;

