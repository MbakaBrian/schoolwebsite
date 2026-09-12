import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const TRANSACTIONS_URL = "/inventory/transactions/";
const ITEMS_URL = "/inventory/items/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const DEPARTMENTS_URL = "/receipts/departments/";

const TRANSACTION_TYPES = [
  { value: "all", label: "All Transactions" },
  { value: "addition", label: "Addition" },
  { value: "removal", label: "Removal" },
  { value: "transfer", label: "Transfer" },
  { value: "adjustment", label: "Adjustment" },
];

const getResults = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(number);
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --------------------------------------------------
// DEPARTMENT DISPLAY HELPERS
// --------------------------------------------------
const getDepartmentName = (item) => {
  return (
    item?.department_display ||
    item?.department?.name ||
    item?.department ||
    ""
  );
};

const getSubDepartmentName = (item) => {
  return (
    item?.subdepartment_display ||
    item?.subdepartment?.name ||
    item?.subdepartment ||
    ""
  );
};

const getTransactionTypeLabel = (transaction) => {
  if (transaction.transaction_type_display) {
    return transaction.transaction_type_display;
  }

  const type = String(transaction.transaction_type || "").toLowerCase();

  const found = TRANSACTION_TYPES.find((item) => item.value === type);

  return found?.label || transaction.transaction_type || "Transaction";
};

const getTransactionTypeClass = (transaction) => {
  const type = String(transaction.transaction_type || "").toLowerCase();

  if (type === "addition") {
    return "bg-green-100 text-green-700";
  }

  if (type === "removal") {
    return "bg-red-100 text-red-700";
  }

  if (type === "transfer") {
    return "bg-blue-100 text-blue-700";
  }

  if (type === "adjustment") {
    return "bg-purple-100 text-purple-700";
  }

  return "bg-gray-100 text-gray-700";
};

const getTransactionIcon = (transaction) => {
  const type = String(transaction.transaction_type || "").toLowerCase();

  if (type === "addition") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 5v14m-7-7h14"
        />
      </svg>
    );
  }

  if (type === "removal") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14"
        />
      </svg>
    );
  }

  if (type === "transfer") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h11l-3-3m3 3l-3 3M17 17H6l3 3m-3-3l3-3"
        />
      </svg>
    );
  }

  if (type === "adjustment") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m6-6H6"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

const InventoryTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);

  // --------------------------------------------------
  // DEPARTMENTS
  // --------------------------------------------------
  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);
  const [subdepartmentLoading, setSubdepartmentLoading] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [transactionType, setTransactionType] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [subdepartmentFilter, setSubdepartmentFilter] =
    useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --------------------------------------------------
  // FETCH FILTER DATA
  // --------------------------------------------------
  const fetchFilterData = async () => {
    try {
      const [
        itemsResponse,
        storesResponse,
        locationsResponse,
        departmentsResponse,
      ] = await Promise.all([
        axiosInstance.get(ITEMS_URL, {
          params: { is_active: true },
        }),
        axiosInstance.get(STORES_URL, {
          params: { is_active: true },
        }),
        axiosInstance.get(LOCATIONS_URL, {
          params: { is_active: true },
        }),
        axiosInstance.get(DEPARTMENTS_URL, {
          params: { is_active: true },
        }),
      ]);

      setItems(getResults(itemsResponse.data));
      setStores(getResults(storesResponse.data));
      setLocations(getResults(locationsResponse.data));
      setDepartments(getResults(departmentsResponse.data));
    } catch (err) {
      console.error("Failed to load inventory filters:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load inventory filter data."
      );
    }
  };

  // --------------------------------------------------
  // FETCH SUBDEPARTMENTS
  // --------------------------------------------------
  const fetchSubdepartments = async (departmentId) => {
    if (!departmentId || departmentId === "all") {
      setSubdepartments([]);
      return;
    }

    try {
      setSubdepartmentLoading(true);

      const response = await axiosInstance.get(
        `${DEPARTMENTS_URL}${departmentId}/subdepartments/`,
        {
          params: {
            is_active: true,
          },
        }
      );

      setSubdepartments(getResults(response.data));
    } catch (err) {
      console.error("Failed to load subdepartments:", err);

      setSubdepartments([]);

      setError(
        err?.response?.data?.detail ||
          "Failed to load subdepartments."
      );
    } finally {
      setSubdepartmentLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH TRANSACTIONS
  // --------------------------------------------------
  const fetchTransactions = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }

      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (transactionType !== "all") {
        params.transaction_type = transactionType;
      }

      if (itemFilter !== "all") {
        params.item = itemFilter;
      }

      if (departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      if (subdepartmentFilter !== "all") {
        params.subdepartment = subdepartmentFilter;
      }

      if (userFilter !== "all") {
        params.user = userFilter;
      }

      if (sourceFilter !== "all") {
        params.source = sourceFilter;
      }

      if (destinationFilter !== "all") {
        params.destination = destinationFilter;
      }

      if (dateFrom) {
        params.date_from = dateFrom;
      }

      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await axiosInstance.get(TRANSACTIONS_URL, {
        params,
      });

      setTransactions(getResults(response.data));
    } catch (err) {
      console.error("Failed to load inventory transactions:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load inventory transactions."
      );
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------
  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);

      await Promise.all([
        fetchFilterData(),
        fetchTransactions(true),
      ]);
    };

    loadPage();
  }, []);

  // --------------------------------------------------
  // FILTER CHANGE
  // --------------------------------------------------
  useEffect(() => {
    if (loading) return;

    fetchTransactions(false);
  }, [
    transactionType,
    itemFilter,
    departmentFilter,
    subdepartmentFilter,
    userFilter,
    sourceFilter,
    destinationFilter,
    dateFrom,
    dateTo,
  ]);

  // --------------------------------------------------
  // DEPARTMENT CHANGE
  // --------------------------------------------------
  useEffect(() => {
    setSubdepartmentFilter("all");

    if (departmentFilter === "all") {
      setSubdepartments([]);
      return;
    }

    fetchSubdepartments(departmentFilter);
  }, [departmentFilter]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    fetchTransactions(false);
  };

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------
  const handleClearFilters = () => {
    setSearch("");
    setTransactionType("all");
    setItemFilter("all");
    setDepartmentFilter("all");
    setSubdepartmentFilter("all");
    setUserFilter("all");
    setSourceFilter("all");
    setDestinationFilter("all");
    setDateFrom("");
    setDateTo("");

    setSubdepartments([]);

    setTimeout(() => {
      fetchTransactions(false);
    }, 0);
  };

  // --------------------------------------------------
  // UNIQUE USERS
  // --------------------------------------------------
  const users = useMemo(() => {
    const map = new Map();

    transactions.forEach((transaction) => {
      const userId = transaction.created_by;

      const userName =
        transaction.created_by_name ||
        transaction.created_by_username ||
        "Unknown User";

      if (userId !== undefined && userId !== null) {
        map.set(String(userId), {
          id: userId,
          name: userName,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [transactions]);

  // --------------------------------------------------
  // LOCATION FILTER OPTIONS
  // --------------------------------------------------
  const locationOptions = useMemo(() => {
    const storeOptions = stores.map((store) => ({
      value: `store:${store.id}`,
      label: `Store: ${store.name}`,
    }));

    const locationOptions = locations.map((location) => ({
      value: `location:${location.id}`,
      label: `Room / Area: ${location.name}`,
    }));

    return [...storeOptions, ...locationOptions];
  }, [stores, locations]);

  // --------------------------------------------------
  // ITEM FILTER OPTIONS
  // --------------------------------------------------
  const itemOptions = useMemo(() => {
    return [...items].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [items]);

  // --------------------------------------------------
  // TRANSACTION SUMMARY
  // --------------------------------------------------
  const summary = useMemo(() => {
    let additions = 0;
    let removals = 0;
    let transfers = 0;
    let adjustments = 0;

    transactions.forEach((transaction) => {
      const type = String(
        transaction.transaction_type || ""
      ).toLowerCase();

      if (type === "addition") additions += 1;
      if (type === "removal") removals += 1;
      if (type === "transfer") transfers += 1;
      if (type === "adjustment") adjustments += 1;
    });

    return {
      total: transactions.length,
      additions,
      removals,
      transfers,
      adjustments,
    };
  }, [transactions]);

  // --------------------------------------------------
  // SOURCE / DESTINATION DISPLAY
  // --------------------------------------------------
  const getSource = (transaction) => {
    return (
      transaction.source_location_name ||
      transaction.source_store_name ||
      transaction.source_inventory_location_name ||
      "-"
    );
  };

  const getDestination = (transaction) => {
    return (
      transaction.destination_location_name ||
      transaction.destination_store_name ||
      transaction.destination_inventory_location_name ||
      "-"
    );
  };

  // --------------------------------------------------
  // ADJUSTMENT DISPLAY
  // --------------------------------------------------
  const getQuantityDisplay = (transaction) => {
    const type = String(
      transaction.transaction_type || ""
    ).toLowerCase();

    const quantity = formatNumber(transaction.quantity);

    if (type === "addition") {
      return {
        text: `+${quantity}`,
        className: "text-green-600",
      };
    }

    if (type === "removal") {
      return {
        text: `-${quantity}`,
        className: "text-red-600",
      };
    }

    if (type === "adjustment") {
      const adjustedQuantity = Number(transaction.adjusted_quantity);

      const previousQuantity =
        Number(transaction.source_previous_quantity ?? 0);

      const difference = adjustedQuantity - previousQuantity;

      if (difference > 0) {
        return {
          text: `+${formatNumber(difference)}`,
          className: "text-green-600",
        };
      }

      if (difference < 0) {
        return {
          text: formatNumber(difference),
          className: "text-red-600",
        };
      }

      return {
        text: "0",
        className: "text-gray-500",
      };
    }

    return {
      text: quantity,
      className: "text-blue-600",
    };
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

            <p className="mt-4 text-sm text-gray-600">
              Loading inventory transactions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                to="/inventory/stock"
                className="transition hover:text-purple-600"
              >
                Inventory Stock
              </Link>

              <span>/</span>

              <span className="text-gray-800">
                Transaction History
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Inventory Transactions
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Complete audit trail of inventory additions, removals,
              transfers and adjustments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/inventory/stock"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Stock Overview
            </Link>

            <Link
              to="/inventory/stock/add"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Add Stock
            </Link>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
              />
            </svg>

            <p>{error}</p>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              Additions
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {summary.additions}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-red-600">
              Removals
            </p>

            <p className="mt-1 text-2xl font-bold text-red-700">
              {summary.removals}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Transfers
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {summary.transfers}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-purple-200 bg-purple-50 p-4 lg:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
              Adjustments
            </p>

            <p className="mt-1 text-2xl font-bold text-purple-700">
              {summary.adjustments}
            </p>
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Transactions
              </h2>

              <p className="text-sm text-gray-500">
                Narrow the audit history using the available filters.
              </p>
            </div>

            {filterLoading && (
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                Updating...
              </div>
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mb-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transaction ID, item, reason or notes..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <button
              type="submit"
              disabled={filterLoading}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Search
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* TRANSACTION TYPE */}
            <div>
              <label
                htmlFor="transactionType"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Transaction Type
              </label>

              <select
                id="transactionType"
                value={transactionType}
                onChange={(event) =>
                  setTransactionType(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ITEM */}
            <div>
              <label
                htmlFor="itemFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Item
              </label>

              <select
                id="itemFilter"
                value={itemFilter}
                onChange={(event) =>
                  setItemFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Items</option>

                {itemOptions.map((item) => {
                  const departmentName = getDepartmentName(item);
                  const subdepartmentName =
                    getSubDepartmentName(item);

                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {departmentName
                        ? ` — ${departmentName}`
                        : ""}
                      {subdepartmentName
                        ? ` — ${subdepartmentName}`
                        : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* DEPARTMENT */}
            <div>
              <label
                htmlFor="departmentFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Department
              </label>

              <select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Departments</option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBDEPARTMENT */}
            <div>
              <label
                htmlFor="subdepartmentFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Subdepartment
              </label>

              <select
                id="subdepartmentFilter"
                value={subdepartmentFilter}
                disabled={
                  departmentFilter === "all" ||
                  subdepartmentLoading
                }
                onChange={(event) =>
                  setSubdepartmentFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">
                  {subdepartmentLoading
                    ? "Loading..."
                    : departmentFilter === "all"
                    ? "Select Department First"
                    : subdepartments.length === 0
                    ? "No Subdepartments"
                    : "All Subdepartments"}
                </option>

                {subdepartments.map((subdepartment) => (
                  <option
                    key={subdepartment.id}
                    value={subdepartment.id}
                  >
                    {subdepartment.name}
                  </option>
                ))}
              </select>
            </div>

            {/* USER */}
            <div>
              <label
                htmlFor="userFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Recorded By
              </label>

              <select
                id="userFilter"
                value={userFilter}
                onChange={(event) =>
                  setUserFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Users</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SOURCE */}
            <div>
              <label
                htmlFor="sourceFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Source
              </label>

              <select
                id="sourceFilter"
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Sources</option>

                {locationOptions.map((option) => (
                  <option
                    key={`source-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINATION */}
            <div>
              <label
                htmlFor="destinationFilter"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Destination
              </label>

              <select
                id="destinationFilter"
                value={destinationFilter}
                onChange={(event) =>
                  setDestinationFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Destinations</option>

                {locationOptions.map((option) => (
                  <option
                    key={`destination-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE FROM */}
            <div>
              <label
                htmlFor="dateFrom"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Date From
              </label>

              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* DATE TO */}
            <div>
              <label
                htmlFor="dateTo"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Date To
              </label>

              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ==================================================
            TRANSACTIONS
        ================================================== */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>

              <p className="text-sm text-gray-500">
                {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 016 0M9 5h6m-6 6h6m-6 4h4"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No transactions found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Try changing your filters or search criteria. Inventory
                movements will appear here once transactions are recorded.
              </p>
            </div>
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Transaction
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Type
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Item
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Department
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantity
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        From
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        To
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Recorded By
                      </th>

                      <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {transactions.map((transaction) => {
                      const quantityDisplay =
                        getQuantityDisplay(transaction);

                      const departmentName =
                        getDepartmentName(transaction);

                      const subdepartmentName =
                        getSubDepartmentName(transaction);

                      return (
                        <tr
                          key={
                            transaction.id ||
                            transaction.transaction_id
                          }
                          className="transition hover:bg-gray-50"
                        >
                          {/* TRANSACTION ID */}
                          <td className="px-5 py-4">
                            <p className="font-mono text-sm font-semibold text-gray-900">
                              {transaction.transaction_id || "-"}
                            </p>

                            {transaction.reason && (
                              <p
                                className="mt-1 max-w-[180px] truncate text-xs text-gray-500"
                                title={transaction.reason}
                              >
                                {transaction.reason}
                              </p>
                            )}
                          </td>

                          {/* TYPE */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getTransactionTypeClass(
                                transaction
                              )}`}
                            >
                              {getTransactionIcon(transaction)}

                              {getTransactionTypeLabel(transaction)}
                            </span>
                          </td>

                          {/* ITEM */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.item_name || "-"}
                            </p>
                          </td>

                          {/* DEPARTMENT / SUBDEPARTMENT */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-800">
                              {departmentName || "-"}
                            </p>

                            {subdepartmentName && (
                              <p className="mt-1 text-xs text-gray-500">
                                {subdepartmentName}
                              </p>
                            )}
                          </td>

                          {/* QUANTITY */}
                          <td className="px-5 py-4">
                            <p
                              className={`text-sm font-bold ${quantityDisplay.className}`}
                            >
                              {quantityDisplay.text}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.item_unit_display ||
                                transaction.unit_display ||
                                transaction.item_unit ||
                                ""}
                            </p>
                          </td>

                          {/* FROM */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-700">
                              {getSource(transaction)}
                            </span>
                          </td>

                          {/* TO */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-700">
                              {getDestination(transaction)}
                            </span>
                          </td>

                          {/* USER */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-800">
                              {transaction.created_by_name ||
                                transaction.created_by_username ||
                                "Unknown User"}
                            </p>
                          </td>

                          {/* DATE */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <p className="text-sm text-gray-700">
                              {formatDateTime(
                                transaction.created_at
                              )}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  MOBILE / TABLET CARDS
              ================================================== */}
              <div className="divide-y divide-gray-200 lg:hidden">
                {transactions.map((transaction) => {
                  const quantityDisplay =
                    getQuantityDisplay(transaction);

                  const departmentName =
                    getDepartmentName(transaction);

                  const subdepartmentName =
                    getSubDepartmentName(transaction);

                  return (
                    <div
                      key={
                        transaction.id ||
                        transaction.transaction_id
                      }
                      className="p-5"
                    >
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {transaction.transaction_id || "-"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDateTime(
                              transaction.created_at
                            )}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getTransactionTypeClass(
                            transaction
                          )}`}
                        >
                          {getTransactionIcon(transaction)}

                          {getTransactionTypeLabel(transaction)}
                        </span>
                      </div>

                      {/* ITEM */}
                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Item
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {transaction.item_name || "-"}
                        </p>
                      </div>

                      {/* DEPARTMENT */}
                      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {departmentName || "-"}
                        </p>

                        {subdepartmentName && (
                          <p className="mt-1 text-xs text-gray-500">
                            Subdepartment: {subdepartmentName}
                          </p>
                        )}
                      </div>

                      {/* QUANTITY */}
                      <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-4">
                        <span className="text-sm text-gray-500">
                          Quantity
                        </span>

                        <span
                          className={`text-base font-bold ${quantityDisplay.className}`}
                        >
                          {quantityDisplay.text}{" "}
                          <span className="text-xs font-medium text-gray-500">
                            {transaction.item_unit_display ||
                              transaction.unit_display ||
                              transaction.item_unit ||
                              ""}
                          </span>
                        </span>
                      </div>

                      {/* FROM / TO */}
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            From
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {getSource(transaction)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            To
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {getDestination(transaction)}
                          </p>
                        </div>
                      </div>

                      {/* USER */}
                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Recorded By
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800">
                          {transaction.created_by_name ||
                            transaction.created_by_username ||
                            "Unknown User"}
                        </p>
                      </div>

                      {/* REASON */}
                      {transaction.reason && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Reason
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {transaction.reason}
                          </p>
                        </div>
                      )}

                      {/* NOTES */}
                      {transaction.notes && (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Notes
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {transaction.notes}
                          </p>
                        </div>
                      )}

                      {/* ADJUSTMENT DETAILS */}
                      {String(
                        transaction.transaction_type || ""
                      ).toLowerCase() === "adjustment" && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Previous
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {formatNumber(
                                transaction.source_previous_quantity
                              )}
                            </p>
                          </div>

                          <div className="rounded-lg bg-purple-50 p-3">
                            <p className="text-xs text-purple-600">
                              Adjusted To
                            </p>

                            <p className="mt-1 text-sm font-semibold text-purple-700">
                              {formatNumber(
                                transaction.adjusted_quantity
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="mt-6 flex flex-col gap-3 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            Inventory transaction history is read-only and records
            authenticated users automatically.
          </p>

          <Link
            to="/inventory/stock"
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Return to Stock Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryTransactionsPage;
