import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Bus,
  CalendarClock,
  Car,
  CheckCircle,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Fuel,
  Gauge,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import axiosInstance from "../../../../utils/axiosInstance";


// ============================================================
// TRANSPORT DASHBOARD
// ============================================================
//
// Dashboard overview:
//
// 1. Transport summary
// 2. Vehicle status
// 3. Driver overview
// 4. Compliance / service alerts
// 5. Recent fueling
// 6. Driver weekly reports
// 7. Transport costs
// 8. Quick actions
//
// Current backend endpoints:
//
// /api/transport/
// ├── driver-profiles/
// ├── driver-reports/
// ├── vehicles/
// ├── vehicle-assignments/
// ├── fueling/
// ├── maintenance/
// ├── insurance/
// ├── routes/
// └── assignments/
// ============================================================


// ============================================================
// HELPERS
// ============================================================

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


const getId = (item) => {
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const getDriverName = (driver) => {
  if (!driver) {
    return "Unknown Driver";
  }

  // Current DriverWeeklyReport serializer
  if (driver.driver_name) {
    return driver.driver_name;
  }

  if (driver.full_name) {
    return driver.full_name;
  }

  if (driver.staff_name) {
    return driver.staff_name;
  }

  if (driver.name) {
    return driver.name;
  }

  if (driver.staff) {
    if (typeof driver.staff === "object") {
      return [
        driver.staff.first_name,
        driver.staff.middle_name,
        driver.staff.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Unknown Driver";
    }
  }

  if (
    typeof driver === "number" ||
    typeof driver === "string"
  ) {
    return `Driver #${driver}`;
  }

  return "Unknown Driver";
};


const getVehicleName = (vehicle) => {
  if (!vehicle) {
    return "Unknown Vehicle";
  }

  // Current DriverWeeklyReport serializer
  if (vehicle.vehicle_registration) {
    if (vehicle.vehicle_id) {
      return `${vehicle.vehicle_registration} — ${vehicle.vehicle_id}`;
    }

    return vehicle.vehicle_registration;
  }

  const registration =
    vehicle.registration_number ||
    vehicle.registration ||
    vehicle.vehicle_number ||
    "";

  const make =
    vehicle.make || "";

  const model =
    vehicle.model || "";

  const description =
    [make, model]
      .filter(Boolean)
      .join(" ");

  if (registration && description) {
    return `${registration} — ${description}`;
  }

  return (
    registration ||
    description ||
    vehicle.vehicle_id ||
    "Unknown Vehicle"
  );
};


const getReportDriverLabel = (report) => {
  if (report?.driver_name) {
    return report.driver_name;
  }

  if (report?.driver !== undefined && report?.driver !== null) {
    return `Driver #${report.driver}`;
  }

  return "Unknown Driver";
};


const getReportVehicleLabel = (report) => {
  if (report?.vehicle_registration) {
    return report.vehicle_registration;
  }

  if (report?.vehicle_id) {
    return report.vehicle_id;
  }

  if (report?.vehicle !== undefined && report?.vehicle !== null) {
    return `Vehicle #${report.vehicle}`;
  }

  return "Unknown Vehicle";
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
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const formatCurrency = (value) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "KES 0.00";
  }

  return `KES ${amount.toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const formatNumber = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-KE"
  );
};


const getStatusLabel = (status) => {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


const getDaysUntil = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const target = new Date(dateValue);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  target.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    target.getTime() -
    today.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};


const getComplianceState = (dateValue) => {
  const days = getDaysUntil(dateValue);

  if (days === null) {
    return "unknown";
  }

  if (days < 0) {
    return "expired";
  }

  if (days <= 30) {
    return "warning";
  }

  return "valid";
};


// ============================================================
// SMALL UI COMPONENTS
// ============================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = "bg-purple-100 text-purple-700",
  href,
}) => {
  const content = (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-2">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClassName}`}
        >
          <Icon size={22} />
        </div>

      </div>

    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      to={href}
      className="block"
    >
      {content}
    </Link>
  );
};


const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  href,
  actionLabel = "View All",
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
          <Icon size={19} />
        </div>

        <div>

          <h2 className="font-semibold text-gray-800">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {href && (
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          {actionLabel}
          <ArrowRight size={15} />
        </Link>
      )}

    </div>
  );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const TransportDashboard = () => {

  // ==========================================================
  // DATA
  // ==========================================================

  const [vehicles, setVehicles] =
    useState([]);

  const [drivers, setDrivers] =
    useState([]);

  const [vehicleAssignments, setVehicleAssignments] =
    useState([]);

  const [fueling, setFueling] =
    useState([]);

  const [maintenance, setMaintenance] =
    useState([]);

  const [insurance, setInsurance] =
    useState([]);

  const [driverReports, setDriverReports] =
    useState([]);

  const [routes, setRoutes] =
    useState([]);

  const [transportAssignments, setTransportAssignments] =
    useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        vehiclesResponse,
        driversResponse,
        vehicleAssignmentsResponse,
        fuelingResponse,
        maintenanceResponse,
        insuranceResponse,
        driverReportsResponse,
        routesResponse,
        transportAssignmentsResponse,
      ] = await Promise.all([
        axiosInstance.get(
          "/transport/vehicles/"
        ),

        axiosInstance.get(
          "/transport/driver-profiles/"
        ),

        axiosInstance.get(
          "/transport/vehicle-assignments/"
        ),

        axiosInstance.get(
          "/transport/fueling/"
        ),

        axiosInstance.get(
          "/transport/maintenance/"
        ),

        axiosInstance.get(
          "/transport/insurance/"
        ),

        axiosInstance.get(
          "/transport/driver-reports/"
        ),

        axiosInstance.get(
          "/transport/routes/"
        ),

        axiosInstance.get(
          "/transport/assignments/"
        ),
      ]);


      setVehicles(
        extractList(
          vehiclesResponse
        )
      );

      setDrivers(
        extractList(
          driversResponse
        )
      );

      setVehicleAssignments(
        extractList(
          vehicleAssignmentsResponse
        )
      );

      setFueling(
        extractList(
          fuelingResponse
        )
      );

      setMaintenance(
        extractList(
          maintenanceResponse
        )
      );

      setInsurance(
        extractList(
          insuranceResponse
        )
      );

      setDriverReports(
        extractList(
          driverReportsResponse
        )
      );

      setRoutes(
        extractList(
          routesResponse
        )
      );

      setTransportAssignments(
        extractList(
          transportAssignmentsResponse
        )
      );

    } catch (err) {

      console.error(
        "Failed to load transport dashboard:",
        err
      );

      setError(
        "Failed to load transport dashboard data. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadDashboard();

  }, []);


  // ==========================================================
  // VEHICLE STATISTICS
  // ==========================================================

  const vehicleStats = useMemo(() => {

    const total =
      vehicles.length;

    const active =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "active"
      ).length;

    const inactive =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "inactive"
      ).length;

    // Current Vehicle model uses:
    // "under_maintenance"
    const maintenanceCount =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "under_maintenance"
      ).length;

    const retired =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "retired"
      ).length;

    const sold =
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "sold"
      ).length;

    return {
      total,
      active,
      inactive,
      maintenance: maintenanceCount,
      retired,
      sold,
    };

  }, [
    vehicles,
  ]);


  // ==========================================================
  // DRIVER STATISTICS
  // ==========================================================

  const driverStats = useMemo(() => {

    const total =
      drivers.length;

    const active =
      drivers.filter(
        (driver) =>
          driver.status === "active"
      ).length;

    const verified =
      drivers.filter(
        (driver) =>
          driver.is_verified === true ||
          driver.verified === true
      ).length;

    const pending =
      drivers.filter(
        (driver) =>
          driver.is_verified === false ||
          driver.verified === false
      ).length;

    return {
      total,
      active,
      verified,
      pending,
    };

  }, [
    drivers,
  ]);


  // ==========================================================
  // ACTIVE VEHICLE ASSIGNMENTS
  // ==========================================================

  const activeVehicleAssignments =
    useMemo(() => {

      return vehicleAssignments.filter(
        (assignment) =>
          assignment.status === "active" ||
          assignment.is_active === true
      );

    }, [
      vehicleAssignments,
    ]);


  // ==========================================================
  // DRIVER REPORT STATISTICS
  // ==========================================================

  const driverReportStats =
    useMemo(() => {

      const total =
        driverReports.length;

      const reviewed =
        driverReports.filter(
          (report) =>
            report.reviewed === true
        ).length;

      const pending =
        driverReports.filter(
          (report) =>
            report.reviewed !== true
        ).length;

      return {
        total,
        reviewed,
        pending,
      };

    }, [
      driverReports,
    ]);


  // ==========================================================
  // COMPLIANCE ALERTS
  // ==========================================================

  const complianceAlerts =
    useMemo(() => {

      const alerts = [];


      // ------------------------------------------------------
      // VEHICLE INSURANCE
      // ------------------------------------------------------

      vehicles.forEach(
        (vehicle) => {

          const expiry =
            vehicle.insurance_expiry_date;

          if (!expiry) {
            return;
          }

          const state =
            getComplianceState(
              expiry
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "insurance",
              title: "Insurance",
              vehicle,
              date: expiry,
              state,
            });

          }

        }
      );


      // ------------------------------------------------------
      // VEHICLE INSPECTION
      // ------------------------------------------------------

      vehicles.forEach(
        (vehicle) => {

          const expiry =
            vehicle.inspection_expiry_date;

          if (!expiry) {
            return;
          }

          const state =
            getComplianceState(
              expiry
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "inspection",
              title: "Inspection Certificate",
              vehicle,
              date: expiry,
              state,
            });

          }

        }
      );


      // ------------------------------------------------------
      // SPEED GOVERNOR
      // ------------------------------------------------------

      vehicles.forEach(
        (vehicle) => {

          if (
            vehicle.speed_governor_present !== true
          ) {
            return;
          }

          const expiry =
            vehicle.speed_governor_expiry_date;

          if (!expiry) {
            return;
          }

          const state =
            getComplianceState(
              expiry
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "speed_governor",
              title: "Speed Governor",
              vehicle,
              date: expiry,
              state,
            });

          }

        }
      );


      // ------------------------------------------------------
      // ROAD SERVICE LICENCE
      // ------------------------------------------------------

      vehicles.forEach(
        (vehicle) => {

          const expiry =
            vehicle.road_service_licence_expiry_date;

          if (!expiry) {
            return;
          }

          const state =
            getComplianceState(
              expiry
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "road_service_licence",
              title: "Road Service Licence",
              vehicle,
              date: expiry,
              state,
            });

          }

        }
      );


      // ------------------------------------------------------
      // MAINTENANCE / NEXT SERVICE
      // ------------------------------------------------------

      vehicles.forEach(
        (vehicle) => {

          const nextService =
            vehicle.date_of_next_service;

          if (!nextService) {
            return;
          }

          const state =
            getComplianceState(
              nextService
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "vehicle_service",
              title: "Vehicle Service",
              vehicle,
              date: nextService,
              state,
            });

          }

        }
      );


      // ------------------------------------------------------
      // MAINTENANCE RECORD NEXT SERVICE
      // ------------------------------------------------------

      maintenance.forEach(
        (record) => {

          const nextService =
            record.next_service_date;

          if (!nextService) {
            return;
          }

          const state =
            getComplianceState(
              nextService
            );

          if (
            state === "expired" ||
            state === "warning"
          ) {

            alerts.push({
              type: "maintenance",
              title: "Maintenance Service",
              vehicle: record.vehicle,
              date: nextService,
              state,
            });

          }

        }
      );


      return alerts
        .sort((a, b) => {

          const aDate =
            new Date(
              a.date
            ).getTime();

          const bDate =
            new Date(
              b.date
            ).getTime();

          return aDate - bDate;

        })
        .slice(0, 6);

    }, [
      vehicles,
      maintenance,
    ]);


  // ==========================================================
  // RECENT FUELING
  // ==========================================================

  const recentFueling =
    useMemo(() => {

      return [...fueling]
        .sort((a, b) => {

          const aDate =
            new Date(
              a.date ||
              a.fueling_date ||
              a.created_at ||
              0
            ).getTime();

          const bDate =
            new Date(
              b.date ||
              b.fueling_date ||
              b.created_at ||
              0
            ).getTime();

          return bDate - aDate;

        })
        .slice(0, 5);

    }, [
      fueling,
    ]);


  // ==========================================================
  // RECENT DRIVER REPORTS
  // ==========================================================

  const recentReports =
    useMemo(() => {

      return [...driverReports]
        .sort((a, b) => {

          // DriverWeeklyReport does NOT have created_at.
          // submitted_at is the actual submission timestamp.
          const aDate =
            new Date(
              a.submitted_at ||
              a.week_start ||
              0
            ).getTime();

          const bDate =
            new Date(
              b.submitted_at ||
              b.week_start ||
              0
            ).getTime();

          return bDate - aDate;

        })
        .slice(0, 5);

    }, [
      driverReports,
    ]);


  // ==========================================================
  // MILEAGE SUMMARY
  // ==========================================================

  const mileageSummary =
    useMemo(() => {

      return driverReports.reduce(
        (total, report) => {

          const mileage =
            Number(
              report.total_mileage
            );

          if (
            Number.isNaN(
              mileage
            )
          ) {
            return total;
          }

          return total + mileage;

        },
        0
      );

    }, [
      driverReports,
    ]);


  // ==========================================================
  // FUEL USED SUMMARY FROM WEEKLY REPORTS
  // ==========================================================

  const weeklyFuelUsed =
    useMemo(() => {

      return driverReports.reduce(
        (total, report) => {

          const quantity =
            Number(
              report.fuel_used_quantity
            );

          if (
            Number.isNaN(
              quantity
            )
          ) {
            return total;
          }

          return total + quantity;

        },
        0
      );

    }, [
      driverReports,
    ]);


  // ==========================================================
  // FUEL COST SUMMARY
  // ==========================================================
  //
  // This comes from VehicleFueling financial records.
  //
  // IMPORTANT:
  // DriverWeeklyReport.fuel_cost_per_liter is NOT included here.
  // That field represents an operational reference price, not
  // an actual financial fueling transaction.
  // ==========================================================

  const fuelingCost =
    useMemo(() => {

      return fueling.reduce(
        (total, record) => {

          const cost =
            Number(
              record.total_cost ??
              record.cost ??
              record.amount ??
              record.receipt?.total ??
              0
            );

          if (
            Number.isNaN(cost)
          ) {
            return total;
          }

          return total + cost;

        },
        0
      );

    }, [
      fueling,
    ]);


  // ==========================================================
  // MAINTENANCE COST SUMMARY
  // ==========================================================

  const maintenanceCost =
    useMemo(() => {

      return maintenance.reduce(
        (total, record) => {

          const cost =
            Number(
              record.cost ??
              record.total_cost ??
              record.amount ??
              record.receipt?.total ??
              0
            );

          if (
            Number.isNaN(cost)
          ) {
            return total;
          }

          return total + cost;

        },
        0
      );

    }, [
      maintenance,
    ]);


  // ==========================================================
  // INSURANCE COST SUMMARY
  // ==========================================================

  const insuranceCost =
    useMemo(() => {

      return insurance.reduce(
        (total, record) => {

          const cost =
            Number(
              record.premium ??
              record.total_cost ??
              record.cost ??
              record.amount ??
              record.receipt?.total ??
              0
            );

          if (
            Number.isNaN(cost)
          ) {
            return total;
          }

          return total + cost;

        },
        0
      );

    }, [
      insurance,
    ]);


  // ==========================================================
  // TOTAL TRANSPORT COST
  // ==========================================================

  const totalTransportCost =
    fuelingCost +
    maintenanceCost +
    insuranceCost;


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            size={30}
            className="mx-auto text-purple-700 animate-spin"
          />

          <p className="text-gray-600 mt-3">
            Loading transport dashboard...
          </p>

        </div>

      </div>
    );

  }


  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/"
            className="hover:text-purple-700"
          >
            Dashboard
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Transport Management
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Bus size={26} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Transport Management
              </h1>

              <p className="text-gray-600 mt-1">
                Monitor school transport, vehicles, drivers and operational activity.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <XCircle
            size={19}
            className="mt-0.5"
          />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="text-sm font-medium hover:underline"
          >
            Retry
          </button>

        </div>
      )}


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <StatCard
          title="Total Vehicles"
          value={vehicleStats.total}
          subtitle={`${vehicleStats.active} active`}
          icon={Bus}
          href="/transport/vehicles"
        />

        <StatCard
          title="Active Drivers"
          value={driverStats.active}
          subtitle={`${driverStats.total} registered drivers`}
          icon={Users}
          iconClassName="bg-blue-100 text-blue-700"
          href="/transport/drivers"
        />

        <StatCard
          title="Active Assignments"
          value={activeVehicleAssignments.length}
          subtitle="Vehicle-driver assignments"
          icon={Car}
          iconClassName="bg-green-100 text-green-700"
          href="/transport/vehicles/assignments"
        />

        <StatCard
          title="Transport Costs"
          value={formatCurrency(
            totalTransportCost
          )}
          subtitle="Fueling, maintenance & insurance"
          icon={CircleDollarSign}
          iconClassName="bg-amber-100 text-amber-700"
          href="/transport/expenses"
        />

      </div>


      {/* ====================================================
          SECONDARY SUMMARY
      ==================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <StatCard
          title="Routes"
          value={routes.length}
          subtitle="Configured transport routes"
          icon={MapPin}
          iconClassName="bg-indigo-100 text-indigo-700"
          href="/transport/routes"
        />

        <StatCard
          title="Students Assigned"
          value={transportAssignments.length}
          subtitle="Transport assignments"
          icon={ClipboardList}
          iconClassName="bg-purple-100 text-purple-700"
          href="/transport/assignments"
        />

        <StatCard
          title="Weekly Mileage"
          value={formatNumber(
            mileageSummary
          )}
          subtitle="Mileage recorded in reports"
          icon={Gauge}
          iconClassName="bg-cyan-100 text-cyan-700"
          href="/transport/reports"
        />

        <StatCard
          title="Driver Reports"
          value={driverReportStats.total}
          subtitle={`${driverReportStats.pending} pending review`}
          icon={ClipboardList}
          iconClassName="bg-teal-100 text-teal-700"
          href="/transport/reports"
        />

      </div>


      {/* ====================================================
          VEHICLE STATUS
      ==================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={Bus}
            title="Vehicle Status"
            subtitle="Current transport fleet overview"
            href="/transport/vehicles"
          />


          <div className="grid grid-cols-2 gap-4">

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">

              <div className="flex items-center gap-2 text-green-700">

                <CheckCircle size={18} />

                <span className="text-sm font-medium">
                  Active
                </span>

              </div>

              <p className="text-2xl font-bold text-green-800 mt-2">
                {vehicleStats.active}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">

              <div className="flex items-center gap-2 text-amber-700">

                <Wrench size={18} />

                <span className="text-sm font-medium">
                  Maintenance
                </span>

              </div>

              <p className="text-2xl font-bold text-amber-800 mt-2">
                {vehicleStats.maintenance}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

              <div className="flex items-center gap-2 text-gray-600">

                <XCircle size={18} />

                <span className="text-sm font-medium">
                  Inactive
                </span>

              </div>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {vehicleStats.inactive}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

              <div className="flex items-center gap-2 text-purple-700">

                <Bus size={18} />

                <span className="text-sm font-medium">
                  Total
                </span>

              </div>

              <p className="text-2xl font-bold text-purple-800 mt-2">
                {vehicleStats.total}
              </p>

            </div>

          </div>


          {(vehicleStats.retired > 0 ||
            vehicleStats.sold > 0) && (

            <div className="grid grid-cols-2 gap-3 mt-4">

              <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">

                <p className="text-xs text-gray-500">
                  Retired
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {vehicleStats.retired}
                </p>

              </div>

              <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">

                <p className="text-xs text-gray-500">
                  Sold
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {vehicleStats.sold}
                </p>

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            DRIVER STATUS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={Users}
            title="Driver Overview"
            subtitle="Driver registration and verification"
            href="/transport/drivers"
          />


          <div className="grid grid-cols-2 gap-4">

            <div className="p-4 rounded-lg bg-green-50 border border-green-200">

              <div className="flex items-center gap-2 text-green-700">

                <CheckCircle size={18} />

                <span className="text-sm font-medium">
                  Active
                </span>

              </div>

              <p className="text-2xl font-bold text-green-800 mt-2">
                {driverStats.active}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">

              <div className="flex items-center gap-2 text-blue-700">

                <ShieldCheck size={18} />

                <span className="text-sm font-medium">
                  Verified
                </span>

              </div>

              <p className="text-2xl font-bold text-blue-800 mt-2">
                {driverStats.verified}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">

              <div className="flex items-center gap-2 text-amber-700">

                <AlertTriangle size={18} />

                <span className="text-sm font-medium">
                  Pending Verification
                </span>

              </div>

              <p className="text-2xl font-bold text-amber-800 mt-2">
                {driverStats.pending}
              </p>

            </div>


            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">

              <div className="flex items-center gap-2 text-gray-600">

                <Users size={18} />

                <span className="text-sm font-medium">
                  Registered
                </span>

              </div>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {driverStats.total}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          COMPLIANCE ALERTS
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <SectionHeader
          icon={CalendarClock}
          title="Compliance & Service Alerts"
          subtitle="Insurance, inspection, licensing and service dates requiring attention"
          href="/transport/vehicles"
          actionLabel="Manage Vehicles"
        />


        {complianceAlerts.length === 0 ? (

          <div className="p-6 rounded-lg bg-green-50 border border-green-200 text-center">

            <CheckCircle
              size={28}
              className="mx-auto text-green-600"
            />

            <p className="font-semibold text-green-800 mt-2">
              No immediate alerts
            </p>

            <p className="text-sm text-green-700 mt-1">
              No insurance, inspection, licensing or service dates are currently due or approaching.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {complianceAlerts.map(
              (alert, index) => {

                const vehicle =
                  typeof alert.vehicle === "object"
                    ? alert.vehicle
                    : null;

                const vehicleLabel =
                  vehicle
                    ? getVehicleName(vehicle)
                    : alert.vehicle ||
                      "Vehicle";

                const days =
                  getDaysUntil(
                    alert.date
                  );

                const expired =
                  days !== null &&
                  days < 0;

                return (
                  <div
                    key={`${alert.type}-${index}`}
                    className={`p-4 rounded-lg border ${
                      expired
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      {expired ? (
                        <XCircle
                          size={20}
                          className="text-red-600 mt-0.5"
                        />
                      ) : (
                        <AlertTriangle
                          size={20}
                          className="text-amber-600 mt-0.5"
                        />
                      )}

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                          <p className="font-semibold text-gray-800">
                            {alert.title}
                          </p>

                          <span
                            className={`text-xs font-semibold ${
                              expired
                                ? "text-red-700"
                                : "text-amber-700"
                            }`}
                          >
                            {expired
                              ? "Expired"
                              : `${days} day${
                                  days === 1
                                    ? ""
                                    : "s"
                                } remaining`}
                          </span>

                        </div>

                        <p className="text-sm text-gray-700 mt-1">
                          {vehicleLabel}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Date: {formatDate(
                            alert.date
                          )}
                        </p>

                      </div>

                    </div>

                  </div>
                );

              }
            )}

          </div>

        )}

      </div>


      {/* ====================================================
          RECENT FUELING + DRIVER REPORTS
      ==================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* ==================================================
            RECENT FUELING
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={Fuel}
            title="Recent Fueling"
            subtitle="Latest vehicle fueling records"
            href="/transport/expenses"
          />


          {recentFueling.length === 0 ? (

            <div className="p-6 rounded-lg bg-gray-100 text-center">

              <Fuel
                size={28}
                className="mx-auto text-gray-400"
              />

              <p className="text-sm text-gray-500 mt-2">
                No fueling records available.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {recentFueling.map(
                (record, index) => {

                  const vehicle =
                    typeof record.vehicle === "object"
                      ? record.vehicle
                      : null;

                  const date =
                    record.date ||
                    record.fueling_date ||
                    record.created_at;

                  const quantity =
                    record.quantity ??
                    record.fuel_quantity ??
                    record.litres ??
                    record.quantity_litres;

                  const cost =
                    record.total_cost ??
                    record.cost ??
                    record.amount ??
                    record.receipt?.total;

                  return (
                    <div
                      key={
                        getId(record) ||
                        `fueling-${index}`
                      }
                      className="p-4 rounded-lg border border-gray-200 bg-white"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-start gap-3">

                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Fuel size={18} />
                          </div>

                          <div>

                            <p className="font-semibold text-gray-800">
                              {vehicle
                                ? getVehicleName(
                                    vehicle
                                  )
                                : record.vehicle ||
                                  "Vehicle"}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(date)}
                            </p>

                          </div>

                        </div>


                        <p className="font-semibold text-gray-800">
                          {formatCurrency(cost)}
                        </p>

                      </div>


                      <div className="grid grid-cols-2 gap-3 mt-3">

                        <div className="text-xs text-gray-500">

                          Quantity

                          <span className="block font-medium text-gray-700 mt-0.5">

                            {quantity !== undefined &&
                            quantity !== null
                              ? `${formatNumber(
                                  quantity
                                )} L`
                              : "—"}

                          </span>

                        </div>


                        <div className="text-xs text-gray-500">

                          Fuel Type

                          <span className="block font-medium text-gray-700 mt-0.5">

                            {getStatusLabel(
                              record.fuel_type
                            )}

                          </span>

                        </div>

                      </div>

                    </div>
                  );

                }
              )}

            </div>

          )}

        </div>


        {/* ==================================================
            DRIVER REPORTS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <SectionHeader
            icon={Gauge}
            title="Recent Driver Reports"
            subtitle="Latest weekly mileage and fuel-use reports"
            href="/transport/reports"
          />


          {recentReports.length === 0 ? (

            <div className="p-6 rounded-lg bg-gray-100 text-center">

              <ClipboardList
                size={28}
                className="mx-auto text-gray-400"
              />

              <p className="text-sm text-gray-500 mt-2">
                No driver reports available.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {recentReports.map(
                (report, index) => {

                  const totalMileage =
                    report.total_mileage;

                  const fuelUsed =
                    report.fuel_used_quantity;

                  const reportDate =
                    report.submitted_at ||
                    report.week_start;

                  const reviewed =
                    report.reviewed === true;

                  return (
                    <div
                      key={
                        getId(report) ||
                        `report-${index}`
                      }
                      className="p-4 rounded-lg border border-gray-200 bg-white"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="font-semibold text-gray-800 truncate">
                            {getReportDriverLabel(
                              report
                            )}
                          </p>

                          <p className="text-sm text-gray-600 mt-1">
                            {getReportVehicleLabel(
                              report
                            )}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Week:{" "}
                            {formatDate(
                              report.week_start
                            )}
                            {" — "}
                            {formatDate(
                              report.week_end
                            )}
                          </p>

                        </div>


                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            reviewed
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >

                          {reviewed ? (
                            <CheckCircle size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}

                          {reviewed
                            ? "Reviewed"
                            : "Pending"}

                        </span>

                      </div>


                      <div className="grid grid-cols-2 gap-3 mt-3">

                        <div className="p-2.5 rounded-lg bg-gray-100">

                          <p className="text-xs text-gray-500">
                            Mileage
                          </p>

                          <p className="font-semibold text-gray-800 mt-0.5">

                            {totalMileage !== undefined &&
                            totalMileage !== null
                              ? `${formatNumber(
                                  totalMileage
                                )} km`
                              : "—"}

                          </p>

                        </div>


                        <div className="p-2.5 rounded-lg bg-gray-100">

                          <p className="text-xs text-gray-500">
                            Fuel Used
                          </p>

                          <p className="font-semibold text-gray-800 mt-0.5">

                            {fuelUsed !== undefined &&
                            fuelUsed !== null
                              ? `${formatNumber(
                                  fuelUsed
                                )} L`
                              : "—"}

                          </p>

                        </div>

                      </div>


                      {report.submitted_at && (
                        <p className="text-xs text-gray-500 mt-3">
                          Submitted:{" "}
                          {formatDateTime(
                            report.submitted_at
                          )}
                        </p>
                      )}

                    </div>
                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          WEEKLY OPERATIONS SUMMARY
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <SectionHeader
          icon={Gauge}
          title="Weekly Driver Report Overview"
          subtitle="Operational mileage and fuel usage recorded by drivers"
          href="/transport/reports"
        />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">

            <div className="flex items-center gap-2 text-cyan-700">

              <Gauge size={18} />

              <span className="text-sm font-medium">
                Total Mileage
              </span>

            </div>

            <p className="text-xl font-bold text-cyan-800 mt-2">
              {formatNumber(
                mileageSummary
              )} km
            </p>

          </div>


          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">

            <div className="flex items-center gap-2 text-amber-700">

              <Fuel size={18} />

              <span className="text-sm font-medium">
                Fuel Used
              </span>

            </div>

            <p className="text-xl font-bold text-amber-800 mt-2">
              {formatNumber(
                weeklyFuelUsed
              )} L
            </p>

          </div>


          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

            <div className="flex items-center gap-2 text-purple-700">

              <ClipboardList size={18} />

              <span className="text-sm font-medium">
                Reports Pending Review
              </span>

            </div>

            <p className="text-xl font-bold text-purple-800 mt-2">
              {driverReportStats.pending}
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          COST BREAKDOWN
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <SectionHeader
          icon={CircleDollarSign}
          title="Transport Cost Overview"
          subtitle="Recorded costs from transport-related financial records"
          href="/transport/expenses"
        />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">

            <div className="flex items-center gap-2 text-amber-700">

              <Fuel size={18} />

              <span className="text-sm font-medium">
                Fueling
              </span>

            </div>

            <p className="text-xl font-bold text-amber-800 mt-2">
              {formatCurrency(
                fuelingCost
              )}
            </p>

          </div>


          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">

            <div className="flex items-center gap-2 text-blue-700">

              <Wrench size={18} />

              <span className="text-sm font-medium">
                Maintenance
              </span>

            </div>

            <p className="text-xl font-bold text-blue-800 mt-2">
              {formatCurrency(
                maintenanceCost
              )}
            </p>

          </div>


          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

            <div className="flex items-center gap-2 text-purple-700">

              <ShieldCheck size={18} />

              <span className="text-sm font-medium">
                Insurance
              </span>

            </div>

            <p className="text-xl font-bold text-purple-800 mt-2">
              {formatCurrency(
                insuranceCost
              )}
            </p>

          </div>

        </div>


        <div className="mt-4 p-4 rounded-lg bg-gray-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <p className="text-sm text-gray-300">
              Total Recorded Transport Costs
            </p>

            <p className="text-2xl font-bold mt-1">
              {formatCurrency(
                totalTransportCost
              )}
            </p>

          </div>

          <Link
            to="/transport/expenses"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium"
          >
            View Expenses
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>


      {/* ====================================================
          QUICK ACTIONS
      ==================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

        <SectionHeader
          icon={ClipboardList}
          title="Quick Actions"
          subtitle="Common Transport Management tasks"
        />


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          <Link
            to="/transport/drivers/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >

            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users size={19} />
            </div>

            <div>

              <p className="font-semibold text-gray-800">
                Add Driver
              </p>

              <p className="text-xs text-gray-500">
                Register transport driver
              </p>

            </div>

          </Link>


          <Link
            to="/transport/vehicles/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >

            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bus size={19} />
            </div>

            <div>

              <p className="font-semibold text-gray-800">
                Add Vehicle
              </p>

              <p className="text-xs text-gray-500">
                Register school vehicle
              </p>

            </div>

          </Link>


          <Link
            to="/transport/routes/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >

            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <MapPin size={19} />
            </div>

            <div>

              <p className="font-semibold text-gray-800">
                Add Route
              </p>

              <p className="text-xs text-gray-500">
                Configure transport route
              </p>

            </div>

          </Link>


          <Link
            to="/transport/reports/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >

            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <ClipboardList size={19} />
            </div>

            <div>

              <p className="font-semibold text-gray-800">
                Driver Report
              </p>

              <p className="text-xs text-gray-500">
                Record weekly report
              </p>

            </div>

          </Link>

        </div>

      </div>

    </div>
  );
};


export default TransportDashboard;