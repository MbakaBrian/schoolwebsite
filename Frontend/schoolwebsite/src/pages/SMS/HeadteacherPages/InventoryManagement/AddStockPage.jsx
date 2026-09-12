import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";

const ITEMS_URL = "/inventory/items/";
const STORES_URL = "/inventory/stores/";
const LOCATIONS_URL = "/inventory/locations/";
const ADD_STOCK_URL = "/inventory/stock/add/";

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
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

  return "Unable to add stock. Please check the information and try again.";
};


const AddStockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    item: "",
    destinationType: "store",
    store: "",
    inventory_location: "",
    quantity: "",
    reason: "",
    notes: "",
  });


  // --------------------------------------------------
  // LOAD ACTIVE ITEMS, STORES AND LOCATIONS
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const [
          itemsResponse,
          storesResponse,
          locationsResponse,
        ] = await Promise.all([
          axiosInstance.get(ITEMS_URL, {
            params: {
              is_active: true,
            },
          }),

          axiosInstance.get(STORES_URL, {
            params: {
              is_active: true,
            },
          }),

          axiosInstance.get(LOCATIONS_URL, {
            params: {
              is_active: true,
            },
          }),
        ]);

        const loadedItems = getResults(itemsResponse.data);
        const loadedStores = getResults(storesResponse.data);
        const loadedLocations = getResults(locationsResponse.data);

        setItems(loadedItems);
        setStores(loadedStores);
        setLocations(loadedLocations);

        // --------------------------------------------------
        // Preselect item when arriving from InventoryStockPage
        // --------------------------------------------------
        const params = new URLSearchParams(location.search);
        const itemId = params.get("item");

        if (
          itemId &&
          loadedItems.some(
            (item) =>
              String(item.id) === String(itemId)
          )
        ) {
          setFormData((previous) => ({
            ...previous,
            item: String(itemId),
          }));
        }
      } catch (err) {
        console.error(
          "Error loading inventory data:",
          err
        );

        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [location.search]);


  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  const handleDestinationTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,

      destinationType: type,

      store:
        type === "store"
          ? previous.store
          : "",

      inventory_location:
        type === "location"
          ? previous.inventory_location
          : "",
    }));

    setError("");
    setSuccess("");
  };


  // --------------------------------------------------
  // SELECTED ITEM
  // --------------------------------------------------
  const selectedItem = items.find(
    (item) =>
      String(item.id) ===
      String(formData.item)
  );


  // --------------------------------------------------
  // ITEM DEPARTMENT HELPERS
  //
  // Department and subdepartment now come from
  // the database through the InventoryItem API.
  // --------------------------------------------------
  const getDepartmentName = (item) => {
    return (
      item?.department_display ||
      item?.department?.name ||
      item?.department ||
      "No department"
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


  const getUnitName = (item) => {
    return (
      item?.unit_display ||
      item?.unit ||
      "—"
    );
  };


  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const validateForm = () => {
    if (!formData.item) {
      return "Please select an inventory item.";
    }

    const quantity = Number(formData.quantity);

    if (
      !formData.quantity ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      return "Quantity must be greater than zero.";
    }

    if (
      formData.destinationType === "store" &&
      !formData.store
    ) {
      return "Please select a destination store.";
    }

    if (
      formData.destinationType === "location" &&
      !formData.inventory_location
    ) {
      return "Please select a destination location.";
    }

    if (!formData.reason.trim()) {
      return "Please provide a reason for adding the stock.";
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

    // --------------------------------------------------
    // IMPORTANT:
    //
    // We do NOT send department or subdepartment here.
    //
    // The selected InventoryItem already contains the
    // database-managed Department/SubDepartment.
    //
    // Backend determines them from item_id.
    // --------------------------------------------------
    const payload = {
      item_id: Number(formData.item),
      quantity: Number(formData.quantity),
      reason: formData.reason.trim(),
      notes: formData.notes.trim(),
    };

    // Exactly one destination is sent.
    if (
      formData.destinationType === "store"
    ) {
      payload.store_id =
        Number(formData.store);
    } else {
      payload.inventory_location_id =
        Number(formData.inventory_location);
    }

    setSaving(true);

    try {
      await axiosInstance.post(
        ADD_STOCK_URL,
        payload
      );

      setSuccess(
        "Stock added successfully. The inventory transaction has been recorded."
      );

      setFormData((previous) => ({
        ...previous,
        quantity: "",
        reason: "",
        notes: "",
      }));
    } catch (err) {
      console.error(
        "Error adding stock:",
        err
      );

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


  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        =================================================== */}
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
                Add Stock
              </span>

            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Add Stock
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Record new inventory received into a store or location.
            </p>

          </div>

          <Link
            to="/inventory/stock"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Back to Stock
          </Link>

        </div>


        {/* ==================================================
            SUCCESS
        =================================================== */}
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
                  Stock Added
                </p>

                <p className="mt-0.5">
                  {success}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ==================================================
            ERROR
        =================================================== */}
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
                  Unable to Add Stock
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


            {/* ==================================================
                ITEM INFORMATION
            =================================================== */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">

                <h2 className="text-lg font-bold text-gray-900">
                  Item Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select the inventory item you are adding.
                </p>

              </div>


              <div className="p-5 sm:p-6">

                <label
                  htmlFor="item"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Inventory Item{" "}
                  <span className="text-red-500">
                    *
                  </span>
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

                    const department =
                      getDepartmentName(item);

                    const subdepartment =
                      getSubDepartmentName(item);

                    return (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                        {" — "}
                        {department}

                        {subdepartment
                          ? ` — ${subdepartment}`
                          : ""}
                      </option>
                    );
                  })}

                </select>


                {/* ==================================================
                    SELECTED ITEM DETAILS
                =================================================== */}
                {selectedItem && (
                  <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


                      {/* ITEM */}
                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Item
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.name}
                        </p>

                      </div>


                      {/* DEPARTMENT */}
                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {getDepartmentName(
                            selectedItem
                          )}
                        </p>

                      </div>


                      {/* SUBDEPARTMENT */}
                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Subdepartment
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {getSubDepartmentName(
                            selectedItem
                          ) || "—"}
                        </p>

                      </div>


                      {/* UNIT */}
                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                          Unit
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {getUnitName(
                            selectedItem
                          )}
                        </p>

                      </div>

                    </div>


                    {/* DATABASE NOTICE */}
                    <div className="mt-4 rounded-lg border border-purple-100 bg-white/70 px-3 py-2">

                      <p className="text-xs text-purple-700">
                        <span className="font-semibold">
                          Department assignment:
                        </span>{" "}
                        This item's department and subdepartment
                        are managed centrally and are automatically
                        associated with the stock transaction.
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </section>


            {/* ==================================================
                DESTINATION
            =================================================== */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">

                <h2 className="text-lg font-bold text-gray-900">
                  Destination
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose where the new stock will be stored.
                </p>

              </div>


              <div className="p-5 sm:p-6">


                {/* DESTINATION TYPE */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">


                  {/* STORE */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDestinationTypeChange(
                        "store"
                      )
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      formData.destinationType ===
                      "store"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          formData.destinationType ===
                          "store"
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
                          Main Store, Kitchen Store, etc.
                        </p>

                      </div>

                    </div>

                  </button>


                  {/* LOCATION */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDestinationTypeChange(
                        "location"
                      )
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      formData.destinationType ===
                      "location"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          formData.destinationType ===
                          "location"
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
                          Classroom, office, lab, etc.
                        </p>

                      </div>

                    </div>

                  </button>

                </div>


                {/* STORE */}
                {formData.destinationType ===
                  "store" && (
                  <div>

                    <label
                      htmlFor="store"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Destination Store{" "}
                      <span className="text-red-500">
                        *
                      </span>
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


                    {stores.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active stores are available.
                        Create a store before adding stock.
                      </p>
                    )}

                  </div>
                )}


                {/* INVENTORY LOCATION */}
                {formData.destinationType ===
                  "location" && (
                  <div>

                    <label
                      htmlFor="inventory_location"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Destination Location{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>


                    <select
                      id="inventory_location"
                      name="inventory_location"
                      value={
                        formData.inventory_location
                      }
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >

                      <option value="">
                        Select a location
                      </option>

                      {locations.map(
                        (locationItem) => (
                          <option
                            key={locationItem.id}
                            value={locationItem.id}
                          >
                            {locationItem.name}
                          </option>
                        )
                      )}

                    </select>


                    {locations.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No active inventory locations
                        are available. Create a location
                        before adding stock.
                      </p>
                    )}

                  </div>
                )}


                <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">

                  <strong className="text-gray-700">
                    Important:
                  </strong>{" "}
                  Stock can belong to either a store or
                  a room/area, but not both.

                </div>

              </div>

            </section>


            {/* ==================================================
                QUANTITY
            =================================================== */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">

                <h2 className="text-lg font-bold text-gray-900">
                  Stock Quantity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the amount being added to inventory.
                </p>

              </div>


              <div className="p-5 sm:p-6">

                <div className="max-w-md">

                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Quantity{" "}
                    <span className="text-red-500">
                      *
                    </span>
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-24 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />


                    {selectedItem && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        {getUnitName(
                          selectedItem
                        )}
                      </span>
                    )}

                  </div>


                  {selectedItem && (
                    <p className="mt-2 text-xs text-gray-500">

                      Unit:{" "}

                      <span className="font-medium text-gray-700">
                        {getUnitName(
                          selectedItem
                        )}
                      </span>

                    </p>
                  )}

                </div>

              </div>

            </section>


            {/* ==================================================
                TRANSACTION DETAILS
            =================================================== */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">

                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Provide information explaining why the stock is being added.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">

                {/* REASON */}
                <div>

                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Reason{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>


                  <input
                    id="reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. New purchase, supplier delivery, opening stock"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                </div>


                {/* NOTES */}
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
                    placeholder="Optional additional information about this stock addition..."
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                </div>

              </div>

            </section>


            {/* ==================================================
                AUDIT NOTICE
            =================================================== */}
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
                    The system will automatically record
                    your currently logged in account as the
                    person who performed this transaction.
                    You do not need to select a user.
                  </p>

                </div>

              </div>

            </section>


            {/* ==================================================
                ACTIONS
            =================================================== */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <Link
                to="/inventory/stock"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Cancel
              </Link>


              <button
                type="submit"
                disabled={saving}
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

                    Adding Stock...

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
                        d="M12 5v14M5 12h14"
                      />
                    </svg>

                    Add Stock

                  </>
                )}

              </button>

            </div>

          </div>

        </form>


        {/* ==================================================
            QUICK LINKS
        =================================================== */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <Link
            to="/inventory/stock"
            className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
          >
            View Stock
          </Link>


          <Link
            to="/inventory/stock/remove"
            className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
          >
            Remove Stock
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


export default AddStockPage;

