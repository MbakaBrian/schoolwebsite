import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const InventoryDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/inventory/dashboard/");

      setDashboard(response.data);
    } catch (err) {
      console.error("Failed to fetch inventory dashboard:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load inventory dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-300"></div>
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
              ></div>
            ))}
          </div>

          <div className="mt-6 h-40 animate-pulse rounded-xl bg-white shadow-sm"></div>

          <div className="mt-6 h-40 animate-pulse rounded-xl bg-white shadow-sm"></div>

          <div className="mt-6 h-80 animate-pulse rounded-xl bg-white shadow-sm"></div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-black">
                  Unable to load inventory dashboard
                </h2>

                <p className="mt-1 text-sm text-gray-600">{error}</p>

                <button
                  onClick={fetchDashboard}
                  className="mt-4 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD DATA
  // --------------------------------------------------

  const totalStores = dashboard?.total_stores ?? 0;

  const totalInventoryLocations =
    dashboard?.total_inventory_locations ?? 0;

  const totalItems = dashboard?.total_items ?? 0;

  const totalStockRecords = dashboard?.total_stock_records ?? 0;

  const todayTransactions = dashboard?.today_transactions ?? 0;

  const recentTransactions = dashboard?.recent_transactions ?? [];

  // --------------------------------------------------
  // TRANSACTION TYPE STYLE
  // --------------------------------------------------

  const getTransactionTypeStyle = (type) => {
    switch (type) {
      case "addition":
        return "bg-green-100 text-green-700";

      case "removal":
        return "bg-red-100 text-red-700";

      case "transfer":
        return "bg-blue-100 text-blue-700";

      case "adjustment":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // --------------------------------------------------
  // TRANSACTION TYPE LABEL
  // --------------------------------------------------

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "addition":
        return "Addition";

      case "removal":
        return "Removal";

      case "transfer":
        return "Transfer";

      case "adjustment":
        return "Adjustment";

      default:
        return type || "Unknown";
    }
  };

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // --------------------------------------------------
  // DEPARTMENT NAME
  // --------------------------------------------------

  const getDepartmentName = (transaction) => {
    return (
      transaction?.department_display ||
      transaction?.department?.name ||
      transaction?.department ||
      "-"
    );
  };

  // --------------------------------------------------
  // SUBDEPARTMENT NAME
  // --------------------------------------------------

  const getSubDepartmentName = (transaction) => {
    return (
      transaction?.subdepartment_display ||
      transaction?.subdepartment?.name ||
      transaction?.subdepartment ||
      ""
    );
  };

  // --------------------------------------------------
  // ITEM UNIT
  // --------------------------------------------------

  const getUnitName = (transaction) => {
    return (
      transaction?.item_unit_display ||
      transaction?.unit_display ||
      transaction?.item_unit ||
      transaction?.unit ||
      ""
    );
  };

  // --------------------------------------------------
  // STAT CARD
  // --------------------------------------------------

  const StatCard = ({
    title,
    value,
    description,
    icon,
    iconBackground = "bg-purple-100",
    iconColor = "text-purple-700",
  }) => {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-black">
              {value}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black md:text-3xl">
              Inventory Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Monitor stores, inventory locations, stock and recent
              inventory activity.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.418 15H15"
              />
            </svg>

            Refresh
          </button>
        </div>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Stores"
            value={totalStores}
            description="Active physical stores"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M5 10v10h14V10M4 10l8-7 8 7M9 20v-6h6v6"
                />
              </svg>
            }
          />

          <StatCard
            title="Inventory Locations"
            value={totalInventoryLocations}
            description="Rooms and assigned areas"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            iconBackground="bg-gray-200"
            iconColor="text-gray-700"
          />

          <StatCard
            title="Inventory Items"
            value={totalItems}
            description="Registered inventory items"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10"
                />
              </svg>
            }
            iconBackground="bg-purple-100"
            iconColor="text-purple-700"
          />

          <StatCard
            title="Today's Transactions"
            value={todayTransactions}
            description="Inventory activity today"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconBackground="bg-gray-200"
            iconColor="text-black"
          />
        </div>

        {/* ==================================================
            INVENTORY MANAGEMENT
        ================================================== */}

        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">
              Inventory Management
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your stores, locations, inventory items and
              current stock.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* STORES */}

            <Link
              to="/inventory/stores"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M5 10v10h14V10M4 10l8-7 8 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black group-hover:text-purple-700">
                    Stores
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Create and manage stores
                  </p>
                </div>
              </div>
            </Link>

            {/* LOCATIONS */}

            <Link
              to="/inventory/locations"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black group-hover:text-purple-700">
                    Locations
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Manage rooms and areas
                  </p>
                </div>
              </div>
            </Link>

            {/* ITEMS */}

            <Link
              to="/inventory/items"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black group-hover:text-purple-700">
                    Items
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Create and manage items
                  </p>
                </div>
              </div>
            </Link>

            {/* STOCK */}

            <Link
              to="/inventory/stock"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h18M5 7v13h14V7M7 7V4h10v3"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black group-hover:text-purple-700">
                    Stock
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    View current stock
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ==================================================
            STOCK OVERVIEW
        ================================================== */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Stock Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current stock records across your inventory locations.
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 px-4 py-2">
              <span className="text-sm text-gray-600">
                Stock Records:{" "}
              </span>

              <span className="font-semibold text-purple-700">
                {totalStockRecords}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================
            STOCK OPERATIONS
        ================================================== */}

        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">
              Stock Operations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Record and manage stock movements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* ADD STOCK */}

            <Link
              to="/inventory/stock/add"
              className="group rounded-xl bg-purple-700 p-5 text-white shadow-sm transition hover:bg-purple-800 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Add Stock</h3>

                  <p className="mt-1 text-sm text-purple-100">
                    Record new inventory received
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </Link>

            {/* REMOVE STOCK */}

            <Link
              to="/inventory/stock/remove"
              className="group rounded-xl border border-red-200 bg-white p-5 shadow-sm transition hover:border-red-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-black group-hover:text-red-700">
                    Remove Stock
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Record stock issued or used
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 12H4"
                  />
                </svg>
              </div>
            </Link>

            {/* TRANSFER STOCK */}

            <Link
              to="/inventory/stock/transfer"
              className="group rounded-xl border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-black group-hover:text-blue-700">
                    Transfer Stock
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Move stock between locations
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h11l-3-3m3 3l-3 3M17 17H6l3 3m-3-3l3-3"
                  />
                </svg>
              </div>
            </Link>

            {/* ADJUST STOCK */}

            <Link
              to="/inventory/stock/adjust"
              className="group rounded-xl border border-purple-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-black group-hover:text-purple-700">
                    Adjust Stock
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Correct stock after physical counting
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* ==================================================
            TRANSACTION HISTORY
        ================================================== */}

        <div className="mt-6">
          <Link
            to="/inventory/transactions"
            className="group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5a3 3 0 016 0"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13h6M9 17h4"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-semibold text-black group-hover:text-purple-700">
                  Inventory Transactions
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View the complete audit trail of inventory activity.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition group-hover:bg-purple-100 group-hover:text-purple-700">
              View Transactions →
            </span>
          </Link>
        </div>

        {/* ==================================================
            RECENT ACTIVITY
        ================================================== */}

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Recent Inventory Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The latest inventory transactions recorded in the system.
                </p>
              </div>

              <Link
                to="/inventory/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-purple-100 hover:text-purple-700"
              >
                View All
              </Link>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 016 0M9 13h6M9 17h4"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-black">
                No inventory activity yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Inventory transactions will appear here once stock
                activity begins.
              </p>

              <Link
                to="/inventory/stock/add"
                className="mt-5 inline-flex items-center rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800"
              >
                Add First Stock
              </Link>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------
                  DESKTOP TABLE
              --------------------------------------------- */}

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Transaction
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Item
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Department
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Subdepartment
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        User
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {recentTransactions.map((transaction) => {
                      const departmentName =
                        getDepartmentName(transaction);

                      const subdepartmentName =
                        getSubDepartmentName(transaction);

                      const unitName =
                        getUnitName(transaction);

                      return (
                        <tr
                          key={
                            transaction.id ||
                            transaction.transaction_id
                          }
                          className="transition hover:bg-gray-50"
                        >
                          {/* TRANSACTION */}

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-black">
                            {transaction.transaction_id || "-"}
                          </td>

                          {/* ITEM */}

                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-black">
                              {transaction.item_name || "-"}
                            </div>

                            {unitName && (
                              <div className="text-xs text-gray-500">
                                Unit: {unitName}
                              </div>
                            )}
                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-gray-800">
                              {departmentName}
                            </div>
                          </td>

                          {/* SUBDEPARTMENT */}

                          <td className="px-5 py-4">
                            {subdepartmentName ? (
                              <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                {subdepartmentName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* TYPE */}

                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTransactionTypeStyle(
                                transaction.transaction_type
                              )}`}
                            >
                              {getTransactionTypeLabel(
                                transaction.transaction_type
                              )}
                            </span>
                          </td>

                          {/* QUANTITY */}

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-black">
                            {transaction.quantity ?? "-"}
                          </td>

                          {/* USER */}

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                            {transaction.created_by_name || "-"}
                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ---------------------------------------------
                  MOBILE CARDS
              --------------------------------------------- */}

              <div className="divide-y divide-gray-200 md:hidden">
                {recentTransactions.map((transaction) => {
                  const departmentName =
                    getDepartmentName(transaction);

                  const subdepartmentName =
                    getSubDepartmentName(transaction);

                  const unitName =
                    getUnitName(transaction);

                  return (
                    <div
                      key={
                        transaction.id ||
                        transaction.transaction_id
                      }
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {transaction.item_name || "-"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {transaction.transaction_id || "-"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getTransactionTypeStyle(
                            transaction.transaction_type
                          )}`}
                        >
                          {getTransactionTypeLabel(
                            transaction.transaction_type
                          )}
                        </span>
                      </div>

                      {/* DEPARTMENT INFORMATION */}

                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Department
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-800">
                              {departmentName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Subdepartment
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-800">
                              {subdepartmentName || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* TRANSACTION DETAILS */}

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-black">
                            {transaction.quantity ?? "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Unit
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {unitName || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Recorded By
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {transaction.created_by_name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;