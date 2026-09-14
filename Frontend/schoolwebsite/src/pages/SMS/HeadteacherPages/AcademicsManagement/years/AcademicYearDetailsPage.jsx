import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicYearDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [academicYear, setAcademicYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH ACADEMIC YEAR
  // ==================================================

  useEffect(() => {
    fetchAcademicYear();
  }, [id]);

  const fetchAcademicYear = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/years/${id}/`
      );

      setAcademicYear(response.data);
    } catch (err) {
      console.error("Failed to fetch academic year:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load the academic year. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete academic year "${academicYear?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(
        `/academics/years/${id}/`
      );

      navigate("/academics/years");
    } catch (err) {
      console.error("Failed to delete academic year:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete the academic year. It may already be linked to other academic records."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

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
  // TERM LABEL
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

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
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
  // ERROR / NOT FOUND
  // ==================================================

  if (error && !academicYear) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/academics/years")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Academic Years
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">
              Unable to load academic year
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAcademicYear}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!academicYear) {
    return null;
  }

  const terms = academicYear.terms || [];

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() => navigate("/academics/years")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            ← Back to Academic Years
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Academic Year
                </span>

                {academicYear.is_current && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Current
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    academicYear.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {academicYear.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {academicYear.name}
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Academic year overview, terms and calendar period.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">

              <Link
                to={`/academics/years/${id}/edit`}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            OVERVIEW CARDS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Year */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Academic Year
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {academicYear.name}
            </p>
          </div>

          {/* Terms */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Terms
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {terms.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Configured academic terms
            </p>
          </div>

          {/* Start */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Start Date
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatDate(academicYear.start_date)}
            </p>
          </div>

          {/* End */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              End Date
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatDate(academicYear.end_date)}
            </p>
          </div>

        </div>

        {/* ==================================================
            ACADEMIC PERIOD
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Academic Period
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The overall period covered by this academic year.
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Opening Date
              </p>

              <p className="mt-2 text-base font-semibold text-gray-900">
                {formatDate(academicYear.start_date)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Closing Date
              </p>

              <p className="mt-2 text-base font-semibold text-gray-900">
                {formatDate(academicYear.end_date)}
              </p>
            </div>

          </div>
        </div>

        {/* ==================================================
            TERMS
        ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Academic Terms
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Terms configured for academic year {academicYear.name}.
              </p>
            </div>

            <Link
              to={`/academics/terms/new?academic_year=${id}`}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              + Add Term
            </Link>

          </div>

          <div className="p-5 sm:p-6">

            {terms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  📅
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  No academic terms yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  This academic year does not have any terms
                  configured yet. Add Term 1 to begin building the
                  academic calendar.
                </p>

                <Link
                  to={`/academics/terms/new?academic_year=${id}`}
                  className="mt-5 inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Create First Term
                </Link>

              </div>
            ) : (
              <div className="space-y-4">

                {terms.map((term, index) => (
                  <Link
                    key={term.id}
                    to={`/academics/terms/${term.id}`}
                    className="block rounded-xl border border-gray-200 p-4 transition hover:border-green-300 hover:bg-green-50/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {index + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-gray-900">
                              {getTermLabel(term)}
                            </h3>

                            {term.is_current && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Current
                              </span>
                            )}

                            {term.is_active !== false && (
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                Active
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(term.start_date)}
                            {" → "}
                            {formatDate(term.end_date)}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        View Term
                        <span>→</span>
                      </div>

                    </div>
                  </Link>
                ))}

              </div>
            )}

          </div>
        </div>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to={`/academics/terms?academic_year=${id}`}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              📚
            </div>

            <h3 className="font-semibold text-gray-900">
              Manage Terms
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Configure term dates and current-term status.
            </p>
          </Link>

          <Link
            to="/academics/calendar"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              📅
            </div>

            <h3 className="font-semibold text-gray-900">
              Academic Calendar
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage holidays, examinations and school events.
            </p>
          </Link>

          <Link
            to="/academics/classes"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              🏫
            </div>

            <h3 className="font-semibold text-gray-900">
              Class Levels
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage grades and their streams.
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default AcademicYearDetailsPage;

