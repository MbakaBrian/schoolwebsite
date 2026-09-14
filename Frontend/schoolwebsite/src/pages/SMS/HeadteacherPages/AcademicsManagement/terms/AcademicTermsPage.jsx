import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicTermsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const academicYearFromUrl =
    searchParams.get("academic_year") || "";

  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [search, setSearch] = useState("");
  const [academicYearFilter, setAcademicYearFilter] =
    useState(academicYearFromUrl);
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

      const [termsResponse, yearsResponse] =
        await Promise.all([
          axiosInstance.get("/academics/terms/"),
          axiosInstance.get("/academics/years/"),
        ]);

      setTerms(termsResponse.data || []);
      setAcademicYears(yearsResponse.data || []);
    } catch (err) {
      console.error("Failed to fetch academic terms:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load academic terms. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredTerms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return terms.filter((term) => {
      const termName =
        term.term_display ||
        term.term ||
        "";

      const academicYearName =
        term.academic_year_name ||
        term.academic_year?.name ||
        String(term.academic_year || "");

      const matchesSearch =
        !normalizedSearch ||
        termName.toLowerCase().includes(normalizedSearch) ||
        academicYearName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesAcademicYear =
        !academicYearFilter ||
        String(term.academic_year) ===
          String(academicYearFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "current" && term.is_current) ||
        (statusFilter === "active" && term.is_active) ||
        (statusFilter === "inactive" && !term.is_active);

      return (
        matchesSearch &&
        matchesAcademicYear &&
        matchesStatus
      );
    });
  }, [
    terms,
    search,
    academicYearFilter,
    statusFilter,
  ]);

  // ==================================================
  // UPDATE URL FILTER
  // ==================================================

  const handleAcademicYearFilter = (value) => {
    setAcademicYearFilter(value);

    if (value) {
      setSearchParams({
        academic_year: value,
      });
    } else {
      setSearchParams({});
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const getTermLabel = (term) => {
    if (term.term_display) {
      return term.term_display;
    }

    const labels = {
      term_1: "Term 1",
      term_2: "Term 2",
      term_3: "Term 3",
    };

    return labels[term.term] || term.term || "Academic Term";
  };

  const getAcademicYearName = (term) => {
    if (term.academic_year_name) {
      return term.academic_year_name;
    }

    if (
      term.academic_year &&
      typeof term.academic_year === "object"
    ) {
      return term.academic_year.name;
    }

    const year = academicYears.find(
      (item) =>
        String(item.id) === String(term.academic_year)
    );

    return year?.name || "Unknown Year";
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

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalTerms = terms.length;

  const currentTerms = terms.filter(
    (term) => term.is_current
  ).length;

  const activeTerms = terms.filter(
    (term) => term.is_active
  ).length;

  const inactiveTerms = terms.filter(
    (term) => !term.is_active
  ).length;

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-20">
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
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-600">
              Academic Management
            </p>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Academic Terms
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Manage academic terms, dates and current-term status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <Link
              to="/academics/terms/new"
              className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              + Add Term
            </Link>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load terms
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData()}
              className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Terms
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalTerms}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              All configured terms
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Current
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {currentTerms}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Currently running terms
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeTerms}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Active terms
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-500">
              {inactiveTerms}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Archived/inactive terms
            </p>
          </div>

        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-3">

            {/* Search */}
            <div className="lg:col-span-1">
              <label
                htmlFor="term-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <input
                id="term-search"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search term or academic year..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label
                htmlFor="academic-year-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Academic Year
              </label>

              <select
                id="academic-year-filter"
                value={academicYearFilter}
                onChange={(e) =>
                  handleAcademicYearFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">All Academic Years</option>

                {academicYears.map((year) => (
                  <option
                    key={year.id}
                    value={year.id}
                  >
                    {year.name}
                    {year.is_current ? " — Current" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="all">All Statuses</option>
                <option value="current">Current</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          {(search ||
            academicYearFilter ||
            statusFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredTerms.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {terms.length}
                </span>{" "}
                terms
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setAcademicYearFilter("");
                  setStatusFilter("all");
                  setSearchParams({});
                }}
                className="text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>

        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Term
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Academic Year
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    End Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredTerms.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-14 text-center"
                    >
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                          📅
                        </div>

                        <h3 className="font-semibold text-gray-900">
                          No academic terms found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Try changing your filters or create a
                          new academic term.
                        </p>

                        <Link
                          to="/academics/terms/new"
                          className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Add Term
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTerms.map((term) => (
                    <tr
                      key={term.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">
                        <Link
                          to={`/academics/terms/${term.id}`}
                          className="font-semibold text-gray-900 hover:text-green-700"
                        >
                          {getTermLabel(term)}
                        </Link>

                        {term.term && (
                          <p className="mt-1 text-xs text-gray-400">
                            {term.term}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {getAcademicYearName(term)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(term.start_date)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(term.end_date)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">

                          {term.is_current && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Current
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              term.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {term.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/academics/terms/${term.id}`}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Link>

                          <Link
                            to={`/academics/terms/${term.id}/edit`}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Edit
                          </Link>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>
          </div>
        </div>

        {/* ==================================================
            MOBILE CARDS
        ================================================== */}

        <div className="space-y-4 md:hidden">

          {filteredTerms.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                📅
              </div>

              <h3 className="font-semibold text-gray-900">
                No academic terms found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your filters or create a new term.
              </p>

              <Link
                to="/academics/terms/new"
                className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Add Term
              </Link>

            </div>
          ) : (
            filteredTerms.map((term) => (
              <div
                key={term.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <Link
                      to={`/academics/terms/${term.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-green-700"
                    >
                      {getTermLabel(term)}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {getAcademicYearName(term)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">

                    {term.is_current && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Current
                      </span>
                    )}

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        term.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {term.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">
                      Start
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(term.start_date)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">
                      End
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(term.end_date)}
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">

                  <Link
                    to={`/academics/terms/${term.id}`}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>

                  <Link
                    to={`/academics/terms/${term.id}/edit`}
                    className="flex-1 rounded-lg bg-green-600 px-3 py-2.5 text-center text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Edit
                  </Link>

                </div>

              </div>
            ))
          )}

        </div>

        {/* ==================================================
            FOOTER INFORMATION
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
              ℹ️
            </div>

            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Academic term management
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Each academic year can have Term 1, Term 2 and
                Term 3. The backend controls date validation,
                overlapping terms and which term is currently
                active.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AcademicTermsPage;
