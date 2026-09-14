import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicTermDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH TERM
  // ==================================================

  useEffect(() => {
    fetchTerm();
  }, [id]);

  const fetchTerm = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/terms/${id}/`
      );

      const termData = response.data;

      setTerm(termData);

      // If the serializer only returns academic_year as an ID,
      // fetch the academic year separately.
      if (
        termData.academic_year &&
        typeof termData.academic_year === "object"
      ) {
        setAcademicYear(termData.academic_year);
      } else if (termData.academic_year) {
        try {
          const yearResponse = await axiosInstance.get(
            `/academics/years/${termData.academic_year}/`
          );

          setAcademicYear(yearResponse.data);
        } catch (yearError) {
          console.error(
            "Failed to fetch academic year:",
            yearError
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch academic term:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the academic term. Please try again."
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
      `Are you sure you want to delete "${getTermLabel(term)}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(
        `/academics/terms/${id}/`
      );

      if (academicYear?.id) {
        navigate(`/academics/years/${academicYear.id}`);
      } else {
        navigate("/academics/terms");
      }
    } catch (err) {
      console.error(
        "Failed to delete academic term:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete the academic term. It may already be linked to other academic records."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const getTermLabel = (termData) => {
    if (!termData) {
      return "Academic Term";
    }

    if (termData.term_display) {
      return termData.term_display;
    }

    const labels = {
      term_1: "Term 1",
      term_2: "Term 2",
      term_3: "Term 3",
    };

    return (
      labels[termData.term] ||
      termData.term ||
      "Academic Term"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-KE", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDurationInDays = () => {
    if (!term?.start_date || !term?.end_date) {
      return null;
    }

    const start = new Date(term.start_date);
    const end = new Date(term.end_date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return null;
    }

    const difference =
      end.getTime() - start.getTime();

    return Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1;
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

  if (error && !term) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate("/academics/terms")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Academic Terms
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-lg font-semibold text-red-800">
              Unable to load academic term
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchTerm}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!term) {
    return null;
  }

  const duration = getDurationInDays();

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
            onClick={() =>
              academicYear?.id
                ? navigate(
                    `/academics/years/${academicYear.id}`
                  )
                : navigate("/academics/terms")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <div className="mb-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Academic Term
                </span>

                {term.is_current && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Current Term
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    term.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {term.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {getTermLabel(term)}
              </h1>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                {academicYear?.name
                  ? `Academic Year ${academicYear.name}`
                  : "Academic term details"}
              </p>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">

              <Link
                to={`/academics/terms/${id}/edit`}
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
                {deleting
                  ? "Deleting..."
                  : "Delete"}
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
            SUMMARY
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Term */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Term
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {getTermLabel(term)}
            </p>

          </div>

          {/* Academic Year */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Academic Year
            </p>

            {academicYear?.id ? (
              <Link
                to={`/academics/years/${academicYear.id}`}
                className="mt-2 inline-block text-2xl font-bold text-gray-900 hover:text-green-700"
              >
                {academicYear.name}
              </Link>
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                —
              </p>
            )}

          </div>

          {/* Duration */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Duration
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {duration !== null
                ? `${duration} days`
                : "—"}
            </p>

          </div>

          {/* Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </p>

            <p
              className={`mt-2 text-lg font-bold ${
                term.is_current
                  ? "text-blue-600"
                  : term.is_active
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {term.is_current
                ? "Current Term"
                : term.is_active
                ? "Active"
                : "Inactive"}
            </p>

          </div>

        </div>

        {/* ==================================================
            TERM PERIOD
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

            <h2 className="text-lg font-semibold text-gray-900">
              Term Period
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The dates defining this academic term.
            </p>

          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            {/* Start */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                ▶
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Start Date
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatDate(term.start_date)}
              </p>

            </div>

            {/* End */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                ■
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                End Date
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatDate(term.end_date)}
              </p>

            </div>

          </div>
        </div>

        {/* ==================================================
            ACADEMIC YEAR
        ================================================== */}

        {academicYear && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Academic Year
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The academic year to which this term belongs.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Academic Year
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {academicYear.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(academicYear.start_date)}
                    {" → "}
                    {formatDate(academicYear.end_date)}
                  </p>

                </div>

                <Link
                  to={`/academics/years/${academicYear.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  View Academic Year →
                </Link>

              </div>

            </div>
          </div>
        )}

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/academics/terms"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              📚
            </div>

            <h3 className="font-semibold text-gray-900">
              All Academic Terms
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View and manage all terms.
            </p>
          </Link>

          <Link
            to="/academics/calendar"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              📅
            </div>

            <h3 className="font-semibold text-gray-900">
              Academic Calendar
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage school events and important dates.
            </p>
          </Link>

          {academicYear?.id && (
            <Link
              to={`/academics/years/${academicYear.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                🏫
              </div>

              <h3 className="font-semibold text-gray-900">
                Academic Year
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Return to the parent academic year.
              </p>
            </Link>
          )}

        </div>

      </div>
    </div>
  );
};

export default AcademicTermDetailsPage;

