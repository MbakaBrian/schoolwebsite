import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Car,
  Check,
  ChevronRight,
  FileCheck2,
  Gauge,
  Save,
  ShieldCheck,
  Wrench,
  X,
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
// 1. Basic Vehicle Information
// 2. Identification Information
// 3. Mileage & Service
// 4. Insurance
// 5. Inspection & Road Compliance
// 6. Additional Information
//
// Historical records such as fueling, maintenance and
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
  registration_number: "",
  vehicle_number: "",
  make: "",
  model: "",
  year_of_manufacture: "",

  chassis_number: "",
  engine_number: "",
  logbook_number: "",

  current_mileage: "",

  last_service_date: "",
  last_service_mileage: "",
  next_service_date: "",
  next_service_mileage: "",

  insurance_company: "",
  insurance_policy_number: "",
  insurance_expiry_date: "",

  inspection_date: "",
  inspection_expiry_date: "",

  speed_governor_date: "",
  speed_governor_expiry_date: "",

  road_service_date: "",
  road_service_expiry_date: "",

  notes: "",
};


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

        setFormData({
          registration_number:
            vehicle.registration_number ||
            "",

          vehicle_number:
            vehicle.vehicle_number ||
            "",

          make:
            vehicle.make ||
            "",

          model:
            vehicle.model ||
            "",

          year_of_manufacture:
            vehicle.year_of_manufacture ??
            vehicle.manufacture_year ??
            "",

          chassis_number:
            vehicle.chassis_number ||
            "",

          engine_number:
            vehicle.engine_number ||
            "",

          logbook_number:
            vehicle.logbook_number ||
            "",

          current_mileage:
            vehicle.current_mileage ??
            vehicle.odometer_reading ??
            vehicle.mileage ??
            "",

          last_service_date:
            formatDateForInput(
              vehicle.last_service_date
            ),

          last_service_mileage:
            vehicle.last_service_mileage ??
            "",

          next_service_date:
            formatDateForInput(
              vehicle.next_service_date
            ),

          next_service_mileage:
            vehicle.next_service_mileage ??
            "",

          insurance_company:
            vehicle.insurance_company ||
            "",

          insurance_policy_number:
            vehicle.insurance_policy_number ||
            "",

          insurance_expiry_date:
            formatDateForInput(
              vehicle.insurance_expiry_date
            ),

          inspection_date:
            formatDateForInput(
              vehicle.inspection_date
            ),

          inspection_expiry_date:
            formatDateForInput(
              vehicle.inspection_expiry_date
            ),

          speed_governor_date:
            formatDateForInput(
              vehicle.speed_governor_date
            ),

          speed_governor_expiry_date:
            formatDateForInput(
              vehicle.speed_governor_expiry_date
            ),

          road_service_date:
            formatDateForInput(
              vehicle.road_service_date
            ),

          road_service_expiry_date:
            formatDateForInput(
              vehicle.road_service_expiry_date
            ),

          notes:
            vehicle.notes ||
            "",
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
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {

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


    if (
      formData.year_of_manufacture &&
      (
        Number(
          formData.year_of_manufacture
        ) < 1900 ||
        Number(
          formData.year_of_manufacture
        ) >
          new Date().getFullYear()
      )
    ) {
      return "Enter a valid year of manufacture.";
    }


    if (
      formData.current_mileage !== "" &&
      Number(formData.current_mileage) < 0
    ) {
      return "Current mileage cannot be negative.";
    }


    if (
      formData.last_service_mileage !== "" &&
      Number(formData.last_service_mileage) < 0
    ) {
      return "Last service mileage cannot be negative.";
    }


    if (
      formData.next_service_mileage !== "" &&
      Number(formData.next_service_mileage) < 0
    ) {
      return "Next service mileage cannot be negative.";
    }


    if (
      formData.inspection_date &&
      formData.inspection_expiry_date &&
      formData.inspection_expiry_date <
        formData.inspection_date
    ) {
      return "Inspection expiry date cannot be before the inspection date.";
    }


    if (
      formData.insurance_expiry_date &&
      formData.insurance_company.trim() === ""
    ) {
      return "Enter the insurance company when providing an insurance expiry date.";
    }


    if (
      formData.speed_governor_date &&
      formData.speed_governor_expiry_date &&
      formData.speed_governor_expiry_date <
        formData.speed_governor_date
    ) {
      return "Speed governor expiry date cannot be before the issue/service date.";
    }


    if (
      formData.road_service_date &&
      formData.road_service_expiry_date &&
      formData.road_service_expiry_date <
        formData.road_service_date
    ) {
      return "Road service expiry date cannot be before the road service date.";
    }


    if (
      formData.last_service_date &&
      formData.next_service_date &&
      formData.next_service_date <
        formData.last_service_date
    ) {
      return "Next service date cannot be before the last service date.";
    }


    return null;
  };


  // ==========================================================
  // BUILD PAYLOAD
  // ==========================================================

  const buildPayload = () => {

    const payload = {
      registration_number:
        formData.registration_number.trim(),

      vehicle_number:
        formData.vehicle_number.trim(),

      make:
        formData.make.trim(),

      model:
        formData.model.trim(),

      chassis_number:
        formData.chassis_number.trim(),

      engine_number:
        formData.engine_number.trim(),

      logbook_number:
        formData.logbook_number.trim(),

      insurance_company:
        formData.insurance_company.trim(),

      insurance_policy_number:
        formData.insurance_policy_number.trim(),

      notes:
        formData.notes.trim(),
    };


    // --------------------------------------------------------
    // OPTIONAL NUMERIC FIELDS
    // --------------------------------------------------------

    if (
      formData.year_of_manufacture !== ""
    ) {
      payload.year_of_manufacture =
        Number(
          formData.year_of_manufacture
        );
    }


    if (
      formData.current_mileage !== ""
    ) {
      payload.current_mileage =
        Number(
          formData.current_mileage
        );
    }


    if (
      formData.last_service_mileage !== ""
    ) {
      payload.last_service_mileage =
        Number(
          formData.last_service_mileage
        );
    }


    if (
      formData.next_service_mileage !== ""
    ) {
      payload.next_service_mileage =
        Number(
          formData.next_service_mileage
        );
    }


    // --------------------------------------------------------
    // OPTIONAL DATE FIELDS
    // --------------------------------------------------------

    const dateFields = [
      "last_service_date",
      "next_service_date",
      "insurance_expiry_date",
      "inspection_date",
      "inspection_expiry_date",
      "speed_governor_date",
      "speed_governor_expiry_date",
      "road_service_date",
      "road_service_expiry_date",
    ];

    dateFields.forEach((field) => {

      if (formData[field]) {
        payload[field] =
          formData[field];
      }

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


      if (isEditMode) {

        response =
          await axiosInstance.patch(
            `/transport/vehicles/${id}/`,
            payload
          );

      } else {

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
      // RETURN TO DETAILS PAGE
      // ------------------------------------------------------

      const savedId =
        response.data?.id ||
        response.data?.pk ||
        id;


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
              SECTION 1 — BASIC VEHICLE INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Car size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Basic Vehicle Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Basic information used to identify the vehicle.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Registration */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Registration Number
                  <span className="text-red-500 ml-1">*</span>
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


              {/* Vehicle Number */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Internal Vehicle Number
                </label>

                <input
                  type="text"
                  name="vehicle_number"
                  value={
                    formData.vehicle_number
                  }
                  onChange={handleChange}
                  placeholder="e.g. BUS-001"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Make */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Make
                  <span className="text-red-500 ml-1">*</span>
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
                  <span className="text-red-500 ml-1">*</span>
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


              {/* Year */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Year of Manufacture
                </label>

                <input
                  type="number"
                  name="year_of_manufacture"
                  value={
                    formData.year_of_manufacture
                  }
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2020"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 2 — IDENTIFICATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileCheck2 size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Vehicle Identification
                  </h2>

                  <p className="text-xs text-gray-500">
                    Official vehicle identification records.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Chassis */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chassis Number
                </label>

                <input
                  type="text"
                  name="chassis_number"
                  value={
                    formData.chassis_number
                  }
                  onChange={handleChange}
                  placeholder="Chassis number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Engine */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Engine Number
                </label>

                <input
                  type="text"
                  name="engine_number"
                  value={
                    formData.engine_number
                  }
                  onChange={handleChange}
                  placeholder="Engine number"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Logbook */}
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
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 3 — MILEAGE & SERVICE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <Gauge size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Mileage & Service
                  </h2>

                  <p className="text-xs text-gray-500">
                    Track current mileage and planned servicing.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Current Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Mileage (km)
                </label>

                <input
                  type="number"
                  min="0"
                  name="current_mileage"
                  value={
                    formData.current_mileage
                  }
                  onChange={handleChange}
                  placeholder="e.g. 125000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Last Service Mileage */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Service Mileage (km)
                </label>

                <input
                  type="number"
                  min="0"
                  name="last_service_mileage"
                  value={
                    formData.last_service_mileage
                  }
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Last Service Date */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Service Date
                </label>

                <input
                  type="date"
                  name="last_service_date"
                  value={
                    formData.last_service_date
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Next Service Date */}
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
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              {/* Next Service Mileage */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Next Service Mileage (km)
                </label>

                <input
                  type="number"
                  min="0"
                  name="next_service_mileage"
                  value={
                    formData.next_service_mileage
                  }
                  onChange={handleChange}
                  placeholder="e.g. 130000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    Insurance
                  </h2>

                  <p className="text-xs text-gray-500">
                    Current vehicle insurance information.
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


              {/* Policy */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Policy Number
                </label>

                <input
                  type="text"
                  name="insurance_policy_number"
                  value={
                    formData.insurance_policy_number
                  }
                  onChange={handleChange}
                  placeholder="Policy number"
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
              SECTION 5 — INSPECTION & ROAD COMPLIANCE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <FileCheck2 size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Inspection & Road Compliance
                  </h2>

                  <p className="text-xs text-gray-500">
                    Keep regulatory and road-service information current.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 space-y-6">

              {/* ------------------------------------------------
                  INSPECTION
              ------------------------------------------------ */}

              <div>

                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Vehicle Inspection
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Inspection Date
                    </label>

                    <input
                      type="date"
                      name="inspection_date"
                      value={
                        formData.inspection_date
                      }
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                  </div>


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

              </div>


              {/* ------------------------------------------------
                  SPEED GOVERNOR
              ------------------------------------------------ */}

              <div className="pt-5 border-t border-gray-200">

                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Speed Governor
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Speed Governor Date
                    </label>

                    <input
                      type="date"
                      name="speed_governor_date"
                      value={
                        formData.speed_governor_date
                      }
                      onChange={handleChange}
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

              </div>


              {/* ------------------------------------------------
                  ROAD SERVICE
              ------------------------------------------------ */}

              <div className="pt-5 border-t border-gray-200">

                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Road Service
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Road Service Date
                    </label>

                    <input
                      type="date"
                      name="road_service_date"
                      value={
                        formData.road_service_date
                      }
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Road Service Expiry Date
                    </label>

                    <input
                      type="date"
                      name="road_service_expiry_date"
                      value={
                        formData.road_service_expiry_date
                      }
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              SECTION 6 — NOTES
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
                  <Wrench size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Additional Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Add any useful notes about this vehicle.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

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

