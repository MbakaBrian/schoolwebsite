import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const ClassLevelsPage = () => {
  const [classLevels, setClassLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ==================================================
  // FETCH CLASS LEVELS
  // ==================================================

  useEffect(() => {
    fetchClassLevels();
  }, []);

  const fetchClassLevels = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axiosInstance.get(
        "/academics/class-levels/"
      );

      const data = response.data;

      // Support both paginated and non-paginated responses.
      const levels = Array.isArray(data)
        ? data
        : data?.results || [];

      setClassLevels(levels);
    } catch (err) {
      console.error(
        "Failed to fetch class levels:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load class levels. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // FILTERING
  // ==================================================

  const filteredClassLevels = useMemo(() => {
    return classLevels
      .filter((level) => {
        if (statusFilter === "active") {
          return level.is_active === true;
        }

        if (statusFilter === "inactive") {
          return level.is_active === false;
        }

        return true;
      })
      .filter((level) => {
        if (!search.trim()) {
          return true;
        }

        const query = search
          .trim()
          .toLowerCase();

        return (
          level.name
            ?.toLowerCase()
            .includes(query) ||
          level.code
            ?.toLowerCase()
            .includes(query) ||
          level.description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const orderA =
          Number(a.display_order) || 0;

        const orderB =
          Number(b.display_order) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return (a.name || "").localeCompare(
          b.name || ""
        );
      });
  }, [
    classLevels,
    search,
    statusFilter,
  ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalLevels = classLevels.length;

  const activeLevels = classLevels.filter(
    (level) => level.is_active === true
  ).length;

  const inactiveLevels = classLevels.filter(
    (level) => level.is_active === false
  ).length;

  const totalStreams = classLevels.reduce(
    (total, level) =>
      total +
      (Number(level.streams_count) || 0),
    0
  );

  // ==================================================
  // HELPERS
  // ==================================================

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        Inactive
      </span>
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />

        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <Link
                to="/academics"
                className="text-sm font-medium text-gray-500 hover:text-green-700"
              >
                Academics
              </Link>

              <span className="text-gray-400">
                /
              </span>

              <span className="text-sm font-medium text-gray-700">
                Class Levels
              </span>

            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Class Levels
            </h1>

            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Manage the school's grade and class-level
              structure.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                fetchClassLevels(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              to="/academics/classes/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add Class Level
            </Link>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchClassLevels()
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Class Levels
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalLevels}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🎓
              </div>

            </div>

          </div>

          {/* Active */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Levels
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {activeLevels}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                ✓
              </div>

            </div>

          </div>

          {/* Inactive */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Levels
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-600">
                  {inactiveLevels}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                ○
              </div>

            </div>

          </div>

          {/* Streams */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Streams
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {totalStreams}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                🏫
              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

            {/* Search */}

            <div>

              <label
                htmlFor="class-level-search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  id="class-level-search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by class name, code or description..."
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>

            {/* Status */}

            <div className="min-w-[180px]">

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
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="all">
                  All Levels
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

        {/* ==================================================
            RESULTS HEADER
        ================================================== */}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Class Levels
            </h2>

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredClassLevels.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {classLevels.length}
              </span>{" "}
              class levels
            </p>

          </div>

          {(search ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="self-start text-sm font-semibold text-green-700 hover:text-green-800 sm:self-auto"
            >
              Clear filters
            </button>
          )}

        </div>

        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    #
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class Level
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Streams
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredClassLevels.length === 0 ? (
                  <tr>

                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center"
                    >

                      <div className="text-4xl">
                        🎓
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-gray-900">
                        No class levels found
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        {search ||
                        statusFilter !==
                          "all"
                          ? "Try changing your search or filters."
                          : "Create your first class level to begin setting up the school's academic structure."}
                      </p>

                      {!search &&
                        statusFilter ===
                          "all" && (
                          <Link
                            to="/academics/classes/new"
                            className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Add Class Level
                          </Link>
                        )}

                    </td>

                  </tr>
                ) : (
                  filteredClassLevels.map(
                    (level, index) => (
                      <tr
                        key={level.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">

                          <div>

                            <Link
                              to={`/academics/classes/${level.id}`}
                              className="font-semibold text-gray-900 hover:text-green-700"
                            >
                              {level.name}
                            </Link>

                            {level.description && (
                              <p className="mt-1 max-w-md truncate text-xs text-gray-500">
                                {level.description}
                              </p>
                            )}

                          </div>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4">

                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                            {level.code ||
                              "—"}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">

                          <span className="font-semibold text-gray-900">
                            {Number(
                              level.streams_count
                            ) || 0}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-600">
                          {level.display_order ??
                            "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          {getStatusBadge(
                            level.is_active
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">

                          <div className="flex justify-end gap-2">

                            <Link
                              to={`/academics/classes/${level.id}`}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </Link>

                            <Link
                              to={`/academics/classes/${level.id}/edit`}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Edit
                            </Link>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ==================================================
            MOBILE CARDS
        ================================================== */}

        <div className="mt-4 space-y-4 md:hidden">

          {filteredClassLevels.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">

              <div className="text-4xl">
                🎓
              </div>

              <h3 className="mt-3 font-semibold text-gray-900">
                No class levels found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search ||
                statusFilter !==
                  "all"
                  ? "Try changing your search or filters."
                  : "Create your first class level to begin."}
              </p>

              {!search &&
                statusFilter ===
                  "all" && (
                <Link
                  to="/academics/classes/new"
                  className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Add Class Level
                </Link>
              )}

            </div>
          ) : (
            filteredClassLevels.map(
              (level, index) => (
                <div
                  key={level.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <Link
                          to={`/academics/classes/${level.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-green-700"
                        >
                          {level.name}
                        </Link>

                        {getStatusBadge(
                          level.is_active
                        )}

                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        {level.code && (
                          <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                            {level.code}
                          </span>
                        )}

                        <span className="text-xs text-gray-500">
                          Order:{" "}
                          {level.display_order ??
                            "—"}
                        </span>

                      </div>

                    </div>

                    <span className="text-xs font-medium text-gray-400">
                      #{index + 1}
                    </span>

                  </div>

                  {level.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {level.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-purple-50 p-3">

                      <p className="text-xs font-medium text-purple-600">
                        Streams
                      </p>

                      <p className="mt-1 text-xl font-bold text-purple-800">
                        {Number(
                          level.streams_count
                        ) || 0}
                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-medium text-gray-500">
                        Display Order
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-800">
                        {level.display_order ??
                          "—"}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <Link
                      to={`/academics/classes/${level.id}`}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </Link>

                    <Link
                      to={`/academics/classes/${level.id}/edit`}
                      className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Edit
                    </Link>

                  </div>

                </div>
              )
            )
          )}

        </div>

      </div>
    </div>
  );
};

export default ClassLevelsPage;

