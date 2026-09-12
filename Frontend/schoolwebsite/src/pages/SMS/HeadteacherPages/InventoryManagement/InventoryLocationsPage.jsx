import { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

const LOCATIONS_URL = "/inventory/locations/";

export default function InventoryLocationsPage() {
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // --------------------------------------------------
  // FETCH LOCATIONS
  // --------------------------------------------------

  const fetchLocations = async () => {
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

      const response = await axiosInstance.get(LOCATIONS_URL, {
        params,
      });

      const data = response.data;

      // Supports both normal DRF pagination
      // and non-paginated responses
      if (Array.isArray(data)) {
        setLocations(data);
      } else if (Array.isArray(data.results)) {
        setLocations(data.results);
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error("Failed to fetch inventory locations:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load inventory locations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [statusFilter]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });

    setEditingLocation(null);
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);

    setFormData({
      name: location.name || "",
      description: location.description || "",
      is_active: location.is_active ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // SAVE LOCATION
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Location name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
      };

      if (editingLocation) {
        await axiosInstance.patch(
          `${LOCATIONS_URL}${editingLocation.id}/`,
          payload
        );

        setSuccess("Inventory location updated successfully.");
      } else {
        await axiosInstance.post(LOCATIONS_URL, payload);

        setSuccess("Inventory location created successfully.");
      }

      setShowModal(false);
      resetForm();

      await fetchLocations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save inventory location:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        let firstError = "";

        for (const value of Object.values(responseData)) {
          if (Array.isArray(value) && value.length > 0) {
            firstError = String(value[0]);
            break;
          }

          if (typeof value === "string") {
            firstError = value;
            break;
          }
        }

        setError(
          firstError ||
            "Failed to save inventory location. Please check the form."
        );
      } else {
        setError(
          "Failed to save inventory location. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // --------------------------------------------------

  const handleToggleStatus = async (location) => {
    const action = location.is_active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${location.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axiosInstance.post(
        `${LOCATIONS_URL}${location.id}/${action}/`
      );

      setSuccess(
        `Location "${location.name}" ${
          action === "activate" ? "activated" : "deactivated"
        } successfully.`
      );

      await fetchLocations();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(`Failed to ${action} location:`, err);

      setError(
        err.response?.data?.detail ||
          `Failed to ${action} the location. Please try again.`
      );
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
                    d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Inventory Locations
              </h1>
            </div>

            <p className="text-sm text-gray-500">
              Manage rooms, offices, classrooms and other inventory locations.
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

            Add Location
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex-1"
            >
              <label
                htmlFor="location-search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search Locations
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
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
                    id="location-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by location name..."
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Status Filter */}
            <div className="w-full lg:w-52">
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Locations</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            LOCATION LIST
        -------------------------------------------------- */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
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
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                        Loading locations...
                      </div>
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
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
                            d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        No locations found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Try adjusting your search."
                          : "Create your first inventory location to get started."}
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="mt-4 text-sm font-semibold text-purple-700 hover:text-purple-800"
                        >
                          + Add Location
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr
                      key={location.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Location */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
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
                                d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {location.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              Location #{location.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="max-w-md px-6 py-4">
                        <p className="truncate text-sm text-gray-600">
                          {location.description || "No description"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {location.is_active ? (
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
                        {formatDate(location.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(location)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(location)
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              location.is_active
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {location.is_active
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

          {/* Mobile Cards */}
          <div className="md:hidden">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-purple-700" />
                Loading locations...
              </div>
            ) : locations.length === 0 ? (
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
                      d="M17.657 16.657L13.414 21a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 016 0 3 3 0 01-6 0z"
                    />
                  </svg>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                  No locations found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try adjusting your search."
                    : "Add your first inventory location."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
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
                              d="M17.657 16.657L13.414 21a2 2 0 01-2.828 0l-4.243-4.343a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {location.name}
                          </h3>

                          <p className="text-xs text-gray-500">
                            Location #{location.id}
                          </p>
                        </div>
                      </div>

                      {location.is_active ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Description
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {location.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Created {formatDate(location.created_at)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(location)}
                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(location)
                        }
                        className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                          location.is_active
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "border border-green-200 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {location.is_active
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

        {/* --------------------------------------------------
            LOCATION COUNT
        -------------------------------------------------- */}

        {!loading && locations.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {locations.length}
            </span>{" "}
            location{locations.length === 1 ? "" : "s"}.
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          ADD / EDIT MODAL
      -------------------------------------------------- */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingLocation
                    ? "Edit Inventory Location"
                    : "Add Inventory Location"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {editingLocation
                    ? "Update the details of this inventory location."
                    : "Create a new room or area where inventory can be stored."}
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

            {/* Modal Body */}
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

                {/* Location Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Location Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Computer Lab"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the name of the room, office, classroom or area.
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
                    placeholder="e.g. Room used for storing ICT equipment and computers."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Optional. Add useful information about this location.
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
                        Active Location
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-500">
                        Active locations can be used when recording inventory
                        stock.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
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
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingLocation
                    ? "Update Location"
                    : "Create Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}