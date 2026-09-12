import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const ITEMS_URL = "/inventory/items/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const STOCK_URL = "/inventory/stock/";
const ADJUST_STOCK_URL = "/inventory/stock/adjust/";

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(number);
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AdjustStockPage = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const itemFromQuery = queryParams.get("item");

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    item: itemFromQuery || "",
    sourceType: "store",
    store: "",
    inventory_location: "",
    physicalQuantity: "",
    reason: "",
    notes: "",
  });

  // --------------------------------------------------
  // FETCH ITEMS, STORES & LOCATIONS
  // --------------------------------------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError("");

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

        // Keep item selected when passed through URL.
        if (
          itemFromQuery &&
          loadedItems.some(
            (item) => String(item.id) === String(itemFromQuery)
          )
        ) {
          setFormData((prev) => ({
            ...prev,
            item: String(itemFromQuery),
          }));
        }
      } catch (err) {
        console.error("Failed to load inventory adjustment data:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load inventory data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [itemFromQuery]);

  // --------------------------------------------------
  // FETCH STOCK FOR SELECTED ITEM
  // --------------------------------------------------
  useEffect(() => {
    const fetchStock = async () => {
      if (!formData.item) {
        setStockRecords([]);
        return;
      }

      try {
        setStockLoading(true);
        setError("");

        const response = await axiosInstance.get(STOCK_URL, {
          params: {
            item: formData.item,
          },
        });

        setStockRecords(getResults(response.data));
      } catch (err) {
        console.error("Failed to load stock:", err);

        setStockRecords([]);

        setError(
          err?.response?.data?.detail ||
            "Failed to load the current stock quantity."
        );
      } finally {
        setStockLoading(false);
      }
    };

    fetchStock();
  }, [formData.item]);

  // --------------------------------------------------
  // SELECTED ITEM
  // --------------------------------------------------
  const selectedItem = useMemo(() => {
    return (
      items.find((item) => String(item.id) === String(formData.item)) || null
    );
  }, [items, formData.item]);

  // --------------------------------------------------
  // SELECTED STOCK RECORD
  // --------------------------------------------------
  const selectedStock = useMemo(() => {
    if (!formData.item) {
      return null;
    }

    if (formData.sourceType === "store") {
      if (!formData.store) {
        return null;
      }

      return (
        stockRecords.find(
          (record) =>
            String(record.store) === String(formData.store) &&
            record.inventory_location == null
        ) || null
      );
    }

    if (!formData.inventory_location) {
      return null;
    }

    return (
      stockRecords.find(
        (record) =>
          String(record.inventory_location) ===
            String(formData.inventory_location) &&
          record.store == null
      ) || null
    );
  }, [
    formData.item,
    formData.sourceType,
    formData.store,
    formData.inventory_location,
    stockRecords,
  ]);

  // --------------------------------------------------
  // CURRENT SYSTEM QUANTITY
  // --------------------------------------------------
  const systemQuantity = Number(selectedStock?.quantity || 0);

  // --------------------------------------------------
  // PHYSICAL QUANTITY
  // --------------------------------------------------
  const physicalQuantity =
    formData.physicalQuantity === ""
      ? null
      : Number(formData.physicalQuantity);

  // --------------------------------------------------
  // ADJUSTMENT DIFFERENCE
  // --------------------------------------------------
  const difference =
    physicalQuantity === null
      ? null
      : physicalQuantity - systemQuantity;

  // --------------------------------------------------
  // LOCATION NAME
  // --------------------------------------------------
  const selectedLocationName = useMemo(() => {
    if (formData.sourceType === "store") {
      const store = stores.find(
        (store) => String(store.id) === String(formData.store)
      );

      return store?.name || "Select a store";
    }

    const inventoryLocation = locations.find(
      (location) =>
        String(location.id) === String(formData.inventory_location)
    );

    return inventoryLocation?.name || "Select a location";
  }, [
    formData.sourceType,
    formData.store,
    formData.inventory_location,
    stores,
    locations,
  ]);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSuccess("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // SOURCE TYPE CHANGE
  // --------------------------------------------------
  const handleSourceTypeChange = (type) => {
    setError("");
    setSuccess("");

    setFormData((prev) => ({
      ...prev,
      sourceType: type,
      store: "",
      inventory_location: "",
      physicalQuantity: "",
    }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------
    if (!formData.item) {
      setError("Please select an inventory item.");
      return;
    }

    if (formData.sourceType === "store" && !formData.store) {
      setError("Please select a store.");
      return;
    }

    if (
      formData.sourceType === "location" &&
      !formData.inventory_location
    ) {
      setError("Please select an inventory location.");
      return;
    }

    if (formData.physicalQuantity === "") {
      setError("Please enter the physical counted quantity.");
      return;
    }

    if (Number.isNaN(physicalQuantity) || physicalQuantity < 0) {
      setError("Physical quantity cannot be negative.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please provide a reason for the adjustment.");
      return;
    }

    if (difference === 0) {
      setError(
        "The physical quantity is the same as the system quantity. No adjustment is required."
      );
      return;
    }

    // ----------------------------------------------
    // PAYLOAD
    // ----------------------------------------------
    // Department and subdepartment are NOT sent here.
    //
    // They belong to InventoryItem and are already
    // determined by item_id on the backend.
    const payload = {
      item_id: Number(formData.item),
      adjusted_quantity: physicalQuantity,
      reason: formData.reason.trim(),
      notes: formData.notes.trim(),
    };

    // Exactly one stock destination is sent.
    if (formData.sourceType === "store") {
      payload.store_id = Number(formData.store);
    } else {
      payload.inventory_location_id = Number(formData.inventory_location);
    }

    try {
      setSaving(true);

      await axiosInstance.post(ADJUST_STOCK_URL, payload);

      setSuccess(
        `Stock adjusted successfully. ${
          selectedItem?.name || "Item"
        } at ${selectedLocationName} is now ${formatNumber(
          physicalQuantity
        )} ${
          selectedItem?.unit_display || selectedItem?.unit || "units"
        }.`
      );

      // Refresh stock records.
      const response = await axiosInstance.get(STOCK_URL, {
        params: {
          item: formData.item,
        },
      });

      setStockRecords(getResults(response.data));

      // Keep item/location selected but clear adjustment fields.
      setFormData((prev) => ({
        ...prev,
        physicalQuantity: "",
        reason: "",
        notes: "",
      }));
    } catch (err) {
      console.error("Stock adjustment failed:", err);

      const backendError = err?.response?.data;

      let message = "Failed to adjust stock. Please try again.";

      if (backendError?.detail) {
        message = backendError.detail;
      } else if (backendError?.error) {
        message = backendError.error;
      } else if (typeof backendError === "string") {
        message = backendError;
      } else if (backendError && typeof backendError === "object") {
        const messages = [];

        Object.entries(backendError).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            messages.push(`${field}: ${value.join(", ")}`);
          } else if (typeof value === "string") {
            messages.push(`${field}: ${value}`);
          }
        });

        if (messages.length > 0) {
          message = messages.join(" ");
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------
  const handleReset = () => {
    setFormData({
      item: itemFromQuery || "",
      sourceType: "store",
      store: "",
      inventory_location: "",
      physicalQuantity: "",
      reason: "",
      notes: "",
    });

    setError("");
    setSuccess("");
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
              Loading inventory adjustment...
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

              <span className="text-gray-800">Adjust Stock</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Adjust Stock
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Reconcile the system quantity with the physically counted stock.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/inventory/stock"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Stock
            </Link>

            <Link
              to="/inventory/transactions"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              View Transactions
            </Link>
          </div>
        </div>

        {/* ==================================================
            ALERTS
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

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
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
                d="M5 13l4 4L19 7"
              />
            </svg>

            <p>{success}</p>
          </div>
        )}

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================================
              FORM
          ================================================== */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Stock Adjustment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the actual quantity counted during the physical stock
                  check.
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-6">

                {/* ==================================================
                    ITEM
                ================================================== */}
                <div>
                  <label
                    htmlFor="item"
                    className="mb-2 block text-sm font-medium text-gray-700"
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
                        {item.subdepartment_display
                          ? ` — ${item.subdepartment_display}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {/* SELECTED ITEM INFORMATION */}
                  {selectedItem && (
                    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

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
                            Subdepartment
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {selectedItem.subdepartment_display ||
                              "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-purple-100 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                              Unit
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {selectedItem.unit_display ||
                                selectedItem.unit ||
                                "Unit"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                              Item ID
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              #{selectedItem.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==================================================
                    LOCATION TYPE
                ================================================== */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Stock Location{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSourceTypeChange("store")}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        formData.sourceType === "store"
                          ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-100"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Store
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSourceTypeChange("location")}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        formData.sourceType === "location"
                          ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-100"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Room / Area
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    STORE
                ================================================== */}
                {formData.sourceType === "store" && (
                  <div>
                    <label
                      htmlFor="store"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Store <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="store"
                      name="store"
                      value={formData.store}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">Select a store</option>

                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>

                    {stores.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active stores are available.
                      </p>
                    )}
                  </div>
                )}

                {/* ==================================================
                    INVENTORY LOCATION
                ================================================== */}
                {formData.sourceType === "location" && (
                  <div>
                    <label
                      htmlFor="inventory_location"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Room / Area{" "}
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
                        Select a room / area
                      </option>

                      {locations.map((inventoryLocation) => (
                        <option
                          key={inventoryLocation.id}
                          value={inventoryLocation.id}
                        >
                          {inventoryLocation.name}
                        </option>
                      ))}
                    </select>

                    {locations.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active inventory locations are available.
                      </p>
                    )}
                  </div>
                )}

                {/* ==================================================
                    CURRENT SYSTEM QUANTITY
                ================================================== */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Current System Quantity
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {stockLoading
                          ? "..."
                          : formatNumber(systemQuantity)}
                      </p>
                    </div>

                    {selectedItem && (
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedItem.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {selectedItem.unit_display ||
                            selectedItem.unit ||
                            "Unit"}
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.item &&
                    (formData.store || formData.inventory_location) &&
                    !stockLoading &&
                    !selectedStock && (
                      <p className="mt-3 text-xs text-amber-700">
                        No existing stock record was found at this location.
                        The current system quantity is therefore treated as
                        zero.
                      </p>
                    )}
                </div>

                {/* ==================================================
                    PHYSICAL QUANTITY
                ================================================== */}
                <div>
                  <label
                    htmlFor="physicalQuantity"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Physical Counted Quantity{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="physicalQuantity"
                    type="number"
                    name="physicalQuantity"
                    min="0"
                    step="0.001"
                    value={formData.physicalQuantity}
                    onChange={handleChange}
                    placeholder="Enter the quantity physically counted"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the actual quantity physically counted. Zero is
                    allowed.
                  </p>
                </div>

                {/* ==================================================
                    DIFFERENCE
                ================================================== */}
                {difference !== null && !Number.isNaN(difference) && (
                  <div
                    className={`rounded-xl border p-4 ${
                      difference > 0
                        ? "border-green-200 bg-green-50"
                        : difference < 0
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Adjustment
                        </p>

                        <p
                          className={`mt-1 text-2xl font-bold ${
                            difference > 0
                              ? "text-green-700"
                              : difference < 0
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {difference > 0 ? "+" : ""}
                          {formatNumber(difference)}
                        </p>
                      </div>

                      <div className="text-right">
                        {difference > 0 && (
                          <>
                            <p className="text-sm font-semibold text-green-700">
                              Stock Increase
                            </p>

                            <p className="mt-1 text-xs text-green-600">
                              System quantity will increase.
                            </p>
                          </>
                        )}

                        {difference < 0 && (
                          <>
                            <p className="text-sm font-semibold text-red-700">
                              Stock Decrease
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                              System quantity will decrease.
                            </p>
                          </>
                        )}

                        {difference === 0 && (
                          <>
                            <p className="text-sm font-semibold text-gray-700">
                              No Difference
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              No adjustment is required.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    REASON
                ================================================== */}
                <div>
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Reason <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. Physical stock count reconciliation"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* ==================================================
                    NOTES
                ================================================== */}
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional information about the adjustment..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              {/* ==================================================
                  FORM ACTIONS
              ================================================== */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    stockLoading ||
                    difference === null ||
                    difference === 0
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {saving ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Adjusting...
                    </>
                  ) : (
                    "Apply Adjustment"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}
          <div className="space-y-6">

            {/* SUMMARY CARD */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Adjustment Summary
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Item
                  </span>

                  <span className="text-right text-sm font-medium text-gray-900">
                    {selectedItem?.name || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Department
                  </span>

                  <span className="text-right text-sm font-medium text-gray-900">
                    {selectedItem?.department_display ||
                      selectedItem?.department ||
                      "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Subdepartment
                  </span>

                  <span className="text-right text-sm font-medium text-gray-900">
                    {selectedItem?.subdepartment_display || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Location
                  </span>

                  <span className="text-right text-sm font-medium text-gray-900">
                    {formData.store || formData.inventory_location
                      ? selectedLocationName
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Unit
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {selectedItem?.unit_display ||
                      selectedItem?.unit ||
                      "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    System Quantity
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {formatNumber(systemQuantity)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Physical Quantity
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {physicalQuantity === null
                      ? "-"
                      : formatNumber(physicalQuantity)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      Difference
                    </span>

                    <span
                      className={`text-lg font-bold ${
                        difference === null
                          ? "text-gray-400"
                          : difference > 0
                          ? "text-green-600"
                          : difference < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {difference === null
                        ? "-"
                        : `${difference > 0 ? "+" : ""}${formatNumber(
                            difference
                          )}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                INFORMATION CARD
            ================================================== */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
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
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-purple-900">
                    How adjustments work
                  </h3>

                  <ul className="mt-2 space-y-2 text-xs leading-5 text-purple-800">
                    <li>
                      • The system quantity is compared with the physical
                      count.
                    </li>

                    <li>
                      • A positive difference increases the stock quantity.
                    </li>

                    <li>
                      • A negative difference decreases the stock quantity.
                    </li>

                    <li>
                      • The adjustment is recorded permanently in the inventory
                      transaction history.
                    </li>

                    <li>
                      • Department and subdepartment come automatically from
                      the selected inventory item.
                    </li>

                    <li>
                      • The logged-in user is automatically recorded by the
                      backend.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ==================================================
                QUICK LINKS
            ================================================== */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Inventory Actions
              </h3>

              <div className="mt-4 space-y-2">
                <Link
                  to="/inventory/stock/add"
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  Add Stock
                </Link>

                <Link
                  to="/inventory/stock/remove"
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  Remove Stock
                </Link>

                <Link
                  to="/inventory/stock/transfer"
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  Transfer Stock
                </Link>

                <Link
                  to="/inventory/transactions"
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  Transaction History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Last stock record check: {formatDate(new Date())}
        </div>
      </div>
    </div>
  );
};

export default AdjustStockPage;