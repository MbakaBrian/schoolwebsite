import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const ITEMS_URL = "/inventory/items/";
const DEPARTMENTS_URL = "/receipts/departments/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const STOCK_URL = "/inventory/stock/";
const REMOVE_STOCK_URL = "/inventory/stock/remove/";

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(number);
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
  }

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return "Unable to remove stock. Please check the information and try again.";
};

// --------------------------------------------------
// DISPLAY HELPERS
// --------------------------------------------------
const getDepartmentName = (item, departments = []) => {
  if (item?.department_display) {
    return item.department_display;
  }

  if (item?.department?.name) {
    return item.department.name;
  }

  if (
    item?.department !== undefined &&
    item?.department !== null &&
    item?.department !== ""
  ) {
    const department = departments.find(
      (departmentItem) =>
        String(departmentItem.id) === String(item.department)
    );

    if (department) {
      return department.name;
    }
  }

  if (item?.department_id) {
    const department = departments.find(
      (departmentItem) =>
        String(departmentItem.id) === String(item.department_id)
    );

    if (department) {
      return department.name;
    }
  }

  return "No department";
};

const getSubDepartmentName = (item) => {
  if (item?.subdepartment_display) {
    return item.subdepartment_display;
  }

  if (item?.subdepartment?.name) {
    return item.subdepartment.name;
  }

  return "";
};

const getUnitName = (item) => {
  return item?.unit_display || item?.unit || "—";
};

const RemoveStockPage = () => {
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    item: "",
    sourceType: "store",
    store: "",
    inventory_location: "",
    quantity: "",
    reason: "",
    notes: "",
  });

  // --------------------------------------------------
  // LOAD ITEMS, DEPARTMENTS, STORES AND LOCATIONS
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const [
          itemsResponse,
          departmentsResponse,
          storesResponse,
          locationsResponse,
        ] = await Promise.all([
          axiosInstance.get(ITEMS_URL, {
            params: { is_active: true },
          }),
          axiosInstance.get(DEPARTMENTS_URL, {
            params: { is_active: true },
          }),
          axiosInstance.get(STORES_URL, {
            params: { is_active: true },
          }),
          axiosInstance.get(LOCATIONS_URL, {
            params: { is_active: true },
          }),
        ]);

        const loadedItems = getResults(itemsResponse.data);
        const loadedDepartments = getResults(departmentsResponse.data);
        const loadedStores = getResults(storesResponse.data);
        const loadedLocations = getResults(locationsResponse.data);

        setItems(loadedItems);
        setDepartments(loadedDepartments);
        setStores(loadedStores);
        setLocations(loadedLocations);

        // --------------------------------------------------
        // PRESELECT ITEM WHEN ARRIVING FROM STOCK PAGE
        // --------------------------------------------------
        const params = new URLSearchParams(location.search);
        const itemId = params.get("item");

        if (
          itemId &&
          loadedItems.some(
            (item) => String(item.id) === String(itemId)
          )
        ) {
          setFormData((previous) => ({
            ...previous,
            item: String(itemId),
          }));
        }
      } catch (err) {
        console.error("Error loading inventory data:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [location.search]);

  // --------------------------------------------------
  // LOAD STOCK FOR SELECTED ITEM
  // --------------------------------------------------
  useEffect(() => {
    const loadStock = async () => {
      if (!formData.item) {
        setStockRecords([]);
        return;
      }

      setLoadingStock(true);
      setError("");

      try {
        const response = await axiosInstance.get(STOCK_URL, {
          params: {
            item: formData.item,
          },
        });

        setStockRecords(getResults(response.data));
      } catch (err) {
        console.error("Error loading item stock:", err);
        setStockRecords([]);
        setError(getErrorMessage(err));
      } finally {
        setLoadingStock(false);
      }
    };

    loadStock();
  }, [formData.item]);

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "store" || name === "inventory_location"
        ? { quantity: "" }
        : {}),
    }));

    setError("");
    setSuccess("");
  };

  const handleSourceTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      sourceType: type,
      store: type === "store" ? previous.store : "",
      inventory_location:
        type === "location" ? previous.inventory_location : "",
      quantity: "",
    }));

    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // SELECTED ITEM
  // --------------------------------------------------
  const selectedItem = items.find(
    (item) => String(item.id) === String(formData.item)
  );

  // --------------------------------------------------
  // SELECTED ITEM DETAILS
  // --------------------------------------------------
  const selectedDepartmentName = selectedItem
    ? getDepartmentName(selectedItem, departments)
    : "—";

  const selectedSubDepartmentName = selectedItem
    ? getSubDepartmentName(selectedItem)
    : "";

  const selectedUnitName = selectedItem
    ? getUnitName(selectedItem)
    : "—";

  // --------------------------------------------------
  // FIND CURRENT STOCK AT SELECTED SOURCE
  // --------------------------------------------------
  const selectedStock = stockRecords.find((record) => {
    if (formData.sourceType === "store") {
      return (
        String(record.store) === String(formData.store) &&
        record.inventory_location == null
      );
    }

    return (
      String(record.inventory_location) ===
        String(formData.inventory_location) &&
      record.store == null
    );
  });

  const availableQuantity = Number(selectedStock?.quantity || 0);

  const requestedQuantity = Number(formData.quantity || 0);

  const exceedsAvailable =
    requestedQuantity > 0 &&
    requestedQuantity > availableQuantity;

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const validateForm = () => {
    if (!formData.item) {
      return "Please select an inventory item.";
    }

    if (
      formData.sourceType === "store" &&
      !formData.store
    ) {
      return "Please select the source store.";
    }

    if (
      formData.sourceType === "location" &&
      !formData.inventory_location
    ) {
      return "Please select the source location.";
    }

    const quantity = Number(formData.quantity);

    if (
      !formData.quantity ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      return "Quantity must be greater than zero.";
    }

    if (quantity > availableQuantity) {
      return `You cannot remove ${formatNumber(
        quantity
      )}. Only ${formatNumber(availableQuantity)} ${
        selectedUnitName === "—" ? "units" : selectedUnitName
      } are currently available at this location.`;
    }

    if (!formData.reason.trim()) {
      return "Please provide a reason for removing the stock.";
    }

    return "";
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      item_id: Number(formData.item),
      quantity: Number(formData.quantity),
      reason: formData.reason.trim(),
      notes: formData.notes.trim(),
    };

    // Exactly one source is sent.
    if (formData.sourceType === "store") {
      payload.store_id = Number(formData.store);
    } else {
      payload.inventory_location_id = Number(
        formData.inventory_location
      );
    }

    setSaving(true);

    try {
      await axiosInstance.post(
        REMOVE_STOCK_URL,
        payload
      );

      setSuccess(
        "Stock removed successfully. The inventory transaction has been recorded."
      );

      setFormData((previous) => ({
        ...previous,
        quantity: "",
        reason: "",
        notes: "",
      }));

      // Refresh stock so the displayed available quantity is current.
      const response = await axiosInstance.get(
        STOCK_URL,
        {
          params: {
            item: formData.item,
          },
        }
      );

      setStockRecords(getResults(response.data));
    } catch (err) {
      console.error("Error removing stock:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600"></div>

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading inventory data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                to="/inventory/stock"
                className="transition hover:text-purple-600"
              >
                Inventory Stock
              </Link>

              <span>/</span>

              <span className="text-gray-700">
                Remove Stock
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Remove Stock
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Remove inventory from a store or room/area.
            </p>
          </div>

          <Link
            to="/inventory/stock"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Back to Stock
          </Link>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>

              <div>
                <p className="font-semibold">
                  Stock Removed
                </p>

                <p className="mt-0.5">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
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

              <div>
                <p className="font-semibold">
                  Unable to Remove Stock
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            {/* ITEM */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Item Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select the item whose stock you want to remove.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <label
                  htmlFor="item"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Inventory Item{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">
                    Select an item
                  </option>

                  {items.map((item) => {
                    const departmentName =
                      getDepartmentName(
                        item,
                        departments
                      );

                    const subDepartmentName =
                      getSubDepartmentName(item);

                    return (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                        {departmentName
                          ? ` — ${departmentName}`
                          : ""}
                        {subDepartmentName
                          ? ` — ${subDepartmentName}`
                          : ""}
                      </option>
                    );
                  })}
                </select>

                {selectedItem && (
                  <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Item
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedDepartmentName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          SubDepartment
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedSubDepartmentName || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Unit
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedUnitName}
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SOURCE */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Source Location
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose where the stock will be removed from.
                </p>
              </div>

              <div className="p-5 sm:p-6">

                {/* SOURCE TYPE */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* STORE */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSourceTypeChange("store")
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      formData.sourceType === "store"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          formData.sourceType === "store"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10h18M5 10v9h14v-9M4 10l2-5h12l2 5M9 19v-5h6v5"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          Store
                        </p>

                        <p className="text-xs text-gray-500">
                          Remove stock from a store
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* LOCATION */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSourceTypeChange("location")
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      formData.sourceType === "location"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          formData.sourceType === "location"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 5h16v14H4zM8 9h8M8 13h5"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          Room / Area
                        </p>

                        <p className="text-xs text-gray-500">
                          Remove stock from a location
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* STORE SELECT */}
                {formData.sourceType === "store" && (
                  <div>
                    <label
                      htmlFor="store"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Source Store{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="store"
                      name="store"
                      value={formData.store}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">
                        Select a store
                      </option>

                      {stores.map((store) => (
                        <option
                          key={store.id}
                          value={store.id}
                        >
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* LOCATION SELECT */}
                {formData.sourceType === "location" && (
                  <div>
                    <label
                      htmlFor="inventory_location"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Source Location{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="inventory_location"
                      name="inventory_location"
                      value={formData.inventory_location}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">
                        Select a location
                      </option>

                      {locations.map((locationItem) => (
                        <option
                          key={locationItem.id}
                          value={locationItem.id}
                        >
                          {locationItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* CURRENT AVAILABLE STOCK */}
                {formData.item &&
                  ((formData.sourceType === "store" &&
                    formData.store) ||
                    (formData.sourceType === "location" &&
                      formData.inventory_location)) && (
                    <div className="mt-5">
                      {loadingStock ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"></div>

                            <span className="text-sm text-gray-600">
                              Checking available stock...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-xl border p-4 ${
                            availableQuantity > 0
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Available Stock
                              </p>

                              <p
                                className={`mt-1 text-2xl font-bold ${
                                  availableQuantity > 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {formatNumber(
                                  availableQuantity
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                Unit
                              </p>

                              <p className="mt-1 text-sm font-semibold text-gray-800">
                                {selectedUnitName}
                              </p>
                            </div>
                          </div>

                          {availableQuantity === 0 && (
                            <p className="mt-3 text-xs font-medium text-red-700">
                              There is no stock available for
                              this item at the selected location.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </section>

            {/* QUANTITY */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Removal Quantity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the amount you want to remove.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="max-w-md">
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Quantity{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      placeholder="Enter quantity"
                      disabled={
                        !selectedStock ||
                        availableQuantity <= 0
                      }
                      className={`w-full rounded-lg border px-3 py-2.5 pr-24 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 ${
                        !selectedStock ||
                        availableQuantity <= 0
                          ? "cursor-not-allowed border-gray-200 bg-gray-100"
                          : "border-gray-300 bg-white"
                      }`}
                    />

                    {selectedItem && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        {selectedUnitName}
                      </span>
                    )}
                  </div>

                  {exceedsAvailable && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Cannot remove more than the available
                      quantity of{" "}
                      {formatNumber(
                        availableQuantity
                      )}.
                    </p>
                  )}

                  {availableQuantity > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum removable quantity:{" "}
                      <span className="font-semibold text-gray-700">
                        {formatNumber(
                          availableQuantity
                        )}{" "}
                        {selectedUnitName === "—"
                          ? ""
                          : selectedUnitName}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* TRANSACTION DETAILS */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Explain why the inventory is being removed.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Reason{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. Issued to classroom, damaged, used, disposed"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Optional additional information..."
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            </section>

            {/* AUDIT NOTICE */}
            <section className="rounded-2xl border border-purple-100 bg-purple-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Transaction Audit
                  </p>

                  <p className="mt-1 text-sm text-purple-800">
                    Your currently logged-in account will
                    automatically be recorded as the person who
                    performed this removal.
                  </p>
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/inventory/stock"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  saving ||
                  loadingStock ||
                  !selectedStock ||
                  availableQuantity <= 0 ||
                  exceedsAvailable
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Removing Stock...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
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

                    Remove Stock
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* QUICK LINKS */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/inventory/stock"
            className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
          >
            View Stock
          </Link>

          <Link
            to="/inventory/stock/add"
            className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
          >
            Add Stock
          </Link>

          <Link
            to="/inventory/transactions"
            className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
          >
            Transaction History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RemoveStockPage;