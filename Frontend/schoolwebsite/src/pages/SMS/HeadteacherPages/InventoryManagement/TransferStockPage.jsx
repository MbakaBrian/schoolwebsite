import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const ITEMS_URL = "/inventory/items/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const STOCK_URL = "/inventory/stock/";
const TRANSFER_STOCK_URL = "/inventory/stock/transfer/";

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

  return "Unable to transfer stock. Please check the information and try again.";
};

const TransferStockPage = () => {
  const location = useLocation();

  const [items, setItems] = useState([]);
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
    sourceStore: "",
    sourceLocation: "",

    destinationType: "location",
    destinationStore: "",
    destinationLocation: "",

    quantity: "",
    reason: "",
    notes: "",
  });

  // --------------------------------------------------
  // LOAD ITEMS, STORES AND LOCATIONS
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const [itemsResponse, storesResponse, locationsResponse] =
          await Promise.all([
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

        const loadedItems = getResults(itemsResponse.data);
        const loadedStores = getResults(storesResponse.data);
        const loadedLocations = getResults(locationsResponse.data);

        setItems(loadedItems);
        setStores(loadedStores);
        setLocations(loadedLocations);

        // Preselect item when arriving from Stock page
        const params = new URLSearchParams(location.search);
        const itemId = params.get("item");

        if (
          itemId &&
          loadedItems.some((item) => String(item.id) === String(itemId))
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
      ...(name === "sourceStore" || name === "sourceLocation"
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
      sourceStore: type === "store" ? previous.sourceStore : "",
      sourceLocation: type === "location" ? previous.sourceLocation : "",
      quantity: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleDestinationTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      destinationType: type,
      destinationStore:
        type === "store" ? previous.destinationStore : "",
      destinationLocation:
        type === "location" ? previous.destinationLocation : "",
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
  // CURRENT SOURCE STOCK
  // --------------------------------------------------
  const selectedSourceStock = stockRecords.find((record) => {
    if (formData.sourceType === "store") {
      return (
        String(record.store) === String(formData.sourceStore) &&
        record.inventory_location == null
      );
    }

    return (
      String(record.inventory_location) ===
        String(formData.sourceLocation) &&
      record.store == null
    );
  });

  const availableQuantity = Number(
    selectedSourceStock?.quantity || 0
  );

  const requestedQuantity = Number(formData.quantity || 0);

  const exceedsAvailable =
    requestedQuantity > 0 &&
    requestedQuantity > availableQuantity;

  // --------------------------------------------------
  // CHECK SAME SOURCE / DESTINATION
  // --------------------------------------------------
  const sameDestination =
    formData.sourceType === formData.destinationType &&
    (
      (formData.sourceType === "store" &&
        formData.sourceStore &&
        formData.sourceStore === formData.destinationStore) ||
      (formData.sourceType === "location" &&
        formData.sourceLocation &&
        formData.sourceLocation === formData.destinationLocation)
    );

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const validateForm = () => {
    if (!formData.item) {
      return "Please select an inventory item.";
    }

    // SOURCE
    if (formData.sourceType === "store" && !formData.sourceStore) {
      return "Please select the source store.";
    }

    if (
      formData.sourceType === "location" &&
      !formData.sourceLocation
    ) {
      return "Please select the source location.";
    }

    // DESTINATION
    if (
      formData.destinationType === "store" &&
      !formData.destinationStore
    ) {
      return "Please select the destination store.";
    }

    if (
      formData.destinationType === "location" &&
      !formData.destinationLocation
    ) {
      return "Please select the destination location.";
    }

    if (sameDestination) {
      return "Source and destination cannot be the same location.";
    }

    const quantity = Number(formData.quantity);

    if (!formData.quantity || Number.isNaN(quantity) || quantity <= 0) {
      return "Transfer quantity must be greater than zero.";
    }

    if (quantity > availableQuantity) {
      return `You cannot transfer ${formatNumber(
        quantity
      )}. Only ${formatNumber(availableQuantity)} ${
        selectedItem?.unit_display ||
        selectedItem?.unit ||
        "units"
      } are currently available at the source.`;
    }

    if (!formData.reason.trim()) {
      return "Please provide a reason for the stock transfer.";
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

    // SOURCE
    if (formData.sourceType === "store") {
      payload.source_store_id = Number(formData.sourceStore);
    } else {
      payload.source_inventory_location_id = Number(
        formData.sourceLocation
      );
    }

    // DESTINATION
    if (formData.destinationType === "store") {
      payload.destination_store_id = Number(
        formData.destinationStore
      );
    } else {
      payload.destination_inventory_location_id = Number(
        formData.destinationLocation
      );
    }

    setSaving(true);

    try {
      await axiosInstance.post(TRANSFER_STOCK_URL, payload);

      setSuccess(
        "Stock transferred successfully. The transfer transaction has been recorded."
      );

      setFormData((previous) => ({
        ...previous,
        quantity: "",
        reason: "",
        notes: "",
      }));

      // Refresh stock after transfer
      const response = await axiosInstance.get(STOCK_URL, {
        params: {
          item: formData.item,
        },
      });

      setStockRecords(getResults(response.data));
    } catch (err) {
      console.error("Error transferring stock:", err);
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
        <div className="mx-auto max-w-6xl">
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
      <div className="mx-auto max-w-6xl">
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
                Transfer Stock
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Transfer Stock
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Move inventory from one store or location to another.
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
                  Transfer Successful
                </p>

                <p className="mt-0.5">{success}</p>
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
                  Unable to Transfer Stock
                </p>

                <p className="mt-0.5">{error}</p>
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
                  Select the inventory item you want to transfer.
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
                  <option value="">Select an item</option>

                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.department_display
                        ? ` — ${item.department_display}`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedItem && (
                  <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                          {selectedItem.department_display ||
                            selectedItem.department ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Unit
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.unit_display ||
                            selectedItem.unit ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SOURCE AND DESTINATION */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Transfer Locations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select where the stock is coming from and where it is going.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* SOURCE */}
                  <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
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
                            d="M19 12H5m6-6l-6 6 6 6"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          Source
                        </h3>

                        <p className="text-xs text-gray-500">
                          Where the stock currently is
                        </p>
                      </div>
                    </div>

                    {/* SOURCE TYPE */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSourceTypeChange("store")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          formData.sourceType === "store"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Store
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSourceTypeChange("location")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          formData.sourceType === "location"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Room / Area
                      </button>
                    </div>

                    {formData.sourceType === "store" ? (
                      <div>
                        <label
                          htmlFor="sourceStore"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Source Store{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="sourceStore"
                          name="sourceStore"
                          value={formData.sourceStore}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="">
                            Select source store
                          </option>

                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="sourceLocation"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Source Location{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="sourceLocation"
                          name="sourceLocation"
                          value={formData.sourceLocation}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="">
                            Select source location
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

                    {/* AVAILABLE STOCK */}
                    {formData.item &&
                      ((formData.sourceType === "store" &&
                        formData.sourceStore) ||
                        (formData.sourceType === "location" &&
                          formData.sourceLocation)) && (
                        <div className="mt-4">
                          {loadingStock ? (
                            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                              Checking available stock...
                            </div>
                          ) : (
                            <div
                              className={`rounded-lg border p-3 ${
                                availableQuantity > 0
                                  ? "border-green-200 bg-green-50"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              <p className="text-xs text-gray-500">
                                Available at source
                              </p>

                              <p
                                className={`mt-1 text-xl font-bold ${
                                  availableQuantity > 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {formatNumber(
                                  availableQuantity
                                )}{" "}
                                <span className="text-sm font-medium">
                                  {selectedItem?.unit_display ||
                                    selectedItem?.unit ||
                                    ""}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  {/* DESTINATION */}
                  <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white">
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
                            d="M5 12h14m-6-6l6 6-6 6"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          Destination
                        </h3>

                        <p className="text-xs text-gray-500">
                          Where the stock will go
                        </p>
                      </div>
                    </div>

                    {/* DESTINATION TYPE */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDestinationTypeChange("store")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          formData.destinationType === "store"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Store
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDestinationTypeChange("location")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          formData.destinationType === "location"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Room / Area
                      </button>
                    </div>

                    {formData.destinationType === "store" ? (
                      <div>
                        <label
                          htmlFor="destinationStore"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Destination Store{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="destinationStore"
                          name="destinationStore"
                          value={formData.destinationStore}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="">
                            Select destination store
                          </option>

                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="destinationLocation"
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Destination Location{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="destinationLocation"
                          name="destinationLocation"
                          value={formData.destinationLocation}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="">
                            Select destination location
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

                    {sameDestination && (
                      <p className="mt-3 text-xs font-medium text-red-600">
                        The destination must be different from the
                        source.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* QUANTITY */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Transfer Quantity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Specify how much stock should be moved.
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
                      disabled={
                        !selectedSourceStock ||
                        availableQuantity <= 0
                      }
                      placeholder="Enter quantity"
                      className={`w-full rounded-lg border px-3 py-2.5 pr-24 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 ${
                        !selectedSourceStock ||
                        availableQuantity <= 0
                          ? "cursor-not-allowed border-gray-200 bg-gray-100"
                          : "border-gray-300 bg-white"
                      }`}
                    />

                    {selectedItem && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        {selectedItem.unit_display ||
                          selectedItem.unit}
                      </span>
                    )}
                  </div>

                  {exceedsAvailable && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Cannot transfer more than the available quantity
                      of {formatNumber(availableQuantity)}.
                    </p>
                  )}

                  {availableQuantity > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum transferable quantity:{" "}
                      <span className="font-semibold text-gray-700">
                        {formatNumber(availableQuantity)}{" "}
                        {selectedItem?.unit_display ||
                          selectedItem?.unit ||
                          ""}
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
                  Transfer Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Provide information explaining the transfer.
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
                    placeholder="e.g. Issuing supplies to classroom"
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
                    Your currently logged-in account will automatically
                    be recorded as the person who performed this
                    transfer.
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
                  !selectedSourceStock ||
                  availableQuantity <= 0 ||
                  exceedsAvailable ||
                  sameDestination
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

                    Transferring...
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
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>

                    Transfer Stock
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

export default TransferStockPage;

