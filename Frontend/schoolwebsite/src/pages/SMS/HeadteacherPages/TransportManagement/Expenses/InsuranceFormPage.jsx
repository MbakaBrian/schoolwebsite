import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileCheck,
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
VEHICLE INSURANCE FORM
==================================================

CREATE
POST /transport/insurance/

EDIT
GET   /transport/insurance/:id/
PATCH /transport/insurance/:id/

Each insurance record represents one historical
insurance policy/cover period.

Example:

Vehicle
   |
   ├── Insurance Policy 2025
   ├── Insurance Policy 2026
   └── Insurance Policy 2027

Previous insurance records are retained.

This allows the school to maintain a complete
insurance history for every vehicle.
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
  insurance_company: "",
  policy_number: "",
  insurance_type: "comprehensive",
  start_date: "",
  expiry_date: "",
  premium: "",
  cover_amount: "",
  certificate_number: "",
  broker: "",
  broker_phone: "",
  receipt: "",
  notes: "",
};


// ==================================================
// COMPONENT
// ==================================================

const InsuranceFormPage = () => {

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

            If the receipts endpoint is unavailable,
            the insurance form can still be used.
            */

            axiosInstance
              .get("/receipts/")
              .catch(() => null),

          ];


          if (isEditMode) {

            requests.push(
              axiosInstance.get(
                `/transport/insurance/${id}/`
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

            const insurance =
              responses[2]?.data;

            if (insurance) {

              setFormData({

                vehicle:
                  getId(
                    insurance.vehicle
                  ) ||
                  insurance.vehicle ||
                  "",

                insurance_company:
                  insurance.insurance_company ||
                  insurance.insurer ||
                  "",

                policy_number:
                  insurance.policy_number ||
                  "",

                insurance_type:
                  insurance.insurance_type ||
                  insurance.cover_type ||
                  "comprehensive",

                start_date:
                  formatDateForInput(
                    insurance.start_date ||
                    insurance.cover_start_date
                  ),

                expiry_date:
                  formatDateForInput(
                    insurance.expiry_date ||
                    insurance.insurance_expiry_date ||
                    insurance.cover_expiry_date
                  ),

                premium:
                  insurance.premium ??
                  insurance.amount ??
                  "",

                cover_amount:
                  insurance.cover_amount ??
                  insurance.sum_insured ??
                  "",

                certificate_number:
                  insurance.certificate_number ||
                  "",

                broker:
                  insurance.broker ||
                  "",

                broker_phone:
                  insurance.broker_phone ||
                  "",

                receipt:
                  getId(
                    insurance.receipt
                  ) ||
                  insurance.receipt ||
                  "",

                notes:
                  insurance.notes ||
                  "",
              });
            }
          }

        } catch (err) {

          console.error(
            "Failed to load insurance form:",
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
      !formData.insurance_company.trim()
    ) {

      return (
        "Enter the insurance company."
      );
    }


    if (
      !formData.policy_number.trim()
    ) {

      return (
        "Enter the policy number."
      );
    }


    if (!formData.start_date) {

      return (
        "Select the insurance start date."
      );
    }


    if (!formData.expiry_date) {

      return (
        "Select the insurance expiry date."
      );
    }


    if (
      formData.expiry_date <
      formData.start_date
    ) {

      return (
        "Insurance expiry date cannot be earlier than the start date."
      );
    }


    if (
      formData.premium === ""
    ) {

      return (
        "Enter the insurance premium."
      );
    }


    const premium =
      Number(
        formData.premium
      );

    if (
      !Number.isFinite(premium) ||
      premium < 0
    ) {

      return (
        "Insurance premium must be a valid amount."
      );
    }


    if (
      formData.cover_amount !== ""
    ) {

      const coverAmount =
        Number(
          formData.cover_amount
        );

      if (
        !Number.isFinite(
          coverAmount
        ) ||
        coverAmount < 0
      ) {

        return (
          "Cover amount must be a valid amount."
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

        vehicle:
          Number(
            formData.vehicle
          ),

        insurance_company:
          formData.insurance_company.trim(),

        policy_number:
          formData.policy_number.trim(),

        insurance_type:
          formData.insurance_type,

        start_date:
          formData.start_date,

        expiry_date:
          formData.expiry_date,

        premium:
          Number(
            formData.premium
          ),

        cover_amount:
          formData.cover_amount !== ""
            ? Number(
                formData.cover_amount
              )
            : null,

        certificate_number:
          formData.certificate_number.trim(),

        broker:
          formData.broker.trim(),

        broker_phone:
          formData.broker_phone.trim(),

        receipt:
          formData.receipt
            ? Number(
                formData.receipt
              )
            : null,

        notes:
          formData.notes.trim(),
      };


      if (isEditMode) {

        await axiosInstance.patch(
          `/transport/insurance/${id}/`,
          payload
        );

        setSuccess(
          "Insurance record updated successfully."
        );

      } else {

        await axiosInstance.post(
          "/transport/insurance/",
          payload
        );

        setSuccess(
          "Insurance record created successfully."
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
        "Failed to save insurance record:",
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
            Loading insurance form...
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
              ? "Edit Insurance"
              : "Record Insurance"}
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <FileCheck
                size={25}
              />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Insurance Record"
                  : "Record Vehicle Insurance"}

              </h1>

              <p className="text-gray-600 mt-1">

                Record insurance policy, cover dates,
                premium and supporting information.

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


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              VEHICLE & POLICY
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Policy Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Identify the vehicle and insurance policy.
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


              {/* Insurance Company */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Insurance Company

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="insurance_company"
                  value={
                    formData.insurance_company
                  }
                  onChange={handleChange}
                  maxLength={255}
                  required
                  placeholder="e.g. APA Insurance"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Policy Number */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Policy Number

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="policy_number"
                  value={
                    formData.policy_number
                  }
                  onChange={handleChange}
                  maxLength={255}
                  required
                  placeholder="Enter policy number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Insurance Type */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Insurance Type

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <select
                  name="insurance_type"
                  value={
                    formData.insurance_type
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="comprehensive">
                    Comprehensive
                  </option>

                  <option value="third_party">
                    Third Party
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>


              {/* Certificate Number */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Certificate Number
                </label>

                <input
                  type="text"
                  name="certificate_number"
                  value={
                    formData.certificate_number
                  }
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="Insurance certificate number, if applicable"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              COVER PERIOD
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Cover Period
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record when the insurance cover starts and expires.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Start Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Start Date

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  name="start_date"
                  value={
                    formData.start_date
                  }
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Expiry Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Expiry Date

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  name="expiry_date"
                  value={
                    formData.expiry_date
                  }
                  onChange={handleChange}
                  min={
                    formData.start_date ||
                    undefined
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================================
              FINANCIAL INFORMATION
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Financial Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record the insurance premium and insured amount.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Premium */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Premium

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
                    name="premium"
                    value={
                      formData.premium
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


              {/* Cover Amount */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Amount
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    KSh
                  </span>

                  <input
                    type="number"
                    name="cover_amount"
                    value={
                      formData.cover_amount
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

                <p className="text-xs text-gray-500 mt-1.5">
                  Sum insured, where applicable.
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              BROKER
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Broker / Agent
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Optional insurance broker or agent information.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Broker */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Broker / Agent
                </label>

                <input
                  type="text"
                  name="broker"
                  value={
                    formData.broker
                  }
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="Broker or insurance agent"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Broker Phone */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Broker Phone
                </label>

                <input
                  type="tel"
                  name="broker_phone"
                  value={
                    formData.broker_phone
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
              RECEIPT
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="flex items-start gap-3 mb-5">

              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">

                <Receipt
                  size={20}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Receipt
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Optionally link the insurance payment to a receipt.
                </p>

              </div>

            </div>


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


          {/* ==================================================
              NOTES
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-800">
                Additional Notes
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add any other information about this insurance policy.
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
              placeholder="Additional insurance notes..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

          </div>


          {/* ==================================================
              HISTORICAL RECORD NOTICE
          ================================================== */}

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <FileCheck
                size={21}
                className="text-purple-700 mt-0.5 shrink-0"
              />

              <div>

                <h3 className="font-semibold text-purple-800">
                  Insurance history
                </h3>

                <p className="text-sm text-purple-700 mt-1">
                  Insurance policies are stored as separate historical
                  records. Recording a renewal does not remove the vehicle's
                  previous insurance history.
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
                    ? "Update Insurance Record"
                    : "Save Insurance Record"}

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default InsuranceFormPage;

