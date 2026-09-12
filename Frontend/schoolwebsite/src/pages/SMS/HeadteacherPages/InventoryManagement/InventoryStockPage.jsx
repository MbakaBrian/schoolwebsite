import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const STOCK_URL = "/inventory/stock/";
const ITEMS_URL = "/inventory/items/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const DEPARTMENTS_URL = "/receipts/departments/";

export default function InventoryStockPage() {
  const [stock, setStock] = useState([]);
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [subdepartmentsLoading, setSubdepartmentsLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [subdepartmentFilter, setSubdepartmentFilter] =
    useState("all");

  const [itemFilter, setItemFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // --------------------------------------------------
  // FETCH DEPARTMENTS
  // --------------------------------------------------

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);

      const response = await axiosInstance.get(
        DEPARTMENTS_URL
      );

      const data = response.data;

      let results = [];

      if (Array.isArray(data)) {
        results = data;
      } else if (Array.isArray(data?.results)) {
        results = data.results;
      }

      setDepartments(results);
    } catch (err) {
      console.error("Failed to load departments:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load departments."
      );
    } finally {
      setDepartmentsLoading(false);
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
      setSubdepartmentsLoading(true);

      const response = await axiosInstance.get(
        `${DEPARTMENTS_URL}${departmentId}/subdepartments/`
      );

      const data = response.data;

      let results = [];

      if (Array.isArray(data)) {
        results = data;
      } else if (Array.isArray(data?.results)) {
        results = data.results;
      }

      setSubdepartments(results);
    } catch (err) {
      console.error(
        "Failed to load subdepartments:",
        err
      );

      setSubdepartments([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load subdepartments."
      );
    } finally {
      setSubdepartmentsLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH FILTER DATA
  // --------------------------------------------------

  const fetchFilterData = async () => {
    try {
      const [
        itemsResponse,
        storesResponse,
        locationsResponse,
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
      ]);

      const extractResults = (data) => {
        if (Array.isArray(data)) {
          return data;
        }

        if (Array.isArray(data?.results)) {
          return data.results;
        }

        return [];
      };

      setItems(extractResults(itemsResponse.data));
      setStores(extractResults(storesResponse.data));
      setLocations(extractResults(locationsResponse.data));
    } catch (err) {
      console.error(
        "Failed to load inventory filters:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load inventory filter data."
      );
    }
  };

  // --------------------------------------------------
  // FETCH STOCK
  // --------------------------------------------------

  const fetchStock = async (showFullLoader = false) => {
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

      // --------------------------------------------------
      // CENTRAL DEPARTMENT FILTER
      // --------------------------------------------------

      if (departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      // --------------------------------------------------
      // CENTRAL SUBDEPARTMENT FILTER
      // --------------------------------------------------

      if (subdepartmentFilter !== "all") {
        params.subdepartment = subdepartmentFilter;
      }

      // --------------------------------------------------
      // ITEM FILTER
      // --------------------------------------------------

      if (itemFilter !== "all") {
        params.item = itemFilter;
      }

      // --------------------------------------------------
      // LOCATION FILTER
      //
      // A stock record can belong to either:
      // - a Store
      // - an Inventory Location
      //
      // Therefore we send the correct backend parameter
      // instead of sending "store:1" as location=...
      // --------------------------------------------------

      if (locationFilter !== "all") {
        const [locationType, locationId] =
          String(locationFilter).split(":");

        if (locationType === "store" && locationId) {
          params.store = locationId;
        }

        if (
          locationType === "location" &&
          locationId
        ) {
          params.inventory_location = locationId;
        }
      }

      const response = await axiosInstance.get(
        STOCK_URL,
        {
          params,
        }
      );

      const data = response.data;

      let results = [];

      if (Array.isArray(data)) {
        results = data;
      } else if (Array.isArray(data?.results)) {
        results = data.results;
      }

      // --------------------------------------------------
      // CLIENT-SIDE STOCK STATUS FILTER
      // --------------------------------------------------

      if (stockFilter === "available") {
        results = results.filter(
          (record) => Number(record.quantity) > 0
        );
      }

      if (stockFilter === "zero") {
        results = results.filter(
          (record) => Number(record.quantity) === 0
        );
      }

      setStock(results);
    } catch (err) {
      console.error(
        "Failed to fetch inventory stock:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load inventory stock. Please try again."
      );
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);

      await Promise.all([
        fetchDepartments(),
        fetchFilterData(),
        fetchStock(true),
      ]);
    };

    loadPage();
  }, []);

  // --------------------------------------------------
  // LOAD SUBDEPARTMENTS WHEN DEPARTMENT CHANGES
  // --------------------------------------------------

  useEffect(() => {
    if (
      departmentFilter &&
      departmentFilter !== "all"
    ) {
      fetchSubdepartments(departmentFilter);
    } else {
      setSubdepartments([]);
      setSubdepartmentFilter("all");
    }
  }, [departmentFilter]);

  // --------------------------------------------------
  // FILTER CHANGES
  // --------------------------------------------------

  useEffect(() => {
    if (!loading) {
      fetchStock(false);
    }
  }, [
    departmentFilter,
    subdepartmentFilter,
    itemFilter,
    locationFilter,
    stockFilter,
  ]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStock(false);
  };

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setSubdepartmentFilter("all");
    setItemFilter("all");
    setLocationFilter("all");
    setStockFilter("all");

    setSubdepartments([]);

    setTimeout(() => {
      fetchStock(false);
    }, 0);
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatQuantity = (quantity) => {
    const number = Number(quantity);

    if (Number.isNaN(number)) {
      return quantity || "0";
    }

    return number.toLocaleString("en-KE", {
      maximumFractionDigits: 2,
    });
  };

  const getUnit = (record) => {
    return (
      record.item_unit_display ||
      record.item_unit ||
      "Units"
    );
  };

  const getDepartment = (record) => {
    return (
      record.department_display ||
      record.department?.name ||
      record.department ||
      "—"
    );
  };

  const getSubDepartment = (record) => {
    return (
      record.subdepartment_display ||
      record.subdepartment?.name ||
      record.subdepartment ||
      ""
    );
  };

  const getLocationName = (record) => {
    if (record.location_name) {
      return record.location_name;
    }

    if (record.store_name) {
      return record.store_name;
    }

    if (record.inventory_location_name) {
      return record.inventory_location_name;
    }

    if (record.store?.name) {
      return record.store.name;
    }

    if (record.inventory_location?.name) {
      return record.inventory_location.name;
    }

    return "Unknown Location";
  };

  const getLocationType = (record) => {
    if (record.location_type === "store") {
      return "Store";
    }

    if (
      record.location_type ===
      "inventory_location"
    ) {
      return "Location";
    }

    if (
      record.inventory_location ||
      record.inventory_location_name
    ) {
      return "Location";
    }

    if (record.store || record.store_name) {
      return "Store";
    }

    return "Location";
  };

  const getQuantityStyle = (quantity) => {
    const value = Number(quantity);

    if (value === 0) {
      return "bg-red-100 text-red-700";
    }

    return "bg-green-100 text-green-700";
  };

  const totalStockRecords = stock.length;

  const totalQuantity = stock.reduce(
    (total, record) =>
      total + Number(record.quantity || 0),
    0
  );

  const zeroStockCount = stock.filter(
    (record) => Number(record.quantity) === 0
  ).length;

  const availableStockCount = stock.filter(
    (record) => Number(record.quantity) > 0
  ).length;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* --------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Current Stock
              </h1>
            </div>

            <p className="text-sm text-gray-500">
              View current inventory quantities across all
              stores and locations.
            </p>
          </div>

          {/* Stock Actions */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              to="/inventory/stock/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Stock
            </Link>

            <Link
              to="/inventory/stock/remove"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
              Remove
            </Link>

            <Link
              to="/inventory/stock/transfer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Transfer
            </Link>
          </div>
        </div>

        {/* --------------------------------------------------
            SUMMARY CARDS
        -------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Records */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Stock Records
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {loading ? "—" : totalStockRecords}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Quantity
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {loading
                    ? "—"
                    : formatQuantity(totalQuantity)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Across the displayed records
            </p>
          </div>

          {/* Available */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  With Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-green-700">
                  {loading ? "—" : availableStockCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Zero */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Zero Stock
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {loading ? "—" : zeroStockCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            ERROR
        -------------------------------------------------- */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-1.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}

        {/* --------------------------------------------------
            FILTERS
        -------------------------------------------------- */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="xl:col-span-2"
            >
              <label
                htmlFor="stock-search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>

                  <input
                    id="stock-search"
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search item or location..."
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Department */}
            <div>
              <label
                htmlFor="department-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Department
              </label>

              <select
                id="department-filter"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setSubdepartmentFilter("all");
                }}
                disabled={departmentsLoading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="all">
                  All Departments
                </option>

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

            {/* Subdepartment */}
            <div>
              <label
                htmlFor="subdepartment-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Subdepartment
              </label>

              <select
                id="subdepartment-filter"
                value={subdepartmentFilter}
                onChange={(e) =>
                  setSubdepartmentFilter(
                    e.target.value
                  )
                }
                disabled={
                  departmentFilter === "all" ||
                  subdepartmentsLoading
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="all">
                  {departmentFilter === "all"
                    ? "Select Department First"
                    : subdepartmentsLoading
                    ? "Loading..."
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

            {/* Item */}
            <div>
              <label
                htmlFor="item-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Item
              </label>

              <select
                id="item-filter"
                value={itemFilter}
                onChange={(e) =>
                  setItemFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">
                  All Items
                </option>

                {items.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second filter row */}
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-3">

            {/* Location */}
            <div>
              <label
                htmlFor="location-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Location
              </label>

              <select
                id="location-filter"
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">
                  All Locations
                </option>

                {stores.length > 0 && (
                  <optgroup label="Stores">
                    {stores.map((store) => (
                      <option
                        key={`store-${store.id}`}
                        value={`store:${store.id}`}
                      >
                        {store.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {locations.length > 0 && (
                  <optgroup label="Rooms / Areas">
                    {locations.map((location) => (
                      <option
                        key={`location-${location.id}`}
                        value={`location:${location.id}`}
                      >
                        {location.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Stock Status */}
            <div>
              <label
                htmlFor="stock-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Stock Status
              </label>

              <select
                id="stock-filter"
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="available">
                  Available Stock
                </option>

                <option value="zero">
                  Zero Stock
                </option>
              </select>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            STOCK TABLE
        -------------------------------------------------- */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Item
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading || filterLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                        Loading stock...
                      </div>
                    </td>
                  </tr>
                ) : stock.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <svg
                          className="h-7 w-7 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        No stock records found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or add
                        some stock.
                      </p>

                      <Link
                        to="/inventory/stock/add"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-800"
                      >
                        + Add Stock
                      </Link>
                    </td>
                  </tr>
                ) : (
                  stock.map((record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.item_name ||
                                "Unknown Item"}
                            </p>

                            <p className="text-xs text-gray-500">
                              Item #{record.item}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {getDepartment(record)}
                        </p>

                        {getSubDepartment(record) && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {getSubDepartment(record)}
                          </p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {getLocationName(record)}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {getLocationType(record)}
                          </p>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold ${getQuantityStyle(
                            record.quantity
                          )}`}
                        >
                          {formatQuantity(
                            record.quantity
                          )}
                        </span>

                        <span className="ml-2 text-xs text-gray-500">
                          {getUnit(record)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/inventory/stock/add?item=${record.item}`}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            Add
                          </Link>

                          {Number(record.quantity) > 0 && (
                            <Link
                              to={`/inventory/stock/remove?item=${record.item}`}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              Remove
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --------------------------------------------------
              MOBILE CARDS
          -------------------------------------------------- */}

          <div className="md:hidden">

            {loading || filterLoading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                Loading stock...
              </div>
            ) : stock.length === 0 ? (
              <div className="px-5 py-14 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-7 w-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  No stock records found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or add some
                  stock.
                </p>

                <Link
                  to="/inventory/stock/add"
                  className="mt-4 inline-flex text-sm font-semibold text-purple-700"
                >
                  + Add Stock
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">

                {stock.map((record) => (
                  <div
                    key={record.id}
                    className="p-5"
                  >

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {record.item_name ||
                              "Unknown Item"}
                          </h3>

                          <p className="text-xs text-gray-500">
                            Item #{record.item}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-bold ${getQuantityStyle(
                          record.quantity
                        )}`}
                      >
                        {formatQuantity(
                          record.quantity
                        )}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="mt-4 rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Department
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {getDepartment(record)}
                      </p>

                      {getSubDepartment(record) && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {getSubDepartment(record)}
                        </p>
                      )}
                    </div>

                    {/* Unit */}
                    <div className="mt-3 rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Unit
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {getUnit(record)}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="mt-3 rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {getLocationName(record)}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {getLocationType(record)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-2 gap-2">

                      <Link
                        to={`/inventory/stock/add?item=${record.item}`}
                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Add Stock
                      </Link>

                      {Number(record.quantity) > 0 ? (
                        <Link
                          to={`/inventory/stock/remove?item=${record.item}`}
                          className="rounded-lg border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          Remove Stock
                        </Link>
                      ) : (
                        <Link
                          to={`/inventory/stock/adjust?item=${record.item}`}
                          className="rounded-lg border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                        >
                          Adjust
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------
            FOOTER INFORMATION
        -------------------------------------------------- */}

        {!loading && stock.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

            <span>
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {stock.length}
              </span>{" "}
              stock record
              {stock.length === 1 ? "" : "s"}.
            </span>

            <Link
              to="/inventory/transactions"
              className="font-semibold text-purple-700 hover:text-purple-800"
            >
              View transaction history →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
