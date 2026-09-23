import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Bus,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Edit,
  Eye,
  FileText,
  Fuel,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// HELPERS
// ==================================================

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

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return item;
  }

  return item.id ?? item.pk ?? null;
};


const getVehicleName = (vehicle) => {
  if (!vehicle) {
    return "Unknown Vehicle";
  }

  if (
    typeof vehicle === "string" ||
    typeof vehicle === "number"
  ) {
    return `Vehicle #${vehicle}`;
  }

  const registration =
    vehicle.registration_number ||
    vehicle.registration ||
    vehicle.number_plate;

  const vehicleNumber =
    vehicle.vehicle_number;

  const makeModel = [
    vehicle.make,
    vehicle.model,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    registration &&
    makeModel
  ) {
    return `${registration} — ${makeModel}`;
  }

  return (
    registration ||
    vehicleNumber ||
    makeModel ||
    "Unknown Vehicle"
  );
};


const getVehicleRegistration = (vehicle) => {
  if (!vehicle) {
    return "—";
  }

  if (
    typeof vehicle === "string" ||
    typeof vehicle === "number"
  ) {
    return `Vehicle #${vehicle}`;
  }

  return (
    vehicle.registration_number ||
    vehicle.registration ||
    vehicle.number_plate ||
    vehicle.vehicle_number ||
    "—"
  );
};


const getVehicleId = (record) => {
  if (!record) {
    return null;
  }

  return (
    getId(record.vehicle) ??
    record.vehicle_id ??
    null
  );
};


const getRecordDate = (record) => {
  return (
    record.date ||
    record.fueling_date ||
    record.maintenance_date ||
    record.insurance_date ||
    record.service_date ||
    record.created_at ||
    null
  );
};


const getAmount = (record) => {
  const value =
    record.total_cost ??
    record.cost ??
    record.amount ??
    record.total ??
    record.price ??
    0;

  const numeric =
    Number(value);

  return Number.isFinite(numeric)
    ? numeric
    : 0;
};


const formatCurrency = (value) => {
  const numeric =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "en-KE",
    {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }
  ).format(numeric);
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-KE",
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

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const getRecordStatus = (record) => {
  if (record?.status) {
    return record.status;
  }

  if (
    typeof record?.is_active ===
    "boolean"
  ) {
    return record.is_active
      ? "active"
      : "inactive";
  }

  return "recorded";
};


const getStatusClasses = (status) => {
  switch (status) {

    case "active":
      return "bg-green-100 text-green-700";

    case "inactive":
      return "bg-gray-100 text-gray-600";

    case "pending":
      return "bg-amber-100 text-amber-700";

    case "expired":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};


const formatStatus = (status) => {
  if (!status) {
    return "Recorded";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};


// ==================================================
// COMPONENT
// ==================================================

const VehicleExpensesPage = () => {
  const navigate = useNavigate();


  // ==================================================
  // DATA
  // ==================================================

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    fuelingRecords,
    setFuelingRecords,
  ] = useState([]);

  const [
    maintenanceRecords,
    setMaintenanceRecords,
  ] = useState([]);

  const [
    insuranceRecords,
    setInsuranceRecords,
  ] = useState([]);


  // ==================================================
  // FILTERS
  // ==================================================

  const [
    recordType,
    setRecordType,
  ] = useState("all");

  const [
    vehicleFilter,
    setVehicleFilter,
  ] = useState("all");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [
    dateTo,
    setDateTo,
  ] = useState("");


  // ==================================================
  // UI
  // ==================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");


      const [
        vehiclesResponse,
        fuelingResponse,
        maintenanceResponse,
        insuranceResponse,
      ] = await Promise.all([

        axiosInstance.get(
          "/transport/vehicles/"
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

      ]);


      setVehicles(
        extractList(
          vehiclesResponse
        )
      );

      setFuelingRecords(
        extractList(
          fuelingResponse
        )
      );

      setMaintenanceRecords(
        extractList(
          maintenanceResponse
        )
      );

      setInsuranceRecords(
        extractList(
          insuranceResponse
        )
      );

    } catch (err) {

      console.error(
        "Failed to load vehicle expenses:",
        err
      );

      setError(
        "Failed to load vehicle expense records."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadData();
  }, []);


  // ==================================================
  // COMBINE RECORDS
  // ==================================================

  const allRecords =
    useMemo(() => {

      const fueling =
        fuelingRecords.map(
          (record) => ({
            ...record,
            record_type: "fueling",
          })
        );

      const maintenance =
        maintenanceRecords.map(
          (record) => ({
            ...record,
            record_type: "maintenance",
          })
        );

      const insurance =
        insuranceRecords.map(
          (record) => ({
            ...record,
            record_type: "insurance",
          })
        );

      return [
        ...fueling,
        ...maintenance,
        ...insurance,
      ];

    }, [
      fuelingRecords,
      maintenanceRecords,
      insuranceRecords,
    ]);


  // ==================================================
  // FILTER RECORDS
  // ==================================================

  const filteredRecords =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return allRecords
        .filter(
          (record) => {

            // ------------------------------------------
            // TYPE
            // ------------------------------------------

            if (
              recordType !== "all" &&
              record.record_type !==
                recordType
            ) {
              return false;
            }


            // ------------------------------------------
            // VEHICLE
            // ------------------------------------------

            const vehicleId =
              getVehicleId(
                record
              );

            if (
              vehicleFilter !== "all" &&
              String(vehicleId) !==
                String(vehicleFilter)
            ) {
              return false;
            }


            // ------------------------------------------
            // SEARCH
            // ------------------------------------------

            if (search) {

              const vehicle =
                record.vehicle;

              const searchable = [

                getVehicleName(
                  vehicle
                ),

                getVehicleRegistration(
                  vehicle
                ),

                record.fuel_type,

                record.fuel_station,

                record.service_type,

                record.description,

                record.work_description,

                record.insurance_company,

                record.policy_number,

                record.invoice_number,

              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


              if (
                !searchable.includes(
                  search
                )
              ) {
                return false;
              }

            }


            // ------------------------------------------
            // DATE FROM
            // ------------------------------------------

            const recordDate =
              getRecordDate(
                record
              );

            if (
              dateFrom &&
              recordDate &&
              String(
                recordDate
              ).slice(0, 10) <
                dateFrom
            ) {
              return false;
            }


            // ------------------------------------------
            // DATE TO
            // ------------------------------------------

            if (
              dateTo &&
              recordDate &&
              String(
                recordDate
              ).slice(0, 10) >
                dateTo
            ) {
              return false;
            }


            return true;

          }
        )
        .sort(
          (a, b) => {

            const dateA =
              new Date(
                getRecordDate(a) || 0
              ).getTime();

            const dateB =
              new Date(
                getRecordDate(b) || 0
              ).getTime();

            return dateB - dateA;

          }
        );

    }, [
      allRecords,
      recordType,
      vehicleFilter,
      searchTerm,
      dateFrom,
      dateTo,
    ]);


  // ==================================================
  // STATISTICS
  // ==================================================

  const totalRecords =
    allRecords.length;

  const totalFueling =
    fuelingRecords.length;

  const totalMaintenance =
    maintenanceRecords.length;

  const totalInsurance =
    insuranceRecords.length;


  const totalFuelingCost =
    fuelingRecords.reduce(
      (sum, record) =>
        sum + getAmount(record),
      0
    );

  const totalMaintenanceCost =
    maintenanceRecords.reduce(
      (sum, record) =>
        sum + getAmount(record),
      0
    );

  const totalRecordedCost =
    totalFuelingCost +
    totalMaintenanceCost;


  // ==================================================
  // RECORD TYPE LABEL
  // ==================================================

  const getRecordTypeLabel =
    (type) => {

      switch (type) {

        case "fueling":
          return "Fueling";

        case "maintenance":
          return "Maintenance";

        case "insurance":
          return "Insurance";

        default:
          return "Record";

      }

    };


  // ==================================================
  // RECORD ICON
  // ==================================================

  const getRecordIcon =
    (type) => {

      switch (type) {

        case "fueling":
          return (
            <Fuel size={18} />
          );

        case "maintenance":
          return (
            <Wrench size={18} />
          );

        case "insurance":
          return (
            <ShieldCheck size={18} />
          );

        default:
          return (
            <FileText size={18} />
          );

      }

    };


  // ==================================================
  // RECORD ICON CLASSES
  // ==================================================

  const getRecordIconClasses =
    (type) => {

      switch (type) {

        case "fueling":
          return "bg-amber-100 text-amber-700";

        case "maintenance":
          return "bg-blue-100 text-blue-700";

        case "insurance":
          return "bg-green-100 text-green-700";

        default:
          return "bg-gray-100 text-gray-700";

      }

    };


  // ==================================================
  // RECORD LINK
  // ==================================================

  const getRecordLink =
    (record) => {

      const id =
        getId(record);

      if (!id) {
        return null;
      }

      switch (
        record.record_type
      ) {

        case "fueling":
          return `/transport/expenses/fueling/${id}`;

        case "maintenance":
          return `/transport/expenses/maintenance/${id}`;

        case "insurance":
          return `/transport/expenses/insurance/${id}`;

        default:
          return null;

      }

    };


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Vehicle Expenses
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <CircleDollarSign
                size={25}
              />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Vehicle Expenses
              </h1>

              <p className="text-gray-600 mt-1">
                Track fueling, maintenance and insurance records for school vehicles.
              </p>

            </div>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
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

      </div>


      {/* ==================================================
          QUICK NAVIGATION
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 overflow-x-auto">

        <div className="flex items-center gap-2 min-w-max">

          <Link
            to="/transport"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Dashboard
          </Link>

          <Link
            to="/transport/drivers"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Drivers
          </Link>

          <Link
            to="/transport/vehicles"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Vehicles
          </Link>

          <Link
            to="/transport/routes"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Routes & Stages
          </Link>

          <Link
            to="/transport/assignments"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Student Assignments
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Vehicle Expenses
          </span>

          <Link
            to="/transport/reports"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Driver Reports
          </Link>

        </div>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={19}
            className="mt-0.5 flex-shrink-0"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <Link
          to="/transport/expenses/fueling/new"
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-800">
                Record Fueling
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Record fuel purchase and mileage.
              </p>

            </div>

            <div className="p-3 rounded-lg bg-amber-100 text-amber-700">

              <Fuel size={21} />

            </div>

          </div>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700">

            Add Fueling Record

            <Plus size={15} />

          </div>

        </Link>


        <Link
          to="/transport/expenses/maintenance/new"
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-800">
                Record Maintenance
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Record vehicle servicing and repairs.
              </p>

            </div>

            <div className="p-3 rounded-lg bg-blue-100 text-blue-700">

              <Wrench size={21} />

            </div>

          </div>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700">

            Add Maintenance Record

            <Plus size={15} />

          </div>

        </Link>


        <Link
          to="/transport/expenses/insurance/new"
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-800">
                Record Insurance
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Record vehicle insurance details.
              </p>

            </div>

            <div className="p-3 rounded-lg bg-green-100 text-green-700">

              <ShieldCheck size={21} />

            </div>

          </div>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700">

            Add Insurance Record

            <Plus size={15} />

          </div>

        </Link>

      </div>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <p className="text-sm font-medium text-gray-500">
            Total Records
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-1">
            {totalRecords}
          </p>

        </div>


        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Fueling
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalFueling}
              </p>

            </div>

            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Fuel size={20} />
            </div>

          </div>

        </div>


        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Maintenance
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalMaintenance}
              </p>

            </div>

            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <Wrench size={20} />
            </div>

          </div>

        </div>


        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Insurance
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalInsurance}
              </p>

            </div>

            <div className="p-2.5 rounded-lg bg-green-100 text-green-700">
              <ShieldCheck size={20} />
            </div>

          </div>

        </div>


        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <p className="text-sm font-medium text-gray-500">
            Recorded Fuel + Maintenance
          </p>

          <p className="text-xl font-bold text-gray-800 mt-2">
            {formatCurrency(
              totalRecordedCost
            )}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Insurance costs excluded where not available.
          </p>

        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* Search */}

          <div className="lg:col-span-2">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search
            </label>

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search vehicle, registration, service or insurer..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>


          {/* Type */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Record Type
            </label>

            <select
              value={recordType}
              onChange={(event) =>
                setRecordType(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All Records
              </option>

              <option value="fueling">
                Fueling
              </option>

              <option value="maintenance">
                Maintenance
              </option>

              <option value="insurance">
                Insurance
              </option>

            </select>

          </div>


          {/* Vehicle */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vehicle
            </label>

            <select
              value={vehicleFilter}
              onChange={(event) =>
                setVehicleFilter(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >

              <option value="all">
                All Vehicles
              </option>

              {vehicles.map(
                (vehicle) => (

                  <option
                    key={getId(vehicle)}
                    value={getId(vehicle)}
                  >

                    {getVehicleRegistration(
                      vehicle
                    )}

                  </option>

                )
              )}

            </select>

          </div>


          {/* Date From */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date From
            </label>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">

          <div className="lg:col-start-5">

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date To
            </label>

            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

        </div>


        {(searchTerm ||
          recordType !== "all" ||
          vehicleFilter !== "all" ||
          dateFrom ||
          dateTo) && (

          <div className="mt-4">

            <button
              type="button"
              onClick={() => {

                setSearchTerm("");
                setRecordType("all");
                setVehicleFilter("all");
                setDateFrom("");
                setDateTo("");

              }}
              className="text-sm font-medium text-purple-700 hover:text-purple-900"
            >

              Clear Filters

            </button>

          </div>

        )}

      </div>


      {/* ==================================================
          RECORD TABLE
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-gray-800 text-lg">
                Expense & Compliance Records
              </h2>

              <p className="text-sm text-gray-500 mt-1">

                Showing{" "}
                {filteredRecords.length}
                {" "}of{" "}
                {allRecords.length}
                {" "}records

              </p>

            </div>

          </div>

        </div>


        {loading ? (

          <div className="p-12 text-center">

            <RefreshCw
              size={28}
              className="mx-auto text-purple-700 animate-spin mb-3"
            />

            <p className="text-gray-600">
              Loading vehicle records...
            </p>

          </div>

        ) : filteredRecords.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">

              <FileText size={28} />

            </div>

            <h3 className="font-semibold text-gray-800 text-lg">
              No records found
            </h3>

            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
              No vehicle expense or compliance records match
              the current filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Vehicle
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Description
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {filteredRecords.map(
                  (record) => {

                    const id =
                      getId(record);

                    const vehicle =
                      record.vehicle;

                    const type =
                      record.record_type;

                    const recordLink =
                      getRecordLink(
                        record
                      );


                    let description =
                      "Vehicle record";


                    if (
                      type === "fueling"
                    ) {

                      description =
                        record.fuel_type ||
                        record.fuel_station ||
                        record.description ||
                        "Fuel purchase";

                    } else if (
                      type === "maintenance"
                    ) {

                      description =
                        record.service_type ||
                        record.description ||
                        record.work_description ||
                        "Maintenance";

                    } else if (
                      type === "insurance"
                    ) {

                      description =
                        record.insurance_company ||
                        record.policy_number ||
                        record.description ||
                        "Insurance";

                    }


                    const status =
                      getRecordStatus(
                        record
                      );


                    return (

                      <tr
                        key={`${type}-${id}`}
                        className="hover:bg-gray-100"
                      >

                        {/* Type */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className={`p-2 rounded-lg ${getRecordIconClasses(
                                type
                              )}`}
                            >

                              {getRecordIcon(
                                type
                              )}

                            </div>

                            <span className="font-medium text-gray-800">

                              {getRecordTypeLabel(
                                type
                              )}

                            </span>

                          </div>

                        </td>


                        {/* Vehicle */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-medium text-gray-800">
                              {getVehicleName(
                                vehicle
                              )}
                            </p>

                            {vehicle?.vehicle_number && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Vehicle No:{" "}
                                {vehicle.vehicle_number}
                              </p>
                            )}

                          </div>

                        </td>


                        {/* Date */}

                        <td className="px-5 py-4 text-sm text-gray-700">

                          <div className="flex items-center gap-2">

                            <CalendarDays
                              size={15}
                              className="text-gray-400"
                            />

                            {formatDate(
                              getRecordDate(
                                record
                              )
                            )}

                          </div>

                        </td>


                        {/* Description */}

                        <td className="px-5 py-4">

                          <p className="text-sm text-gray-700 max-w-xs truncate">
                            {description}
                          </p>

                        </td>


                        {/* Amount */}

                        <td className="px-5 py-4 text-right">

                          {type === "insurance" &&
                          getAmount(record) === 0 ? (

                            <span className="text-sm text-gray-500">
                              —
                            </span>

                          ) : (

                            <span className="font-medium text-gray-800">
                              {formatCurrency(
                                getAmount(
                                  record
                                )
                              )}
                            </span>

                          )}

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >

                            {formatStatus(
                              status
                            )}

                          </span>

                        </td>


                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            {recordLink && (

                              <Link
                                to={recordLink}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                              >

                                <Eye size={15} />

                                View

                              </Link>

                            )}


                            {recordLink && (

                              <Link
                                to={`${recordLink}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm"
                              >

                                <Edit size={15} />

                                Edit

                              </Link>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ==================================================
          COMPLIANCE NOTICE
      ================================================== */}

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">

        <div className="flex items-start gap-3">

          <AlertTriangle
            size={20}
            className="text-amber-700 mt-0.5 flex-shrink-0"
          />

          <div>

            <h3 className="font-semibold text-amber-800">
              Vehicle records are historical
            </h3>

            <p className="text-sm text-amber-700 mt-1">
              Fueling, maintenance and insurance entries should
              be recorded as separate historical records. Updating
              a vehicle should not erase its previous service,
              fueling or insurance history.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
};


export default VehicleExpensesPage;

