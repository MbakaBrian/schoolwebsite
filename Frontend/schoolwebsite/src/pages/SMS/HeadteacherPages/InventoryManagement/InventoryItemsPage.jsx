import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

const ITEMS_URL = "/inventory/items/";
const DEPARTMENTS_URL = "/receipts/departments/";

// --------------------------------------------------
// UNITS
// These values should match the backend choices.
// --------------------------------------------------

const UNITS = [
  { value: "liters", label: "Liters" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "pieces", label: "Pieces" },
  { value: "other", label: "Other" },
];

export default function InventoryItemsPage() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSubdepartments, setLoadingSubdepartments] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    subdepartment: "",
    unit: "",
    description: "",
    is_active: true,
  });

  // --------------------------------------------------
  // FETCH DEPARTMENTS
  // --------------------------------------------------

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);

      const response = await axiosInstance.get(DEPARTMENTS_URL);

      const data = response.data;

      if (Array.isArray(data)) {
        setDepartments(data);
      } else if (Array.isArray(data.results)) {
        setDepartments(data.results);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load departments. Please try again."
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  // --------------------------------------------------
  // FETCH ITEMS
  // --------------------------------------------------

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "all") {
        params.is_active = statusFilter === "active";
      }

      if (departmentFilter !== "all") {
        params.department = departmentFilter;
      }

      const response = await axiosInstance.get(ITEMS_URL, {
        params,
      });

      const data = response.data;

      // Supports both paginated and non-paginated DRF responses.
      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data.results)) {
        setItems(data.results);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load inventory items. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [statusFilter, departmentFilter]);

  // --------------------------------------------------
  // FETCH SUBDEPARTMENTS
  // --------------------------------------------------

  const fetchSubdepartments = async (departmentId) => {
    if (!departmentId) {
      setSubdepartments([]);
      return;
    }

    try {
      setLoadingSubdepartments(true);

      const response = await axiosInstance.get(
        `${DEPARTMENTS_URL}${departmentId}/subdepartments/`
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setSubdepartments(data);
      } else if (Array.isArray(data.results)) {
        setSubdepartments(data.results);
      } else {
        setSubdepartments([]);
      }
    } catch (err) {
      console.error(
        "Failed to fetch subdepartments:",
        err
      );

      setSubdepartments([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load subdepartments."
      );
    } finally {
      setLoadingSubdepartments(false);
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      subdepartment: "",
      unit: "",
      description: "",
      is_active: true,
    });

    setSubdepartments([]);
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = async (item) => {
    const departmentId =
      item.department ??
      item.department_id ??
      item.department?.id ??
      "";

    const subdepartmentId =
      item.subdepartment ??
      item.subdepartment_id ??
      item.subdepartment?.id ??
      "";

    setEditingItem(item);

    setFormData({
      name: item.name || "",
      department: departmentId,
      subdepartment: subdepartmentId || "",
      unit: item.unit || "",
      description: item.description || "",
      is_active: item.is_active ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);

    // Load subdepartments for the selected department.
    if (departmentId) {
      await fetchSubdepartments(departmentId);
    }
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        subdepartment: "",
      }));

      await fetchSubdepartments(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // SAVE ITEM
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Item name is required.");
      return;
    }

    if (!formData.department) {
      setError("Please select a department.");
      return;
    }

    if (!formData.unit) {
      setError("Please select a unit.");
      return;
    }

    // --------------------------------------------------
    // Validate subdepartment relationship
    // --------------------------------------------------

    if (formData.subdepartment) {
      const selectedSubdepartment = subdepartments.find(
        (sub) =>
          String(sub.id) ===
          String(formData.subdepartment)
      );

      if (!selectedSubdepartment) {
        setError(
          "The selected subdepartment is not valid for this department."
        );
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),

        // Department is now a database FK.
        department: Number(formData.department),

        // Optional FK.
        subdepartment: formData.subdepartment
          ? Number(formData.subdepartment)
          : null,

        unit: formData.unit,

        description: formData.description.trim(),

        is_active: formData.is_active,
      };

      if (editingItem) {
        await axiosInstance.put(
          `${ITEMS_URL}${editingItem.id}/`,
          payload
        );

        setSuccess(
          "Inventory item updated successfully."
        );
      } else {
        await axiosInstance.post(
          ITEMS_URL,
          payload
        );

        setSuccess(
          "Inventory item created successfully."
        );
      }

      setShowModal(false);
      resetForm();

      await fetchItems();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save inventory item:",
        err
      );

      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError = Object.values(responseData)
          .flat()
          .filter(Boolean)[0];

        setError(
          firstError ||
            "Failed to save inventory item. Please check the form."
        );
      } else {
        setError(
          "Failed to save inventory item. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // --------------------------------------------------

  const handleToggleStatus = async (item) => {
    const action = item.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axiosInstance.post(
        `${ITEMS_URL}${item.id}/${action}/`
      );

      setSuccess(
        `Item "${item.name}" ${
          action === "activate"
            ? "activated"
            : "deactivated"
        } successfully.`
      );

      await fetchItems();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        `Failed to ${action} item:`,
        err
      );

      setError(
        err.response?.data?.detail ||
          `Failed to ${action} the item. Please try again.`
      );
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getDepartmentLabel = (item) => {
    if (item.department_display) {
      return item.department_display;
    }

    if (
      item.department &&
      typeof item.department === "object"
    ) {
      return item.department.name || "—";
    }

    const department = departments.find(
      (dept) =>
        String(dept.id) ===
        String(item.department)
    );

    return (
      department?.name ||
      item.department ||
      "—"
    );
  };

  const getSubDepartmentLabel = (item) => {
    if (item.subdepartment_display) {
      return item.subdepartment_display;
    }

    if (
      item.subdepartment &&
      typeof item.subdepartment === "object"
    ) {
      return item.subdepartment.name || "";
    }

    if (!item.subdepartment) {
      return "";
    }

    // Try to find it in the currently loaded departments.
    for (const department of departments) {
      const found = department.subdepartments?.find(
        (sub) =>
          String(sub.id) ===
          String(item.subdepartment)
      );

      if (found) {
        return found.name;
      }
    }

    return "";
  };

  const getUnitLabel = (item) => {
    if (item.unit_display) {
      return item.unit_display;
    }

    const unit = UNITS.find(
      (unitOption) =>
        unitOption.value === item.unit
    );

    return unit?.label || item.unit || "—";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-KE",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* --------------------------------------------------
            PAGE HEADER
        -------------------------------------------------- */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                Inventory Items
              </h1>
            </div>

            <p className="text-sm text-gray-500">
              Manage the items that are tracked
              throughout the school.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>

            Add Item
          </button>
        </div>

        {/* --------------------------------------------------
            SUCCESS MESSAGE
        -------------------------------------------------- */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
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
                d="M5 13l4 4L19 7"
              />
            </svg>

            <span>{success}</span>
          </div>
        )}

        {/* --------------------------------------------------
            ERROR MESSAGE
        -------------------------------------------------- */}

        {error && !showModal && (
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
                d="M12 8v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}

        {/* --------------------------------------------------
            FILTERS
        -------------------------------------------------- */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="lg:col-span-1"
            >
              <label
                htmlFor="item-search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search Items
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
                    id="item-search"
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search items..."
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
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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

            {/* Status */}
            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">
                  All Items
                </option>
                <option value="active">
                  Active Only
                </option>
                <option value="inactive">
                  Inactive Only
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            ITEMS TABLE
        -------------------------------------------------- */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Desktop */}
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
                    SubDepartment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Unit
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                        Loading inventory items...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                        No inventory items found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {search ||
                        departmentFilter !==
                          "all"
                          ? "Try adjusting your filters."
                          : "Create your first inventory item to get started."}
                      </p>

                      {!search &&
                        departmentFilter ===
                          "all" && (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-4 text-sm font-semibold text-purple-700 hover:text-purple-800"
                          >
                            + Add Item
                          </button>
                        )}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
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

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>

                            {item.description && (
                              <p className="max-w-xs truncate text-xs text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                          {getDepartmentLabel(
                            item
                          )}
                        </span>
                      </td>

                      {/* SubDepartment */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {getSubDepartmentLabel(
                          item
                        ) ? (
                          <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                            {
                              getSubDepartmentLabel(
                                item
                              )
                            }
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {getUnitLabel(item)}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(
                          item.created_at
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                item
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              item.is_active
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {item.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
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
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                Loading inventory items...
              </div>
            ) : items.length === 0 ? (
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
                  No inventory items found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {search ||
                  departmentFilter !==
                    "all"
                    ? "Try adjusting your filters."
                    : "Add your first inventory item."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
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
                            {item.name}
                          </h3>

                          <p className="text-xs text-gray-500">
                            Item #{item.id}
                          </p>
                        </div>
                      </div>

                      {item.is_active ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {getDepartmentLabel(
                            item
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          SubDepartment
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {getSubDepartmentLabel(
                            item
                          ) || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Unit
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {getUnitLabel(item)}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div className="mt-3 rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Description
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="mt-3 text-xs text-gray-500">
                      Created{" "}
                      {formatDate(
                        item.created_at
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(item)
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(item)
                        }
                        className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                          item.is_active
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "border border-green-200 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {item.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Count */}
        {!loading && items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {items.length}
            </span>{" "}
            item
            {items.length === 1
              ? ""
              : "s"}
            .
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          ADD / EDIT MODAL
      -------------------------------------------------- */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItem
                    ? "Edit Inventory Item"
                    : "Add Inventory Item"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {editingItem
                    ? "Update the details of this inventory item."
                    : "Create an item that can be tracked across stores and locations."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
              >
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
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-5 py-6 sm:px-6">

                {/* Modal Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
                        d="M12 8v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                      />
                    </svg>

                    <span>{error}</span>
                  </div>
                )}

                {/* Item Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Item Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Printer Paper A4"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the common name of the inventory item.
                  </p>
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Department
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={loadingDepartments}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select department"}
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

                  <p className="mt-1.5 text-xs text-gray-500">
                    Departments are managed centrally by the school.
                  </p>
                </div>

                {/* SubDepartment */}
                <div>
                  <label
                    htmlFor="subdepartment"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    SubDepartment
                  </label>

                  <select
                    id="subdepartment"
                    name="subdepartment"
                    value={formData.subdepartment}
                    onChange={handleChange}
                    disabled={
                      !formData.department ||
                      loadingSubdepartments
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">
                      {!formData.department
                        ? "Select a department first"
                        : loadingSubdepartments
                        ? "Loading subdepartments..."
                        : subdepartments.length ===
                          0
                        ? "No subdepartments"
                        : "Select subdepartment"}
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

                  <p className="mt-1.5 text-xs text-gray-500">
                    Optional. Only subdepartments belonging to the selected department are shown.
                  </p>
                </div>

                {/* Unit */}
                <div>
                  <label
                    htmlFor="unit"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Unit
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">
                      Select unit
                    </option>

                    {UNITS.map((unit) => (
                      <option
                        key={unit.value}
                        value={unit.value}
                      >
                        {unit.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-gray-500">
                    This determines how the quantity of this item is recorded.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="e.g. Standard A4 printing paper used by the administration office."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Optional. Add additional information about the item.
                  </p>
                </div>

                {/* Active Status */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        Active Item
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-500">
                        Active items can be used in stock transactions.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingDepartments
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Update Item"
                    : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}