import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const RECEIPTS_URL = "receipts/";
const DEPARTMENTS_URL = "/receipts/departments/";

const UNITS = [
  ["liters", "Liters"],
  ["kg", "Kg"],
  ["pieces", "Pieces"],
  ["other", "Other"],
];

const emptyForm = {
  item_name: "",
  department: "",
  subdepartment: "",
  quantity: "",
  unit: "",
  unit_price: "",
};

export default function ReceiptItemsPage() {
  const { receiptId } = useParams();

  const [items, setItems] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSubdepartments, setLoadingSubdepartments] =
    useState(false);

  const [error, setError] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [editingItemId, setEditingItemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  // ============================================================
  // FETCH INITIAL DATA
  // ============================================================

  useEffect(() => {
    fetchItems();
    fetchDepartments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId]);

  // ============================================================
  // FETCH ITEMS
  // GET /api/receipts/<receipt_id>/items/add/
  // ============================================================

  async function fetchItems() {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.get(
        `${RECEIPTS_URL}${receiptId}/items/add/`
      );

      const fetchedItems = data?.results ?? data;

      setItems(
        Array.isArray(fetchedItems)
          ? fetchedItems
          : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch receipt items:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      const backendErrors = err.response?.data;

      if (
        backendErrors &&
        typeof backendErrors === "object"
      ) {
        const messages = Object.entries(
          backendErrors
        )
          .map(([field, errors]) => {
            const errorMessages = Array.isArray(
              errors
            )
              ? errors.join(", ")
              : String(errors);

            return `${field}: ${errorMessages}`;
          })
          .join(" | ");

        setError(
          messages ||
            "Failed to load receipt items."
        );
      } else {
        setError(
          "Failed to load receipt items."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FETCH DEPARTMENTS
  // GET /api/departments/
  // ============================================================

  async function fetchDepartments() {
    setLoadingDepartments(true);

    try {
      const { data } = await axiosInstance.get(
        DEPARTMENTS_URL
      );

      const departmentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setDepartments(departmentList);
    } catch (err) {
      console.error(
        "Failed to fetch departments:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  }

  // ============================================================
  // FETCH SUBDEPARTMENTS
  // GET /api/departments/<id>/subdepartments/
  // ============================================================

  async function fetchSubdepartments(
    departmentId,
    preserveSelection = false
  ) {
    if (!departmentId) {
      setSubdepartments([]);

      if (!preserveSelection) {
        setForm((prev) => ({
          ...prev,
          subdepartment: "",
        }));
      }

      return;
    }

    setLoadingSubdepartments(true);

    try {
      const { data } = await axiosInstance.get(
        `${DEPARTMENTS_URL}${departmentId}/subdepartments/`
      );

      const subdepartmentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setSubdepartments(subdepartmentList);

      if (!preserveSelection) {
        setForm((prev) => ({
          ...prev,
          subdepartment: "",
        }));
      }
    } catch (err) {
      console.error(
        "Failed to fetch subdepartments:",
        err
      );

      setSubdepartments([]);

      if (!preserveSelection) {
        setForm((prev) => ({
          ...prev,
          subdepartment: "",
        }));
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load subdepartments."
      );
    } finally {
      setLoadingSubdepartments(false);
    }
  }

  // ============================================================
  // FORM CHANGE
  // ============================================================

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "department") {
      setForm((prev) => ({
        ...prev,
        department: value,
        subdepartment: "",
      }));

      setSubdepartments([]);

      setFieldErrors((prev) => ({
        ...prev,
        department: null,
        subdepartment: null,
      }));

      setError(null);

      if (value) {
        fetchSubdepartments(value);
      }

      return;
    }

    if (name === "subdepartment") {
      setForm((prev) => ({
        ...prev,
        subdepartment: value,
      }));

      if (fieldErrors.subdepartment) {
        setFieldErrors((prev) => ({
          ...prev,
          subdepartment: null,
        }));
      }

      setError(null);

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    if (error) {
      setError(null);
    }
  }

  // ============================================================
  // FORMAT BACKEND ERRORS
  // ============================================================

  function formatBackendErrors(backendErrors) {
    if (!backendErrors) {
      return "Please correct the errors in the form.";
    }

    if (typeof backendErrors === "string") {
      return backendErrors;
    }

    if (backendErrors.detail) {
      return Array.isArray(
        backendErrors.detail
      )
        ? backendErrors.detail.join(", ")
        : String(backendErrors.detail);
    }

    if (
      typeof backendErrors === "object" &&
      Object.keys(backendErrors).length > 0
    ) {
      return Object.entries(backendErrors)
        .map(([field, errors]) => {
          let message;

          if (Array.isArray(errors)) {
            message = errors.join(", ");
          } else if (
            errors &&
            typeof errors === "object"
          ) {
            message = JSON.stringify(errors);
          } else {
            message = String(errors);
          }

          const readableField = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            );

          return `${readableField}: ${message}`;
        })
        .join(" | ");
    }

    return "Please correct the errors in the form.";
  }

  // ============================================================
  // START EDIT
  // ============================================================

  async function startEdit(item) {
    setEditingItemId(item.id);

    const departmentId =
      typeof item.department === "object"
        ? item.department?.id
        : item.department ??
          item.department_id ??
          "";

    const subdepartmentId =
      typeof item.subdepartment === "object"
        ? item.subdepartment?.id
        : item.subdepartment ??
          item.subdepartment_id ??
          "";

    setForm({
      item_name: item.item_name || "",
      department: departmentId || "",
      subdepartment: subdepartmentId || "",
      quantity: item.quantity ?? "",
      unit: item.unit || "",
      unit_price: item.unit_price ?? "",
    });

    setFieldErrors({});
    setError(null);

    /*
     * Load the subdepartments belonging to the selected
     * department while preserving the item's current
     * subdepartment.
     */
    if (departmentId) {
      await fetchSubdepartments(
        departmentId,
        true
      );
    } else {
      setSubdepartments([]);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  function cancelEdit() {
    setEditingItemId(null);
    setForm(emptyForm);
    setSubdepartments([]);
    setFieldErrors({});
    setError(null);
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      item_name: form.item_name,
      department: form.department
        ? Number(form.department)
        : null,
      subdepartment: form.subdepartment
        ? Number(form.subdepartment)
        : null,
      quantity: form.quantity,
      unit: form.unit,
      unit_price: form.unit_price,
    };

    console.log(
      "Submitting receipt item:",
      payload
    );

    try {
      if (editingItemId) {
        // ======================================================
        // PATCH
        // /api/receipts/items/<item_id>/edit/
        // ======================================================

        await axiosInstance.patch(
          `${RECEIPTS_URL}items/${editingItemId}/edit/`,
          payload
        );
      } else {
        // ======================================================
        // POST
        // /api/receipts/<receipt_id>/items/add/
        // ======================================================

        await axiosInstance.post(
          `${RECEIPTS_URL}${receiptId}/items/add/`,
          payload
        );
      }

      setForm(emptyForm);
      setSubdepartments([]);
      setEditingItemId(null);
      setFieldErrors({});
      setError(null);

      await fetchItems();
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "FAILED TO SAVE RECEIPT ITEM"
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Django validation errors:",
        err.response?.data
      );

      console.error(
        "Request payload:",
        payload
      );

      console.error(
        "Request URL:",
        err.config?.url
      );

      console.error(
        "================================="
      );

      if (err.response?.status === 400) {
        const backendErrors =
          err.response?.data || {};

        setFieldErrors(
          backendErrors &&
          typeof backendErrors === "object"
            ? backendErrors
            : {}
        );

        const formattedError =
          formatBackendErrors(
            backendErrors
          );

        setError(formattedError);
      } else if (
        err.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to add or edit receipt items."
        );
      } else if (
        err.response?.status >= 500
      ) {
        setError(
          "The server encountered an error while saving the item. Please try again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to save receipt item."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(
    itemId,
    itemName
  ) {
    const confirmed = window.confirm(
      `Delete "${itemName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await axiosInstance.delete(
        `${RECEIPTS_URL}items/${itemId}/delete/`
      );

      await fetchItems();
    } catch (err) {
      console.error(
        "Failed to delete receipt item:",
        err
      );

      setError(
        err.response?.data?.detail ||
          `Failed to delete "${itemName}".`
      );
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function getDepartmentName(item) {
    return (
      item?.department_display ||
      item?.department?.name ||
      departments.find(
        (department) =>
          Number(department.id) ===
          Number(
            typeof item?.department ===
              "object"
              ? item?.department?.id
              : item?.department
          )
      )?.name ||
      "Unknown department"
    );
  }

  function getSubDepartmentName(item) {
    return (
      item?.subdepartment_display ||
      item?.subdepartment?.name ||
      subdepartments.find(
        (subdepartment) =>
          Number(subdepartment.id) ===
          Number(
            typeof item?.subdepartment ===
              "object"
              ? item?.subdepartment?.id
              : item?.subdepartment
          )
      )?.name ||
      ""
    );
  }

  // ============================================================
  // TOTAL
  // ============================================================

  const itemsTotal = items.reduce(
    (sum, item) =>
      sum + Number(item.total || 0),
    0
  );

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  function formatMoney(value) {
    return Number(value || 0).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14.25l6-6m4.5-3.493V21.75l-7.5-3.75-7.5 3.75V4.757a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 4.757z"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Receipt Items
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Receipt{" "}
                  <span className="font-semibold text-purple-700">
                    {receiptId}
                  </span>
                </p>
              </div>

            </div>

            <p className="text-sm text-gray-500">
              Add, edit and manage the items recorded on this receipt.
            </p>
          </div>

          <Link
            to={`/receipts/${receiptId}`}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>

            Back to Receipt
          </Link>

        </div>

        {/* ============================================================
            ERROR MESSAGE
        ============================================================ */}

        {error && (
          <div className="mb-6 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">

            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                !
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Unable to save receipt item
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {error}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-4 text-xl text-red-600 transition hover:text-red-900"
              aria-label="Close error"
            >
              ×
            </button>

          </div>
        )}

        {/* ============================================================
            ADD / EDIT FORM
        ============================================================ */}

        <form
          onSubmit={handleSubmit}
          className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >

          {/* Form Header */}

          <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  editingItemId
                    ? "bg-gray-200 text-gray-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >

                {editingItemId ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}

              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItemId
                    ? "Edit Item"
                    : "Add Item"}
                </h2>

                <p className="text-sm text-gray-500">
                  {editingItemId
                    ? "Update the details of this receipt item."
                    : "Enter the details of the item purchased."}
                </p>
              </div>

            </div>

          </div>

          {/* Form Body */}

          <div className="p-6">

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* ======================================================
                  ITEM NAME
              ====================================================== */}

              <div>

                <label
                  htmlFor="item_name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Item Name
                </label>

                <input
                  id="item_name"
                  type="text"
                  name="item_name"
                  value={form.item_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Printing paper"
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
                    fieldErrors.item_name
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                />

                {fieldErrors.item_name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.item_name
                    )
                      ? fieldErrors.item_name[0]
                      : fieldErrors.item_name}
                  </p>
                )}

              </div>

              {/* ======================================================
                  DEPARTMENT
              ====================================================== */}

              <div>

                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Department
                </label>

                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  disabled={loadingDepartments}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    fieldErrors.department
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                >

                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : "Select department..."}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    )
                  )}

                </select>

                {fieldErrors.department && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.department
                    )
                      ? fieldErrors.department[0]
                      : fieldErrors.department}
                  </p>
                )}

              </div>

              {/* ======================================================
                  SUBDEPARTMENT
              ====================================================== */}

              <div>

                <label
                  htmlFor="subdepartment"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subdepartment
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <select
                  id="subdepartment"
                  name="subdepartment"
                  value={form.subdepartment}
                  onChange={handleChange}
                  disabled={
                    !form.department ||
                    loadingSubdepartments
                  }
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    fieldErrors.subdepartment
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                >

                  <option value="">
                    {!form.department
                      ? "Select department first..."
                      : loadingSubdepartments
                      ? "Loading subdepartments..."
                      : subdepartments.length > 0
                      ? "Select subdepartment..."
                      : "No subdepartments"}
                  </option>

                  {subdepartments.map(
                    (subdepartment) => (
                      <option
                        key={subdepartment.id}
                        value={subdepartment.id}
                      >
                        {subdepartment.name}
                      </option>
                    )
                  )}

                </select>

                {fieldErrors.subdepartment && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.subdepartment
                    )
                      ? fieldErrors.subdepartment[0]
                      : fieldErrors.subdepartment}
                  </p>
                )}

                {form.department &&
                  !loadingSubdepartments &&
                  subdepartments.length === 0 && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      This department has no subdepartments.
                    </p>
                  )}

              </div>

              {/* ======================================================
                  UNIT
              ====================================================== */}

              <div>

                <label
                  htmlFor="unit"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Unit
                </label>

                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition ${
                    fieldErrors.unit
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                >

                  <option value="">
                    Select unit...
                  </option>

                  {UNITS.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    )
                  )}

                </select>

                {fieldErrors.unit && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.unit
                    )
                      ? fieldErrors.unit[0]
                      : fieldErrors.unit}
                  </p>
                )}

              </div>

              {/* ======================================================
                  QUANTITY
              ====================================================== */}

              <div>

                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
                    fieldErrors.quantity
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  }`}
                />

                {fieldErrors.quantity && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.quantity
                    )
                      ? fieldErrors.quantity[0]
                      : fieldErrors.quantity}
                  </p>
                )}

              </div>

              {/* ======================================================
                  UNIT PRICE
              ====================================================== */}

              <div>

                <label
                  htmlFor="unit_price"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Unit Price
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    KSh
                  </span>

                  <input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    name="unit_price"
                    value={form.unit_price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className={`w-full rounded-lg border bg-white py-2.5 pl-14 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
                      fieldErrors.unit_price
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    }`}
                  />

                </div>

                {fieldErrors.unit_price && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {Array.isArray(
                      fieldErrors.unit_price
                    )
                      ? fieldErrors.unit_price[0]
                      : fieldErrors.unit_price}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* Form Footer */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">

            {editingItemId && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={
                saving ||
                loadingDepartments
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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

                  Saving...
                </>
              ) : editingItemId ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  Save Changes
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">
                    +
                  </span>

                  Add Item
                </>
              )}

            </button>

          </div>

        </form>

        {/* ============================================================
            ITEMS SECTION
        ============================================================ */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Section Header */}

          <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Items on this Receipt
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                All items currently recorded against receipt{" "}
                <span className="font-semibold text-purple-700">
                  {receiptId}
                </span>
              </p>

            </div>

            <div className="rounded-xl bg-purple-50 px-5 py-3 text-right">

              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Receipt Items Total
              </p>

              <p className="mt-1 text-xl font-bold text-purple-800">
                KSh {formatMoney(itemsTotal)}
              </p>

            </div>

          </div>

          {/* ==========================================================
              LOADING
          ========================================================== */}

          {loading && (
            <div className="py-16 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-700"></div>

              <p className="text-sm font-medium text-gray-600">
                Loading items...
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Please wait while we retrieve the receipt items.
              </p>

            </div>
          )}

          {/* ==========================================================
              ITEMS TABLE
          ========================================================== */}

          {!loading && items.length > 0 && (
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Item
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Department
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Quantity
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Unit Price
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      Total
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">

                  {items.map((item) => {

                    const departmentName =
                      getDepartmentName(item);

                    const subdepartmentName =
                      getSubDepartmentName(item);

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-purple-50/40"
                      >

                        {/* Item */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                              {item.item_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "I"}
                            </div>

                            <div>

                              <p className="font-semibold text-gray-900">
                                {item.item_name}
                              </p>

                              <p className="text-xs text-gray-400">
                                Item #{item.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Department */}

                        <td className="px-6 py-4">

                          <div className="flex flex-col gap-1">

                            <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                              {departmentName}
                            </span>

                            {subdepartmentName && (
                              <span className="text-xs font-medium text-purple-600">
                                {subdepartmentName}
                              </span>
                            )}

                          </div>

                        </td>

                        {/* Quantity */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">

                          <span className="font-semibold text-gray-900">
                            {item.quantity}
                          </span>{" "}

                          {item.unit_display ||
                            item.unit}

                        </td>

                        {/* Unit Price */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                          KSh{" "}
                          {formatMoney(
                            item.unit_price
                          )}
                        </td>

                        {/* Total */}

                        <td className="whitespace-nowrap px-6 py-4">

                          <span className="font-bold text-gray-900">
                            KSh{" "}
                            {formatMoney(
                              item.total
                            )}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="whitespace-nowrap px-6 py-4">

                          <div className="flex justify-end gap-2">

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                startEdit(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                            >

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                />
                              </svg>

                              Edit

                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item.id,
                                  item.item_name
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                            >

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                                />
                              </svg>

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

          {/* ==========================================================
              EMPTY STATE
          ========================================================== */}

          {!loading && items.length === 0 && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>

              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No items added yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                This receipt doesn't have any items
                recorded yet. Use the form above to
                add the first item.
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

