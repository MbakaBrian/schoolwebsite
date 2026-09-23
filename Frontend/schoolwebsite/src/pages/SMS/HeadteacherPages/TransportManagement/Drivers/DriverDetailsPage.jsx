import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// DRIVER DETAILS PAGE
// ============================================================
//
// Displays:
// - Driver profile
// - Staff information
// - Driving licence information
// - PSV information
// - Medical compliance
// - Driver badge
// - Experience
// - Verification
// - Notes
//
// DriverProfile belongs to Staff through a OneToOne relationship.
//
// The page does not modify verification information directly.
// Verification remains controlled by the backend/workflow.
//
// ============================================================


// ============================================================
// HELPERS
// ============================================================

const getId = (item) => {
  if (!item) return null;

  if (typeof item === "object") {
    return item.id ?? item.pk ?? null;
  }

  return item;
};


const getStaffName = (staff) => {
  if (!staff) {
    return "Unknown Staff Member";
  }

  if (staff.full_name) {
    return staff.full_name;
  }

  return [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown Staff Member";
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
      month: "long",
      day: "numeric",
    }
  );
};


const formatShortDate = (value) => {
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


const formatStatus = (value) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const getStatusClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";

    case "inactive":
      return "bg-gray-100 text-gray-700 border-gray-200";

    case "suspended":
      return "bg-amber-100 text-amber-800 border-amber-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};


const getExpiryState = (dateValue) => {
  if (!dateValue) {
    return {
      label: "Not provided",
      classes:
        "bg-gray-100 text-gray-700 border-gray-200",
      icon: Clock,
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
      classes:
        "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    };
  }

  if (daysRemaining <= 30) {
    return {
      label: `Expires in ${daysRemaining} day${
        daysRemaining === 1 ? "" : "s"
      }`,
      classes:
        "bg-amber-100 text-amber-800 border-amber-200",
      icon: Clock,
    };
  }

  return {
    label: "Valid",
    classes:
      "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  };
};


const getInitials = (name) => {
  if (!name) {
    return "DR";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};


// ============================================================
// COMPONENT
// ============================================================

const DriverDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [driver, setDriver] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deactivating, setDeactivating] =
    useState(false);


  // ==========================================================
  // LOAD DRIVER
  // ==========================================================

  useEffect(() => {
    const loadDriver = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/transport/driver-profiles/${id}/`
          );

        setDriver(response.data);

      } catch (err) {
        console.error(
          "Failed to load driver:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Failed to load driver information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDriver();
    }
  }, [id]);


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const staff = driver?.staff;

  const staffName =
    driver?.staff_name ||
    getStaffName(staff);

  const driverStatus =
    driver?.status ||
    (driver?.is_active
      ? "active"
      : "inactive");


  const licenceExpiry =
    getExpiryState(
      driver?.license_expiry_date
    );

  const psvExpiry =
    getExpiryState(
      driver?.psv_expiry_date
    );

  const medicalExpiry =
    getExpiryState(
      driver?.medical_certificate_expiry
    );


  const LicenceExpiryIcon =
    licenceExpiry.icon;

  const PsvExpiryIcon =
    psvExpiry.icon;

  const MedicalExpiryIcon =
    medicalExpiry.icon;


  const initials = useMemo(
    () => getInitials(staffName),
    [staffName]
  );


  // ==========================================================
  // DEACTIVATE DRIVER
  // ==========================================================

  const handleDeactivate = async () => {
    const confirmed =
      window.confirm(
        `Deactivate the driver profile for ${staffName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);
      setError("");

      await axiosInstance.patch(
        `/transport/driver-profiles/${id}/`,
        {
          is_active: false,
          status: "inactive",
        }
      );

      setDriver((current) => ({
        ...current,
        is_active: false,
        status: "inactive",
      }));

    } catch (err) {
      console.error(
        "Failed to deactivate driver:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "The driver profile could not be deactivated."
      );
    } finally {
      setDeactivating(false);
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
            Loading driver information...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-800 mb-6"
          >
            <ArrowLeft size={18} />
            Back
          </button>


          <div className="bg-gray-50 border border-red-200 rounded-xl p-8 text-center">

            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <XCircle size={28} />
            </div>

            <h1 className="text-xl font-bold text-gray-800">
              Driver Not Found
            </h1>

            <p className="text-gray-500 mt-2">
              {error ||
                "The requested driver profile could not be found."}
            </p>

          </div>

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

          <Link
            to="/transport/drivers"
            className="hover:text-purple-700"
          >
            Drivers
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            {staffName}
          </span>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-purple-800 text-white flex items-center justify-center text-xl font-bold shadow-sm">
              {initials}
            </div>


            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {staffName}
                </h1>

                {driver?.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold">
                    <BadgeCheck size={14} />
                    Verified
                  </span>
                )}

              </div>


              <p className="text-gray-500 mt-1">
                Driver Profile
                {driver?.driver_badge_number
                  ? ` • Badge ${driver.driver_badge_number}`
                  : ""}
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >
              <ArrowLeft size={17} />
              Back
            </button>


            <Link
              to={`/transport/drivers/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >
              <Edit size={17} />
              Edit Driver
            </Link>

          </div>

        </div>


        {/* ==================================================
            ALERT
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
            STATUS BANNER
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Driver Status
                </p>

                <div className="flex items-center gap-2 mt-1">

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${getStatusClasses(
                      driverStatus
                    )}`}
                  >
                    {formatStatus(
                      driverStatus
                    )}
                  </span>

                  {driver?.is_verified && (
                    <span className="text-sm text-blue-700 font-medium">
                      Verified Driver
                    </span>
                  )}

                </div>

              </div>

            </div>


            <div className="flex flex-wrap gap-2">

              <Link
                to={`/transport/drivers/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 text-sm font-medium"
              >
                <Edit size={16} />
                Edit Profile
              </Link>


              {driverStatus === "active" && (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                >
                  <XCircle size={16} />

                  {deactivating
                    ? "Deactivating..."
                    : "Deactivate"}
                </button>
              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            DRIVER / STAFF INFORMATION
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* ------------------------------------------------
              STAFF INFORMATION
          ------------------------------------------------ */}

          <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <User size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Staff Information
                  </h2>

                  <p className="text-xs text-gray-500">
                    Staff member linked to this driver profile.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Name */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Full Name
                  </p>

                  <p className="text-gray-800 font-semibold">
                    {staffName}
                  </p>

                </div>


                {/* Employee Number */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Employee Number
                  </p>

                  <p className="text-gray-800">
                    {staff?.employee_number ||
                      driver?.employee_number ||
                      "—"}
                  </p>

                </div>


                {/* Staff ID */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Staff ID
                  </p>

                  <p className="text-gray-800">
                    {staff?.staff_id ||
                      driver?.staff_id ||
                      "—"}
                  </p>

                </div>


                {/* Phone */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Phone
                  </p>

                  {(
                    staff?.phone ||
                    driver?.staff_phone
                  ) ? (
                    <a
                      href={`tel:${
                        staff?.phone ||
                        driver?.staff_phone
                      }`}
                      className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900"
                    >
                      <Phone size={15} />
                      {staff?.phone ||
                        driver?.staff_phone}
                    </a>
                  ) : (
                    <p className="text-gray-800">
                      —
                    </p>
                  )}

                </div>


                {/* Email */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Email
                  </p>

                  {(
                    staff?.email ||
                    driver?.staff_email
                  ) ? (
                    <a
                      href={`mailto:${
                        staff?.email ||
                        driver?.staff_email
                      }`}
                      className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 break-all"
                    >
                      <Mail size={15} />
                      {staff?.email ||
                        driver?.staff_email}
                    </a>
                  ) : (
                    <p className="text-gray-800">
                      —
                    </p>
                  )}

                </div>


                {/* Employment Type */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Employment Type
                  </p>

                  <p className="text-gray-800">
                    {formatStatus(
                      staff?.employment_type ||
                        driver?.employment_type
                    )}
                  </p>

                </div>


                {/* Date Joined */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Date Joined
                  </p>

                  <div className="flex items-center gap-2 text-gray-800">

                    <CalendarDays size={15} />

                    {formatDate(
                      staff?.date_joined
                    )}

                  </div>

                </div>


                {/* Location */}
                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                    Location
                  </p>

                  <div className="flex items-center gap-2 text-gray-800">

                    <MapPin size={15} />

                    {[
                      staff?.subcounty,
                      staff?.county,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}

                  </div>

                </div>

              </div>


              <div className="mt-5 pt-5 border-t border-gray-200">

                <Link
                  to={
                    staff?.id
                      ? `/staff/members/${staff.id}`
                      : "/staff/members"
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  <UserCheck size={16} />
                  View Staff Record
                  <ChevronRight size={15} />
                </Link>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              DRIVER SUMMARY
          ------------------------------------------------ */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Car size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Driver Summary
                  </h2>

                  <p className="text-xs text-gray-500">
                    Key driving information.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 space-y-5">

              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Licence Class
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {driver?.license_class ||
                    "—"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Years of Experience
                </p>

                <p className="text-lg font-bold text-gray-800 mt-1">
                  {driver?.years_of_experience ??
                    "—"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Driver Badge
                </p>

                <p className="text-gray-800 mt-1">
                  {driver?.driver_badge_number ||
                    "Not assigned"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Verification
                </p>

                <p className="mt-1">

                  {driver?.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
                      <CheckCircle2 size={16} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-gray-600 font-medium">
                      <Clock size={16} />
                      Not verified
                    </span>
                  )}

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            LICENCE & PSV
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* ------------------------------------------------
              DRIVING LICENCE
          ------------------------------------------------ */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileCheck2 size={19} />
                  </div>

                  <div>

                    <h2 className="font-semibold text-gray-800">
                      Driving Licence
                    </h2>

                    <p className="text-xs text-gray-500">
                      Primary driving licence details.
                    </p>

                  </div>

                </div>


                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${licenceExpiry.classes}`}
                >
                  <LicenceExpiryIcon size={13} />
                  {licenceExpiry.label}
                </span>

              </div>

            </div>


            <div className="p-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    Licence Number
                  </p>

                  <p className="text-gray-800 font-semibold mt-1">
                    {driver?.license_number ||
                      "—"}
                  </p>

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    Licence Class
                  </p>

                  <p className="text-gray-800 font-semibold mt-1">
                    {driver?.license_class ||
                      "—"}
                  </p>

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    Issue Date
                  </p>

                  <p className="text-gray-800 mt-1">
                    {formatDate(
                      driver?.license_issue_date
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    Expiry Date
                  </p>

                  <p className="text-gray-800 mt-1">
                    {formatDate(
                      driver?.license_expiry_date
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              PSV LICENCE
          ------------------------------------------------ */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <BadgeCheck size={19} />
                  </div>

                  <div>

                    <h2 className="font-semibold text-gray-800">
                      PSV Licence
                    </h2>

                    <p className="text-xs text-gray-500">
                      Public service vehicle authorization.
                    </p>

                  </div>

                </div>


                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${psvExpiry.classes}`}
                >
                  <PsvExpiryIcon size={13} />
                  {psvExpiry.label}
                </span>

              </div>

            </div>


            <div className="p-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    PSV Licence Number
                  </p>

                  <p className="text-gray-800 font-semibold mt-1">
                    {driver?.psv_license_number ||
                      "Not provided"}
                  </p>

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                    PSV Expiry Date
                  </p>

                  <p className="text-gray-800 mt-1">
                    {formatDate(
                      driver?.psv_expiry_date
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            MEDICAL / EXPERIENCE
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* ------------------------------------------------
              MEDICAL
          ------------------------------------------------ */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                    <ShieldCheck size={19} />
                  </div>

                  <h2 className="font-semibold text-gray-800">
                    Medical Compliance
                  </h2>

                </div>

              </div>

            </div>


            <div className="p-5">

              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                Medical Certificate Expiry
              </p>

              <p className="text-gray-800 font-semibold mt-1">
                {formatDate(
                  driver?.medical_certificate_expiry
                )}
              </p>

              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mt-3 ${medicalExpiry.classes}`}
              >
                <MedicalExpiryIcon size={13} />
                {medicalExpiry.label}
              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              EXPERIENCE
          ------------------------------------------------ */}

          <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Car size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-gray-800">
                    Driving Experience
                  </h2>

                  <p className="text-xs text-gray-500">
                    Previous driving and transport experience.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

              <div className="mb-4">

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Years of Experience
                </p>

                <p className="text-xl font-bold text-gray-800 mt-1">
                  {driver?.years_of_experience ??
                    "—"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
                  Previous Driving Experience
                </p>

                <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {driver?.previous_driving_experience ||
                      "No previous driving experience has been recorded."}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            VERIFICATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

          <div className="px-5 py-4 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserCheck size={19} />
              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Driver Verification
                </h2>

                <p className="text-xs text-gray-500">
                  Verification information recorded by the system.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Verification status */}
              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Verification Status
                </p>

                <div className="mt-2">

                  {driver?.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-200 text-sm font-semibold">
                      <CheckCircle2 size={15} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm font-semibold">
                      <Clock size={15} />
                      Not Verified
                    </span>
                  )}

                </div>

              </div>


              {/* Verification date */}
              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Verification Date
                </p>

                <p className="text-gray-800 mt-2">
                  {formatDate(
                    driver?.verification_date
                  )}
                </p>

              </div>


              {/* Verified by */}
              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Verified By
                </p>

                <p className="text-gray-800 mt-2">
                  {driver?.verified_by_name ||
                    driver?.verified_by ||
                    "—"}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            NOTES
        ================================================== */}

        {driver?.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

            <div className="px-5 py-4 border-b border-gray-200">

              <h2 className="font-semibold text-gray-800">
                Notes
              </h2>

            </div>

            <div className="p-5">

              <p className="text-gray-700 whitespace-pre-wrap">
                {driver.notes}
              </p>

            </div>

          </div>
        )}


        {/* ==================================================
            RELATED TRANSPORT RECORDS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

          <div className="px-5 py-4 border-b border-gray-200">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Car size={19} />
              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Related Transport Records
                </h2>

                <p className="text-xs text-gray-500">
                  Continue managing records associated with this driver.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Driver Reports */}
              <Link
                to="/transport/driver-reports"
                className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <FileCheck2 size={19} />
                    </div>

                    <div>

                      <p className="font-semibold text-gray-800 group-hover:text-purple-800">
                        Driver Weekly Reports
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        View mileage, fueling and driver reports.
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-400 group-hover:text-purple-700"
                  />

                </div>

              </Link>


              {/* Vehicles */}
              <Link
                to="/transport/vehicles"
                className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Car size={19} />
                    </div>

                    <div>

                      <p className="font-semibold text-gray-800 group-hover:text-purple-800">
                        Vehicles
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        View vehicles and transport assignments.
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-400 group-hover:text-purple-700"
                  />

                </div>

              </Link>

            </div>

          </div>

        </div>


        {/* ==================================================
            RECORD INFORMATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">

            <h2 className="font-semibold text-gray-800">
              Record Information
            </h2>

          </div>


          <div className="p-5">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Driver Profile ID
                </p>

                <p className="text-gray-800 mt-1">
                  {driver.id || "—"}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Created
                </p>

                <p className="text-gray-800 mt-1">
                  {formatShortDate(
                    driver.created_at
                  )}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                  Last Updated
                </p>

                <p className="text-gray-800 mt-1">
                  {formatShortDate(
                    driver.updated_at
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>


      </div>

    </div>
  );
};


export default DriverDetailsPage;

