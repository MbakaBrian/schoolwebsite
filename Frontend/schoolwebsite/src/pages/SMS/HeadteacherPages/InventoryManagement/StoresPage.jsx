import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

const StoresPage = () => {
  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    long_description: "",
    store_manager: "",
    is_active: true,
  });

  // --------------------------------------------------
  // FETCH STORES
  // --------------------------------------------------

  useEffect(() => {
    fetchStores();
  }, [search, statusFilter]);

  const fetchStores = async () => {
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

      const response = await axiosInstance.get("/inventory/stores/", {
        params,
      });

      const data = response.data;

      setStores(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to fetch stores:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load stores. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setFormData({
      name: "",
      short_description: "",
      long_description: "",
      store_manager: "",
      is_active: true,
    });
  };

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingStore(null);
    resetForm();

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (store) => {
    setEditingStore(store);

    setFormData({
      name: store.name || "",
      short_description: store.short_description || "",
      long_description: store.long_description || "",
      store_manager: store.store_manager || "",
      is_active: store.is_active ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingStore(null);
    resetForm();

    setError("");
  };

  // --------------------------------------------------
  // SAVE STORE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Store name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        short_description: formData.short_description.trim(),
        long_description: formData.long_description.trim(),
        store_manager: formData.store_manager.trim(),
        is_active: formData.is_active,
      };

      if (editingStore) {
        await axiosInstance.patch(
          `/inventory/stores/${editingStore.id}/`,
          payload
        );

        setSuccess("Store updated successfully.");
      } else {
        await axiosInstance.post("/inventory/stores/", payload);

        setSuccess("Store created successfully.");
      }

      setShowModal(false);
      setEditingStore(null);
      resetForm();

      await fetchStores();
    } catch (err) {
      console.error("Failed to save store:", err);

      const responseData = err.response?.data;

      if (responseData) {
        if (typeof responseData === "object") {
          const messages = Object.entries(responseData)
            .map(([field, message]) => {
              const formattedField = field.replaceAll("_", " ");

              const formattedMessage = Array.isArray(message)
                ? message.join(", ")
                : message;

              return `${formattedField}: ${formattedMessage}`;
            })
            .join(" | ");

          setError(messages || "Failed to save store.");
        } else {
          setError(String(responseData));
        }
      } else {
        setError("Failed to save store. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // --------------------------------------------------

  const toggleStoreStatus = async (store) => {
    const action = store.is_active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${store.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axiosInstance.post(
        `/inventory/stores/${store.id}/${action}/`
      );

      setSuccess(
        store.is_active
          ? "Store deactivated successfully."
          : "Store activated successfully."
      );

      await fetchStores();
    } catch (err) {
      console.error(`Failed to ${action} store:`, err);

      setError(
        err.response?.data?.detail ||
          `Failed to ${action} store. Please try again.`
      );
    }
  };

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-52 animate-pulse rounded bg-gray-300" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="mb-6 h-20 animate-pulse rounded-xl bg-white shadow-sm" />

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="h-14 animate-pulse bg-gray-200" />

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse border-t border-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black md:text-3xl">
              Inventory Stores
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage the physical stores used to hold school inventory.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>

            Add Store
          </button>
        </div>

        {/* SUCCESS ALERT */}

        {success && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>

              <span>{success}</span>
            </div>

            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* ERROR ALERT */}

        {error && !showModal && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
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
                  d="M12 8v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 001.73-2.64l-7.82-13.5A2 2 0 0010.29 3.86z"
                />
              </svg>

              <span>{error}</span>
            </div>

            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* FILTERS */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search Stores
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by store name..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Stores</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {(search || statusFilter !== "all") && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-purple-700 hover:text-purple-900"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* STORE COUNT */}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-black">
              {stores.length}
            </span>{" "}
            {stores.length === 1 ? "store" : "stores"}
          </p>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
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

              Updating...
            </div>
          )}
        </div>

        {/* EMPTY STATE */}

        {!loading && stores.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            </div>

            <h3 className="mt-4 text-lg font-semibold text-black">
              No stores found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "No stores match your current filters."
                : "You have not created any inventory stores yet."}
            </p>

            {search || statusFilter !== "all" ? (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800"
              >
                Add Your First Store
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Store
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Description
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Store Manager
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {stores.map((store) => (
                      <tr
                        key={store.id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* STORE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
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
                                  d="M3 10h18M5 10v10h14V10M4 10l8-7 8 7M9 20v-6h6v6"
                                />
                              </svg>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-black">
                                {store.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                Store #{store.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-md px-5 py-4">
                          <p className="truncate text-sm text-gray-600">
                            {store.short_description ||
                              store.long_description ||
                              "No description"}
                          </p>
                        </td>

                        {/* STORE MANAGER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                              {store.store_manager
                                ? store.store_manager
                                    .charAt(0)
                                    .toUpperCase()
                                : "N"}
                            </div>

                            <span className="text-sm text-gray-700">
                              {store.store_manager || "Not assigned"}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {store.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(store)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleStoreStatus(store)}
                              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                                store.is_active
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                              }`}
                            >
                              {store.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-4 md:hidden">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
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
                            d="M3 10h18M5 10v10h14V10M4 10l8-7 8 7M9 20v-6h6v6"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          {store.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Store #{store.id}
                        </p>
                      </div>
                    </div>

                    {store.is_active ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Description
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {store.short_description ||
                          store.long_description ||
                          "No description"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Store Manager
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {store.store_manager || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openEditModal(store)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStoreStatus(store)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        store.is_active
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                      }`}
                    >
                      {store.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 md:px-6">
              <div>
                <h2 className="text-xl font-bold text-black">
                  {editingStore ? "Edit Store" : "Add Store"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingStore
                    ? "Update the store information below."
                    : "Create a new physical inventory store."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* MODAL BODY */}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-5 py-6 md:px-6">

                {/* MODAL ERROR */}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* STORE NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Store Name{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Main Store"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* SHORT DESCRIPTION */}

                <div>
                  <label
                    htmlFor="short_description"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Short Description
                  </label>

                  <input
                    id="short_description"
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    placeholder="Brief description of the store"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* LONG DESCRIPTION */}

                <div>
                  <label
                    htmlFor="long_description"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Detailed Description
                  </label>

                  <textarea
                    id="long_description"
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add any additional information about this store..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* STORE MANAGER */}

                <div>
                  <label
                    htmlFor="store_manager"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Store Manager
                  </label>

                  <input
                    id="store_manager"
                    type="text"
                    name="store_manager"
                    value={formData.store_manager}
                    onChange={handleChange}
                    placeholder="e.g. John Kamau"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the name of the person responsible for this store.
                    Staff selection will be added later.
                  </p>
                </div>

                {/* ACTIVE STATUS */}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
                    />

                    <div>
                      <p className="text-sm font-medium text-black">
                        Active Store
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Active stores can be used for inventory transactions.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
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
                  )}

                  {saving
                    ? "Saving..."
                    : editingStore
                    ? "Update Store"
                    : "Create Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;