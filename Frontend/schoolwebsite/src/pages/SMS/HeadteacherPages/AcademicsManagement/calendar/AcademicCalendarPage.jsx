import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicCalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [academicYearFilter, setAcademicYearFilter] =
    useState(searchParams.get("academic_year") || "");

  const [eventTypeFilter, setEventTypeFilter] =
    useState(searchParams.get("event_type") || "");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  // ==================================================
  // EVENT TYPES
  // ==================================================

  const eventTypes = [
    {
      value: "mid_term_break",
      label: "Mid-Term Break",
    },
    {
      value: "school_holiday",
      label: "School Holiday",
    },
    {
      value: "public_holiday",
      label: "Public Holiday",
    },
    {
      value: "examination",
      label: "Examination",
    },
    {
      value: "staff_day",
      label: "Staff Day",
    },
    {
      value: "opening_day",
      label: "Opening Day",
    },
    {
      value: "closing_day",
      label: "Closing Day",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  // ==================================================
  // FETCH DATA
  // ==================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsResponse, yearsResponse] =
        await Promise.all([
          axiosInstance.get(
            "/academics/calendar-events/"
          ),
          axiosInstance.get("/academics/years/"),
        ]);

      setEvents(
        Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.results || []
      );

      setAcademicYears(
        Array.isArray(yearsResponse.data)
          ? yearsResponse.data
          : yearsResponse.data.results || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch academic calendar:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the academic calendar. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const [eventsResponse, yearsResponse] =
        await Promise.all([
          axiosInstance.get(
            "/academics/calendar-events/"
          ),
          axiosInstance.get("/academics/years/"),
        ]);

      setEvents(
        Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.results || []
      );

      setAcademicYears(
        Array.isArray(yearsResponse.data)
          ? yearsResponse.data
          : yearsResponse.data.results || []
      );
    } catch (err) {
      console.error(
        "Failed to refresh academic calendar:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to refresh the academic calendar."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const getEventTypeLabel = (type) => {
    const eventType = eventTypes.find(
      (item) => item.value === type
    );

    return (
      eventType?.label ||
      type ||
      "Other"
    );
  };

  const getEventTypeBadge = (type) => {
    const classes = {
      mid_term_break:
        "bg-yellow-100 text-yellow-700",
      school_holiday:
        "bg-orange-100 text-orange-700",
      public_holiday:
        "bg-red-100 text-red-700",
      examination:
        "bg-purple-100 text-purple-700",
      staff_day:
        "bg-blue-100 text-blue-700",
      opening_day:
        "bg-green-100 text-green-700",
      closing_day:
        "bg-gray-200 text-gray-700",
      other:
        "bg-gray-100 text-gray-600",
    };

    return (
      classes[type] ||
      "bg-gray-100 text-gray-600"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isPastEvent = (event) => {
    if (!event?.end_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(event.end_date);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  };

  const isUpcomingEvent = (event) => {
    if (!event?.start_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(event.start_date);
    startDate.setHours(0, 0, 0, 0);

    return startDate >= today;
  };

  const getAcademicYearName = (event) => {
    if (event.academic_year_name) {
      return event.academic_year_name;
    }

    if (
      event.academic_year &&
      typeof event.academic_year === "object"
    ) {
      return event.academic_year.name;
    }

    const year = academicYears.find(
      (item) =>
        String(item.id) ===
        String(event.academic_year)
    );

    return year?.name || "Unknown Year";
  };

  const getTermName = (event) => {
    if (event.term_name) {
      return event.term_name;
    }

    if (
      event.term &&
      typeof event.term === "object"
    ) {
      return (
        event.term.term_display ||
        event.term.term ||
        "Term"
      );
    }

    return event.term
      ? `Term ${event.term}`
      : "All Terms";
  };

  const updateUrlParams = (
    newSearch,
    newAcademicYear,
    newEventType,
    newStatus
  ) => {
    const params = {};

    if (newSearch.trim()) {
      params.search = newSearch.trim();
    }

    if (newAcademicYear) {
      params.academic_year = newAcademicYear;
    }

    if (newEventType) {
      params.event_type = newEventType;
    }

    if (newStatus !== "all") {
      params.status = newStatus;
    }

    setSearchParams(params);
  };

  // ==================================================
  // FILTER EVENTS
  // ==================================================

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const searchText =
          search.trim().toLowerCase();

        if (!searchText) return true;

        return (
          event.title
            ?.toLowerCase()
            .includes(searchText) ||
          event.description
            ?.toLowerCase()
            .includes(searchText) ||
          getEventTypeLabel(event.event_type)
            .toLowerCase()
            .includes(searchText) ||
          getAcademicYearName(event)
            .toLowerCase()
            .includes(searchText)
        );
      })
      .filter((event) => {
        if (!academicYearFilter) {
          return true;
        }

        return (
          String(
            event.academic_year?.id ||
              event.academic_year
          ) === String(academicYearFilter)
        );
      })
      .filter((event) => {
        if (!eventTypeFilter) {
          return true;
        }

        return (
          event.event_type === eventTypeFilter
        );
      })
      .filter((event) => {
        if (statusFilter === "all") {
          return true;
        }

        if (statusFilter === "active") {
          return event.is_active === true;
        }

        if (statusFilter === "inactive") {
          return event.is_active === false;
        }

        if (statusFilter === "upcoming") {
          return isUpcomingEvent(event);
        }

        if (statusFilter === "past") {
          return isPastEvent(event);
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.start_date || "9999-12-31"
        );

        const dateB = new Date(
          b.start_date || "9999-12-31"
        );

        return dateA - dateB;
      });
  }, [
    events,
    search,
    academicYearFilter,
    eventTypeFilter,
    statusFilter,
    academicYears,
  ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const summary = useMemo(() => {
    const active = events.filter(
      (event) => event.is_active === true
    ).length;

    const upcoming = events.filter(
      (event) => isUpcomingEvent(event)
    ).length;

    const closed = events.filter(
      (event) => event.is_school_closed === true
    ).length;

    const examinations = events.filter(
      (event) =>
        event.event_type === "examination"
    ).length;

    return {
      total: events.length,
      active,
      upcoming,
      closed,
      examinations,
    };
  }, [events]);

  // ==================================================
  // FILTER HANDLERS
  // ==================================================

  const handleSearchChange = (value) => {
    setSearch(value);

    updateUrlParams(
      value,
      academicYearFilter,
      eventTypeFilter,
      statusFilter
    );
  };

  const handleAcademicYearChange = (value) => {
    setAcademicYearFilter(value);

    updateUrlParams(
      search,
      value,
      eventTypeFilter,
      statusFilter
    );
  };

  const handleEventTypeChange = (value) => {
    setEventTypeFilter(value);

    updateUrlParams(
      search,
      academicYearFilter,
      value,
      statusFilter
    );
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);

    updateUrlParams(
      search,
      academicYearFilter,
      eventTypeFilter,
      value
    );
  };

  const clearFilters = () => {
    setSearch("");
    setAcademicYearFilter("");
    setEventTypeFilter("");
    setStatusFilter("all");

    setSearchParams({});
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
            </div>
          </div>
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

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <Link
              to="/academics"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
            >
              ← Academics Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Academic Calendar
            </h1>

            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Manage school holidays, examinations,
              opening days, closing days and other
              important academic events.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              to="/academics/calendar/new"
              className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              + Add Calendar Event
            </Link>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Events
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {summary.active}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {summary.upcoming}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              School Closed
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {summary.closed}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Examinations
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {summary.examinations}
            </p>
          </div>

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Filter Calendar
              </h2>

              <p className="text-sm text-gray-500">
                Narrow down calendar events.
              </p>
            </div>

            {(search ||
              academicYearFilter ||
              eventTypeFilter ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Clear Filters
              </button>
            )}

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}
            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
                placeholder="Search events..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>

            {/* Academic Year */}
            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Academic Year
              </label>

              <select
                value={academicYearFilter}
                onChange={(e) =>
                  handleAcademicYearChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  All Academic Years
                </option>

                {academicYears.map((year) => (
                  <option
                    key={year.id}
                    value={year.id}
                  >
                    {year.name}
                  </option>
                ))}
              </select>

            </div>

            {/* Event Type */}
            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Event Type
              </label>

              <select
                value={eventTypeFilter}
                onChange={(e) =>
                  handleEventTypeChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  All Event Types
                </option>

                {eventTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>

            </div>

            {/* Status */}
            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="all">
                  All Events
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="upcoming">
                  Upcoming
                </option>

                <option value="past">
                  Past
                </option>
              </select>

            </div>

          </div>
        </div>

        {/* ==================================================
            RESULTS COUNT
        ================================================== */}

        <div className="mb-3 flex items-center justify-between">

          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredEvents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {events.length}
            </span>{" "}
            events
          </p>

        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              📅
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No calendar events found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {events.length === 0
                ? "No academic calendar events have been created yet."
                : "No events match your current filters."}
            </p>

            {events.length === 0 ? (
              <Link
                to="/academics/calendar/new"
                className="mt-5 inline-flex rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                + Add Calendar Event
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <>
            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Event
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Academic Year
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Dates
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <Link
                            to={`/academics/calendar/${event.id}`}
                            className="font-semibold text-gray-900 hover:text-green-700"
                          >
                            {event.title}
                          </Link>

                          {event.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {event.description}
                            </p>
                          )}

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEventTypeBadge(
                              event.event_type
                            )}`}
                          >
                            {getEventTypeLabel(
                              event.event_type
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-900">
                            {getAcademicYearName(
                              event
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {getTermName(event)}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(
                              event.start_date
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            to{" "}
                            {formatDate(
                              event.end_date
                            )}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex flex-col gap-1.5">

                            {event.is_active && (
                              <span className="text-xs font-semibold text-green-600">
                                Active
                              </span>
                            )}

                            {event.is_school_closed && (
                              <span className="text-xs font-semibold text-orange-600">
                                School Closed
                              </span>
                            )}

                            {isUpcomingEvent(
                              event
                            ) && (
                              <span className="text-xs font-semibold text-blue-600">
                                Upcoming
                              </span>
                            )}

                            {isPastEvent(event) && (
                              <span className="text-xs font-semibold text-gray-500">
                                Past
                              </span>
                            )}

                          </div>

                        </td>

                        <td className="px-5 py-4 text-right">

                          <Link
                            to={`/academics/calendar/${event.id}`}
                            className="text-sm font-semibold text-green-700 hover:text-green-800"
                          >
                            View →
                          </Link>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            </div>

            {/* ==================================================
                MOBILE / TABLET CARDS
            ================================================== */}

            <div className="grid gap-4 lg:hidden">

              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <Link
                        to={`/academics/calendar/${event.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-green-700"
                      >
                        {event.title}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {getAcademicYearName(
                          event
                        )}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getEventTypeBadge(
                        event.event_type
                      )}`}
                    >
                      {getEventTypeLabel(
                        event.event_type
                      )}
                    </span>

                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Start
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatDate(
                          event.start_date
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        End
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatDate(
                          event.end_date
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    {event.is_active && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    )}

                    {event.is_school_closed && (
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        School Closed
                      </span>
                    )}

                    {isUpcomingEvent(event) && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Upcoming
                      </span>
                    )}

                    {isPastEvent(event) && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Past
                      </span>
                    )}

                  </div>

                  {event.description && (
                    <p className="mt-4 line-clamp-2 text-sm text-gray-500">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-gray-100 pt-4">

                    <Link
                      to={`/academics/calendar/${event.id}`}
                      className="text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      View Event →
                    </Link>

                  </div>

                </div>
              ))}

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AcademicCalendarPage;
