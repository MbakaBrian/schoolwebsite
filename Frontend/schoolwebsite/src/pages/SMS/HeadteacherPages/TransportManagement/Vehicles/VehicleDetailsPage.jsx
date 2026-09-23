import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Edit,
  Gauge,
  History,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const getValue = (object, ...keys) => {
  if (!object) return null;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return null;
};


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

  return number.toLocaleString("en-KE");
};


const getExpiryState = (dateValue) => {
  if (!dateValue) {
    return "none";
  }

  const expiry = new Date(dateValue);

  if (Number.isNaN(expiry.getTime())) {
    return "none";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const difference =
    expiry.getTime() - today.getTime();

  const daysRemaining =
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

  if (daysRemaining < 0) {
    return "expired";
  }

  if (daysRemaining <= 30) {
    return "warning";
  }

  return "valid";
};


const getExpiryLabel = (dateValue) => {
  const state =
    getExpiryState(dateValue);

  if (state === "expired") {
    return "Expired";
  }

  if (state === "warning") {
    return "Expiring soon";
  }

  if (state === "valid") {
    return "Valid";
  }

  return "Not provided";
};


const getStatusValue = (vehicle) => {
  return (
    vehicle?.status ||
    (vehicle?.is_active === false
      ? "inactive"
      : "active")
  );
};


const getStatusLabel = (status) => {
  if (!status) return "Active";

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// ============================================================
// EXPIRY BADGE
// ============================================================

const ExpiryBadge = ({
  date,
  label,
}) => {
  const state =
    getExpiryState(date);

  if (state === "expired") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle size={13} />
        {label || "Expired"}
      </span>
    );
  }

  if (state === "warning") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <TriangleAlert size={13} />
        {label || "Expiring soon"}
      </span>
    );
  }

  if (state === "valid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 size={13} />
        {label || "Valid"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      Not provided
    </span>
  );
};


// ============================================================
// INFORMATION ROW
// ============================================================

const InfoRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-3 border-b border-gray-100 last:border-b-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm font-medium text-gray-800 sm:text-right">
        {value || "—"}
      </span>

    </div>
  );
};


// ============================================================
// SECTION CARD
// ============================================================

const SectionCard = ({
  icon,
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

      <div className="px-5 py-4 border-b border-gray-200">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            {icon}
          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              {title}
            </h2>

            {description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="p-5">
        {children}
      </div>

    </div>
  );
};


// ============================================================
// PAGE
// ============================================================

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [vehicle, setVehicle] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD VEHICLE
  // ==========================================================

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/transport/vehicles/${id}/`
          );

        setVehicle(
          response.data
        );

      } catch (err) {
        console.error(
          "Failed to load vehicle:",
          err
        );

        const detail =
          err.response?.data?.detail;

        if (
          typeof detail === "string"
        ) {
          setError(detail);
        } else {
          setError(
            "Failed to load vehicle information."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadVehicle();
    }
  }, [id]);


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const registrationNumber =
    getValue(
      vehicle,
      "registration_number",
      "registration",
      "number_plate"
    ) || "—";


  const vehicleNumber =
    getValue(
      vehicle,
      "vehicle_number",
      "fleet_number"
    ) || "—";


  const make =
    getValue(
      vehicle,
      "make",
      "manufacturer"
    ) || "—";


  const model =
    getValue(
      vehicle,
      "model"
    ) || "—";


  const manufactureYear =
    getValue(
      vehicle,
      "year_of_manufacture",
      "manufacture_year",
      "year"
    );


  const currentMileage =
    getValue(
      vehicle,
      "current_mileage",
      "odometer_reading",
      "mileage"
    );


  const lastServiceMileage =
    getValue(
      vehicle,
      "last_service_mileage"
    );


  const nextServiceMileage =
    getValue(
      vehicle,
      "next_service_mileage"
    );


  const status =
    getStatusValue(vehicle);


  const statusLabel =
    getStatusLabel(status);


  // ==========================================================
  // EXPIRY DATA
  // ==========================================================

  const insuranceExpiry =
    getValue(
      vehicle,
      "insurance_expiry_date"
    );


  const inspectionExpiry =
    getValue(
      vehicle,
      "inspection_expiry_date"
    );


  const speedGovernorExpiry =
    getValue(
      vehicle,
      "speed_governor_expiry_date"
    );


  const roadServiceExpiry =
    getValue(
      vehicle,
      "road_service_expiry_date"
    );


  // ==========================================================
  // COMPLIANCE SUMMARY
  // ==========================================================

  const complianceItems =
    useMemo(
      () => [
        {
          label: "Insurance",
          date: insuranceExpiry,
        },
        {
          label: "Inspection",
          date: inspectionExpiry,
        },
        {
          label: "Speed Governor",
          date: speedGovernorExpiry,
        },
        {
          label: "Road Service",
          date: roadServiceExpiry,
        },
      ],
      [
        insuranceExpiry,
        inspectionExpiry,
        speedGovernorExpiry,
        roadServiceExpiry,
      ]
    );


  const expiredCount =
    complianceItems.filter(
      (item) =>
        getExpiryState(
          item.date
        ) === "expired"
    ).length;


  const warningCount =
    complianceItems.filter(
      (item) =>
        getExpiryState(
          item.date
        ) === "warning"
    ).length;


  const validCount =
    complianceItems.filter(
      (item) =>
        getExpiryState(
          item.date
        ) === "valid"
    ).length;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-800 animate-spin" />

          <p className="text-gray-600 mt-4">
            Loading vehicle information...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate("/transport/vehicles")
            }
            className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 mb-5"
          >
            <ArrowLeft size={16} />
            Back to Vehicles
          </button>


          <div className="bg-gray-50 border border-red-200 rounded-xl p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle size={28} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-4">
              Vehicle not found
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              {error ||
                "The requested vehicle could not be loaded."}
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">


        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport
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
            {registrationNumber}
          </span>

        </div>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0">
                <Car size={28} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {registrationNumber}
                  </h1>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      status === "active"
                        ? "bg-green-100 text-green-700"
                        : status === "inactive"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {statusLabel}
                  </span>

                </div>

                <p className="text-gray-600 mt-1">
                  {make} {model}
                  {manufactureYear
                    ? ` • ${manufactureYear}`
                    : ""}
                </p>

                {vehicleNumber !== "—" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Vehicle No:{" "}
                    <span className="font-medium text-gray-700">
                      {vehicleNumber}
                    </span>
                  </p>
                )}

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/transport/vehicles/${id}/edit`
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >
                <Edit size={17} />
                Edit Vehicle
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate("/transport/vehicles")
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <ArrowLeft size={17} />
                Vehicles
              </button>

            </div>

          </div>

        </div>


        {/* ====================================================
            COMPLIANCE SUMMARY
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Valid
                </p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {validCount}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                <CheckCircle2 size={21} />
              </div>

            </div>

          </div>


          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Expiring Soon
                </p>

                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {warningCount}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <TriangleAlert size={21} />
              </div>

            </div>

          </div>


          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Expired
                </p>

                <p className="text-2xl font-bold text-red-700 mt-1">
                  {expiredCount}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <XCircle size={21} />
              </div>

            </div>

          </div>


          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Current Mileage
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatNumber(
                    currentMileage
                  )}
                </p>

              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Gauge size={21} />
              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <SectionCard
            icon={<Car size={21} />}
            title="Vehicle Information"
            description="Basic vehicle identification and specifications."
          >

            <InfoRow
              label="Registration Number"
              value={registrationNumber}
            />

            <InfoRow
              label="Vehicle Number"
              value={vehicleNumber}
            />

            <InfoRow
              label="Make"
              value={make}
            />

            <InfoRow
              label="Model"
              value={model}
            />

            <InfoRow
              label="Year of Manufacture"
              value={manufactureYear}
            />

            <InfoRow
              label="Chassis Number"
              value={
                getValue(
                  vehicle,
                  "chassis_number",
                  "chassis_no"
                )
              }
            />

            <InfoRow
              label="Engine Number"
              value={
                getValue(
                  vehicle,
                  "engine_number",
                  "engine_no"
                )
              }
            />

            <InfoRow
              label="Logbook Number"
              value={
                getValue(
                  vehicle,
                  "logbook_number",
                  "logbook_no"
                )
              }
            />

          </SectionCard>


          {/* ==================================================
              MILEAGE & SERVICE
          ================================================== */}

          <SectionCard
            icon={<Wrench size={21} />}
            title="Mileage & Service"
            description="Current mileage and scheduled vehicle servicing."
          >

            <InfoRow
              label="Current Mileage"
              value={
                currentMileage !== null
                  ? `${formatNumber(
                      currentMileage
                    )} km`
                  : "—"
              }
            />

            <InfoRow
              label="Last Service Date"
              value={formatDate(
                getValue(
                  vehicle,
                  "last_service_date"
                )
              )}
            />

            <InfoRow
              label="Last Service Mileage"
              value={
                lastServiceMileage !== null
                  ? `${formatNumber(
                      lastServiceMileage
                    )} km`
                  : "—"
              }
            />

            <InfoRow
              label="Next Service Date"
              value={formatDate(
                getValue(
                  vehicle,
                  "next_service_date"
                )
              )}
            />

            <InfoRow
              label="Next Service Mileage"
              value={
                nextServiceMileage !== null
                  ? `${formatNumber(
                      nextServiceMileage
                    )} km`
                  : "—"
              }
            />

          </SectionCard>


          {/* ==================================================
              INSURANCE
          ================================================== */}

          <SectionCard
            icon={<ShieldCheck size={21} />}
            title="Insurance"
            description="Current vehicle insurance information."
          >

            <InfoRow
              label="Insurance Company"
              value={
                getValue(
                  vehicle,
                  "insurance_company"
                )
              }
            />

            <InfoRow
              label="Policy Number"
              value={
                getValue(
                  vehicle,
                  "insurance_policy_number",
                  "insurance_policy"
                )
              }
            />

            <InfoRow
              label="Expiry Date"
              value={formatDate(
                insuranceExpiry
              )}
            />

            <div className="mt-4">

              <ExpiryBadge
                date={insuranceExpiry}
                label={getExpiryLabel(
                  insuranceExpiry
                )}
              />

            </div>

          </SectionCard>


          {/* ==================================================
              INSPECTION & COMPLIANCE
          ================================================== */}

          <SectionCard
            icon={<ShieldCheck size={21} />}
            title="Inspection & Compliance"
            description="Vehicle roadworthiness and compliance dates."
          >

            <div className="space-y-4">

              {/* Inspection */}
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <div>

                    <p className="font-semibold text-gray-800">
                      Inspection
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Date:{" "}
                      {formatDate(
                        getValue(
                          vehicle,
                          "inspection_date"
                        )
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      Expiry:{" "}
                      {formatDate(
                        inspectionExpiry
                      )}
                    </p>

                  </div>

                  <ExpiryBadge
                    date={inspectionExpiry}
                  />

                </div>

              </div>


              {/* Speed Governor */}
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <div>

                    <p className="font-semibold text-gray-800">
                      Speed Governor
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Date:{" "}
                      {formatDate(
                        getValue(
                          vehicle,
                          "speed_governor_date"
                        )
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      Expiry:{" "}
                      {formatDate(
                        speedGovernorExpiry
                      )}
                    </p>

                  </div>

                  <ExpiryBadge
                    date={speedGovernorExpiry}
                  />

                </div>

              </div>


              {/* Road Service */}
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <div>

                    <p className="font-semibold text-gray-800">
                      Road Service
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Date:{" "}
                      {formatDate(
                        getValue(
                          vehicle,
                          "road_service_date"
                        )
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      Expiry:{" "}
                      {formatDate(
                        roadServiceExpiry
                      )}
                    </p>

                  </div>

                  <ExpiryBadge
                    date={roadServiceExpiry}
                  />

                </div>

              </div>

            </div>

          </SectionCard>


          {/* ==================================================
              ADDITIONAL INFORMATION
          ================================================== */}

          <SectionCard
            icon={<CalendarDays size={21} />}
            title="Additional Information"
            description="Other vehicle information and record metadata."
          >

            <InfoRow
              label="Status"
              value={statusLabel}
            />

            <InfoRow
              label="Created"
              value={formatDate(
                getValue(
                  vehicle,
                  "created_at"
                )
              )}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(
                getValue(
                  vehicle,
                  "updated_at"
                )
              )}
            />

            <div className="pt-4">

              <p className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </p>

              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]">
                {getValue(
                  vehicle,
                  "notes"
                ) || "No additional notes."}
              </div>

            </div>

          </SectionCard>


          {/* ==================================================
              TRANSPORT RECORDS
          ================================================== */}

          <SectionCard
            icon={<History size={21} />}
            title="Vehicle Records"
            description="View the vehicle's operational and financial history."
          >

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Link
                to="/transport/expenses"
                className="p-4 rounded-lg bg-gray-100 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
              >

                <Wrench
                  size={20}
                  className="text-purple-700 mb-3"
                />

                <p className="font-semibold text-gray-800">
                  Expenses
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Fueling, maintenance and insurance.
                </p>

              </Link>


              <Link
                to="/transport/expenses"
                className="p-4 rounded-lg bg-gray-100 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
              >

                <Gauge
                  size={20}
                  className="text-purple-700 mb-3"
                />

                <p className="font-semibold text-gray-800">
                  Mileage
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Review vehicle running records.
                </p>

              </Link>


              <Link
                to="/transport/assignments"
                className="p-4 rounded-lg bg-gray-100 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition"
              >

                <History
                  size={20}
                  className="text-purple-700 mb-3"
                />

                <p className="font-semibold text-gray-800">
                  Assignments
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  View transport assignments.
                </p>

              </Link>

            </div>

          </SectionCard>

        </div>


        {/* ====================================================
            BOTTOM NAVIGATION
        ==================================================== */}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <Link
            to="/transport/vehicles"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <ArrowLeft size={17} />
            Back to Vehicles
          </Link>


          <Link
            to={`/transport/vehicles/${id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
          >
            <Edit size={17} />
            Edit Vehicle
          </Link>

        </div>

      </div>

    </div>
  );
};


export default VehicleDetailsPage;

