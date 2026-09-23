import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Fuel,
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
FUELING FORM PAGE
==================================================

Used for:

CREATE
POST /transport/fueling/

EDIT
GET   /transport/fueling/:id/
PATCH /transport/fueling/:id/

Records:

- Vehicle
- Fueling date
- Mileage
- Fuel type
- Quantity
- Unit price
- Total cost
- Fuel station
- Receipt
- Notes

The total cost is calculated automatically:

quantity × unit price

The backend should remain responsible for
final validation and persistence.
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

        const message = Array.isArray(messages)
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
  date: "",
  mileage: "",
  fuel_type: "diesel",
  quantity: "",
  unit_price: "",
  fuel_station: "",
  receipt: "",
  notes: "",
};


// ==================================================
// COMPONENT
// ==================================================

const FuelingFormPage = () => {

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
  // LOAD FORM DATA
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
          ];

          /*
          Receipt linkage is optional.

          If the receipts endpoint is unavailable,
          the fueling form can still be used.
          */

          requests.push(
            axiosInstance
              .get("/receipts/")
              .catch(() => null)
          );


          if (isEditMode) {

            requests.push(
              axiosInstance.get(
                `/transport/fueling/${id}/`
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

            const fueling =
              responses[2]?.data;

            if (fueling) {

              setFormData({
                vehicle:
                  getId(
                    fueling.vehicle
                  ) ||
                  fueling.vehicle ||
                  "",

                date:
                  formatDateForInput(
                    fueling.date
                  ),

                mileage:
                  fueling.mileage ??
                  "",

                fuel_type:
                  fueling.fuel_type ||
                  "diesel",

                quantity:
                  fueling.quantity ??
                  "",

                unit_price:
                  fueling.unit_price ??
                  "",

                fuel_station:
                  fueling.fuel_station ||
                  "",

                receipt:
                  getId(
                    fueling.receipt
                  ) ||
                  fueling.receipt ||
                  "",

                notes:
                  fueling.notes ||
                  "",
              });
            }
          }

        } catch (err) {

          console.error(
            "Failed to load fueling form data:",
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
  // TOTAL COST
  // ==================================================

  const totalCost =
    useMemo(() => {

      const quantity =
        Number(
          formData.quantity
        );

      const unitPrice =
        Number(
          formData.unit_price
        );

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitPrice)
      ) {
        return 0;
      }

      if (
        quantity <= 0 ||
        unitPrice < 0
      ) {
        return 0;
      }

      return (
        quantity *
        unitPrice
      );

    }, [
      formData.quantity,
      formData.unit_price,
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
  // HANDLE INPUT
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


    if (!formData.date) {

      return (
        "Select the fueling date."
      );
    }


    if (
      formData.mileage === ""
    ) {

      return (
        "Enter the vehicle mileage."
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


    if (!formData.fuel_type) {

      return (
        "Select the fuel type."
      );
    }


    if (
      formData.quantity === ""
    ) {

      return (
        "Enter the quantity of fuel."
      );
    }


    const quantity =
      Number(
        formData.quantity
      );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {

      return (
        "Fuel quantity must be greater than zero."
      );
    }


    if (
      formData.unit_price === ""
    ) {

      return (
        "Enter the fuel unit price."
      );
    }


    const unitPrice =
      Number(
        formData.unit_price
      );

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {

      return (
        "Fuel unit price must be a valid amount."
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

        date:
          formData.date,

        mileage:
          Number(
            formData.mileage
          ),

        fuel_type:
          formData.fuel_type,

        quantity:
          Number(
            formData.quantity
          ),

        unit_price:
          Number(
            formData.unit_price
          ),

        fuel_station:
          formData.fuel_station.trim(),

        receipt:
          formData.receipt
            ? Number(
                formData.receipt
              )
            : null,

        notes:
          formData.notes.trim(),
      };


      /*
      total_cost is intentionally not sent.

      The backend should calculate/persist the
      authoritative total from quantity × unit_price.
      */

      if (isEditMode) {

        await axiosInstance.patch(
          `/transport/fueling/${id}/`,
          payload
        );

        setSuccess(
          "Fueling record updated successfully."
        );

      } else {

        await axiosInstance.post(
          "/transport/fueling/",
          payload
        );

        setSuccess(
          "Fueling record created successfully."
        );

        setFormData(
          INITIAL_FORM
        );
      }


      // Give the success message a moment
      // before returning to the expense workspace.

      setTimeout(() => {

        navigate(
          "/transport/expenses"
        );

      }, 700);

    } catch (err) {

      console.error(
        "Failed to save fueling record:",
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
            Loading fueling form...
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

      <div className="max-w-5xl mx-auto">

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
              ? "Edit Fueling"
              : "Record Fueling"}
          </span>

        </div>


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Fuel size={25} />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Fueling Record"
                  : "Record Vehicle Fueling"}

              </h1>

              <p className="text-gray-600 mt-1">

                Record fuel usage, mileage,
                cost and supporting receipt information.

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
              BASIC FUELING INFORMATION
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Fueling Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record the vehicle and fueling transaction details.
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

                    Current mileage:
                    {" "}
                    {selectedVehicle.current_mileage ??
                      selectedVehicle.mileage ??
                      selectedVehicle.odometer_reading ??
                      "—"}

                  </p>

                )}

              </div>


              {/* Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fueling Date
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mileage at Fueling
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
                  placeholder="e.g. 125430"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Enter the odometer reading when the vehicle was fueled.
                </p>

              </div>


              {/* Fuel Type */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fuel Type
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="diesel">
                    Diesel
                  </option>

                  <option value="petrol">
                    Petrol
                  </option>

                </select>

              </div>


              {/* Fuel Station */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fuel Station
                </label>

                <input
                  type="text"
                  name="fuel_station"
                  value={formData.fuel_station}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="e.g. Shell, TotalEnergies, Rubis..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              COST INFORMATION
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Fuel Cost
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enter the quantity and unit price. The total is calculated automatically.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Quantity */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantity (Litres)
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="e.g. 80"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Unit Price */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Unit Price
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 180.50"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Price per litre.
                </p>

              </div>


              {/* Total */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Total Cost
                </label>

                <div className="w-full px-3 py-2.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 font-bold">

                  KSh{" "}
                  {totalCost.toLocaleString(
                    "en-KE",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}

                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  Quantity × unit price.
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              RECEIPT
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-start gap-3 mb-5">

              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">

                <Receipt size={20} />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Receipt & Supporting Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Optionally link this fueling transaction to a receipt record.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 gap-5">

              {/* Receipt */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Receipt
                </label>

                <select
                  name="receipt"
                  value={formData.receipt}
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
                    No receipt records are currently available to link.
                  </p>

                )}

              </div>


              {/* Notes */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Add any additional information about this fueling transaction..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <Fuel
                size={21}
                className="text-purple-700 mt-0.5"
              />

              <div className="flex-1">

                <h3 className="font-semibold text-purple-800">
                  Transaction Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

                  <div>

                    <p className="text-xs uppercase font-semibold text-purple-600">
                      Vehicle
                    </p>

                    <p className="text-sm font-medium text-purple-900 mt-1">
                      {selectedVehicle
                        ? getVehicleName(
                            selectedVehicle
                          )
                        : "—"}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs uppercase font-semibold text-purple-600">
                      Fuel
                    </p>

                    <p className="text-sm font-medium text-purple-900 mt-1 capitalize">
                      {formData.quantity
                        ? `${formData.quantity} L ${formData.fuel_type}`
                        : "—"}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs uppercase font-semibold text-purple-600">
                      Total
                    </p>

                    <p className="text-lg font-bold text-purple-900 mt-1">
                      KSh{" "}
                      {totalCost.toLocaleString(
                        "en-KE",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                  </div>

                </div>

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

              <ArrowLeft size={18} />

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
                  <Check size={18} />

                  {isEditMode
                    ? "Update Fueling Record"
                    : "Save Fueling Record"}

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default FuelingFormPage;

