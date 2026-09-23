import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Receipt,
  RefreshCw,
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
VEHICLE MAINTENANCE FORM
==================================================

CREATE
POST /transport/maintenance/

EDIT
GET   /transport/maintenance/:id/
PATCH /transport/maintenance/:id/

A maintenance record represents one historical
maintenance/service event.

The vehicle itself should NOT be overwritten when
a new maintenance record is created.

Example:

Vehicle
   |
   ├── Maintenance #1
   ├── Maintenance #2
   ├── Maintenance #3
   └── Maintenance #4

This gives us a complete maintenance history.
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


const getVehicleName = (vehicle) => {
  if (!vehicle) {
    return "Unknown vehicle";
  }

  const registration =
    vehicle.registration_number ||
    vehicle.registration ||
    "";

  const vehicleNumber =
    vehicle.vehicle_number ||
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
    vehicleNumber ||
    description ||
    `Vehicle #${getId(vehicle)}`
  );
};


const getReceiptLabel = (receipt) => {
  if (!receipt) {
    return "Receipt";
  }

  return (
    receipt.receipt_id ||
    receipt.reference ||
    receipt.payment_reference ||
    `Receipt #${getId(receipt)}`
  );
};


// ==================================================
// INITIAL FORM
// ==================================================

const INITIAL_FORM = {
  vehicle: "",
  maintenance_date: "",
  mileage: "",
  maintenance_type: "routine_service",
  description: "",
  service_provider: "",
  service_provider_phone: "",
  cost: "",
  receipt: "",
  next_service_date: "",
  next_service_mileage: "",
  notes: "",
};


// ==================================================
// COMPONENT
// ==================================================

const MaintenanceFormPage = () => {

  const navigate = useNavigate();

  const {
    id,
  } = useParams();

  const isEditMode =
    Boolean(id);


  // ==================================================
  // DATA
  // ==================================================

  const [vehicles, setVehicles] =
    useState([]);

  const [receipts, setReceipts] =
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

          const requests = [

            axiosInstance.get(
              "/transport/vehicles/"
            ),

            /*
            Receipt linkage is optional.

            If the receipt endpoint is temporarily
            unavailable, maintenance records can
            still be created.
            */

            axiosInstance
              .get("/receipts/")
              .catch(() => null),

          ];


          if (isEditMode) {

            requests.push(
              axiosInstance.get(
                `/transport/maintenance/${id}/`
              )
            );

          }


          const responses =
            await Promise.all(
              requests
            );


          // ------------------------------------------------
          // VEHICLES
          // ------------------------------------------------

          setVehicles(
            extractList(
              responses[0]
            )
          );


          // ------------------------------------------------
          // RECEIPTS
          // ------------------------------------------------

          if (responses[1]) {

            setReceipts(
              extractList(
                responses[1]
              )
            );

          } else {

            setReceipts([]);

          }


          // ------------------------------------------------
          // EDIT RECORD
          // ------------------------------------------------

          if (isEditMode) {

            const maintenance =
              responses[2]?.data;

            if (maintenance) {

              setFormData({

                vehicle:
                  getId(
                    maintenance.vehicle
                  ) ||
                  maintenance.vehicle ||
                  "",

                maintenance_date:
                  formatDateForInput(
                    maintenance.maintenance_date ||
                    maintenance.date
                  ),

                mileage:
                  maintenance.mileage ??
                  maintenance.odometer_reading ??
                  "",

                maintenance_type:
                  maintenance.maintenance_type ||
                  maintenance.service_type ||
                  "routine_service",

                description:
                  maintenance.description ||
                  "",

                service_provider:
                  maintenance.service_provider ||
                  maintenance.workshop ||
                  "",

                service_provider_phone:
                  maintenance.service_provider_phone ||
                  maintenance.provider_phone ||
                  "",

                cost:
                  maintenance.cost ??
                  maintenance.total_cost ??
                  "",

                receipt:
                  getId(
                    maintenance.receipt
                  ) ||
                  maintenance.receipt ||
                  "",

                next_service_date:
                  formatDateForInput(
                    maintenance.next_service_date
                  ),

                next_service_mileage:
                  maintenance.next_service_mileage ??
                  "",

                notes:
                  maintenance.notes ||
                  "",
              });
            }
          }

        } catch (err) {

          console.error(
            "Failed to load maintenance form:",
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
  // HANDLE CHANGE
  // ==================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");
  };


  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {

    if (!formData.vehicle) {

      return (
        "Select a vehicle."
      );
    }


    if (
      !formData.maintenance_date
    ) {

      return (
        "Select the maintenance date."
      );
    }


    if (
      formData.mileage === ""
    ) {

      return (
        "Enter the vehicle mileage at the time of maintenance."
      );
    }


    const mileage =
      Number(
        formData.mileage
      );

    if (
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {

      return (
        "Mileage must be a valid number greater than or equal to zero."
      );
    }


    if (
      !formData.maintenance_type
    ) {

      return (
        "Select the maintenance type."
      );
    }


    if (
      !formData.description.trim()
    ) {

      return (
        "Enter a description of the maintenance work."
      );
    }


    if (
      formData.cost === ""
    ) {

      return (
        "Enter the maintenance cost."
      );
    }


    const cost =
      Number(
        formData.cost
      );

    if (
      !Number.isFinite(cost) ||
      cost < 0
    ) {

      return (
        "Maintenance cost must be a valid amount."
      );
    }


    if (
      formData.next_service_mileage !== ""
    ) {

      const nextMileage =
        Number(
          formData.next_service_mileage
        );

      if (
        !Number.isFinite(
          nextMileage
        ) ||
        nextMileage < 0
      ) {

        return (
          "Next service mileage must be a valid number."
        );
      }

      if (
        nextMileage < mileage
      ) {

        return (
          "Next service mileage cannot be lower than the current mileage."
        );
      }
    }


    if (
      formData.next_service_date &&
      formData.next_service_date <
        formData.maintenance_date
    ) {

      return (
        "Next service date cannot be earlier than the maintenance date."
      );
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

        vehicle:
          Number(
            formData.vehicle
          ),

        maintenance_date:
          formData.maintenance_date,

        mileage:
          Number(
            formData.mileage
          ),

        maintenance_type:
          formData.maintenance_type,

        description:
          formData.description.trim(),

        service_provider:
          formData.service_provider.trim(),

        service_provider_phone:
          formData.service_provider_phone.trim(),

        cost:
          Number(
            formData.cost
          ),

        receipt:
          formData.receipt
            ? Number(
                formData.receipt
              )
            : null,

        next_service_date:
          formData.next_service_date ||
          null,

        next_service_mileage:
          formData.next_service_mileage !== ""
            ? Number(
                formData.next_service_mileage
              )
            : null,

        notes:
          formData.notes.trim(),
      };


      if (isEditMode) {

        await axiosInstance.patch(
          `/transport/maintenance/${id}/`,
          payload
        );

        setSuccess(
          "Maintenance record updated successfully."
        );

      } else {

        await axiosInstance.post(
          "/transport/maintenance/",
          payload
        );

        setSuccess(
          "Maintenance record created successfully."
        );

        setFormData(
          INITIAL_FORM
        );
      }


      setTimeout(() => {

        navigate(
          "/transport/expenses"
        );

      }, 700);

    } catch (err) {

      console.error(
        "Failed to save maintenance record:",
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
            Loading maintenance form...
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
            to="/transport/expenses"
            className="hover:text-purple-700"
          >
            Vehicle Expenses
          </Link>

          <span>
            /
          </span>

          <span className="text-gray-700">
            {isEditMode
              ? "Edit Maintenance"
              : "Record Maintenance"}
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
                  ? "Edit Maintenance Record"
                  : "Record Vehicle Maintenance"}

              </h1>

              <p className="text-gray-600 mt-1">

                Record service, repairs, mileage,
                costs and future maintenance information.

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >

            <ArrowLeft size={17} />

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


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              MAINTENANCE INFORMATION
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Maintenance Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Identify the vehicle and record the maintenance event.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                  value={formData.vehicle}
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


                {selectedVehicle && (

                  <p className="text-xs text-gray-500 mt-1.5">

                    Current vehicle mileage:
                    {" "}
                    {selectedVehicle.current_mileage ??
                      selectedVehicle.mileage ??
                      selectedVehicle.odometer_reading ??
                      "—"}

                  </p>

                )}

              </div>


              {/* Maintenance Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Maintenance Date

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  name="maintenance_date"
                  value={
                    formData.maintenance_date
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Mileage at Maintenance

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  placeholder="e.g. 128500"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Odometer reading when the maintenance work was performed.
                </p>

              </div>


              {/* Maintenance Type */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Maintenance Type

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <select
                  name="maintenance_type"
                  value={
                    formData.maintenance_type
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="routine_service">
                    Routine Service
                  </option>

                  <option value="major_service">
                    Major Service
                  </option>

                  <option value="repair">
                    Repair
                  </option>

                  <option value="tyre_replacement">
                    Tyre Replacement
                  </option>

                  <option value="oil_change">
                    Oil Change
                  </option>

                  <option value="brake_service">
                    Brake Service
                  </option>

                  <option value="electrical">
                    Electrical
                  </option>

                  <option value="bodywork">
                    Bodywork
                  </option>

                  <option value="inspection">
                    Inspection
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ==================================================
              WORK DETAILS
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Work Details
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Describe what was done and who performed the work.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Description */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Work Description

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  rows={4}
                  maxLength={3000}
                  required
                  placeholder="Describe the service, repair, parts replaced or other work performed..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

              </div>


              {/* Service Provider */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Service Provider / Workshop
                </label>

                <input
                  type="text"
                  name="service_provider"
                  value={
                    formData.service_provider
                  }
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="e.g. XYZ Auto Garage"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Provider Phone */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workshop Phone
                </label>

                <input
                  type="tel"
                  name="service_provider_phone"
                  value={
                    formData.service_provider_phone
                  }
                  onChange={handleChange}
                  maxLength={30}
                  placeholder="e.g. 07XXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              COST
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Maintenance Cost
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record the amount paid for this maintenance event.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Cost */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Total Cost

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    KSh
                  </span>

                  <input
                    type="number"
                    name="cost"
                    value={
                      formData.cost
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>


              {/* Receipt */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Receipt

                </label>

                <select
                  name="receipt"
                  value={
                    formData.receipt
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="">
                    No receipt linked
                  </option>

                  {receipts.map(
                    (receipt) => (

                      <option
                        key={
                          getId(
                            receipt
                          )
                        }
                        value={
                          getId(
                            receipt
                          )
                        }
                      >
                        {getReceiptLabel(
                          receipt
                        )}
                      </option>

                    )
                  )}

                </select>

                {receipts.length === 0 && (

                  <p className="text-xs text-gray-500 mt-1.5">
                    No receipt records are currently available.
                  </p>

                )}

              </div>

            </div>

          </div>


          {/* ==================================================
              NEXT SERVICE
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Next Service
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Optionally schedule the next service based on date or mileage.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Next Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Next Service Date
                </label>

                <input
                  type="date"
                  name="next_service_date"
                  value={
                    formData.next_service_date
                  }
                  onChange={handleChange}
                  min={
                    formData.maintenance_date ||
                    undefined
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Next Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Next Service Mileage
                </label>

                <input
                  type="number"
                  name="next_service_mileage"
                  value={
                    formData.next_service_mileage
                  }
                  onChange={handleChange}
                  min={
                    formData.mileage ||
                    "0"
                  }
                  step="1"
                  placeholder="e.g. 135000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              NOTES
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Additional Notes
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add any other information that should remain in the maintenance history.
              </p>

            </div>


            <textarea
              name="notes"
              value={
                formData.notes
              }
              onChange={handleChange}
              rows={5}
              maxLength={3000}
              placeholder="Additional maintenance notes..."
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
                  Maintenance history
                </h3>

                <p className="text-sm text-purple-700 mt-1">
                  Each maintenance transaction is stored as a separate historical
                  record. Creating this record will not erase previous service,
                  repair or maintenance history for the vehicle.
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
                    ? "Update Maintenance Record"
                    : "Save Maintenance Record"}

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default MaintenanceFormPage;

