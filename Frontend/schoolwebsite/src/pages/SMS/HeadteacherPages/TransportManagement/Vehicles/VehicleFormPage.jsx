import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Car,
  Check,
  ChevronRight,
  FileCheck2,
  Save,
  ShieldCheck,
  Wrench,
  X,
  Gauge,
  User,
  ClipboardCheck,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// VEHICLE FORM PAGE
// ============================================================
//
// Used for:
// - Creating a vehicle
// - Editing an existing vehicle
//
// Sections:
// 1. Vehicle Identity
// 2. Vehicle Information
// 3. Ownership
// 4. Insurance
// 5. Inspection
// 6. Speed Governor
// 7. Road Service Licence
// 8. Logbook
// 9. Service
// 10. Status & Notes
//
// vehicle_id is generated automatically by Django.
// Historical records such as maintenance, fueling and
// insurance renewals are managed separately.
//
// ============================================================


// ============================================================
// HELPERS
// ============================================================

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};


const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(" ")
          : String(messages);

        return `${field}: ${message}`;
      })
      .join(" ");
  }

  return "Something went wrong. Please try again.";
};


// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
  // ----------------------------------------------------------
  // VEHICLE IDENTITY
  // ----------------------------------------------------------

  registration_number: "",
  make: "",
  model: "",
  vehicle_type: "",

  // ----------------------------------------------------------
  // VEHICLE INFORMATION
  // ----------------------------------------------------------

  date_of_manufacture: "",
  date_of_registration: "",
  capacity: "",
  fuel_type: "",
  color: "",

  // ----------------------------------------------------------
  // OWNERSHIP
  // ----------------------------------------------------------

  ownership_type: "school_owned",
  owner_name: "",
  owner_phone: "",

  // ----------------------------------------------------------
  // INSURANCE
  // ----------------------------------------------------------

  insurance_company: "",
  insurance_number: "",
  insurance_expiry_date: "",

  // ----------------------------------------------------------
  // INSPECTION
  // ----------------------------------------------------------

  inspection_certificate_number: "",
  inspection_expiry_date: "",

  // ----------------------------------------------------------
  // SPEED GOVERNOR
  // ----------------------------------------------------------

  speed_governor_present: false,
  speed_governor_company: "",
  speed_governor_expiry_date: "",

  // ----------------------------------------------------------
  // ROAD SERVICE LICENCE
  // ----------------------------------------------------------

  road_service_licence_number: "",
  road_service_licence_expiry_date: "",

  // ----------------------------------------------------------
  // LOGBOOK
  // ----------------------------------------------------------

  logbook_number: "",
  logbook_expiry_date: "",

  // ----------------------------------------------------------
  // SERVICE
  // ----------------------------------------------------------

  date_of_service: "",
  date_of_next_service: "",

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  status: "active",

  // ----------------------------------------------------------
  // NOTES
  // ----------------------------------------------------------

  notes: "",
};


// ============================================================
// CHOICES
// ============================================================

const vehicleTypeChoices = [
  { value: "bus", label: "Bus" },
  { value: "van", label: "Van" },
  { value: "minibus", label: "Minibus" },
  { value: "car", label: "Car" },
  { value: "pickup", label: "Pickup" },
  { value: "truck", label: "Truck" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "other", label: "Other" },
];


const fuelTypeChoices = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
];


const ownershipTypeChoices = [
  { value: "school_owned", label: "School Owned" },
  { value: "leased", label: "Leased" },
  { value: "hired", label: "Hired" },
  { value: "private", label: "Private" },
  { value: "other", label: "Other" },
];


const statusChoices = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  {
    value: "under_maintenance",
    label: "Under Maintenance",
  },
  { value: "retired", label: "Retired" },
  { value: "sold", label: "Sold" },
];


// ============================================================
// COMPONENT
// ============================================================

const VehicleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);


  // ==========================================================
  // STATE
  // ==========================================================

  const [formData, setFormData] =
    useState(initialForm);

  const [vehicleId, setVehicleId] =
    useState("");

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD VEHICLE FOR EDITING
  // ==========================================================

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/transport/vehicles/${id}/`
          );

        const vehicle =
          response.data;

        // ----------------------------------------------------
        // SYSTEM GENERATED VEHICLE ID
        // ----------------------------------------------------

        setVehicleId(
          vehicle.vehicle_id || ""
        );


        // ----------------------------------------------------
        // POPULATE FORM
        // ----------------------------------------------------

        setFormData({
          registration_number:
            vehicle.registration_number || "",

          make:
            vehicle.make || "",

          model:
            vehicle.model || "",

          vehicle_type:
            vehicle.vehicle_type || "",

          date_of_manufacture:
            formatDateForInput(
              vehicle.date_of_manufacture
            ),

          date_of_registration:
            formatDateForInput(
              vehicle.date_of_registration
            ),

          capacity:
            vehicle.capacity ??
            "",

          fuel_type:
            vehicle.fuel_type || "",

          color:
            vehicle.color || "",

          ownership_type:
            vehicle.ownership_type ||
            "school_owned",

          owner_name:
            vehicle.owner_name || "",

          owner_phone:
            vehicle.owner_phone || "",

          insurance_company:
            vehicle.insurance_company || "",

          insurance_number:
            vehicle.insurance_number || "",

          insurance_expiry_date:
            formatDateForInput(
              vehicle.insurance_expiry_date
            ),

          inspection_certificate_number:
            vehicle.inspection_certificate_number ||
            "",

          inspection_expiry_date:
            formatDateForInput(
              vehicle.inspection_expiry_date
            ),

          speed_governor_present:
            Boolean(
              vehicle.speed_governor_present
            ),

          speed_governor_company:
            vehicle.speed_governor_company || "",

          speed_governor_expiry_date:
            formatDateForInput(
              vehicle.speed_governor_expiry_date
            ),

          road_service_licence_number:
            vehicle.road_service_licence_number ||
            "",

          road_service_licence_expiry_date:
            formatDateForInput(
              vehicle.road_service_licence_expiry_date
            ),

          logbook_number:
            vehicle.logbook_number || "",

          logbook_expiry_date:
            formatDateForInput(
              vehicle.logbook_expiry_date
            ),

          date_of_service:
            formatDateForInput(
              vehicle.date_of_service
            ),

          date_of_next_service:
            formatDateForInput(
              vehicle.date_of_next_service
            ),

          status:
            vehicle.status || "active",

          notes:
            vehicle.notes || "",
        });

      } catch (err) {
        console.error(
          "Failed to load vehicle:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id, isEditMode]);


  // ==========================================================
  // INPUT HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {

    // --------------------------------------------------------
    // REQUIRED BASIC FIELDS
    // --------------------------------------------------------

    if (
      !formData.registration_number.trim()
    ) {
      return "Vehicle registration number is required.";
    }


    if (!formData.make.trim()) {
      return "Vehicle make is required.";
    }


    if (!formData.model.trim()) {
      return "Vehicle model is required.";
    }


    if (!formData.vehicle_type) {
      return "Vehicle type is required.";
    }


    if (!formData.fuel_type) {
      return "Fuel type is required.";
    }


    // --------------------------------------------------------
    // CAPACITY
    // --------------------------------------------------------

    if (
      formData.capacity !== "" &&
      Number(formData.capacity) < 0
    ) {
      return "Vehicle capacity cannot be negative.";
    }


    // --------------------------------------------------------
    // MANUFACTURE / REGISTRATION
    // --------------------------------------------------------

    if (
      formData.date_of_manufacture &&
      formData.date_of_registration &&
      formData.date_of_registration <
        formData.date_of_manufacture
    ) {
      return (
        "Registration date cannot be earlier than the manufacture date."
      );
    }


    // --------------------------------------------------------
    // INSPECTION
    // --------------------------------------------------------

    if (
      formData.inspection_expiry_date &&
      !formData.inspection_certificate_number.trim()
    ) {
      return (
        "Enter the inspection certificate number when providing an inspection expiry date."
      );
    }


    // --------------------------------------------------------
    // SPEED GOVERNOR
    // --------------------------------------------------------

    if (
      formData.speed_governor_present &&
      !formData.speed_governor_company.trim()
    ) {
      return (
        "Speed governor company is required when a speed governor is present."
      );
    }


    // --------------------------------------------------------
    // SERVICE DATES
    // --------------------------------------------------------

    if (
      formData.date_of_service &&
      formData.date_of_next_service &&
      formData.date_of_next_service <
        formData.date_of_service
    ) {
      return (
        "Next service date cannot be earlier than the previous service date."
      );
    }


    return null;
  };


  // ==========================================================
  // BUILD PAYLOAD
  // ==========================================================

  const buildPayload = () => {

    const payload = {
      // ------------------------------------------------------
      // IDENTITY
      // ------------------------------------------------------

      registration_number:
        formData.registration_number.trim(),

      make:
        formData.make.trim(),

      model:
        formData.model.trim(),

      vehicle_type:
        formData.vehicle_type,

      // ------------------------------------------------------
      // VEHICLE INFORMATION
      // ------------------------------------------------------

      fuel_type:
        formData.fuel_type,

      color:
        formData.color.trim(),

      // ------------------------------------------------------
      // OWNERSHIP
      // ------------------------------------------------------

      ownership_type:
        formData.ownership_type,

      owner_name:
        formData.owner_name.trim(),

      owner_phone:
        formData.owner_phone.trim(),

      // ------------------------------------------------------
      // INSURANCE
      // ------------------------------------------------------

      insurance_company:
        formData.insurance_company.trim(),

      insurance_number:
        formData.insurance_number.trim(),

      // ------------------------------------------------------
      // INSPECTION
      // ------------------------------------------------------

      inspection_certificate_number:
        formData.inspection_certificate_number.trim(),

      // ------------------------------------------------------
      // SPEED GOVERNOR
      // ------------------------------------------------------

      speed_governor_present:
        formData.speed_governor_present,

      speed_governor_company:
        formData.speed_governor_company.trim(),

      // ------------------------------------------------------
      // ROAD SERVICE
      // ------------------------------------------------------

      road_service_licence_number:
        formData.road_service_licence_number.trim(),

      // ------------------------------------------------------
      // LOGBOOK
      // ------------------------------------------------------

      logbook_number:
        formData.logbook_number.trim(),

      // ------------------------------------------------------
      // STATUS
      // ------------------------------------------------------

      status:
        formData.status,

      // ------------------------------------------------------
      // NOTES
      // ------------------------------------------------------

      notes:
        formData.notes.trim(),
    };


    // --------------------------------------------------------
    // OPTIONAL CAPACITY
    // --------------------------------------------------------

    if (formData.capacity !== "") {
      payload.capacity =
        Number(formData.capacity);
    } else {
      payload.capacity = null;
    }


    // --------------------------------------------------------
    // OPTIONAL DATE FIELDS
    // --------------------------------------------------------

    const dateFields = [
      "date_of_manufacture",
      "date_of_registration",
      "insurance_expiry_date",
      "inspection_expiry_date",
      "speed_governor_expiry_date",
      "road_service_licence_expiry_date",
      "logbook_expiry_date",
      "date_of_service",
      "date_of_next_service",
    ];


    dateFields.forEach((field) => {

      payload[field] =
        formData[field] || null;

    });


    return payload;
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");


      const payload =
        buildPayload();


      let response;


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (isEditMode) {

        response =
          await axiosInstance.patch(
            `/transport/vehicles/${id}/`,
            payload
          );

      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {

        response =
          await axiosInstance.post(
            "/transport/vehicles/",
            payload
          );

      }


      setSuccess(
        isEditMode
          ? "Vehicle updated successfully."
          : "Vehicle registered successfully."
      );


      // ------------------------------------------------------
      // GET SAVED ID
      // ------------------------------------------------------

      const savedId =
        response.data?.id ||
        response.data?.pk ||
        id;


      // ------------------------------------------------------
      // NAVIGATE TO DETAILS
      // ------------------------------------------------------

      setTimeout(() => {

        if (savedId) {

          navigate(
            `/transport/vehicles/${savedId}`
          );

        } else {

          navigate(
            "/transport/vehicles"
          );

        }

      }, 700);

    } catch (err) {

      console.error(
        "Failed to save vehicle:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-10 h-10 mx-auto mb-3 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin" />

          <p className="text-gray-600">
            Loading vehicle information...
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

      <div className="max-w-5xl mx-auto">


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

          <Link
            to="/transport/vehicles"
            className="hover:text-purple-700"
          >
            Vehicles
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Vehicle"
              : "Add Vehicle"}
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Car size={24} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {isEditMode
                  ? "Edit Vehicle"
                  : "Register Vehicle"}
              </h1>

              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Update the vehicle's current information."
                  : "Register a school vehicle in the transport system."}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => navigate(-1)}
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
              className="mt-0.5 flex-shrink-0"
            />

            <span>{error}</span>

          </div>
        )}


        {success && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

            <Check
              size={19}
              className="mt-0.5 flex-shrink-0"
            />

            <span>{success}</span>

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
              SECTION 1 — VEHICLE IDENTITY
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Car size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Vehicle Identity
                  </h2>

                  <p className="text-xs text-gray-500">
                    Basic information used to identify the vehicle.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Vehicle ID */}

              {isEditMode && (
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vehicle ID
                  </label>

                  <input
                    type="text"
                    value={vehicleId}
                    readOnly
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Automatically generated by the system.
                  </p>

                </div>
              )}


              {/* Registration Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Registration Number

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="registration_number"
                  value={
                    formData.registration_number
                  }
                  onChange={handleChange}
                  placeholder="e.g. KDA 123A"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Make */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Make

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Model */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Model

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Coaster"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Vehicle Type */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">

                  Vehicle Type

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option value="">
                    Select vehicle type
                  </option>

                  {vehicleTypeChoices.map(
                    (choice) => (
                      <option
                        key={choice.value}
                        value={choice.value}
                      >
                        {choice.label}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 2 — VEHICLE INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Gauge size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Vehicle Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Technical and physical information about the vehicle.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Manufacture Date */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Manufacture
                </label>

                <input
                  type="date"
                  name="date_of_manufacture"
                  value={
                    formData.date_of_manufacture
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Registration Date */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Registration
                </label>

                <input
                  type="date"
                  name="date_of_registration"
                  value={
                    formData.date_of_registration
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Capacity */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Passenger Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 33"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Passenger capacity where applicable.
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

                  <option value="">
                    Select fuel type
                  </option>

                  {fuelTypeChoices.map(
                    (choice) => (
                      <option
                        key={choice.value}
                        value={choice.value}
                      >
                        {choice.label}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* Color */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vehicle Color
                </label>

                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. White"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 3 — OWNERSHIP
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <User size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Ownership
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record how the school vehicle is owned or operated.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Ownership Type */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ownership Type
                </label>

                <select
                  name="ownership_type"
                  value={
                    formData.ownership_type
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  {ownershipTypeChoices.map(
                    (choice) => (
                      <option
                        key={choice.value}
                        value={choice.value}
                      >
                        {choice.label}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* Owner Name */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Owner Name
                </label>

                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Owner or company name"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Owner Phone */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Owner Phone
                </label>

                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  placeholder="e.g. 0712 345 678"
                  className="w-full md:max-w-xl px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 4 — INSURANCE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Current Insurance
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record the vehicle's current insurance information.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Company */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Insurance Company
                </label>

                <input
                  type="text"
                  name="insurance_company"
                  value={
                    formData.insurance_company
                  }
                  onChange={handleChange}
                  placeholder="Insurance provider"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Insurance Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Insurance Number
                </label>

                <input
                  type="text"
                  name="insurance_number"
                  value={
                    formData.insurance_number
                  }
                  onChange={handleChange}
                  placeholder="Policy / insurance number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Expiry */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Insurance Expiry Date
                </label>

                <input
                  type="date"
                  name="insurance_expiry_date"
                  value={
                    formData.insurance_expiry_date
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 5 — INSPECTION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ClipboardCheck size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Vehicle Inspection
                  </h2>

                  <p className="text-xs text-gray-500">
                    Keep the current vehicle inspection record up to date.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Certificate Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Inspection Certificate Number
                </label>

                <input
                  type="text"
                  name="inspection_certificate_number"
                  value={
                    formData.inspection_certificate_number
                  }
                  onChange={handleChange}
                  placeholder="Certificate number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Expiry */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Inspection Expiry Date
                </label>

                <input
                  type="date"
                  name="inspection_expiry_date"
                  value={
                    formData.inspection_expiry_date
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 6 — SPEED GOVERNOR
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Gauge size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Speed Governor
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record the vehicle's speed governor information.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 space-y-5">

              {/* Present */}

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="speed_governor_present"
                  checked={
                    formData.speed_governor_present
                  }
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Speed governor is present
                </span>

              </label>


              {/* Company */}

              {formData.speed_governor_present && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">

                      Speed Governor Company

                      <span className="text-red-500 ml-1">
                        *
                      </span>

                    </label>

                    <input
                      type="text"
                      name="speed_governor_company"
                      value={
                        formData.speed_governor_company
                      }
                      onChange={handleChange}
                      placeholder="Company / installer"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Speed Governor Expiry Date
                    </label>

                    <input
                      type="date"
                      name="speed_governor_expiry_date"
                      value={
                        formData.speed_governor_expiry_date
                      }
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* ==================================================
              SECTION 7 — ROAD SERVICE LICENCE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <FileCheck2 size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Road Service Licence
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record the vehicle's road service licence.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Licence Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Licence Number
                </label>

                <input
                  type="text"
                  name="road_service_licence_number"
                  value={
                    formData.road_service_licence_number
                  }
                  onChange={handleChange}
                  placeholder="Road service licence number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Expiry */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Licence Expiry Date
                </label>

                <input
                  type="date"
                  name="road_service_licence_expiry_date"
                  value={
                    formData.road_service_licence_expiry_date
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 8 — LOGBOOK
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileCheck2 size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Logbook
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record the vehicle logbook information.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Number */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Logbook Number
                </label>

                <input
                  type="text"
                  name="logbook_number"
                  value={
                    formData.logbook_number
                  }
                  onChange={handleChange}
                  placeholder="Logbook number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Expiry */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Logbook Expiry Date
                </label>

                <input
                  type="date"
                  name="logbook_expiry_date"
                  value={
                    formData.logbook_expiry_date
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 9 — SERVICE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Wrench size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Vehicle Service
                  </h2>

                  <p className="text-xs text-gray-500">
                    Record the most recent and upcoming service dates.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Previous Service */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Last Service
                </label>

                <input
                  type="date"
                  name="date_of_service"
                  value={
                    formData.date_of_service
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Next Service */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Next Service
                </label>

                <input
                  type="date"
                  name="date_of_next_service"
                  value={
                    formData.date_of_next_service
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 10 — STATUS & NOTES
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
                  <Wrench size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Status & Additional Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Manage the current vehicle status and notes.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 space-y-5">

              {/* Status */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vehicle Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full md:w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >

                  {statusChoices.map(
                    (choice) => (
                      <option
                        key={choice.value}
                        value={choice.value}
                      >
                        {choice.label}
                      </option>
                    )
                  )}

                </select>

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
                  rows={5}
                  placeholder="Enter any additional information about the vehicle..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              FORM ACTIONS
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pb-8">

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              <X size={18} />
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {saving ? (
                <>
                  <RefreshIcon />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  {isEditMode
                    ? "Update Vehicle"
                    : "Register Vehicle"}
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


// ============================================================
// SMALL LOADING ICON
// ============================================================

const RefreshIcon = () => (
  <svg
    className="w-[18px] h-[18px] animate-spin"
    viewBox="0 0 24 24"
    fill="none"
  >

    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.25"
    />

    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />

  </svg>
);


export default VehicleFormPage;