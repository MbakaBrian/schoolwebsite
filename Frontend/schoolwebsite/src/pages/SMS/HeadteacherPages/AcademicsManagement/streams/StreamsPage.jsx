import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const StreamsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [streams, setStreams] = useState([]);
  const [classLevels, setClassLevels] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [classLevelFilter, setClassLevelFilter] =
    useState(
      searchParams.get("class_level") || ""
    );

  const [statusFilter, setStatusFilter] =
    useState(
      searchParams.get("status") || "all"
    );

  // ==================================================
  // FETCH DATA
  // ==================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        streamsResponse,
        classLevelsResponse,
      ] = await Promise.all([
        axiosInstance.get(
          "/academics/streams/"
        ),
        axiosInstance.get(
          "/academics/class-levels/"
        ),
      ]);

      const streamsData =
        streamsResponse.data;

      const classLevelsData =
        classLevelsResponse.data;

      setStreams(
        Array.isArray(streamsData)
          ? streamsData
          : streamsData?.results || []
      );

      setClassLevels(
        Array.isArray(classLevelsData)
          ? classLevelsData
          : classLevelsData?.results || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch streams:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load streams. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // FILTER URL
  // ==================================================

  useEffect(() => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (classLevelFilter) {
      params.class_level =
        classLevelFilter;
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    setSearchParams(params, {
      replace: true,
    });
  }, [
    search,
    classLevelFilter,
    statusFilter,
    setSearchParams,
  ]);

  // ==================================================
  // CLASS LEVEL NAME
  // ==================================================

  const getClassLevelName = (
    stream
  ) => {
    if (
      stream.class_level &&
      typeof stream.class_level ===
        "object"
    ) {
      return (
        stream.class_level.name ||
        "Unknown Class Level"
      );
    }

    if (
      stream.class_level_name
    ) {
      return stream.class_level_name;
    }

    if (
      stream.class_level_code
    ) {
      return stream.class_level_code;
    }

    const classLevelId =
      stream.class_level;

    if (classLevelId) {
      const level =
        classLevels.find(
          (item) =>
            String(item.id) ===
            String(classLevelId)
        );

      return (
        level?.name ||
        "Unknown Class Level"
      );
    }

    return "Not assigned";
  };

  const getClassLevelId = (
    stream
  ) => {
    if (
      stream.class_level &&
      typeof stream.class_level ===
        "object"
    ) {
      return stream.class_level.id;
    }

    return stream.class_level;
  };

  // ==================================================
  // FILTERING
  // ==================================================

  const filteredStreams = useMemo(() => {
    return streams
      .filter((stream) => {
        if (!classLevelFilter) {
          return true;
        }

        const streamClassLevelId =
          getClassLevelId(stream);

        return (
          String(streamClassLevelId) ===
          String(classLevelFilter)
        );
      })
      .filter((stream) => {
        if (statusFilter === "active") {
          return stream.is_active === true;
        }

        if (statusFilter === "inactive") {
          return stream.is_active === false;
        }

        return true;
      })
      .filter((stream) => {
        if (!search.trim()) {
          return true;
        }

        const query =
          search.trim().toLowerCase();

        const classLevelName =
          getClassLevelName(stream);

        return (
          stream.name
            ?.toLowerCase()
            .includes(query) ||
          stream.code
            ?.toLowerCase()
            .includes(query) ||
          classLevelName
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const classA =
          getClassLevelName(a);

        const classB =
          getClassLevelName(b);

        const classComparison =
          classA.localeCompare(classB);

        if (classComparison !== 0) {
          return classComparison;
        }

        return (a.name || "").localeCompare(
          b.name || ""
        );
      });
  }, [
    streams,
    classLevels,
    search,
    classLevelFilter,
    statusFilter,
  ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalStreams =
    streams.length;

  const activeStreams =
    streams.filter(
      (stream) =>
        stream.is_active === true
    ).length;

  const inactiveStreams =
    streams.filter(
      (stream) =>
        stream.is_active === false
    ).length;

  const classLevelsWithStreams =
    new Set(
      streams
        .map((stream) =>
          getClassLevelId(stream)
        )
        .filter(Boolean)
        .map((id) => String(id))
    ).size;

  // ==================================================
  // HELPERS
  // ==================================================

  const getStatusBadge = (
    isActive
  ) => {
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
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              )
            )}
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
                Streams
              </span>

            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Streams
            </h1>

            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Manage streams and organize them
              under their respective class levels.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                fetchData(true)
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
              to="/academics/streams/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add Stream
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
                fetchData()
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
                  Total Streams
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalStreams}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                🏫
              </div>

            </div>

          </div>

          {/* Active */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Active Streams
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {activeStreams}
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
                  Inactive Streams
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-600">
                  {inactiveStreams}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                ○
              </div>

            </div>

          </div>

          {/* Class Levels */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Class Levels Used
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {classLevelsWithStreams}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🎓
              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Search */}

            <div className="lg:col-span-1">

              <label
                htmlFor="stream-search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  id="stream-search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search stream or class..."
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>

            {/* Class Level */}

            <div>

              <label
                htmlFor="class-level-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Class Level
              </label>

              <select
                id="class-level-filter"
                value={
                  classLevelFilter
                }
                onChange={(e) =>
                  setClassLevelFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >

                <option value="">
                  All Class Levels
                </option>

                {classLevels
                  .slice()
                  .sort(
                    (a, b) =>
                      (Number(
                        a.display_order
                      ) || 0) -
                      (Number(
                        b.display_order
                      ) || 0)
                  )
                  .map(
                    (level) => (
                      <option
                        key={level.id}
                        value={level.id}
                      >
                        {level.name}
                      </option>
                    )
                  )}

              </select>

            </div>

            {/* Status */}

            <div>

              <label
                htmlFor="stream-status-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="stream-status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >

                <option value="all">
                  All Streams
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
              Stream List
            </h2>

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredStreams.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {streams.length}
              </span>{" "}
              streams
            </p>

          </div>

          {(search ||
            classLevelFilter ||
            statusFilter !==
              "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setClassLevelFilter(
                  ""
                );
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
                    Stream
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Class Level
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
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

                {filteredStreams.length ===
                0 ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >

                      <div className="text-4xl">
                        🏫
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-gray-900">
                        No streams found
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        {search ||
                        classLevelFilter ||
                        statusFilter !==
                          "all"
                          ? "Try changing your search or filters."
                          : "Create your first stream to start organizing students into classes."}
                      </p>

                      {!search &&
                        !classLevelFilter &&
                        statusFilter ===
                          "all" && (
                          <Link
                            to="/academics/streams/new"
                            className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Add Stream
                          </Link>
                        )}

                    </td>

                  </tr>
                ) : (
                  filteredStreams.map(
                    (stream, index) => (
                      <tr
                        key={stream.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">

                          <Link
                            to={`/academics/streams/${stream.id}`}
                            className="font-semibold text-gray-900 hover:text-green-700"
                          >
                            {stream.name}
                          </Link>

                        </td>

                        <td className="px-6 py-4">

                          <Link
                            to={`/academics/classes/${getClassLevelId(stream)}`}
                            className="font-medium text-gray-700 hover:text-green-700"
                          >
                            {getClassLevelName(
                              stream
                            )}
                          </Link>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">

                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                            {stream.code ||
                              "—"}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          {getStatusBadge(
                            stream.is_active
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">

                          <div className="flex justify-end gap-2">

                            <Link
                              to={`/academics/streams/${stream.id}`}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </Link>

                            <Link
                              to={`/academics/streams/${stream.id}/edit`}
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

          {filteredStreams.length ===
          0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">

              <div className="text-4xl">
                🏫
              </div>

              <h3 className="mt-3 font-semibold text-gray-900">
                No streams found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search ||
                classLevelFilter ||
                statusFilter !==
                  "all"
                  ? "Try changing your search or filters."
                  : "Create your first stream to begin."}
              </p>

              {!search &&
                !classLevelFilter &&
                statusFilter ===
                  "all" && (
                <Link
                  to="/academics/streams/new"
                  className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Add Stream
                </Link>
              )}

            </div>
          ) : (
            filteredStreams.map(
              (stream, index) => (
                <div
                  key={stream.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <Link
                          to={`/academics/streams/${stream.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-green-700"
                        >
                          {stream.name}
                        </Link>

                        {getStatusBadge(
                          stream.is_active
                        )}

                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {getClassLevelName(
                          stream
                        )}
                      </p>

                    </div>

                    <span className="text-xs font-medium text-gray-400">
                      #{index + 1}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-medium text-gray-500">
                        Stream Code
                      </p>

                      <p className="mt-1 font-mono font-semibold text-gray-800">
                        {stream.code ||
                          "—"}
                      </p>

                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">

                      <p className="text-xs font-medium text-blue-600">
                        Class Level
                      </p>

                      <p className="mt-1 truncate font-semibold text-blue-800">
                        {getClassLevelName(
                          stream
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <Link
                      to={`/academics/streams/${stream.id}`}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </Link>

                    <Link
                      to={`/academics/streams/${stream.id}/edit`}
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

export default StreamsPage;

