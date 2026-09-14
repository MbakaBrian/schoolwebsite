import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const CalendarEventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [academicTerm, setAcademicTerm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // EVENT TYPES
  // ==================================================

  const eventTypes = {
    mid_term_break: {
      label: "Mid-Term Break",
      badge: "bg-yellow-100 text-yellow-700",
    },
    school_holiday: {
      label: "School Holiday",
      badge: "bg-orange-100 text-orange-700",
    },
    public_holiday: {
      label: "Public Holiday",
      badge: "bg-red-100 text-red-700",
    },
    examination: {
      label: "Examination",
      badge: "bg-purple-100 text-purple-700",
    },
    staff_day: {
      label: "Staff Day",
      badge: "bg-blue-100 text-blue-700",
    },
    opening_day: {
      label: "Opening Day",
      badge: "bg-green-100 text-green-700",
    },
    closing_day: {
      label: "Closing Day",
      badge: "bg-gray-200 text-gray-700",
    },
    other: {
      label: "Other",
      badge: "bg-gray-100 text-gray-600",
    },
  };

  // ==================================================
  // FETCH EVENT
  // ==================================================

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/calendar-events/${id}/`
      );

      const eventData = response.data;

      setEvent(eventData);

      // --------------------------------------------------
      // FETCH ACADEMIC YEAR
      // --------------------------------------------------

      const academicYearId =
        eventData.academic_year?.id ||
        eventData.academic_year;

      if (academicYearId) {
        try {
          const yearResponse =
            await axiosInstance.get(
              `/academics/years/${academicYearId}/`
            );

          setAcademicYear(yearResponse.data);
        } catch (yearError) {
          console.error(
            "Failed to fetch academic year:",
            yearError
          );
        }
      }

      // --------------------------------------------------
      // FETCH ACADEMIC TERM
      // --------------------------------------------------

      const academicTermId =
        eventData.term?.id ||
        eventData.term;

      if (academicTermId) {
        try {
          const termResponse =
            await axiosInstance.get(
              `/academics/terms/${academicTermId}/`
            );

          setAcademicTerm(termResponse.data);
        } catch (termError) {
          console.error(
            "Failed to fetch academic term:",
            termError
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to fetch calendar event:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the calendar event. Please try again."
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
      `Are you sure you want to delete "${event?.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(
        `/academics/calendar-events/${id}/`
      );

      navigate("/academics/calendar");
    } catch (err) {
      console.error(
        "Failed to delete calendar event:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete the calendar event. It may already be referenced by other records."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

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

  const getEventType = () => {
    return (
      eventTypes[event?.event_type] ||
      eventTypes.other
    );
  };

  const getDurationInDays = () => {
    if (
      !event?.start_date ||
      !event?.end_date
    ) {
      return null;
    }

    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return null;
    }

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const isPastEvent = () => {
    if (!event?.end_date) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(event.end_date);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  };

  const isUpcomingEvent = () => {
    if (!event?.start_date) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(
      event.start_date
    );
    startDate.setHours(0, 0, 0, 0);

    return startDate >= today;
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

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate("/academics/calendar")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Academic Calendar
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-lg font-semibold text-red-800">
              Unable to load calendar event
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchEvent}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const eventType = getEventType();
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
              navigate("/academics/calendar")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Academic Calendar
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${eventType.badge}`}
                >
                  {eventType.label}
                </span>

                {event.is_active && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                )}

                {event.is_school_closed && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    School Closed
                  </span>
                )}

                {isUpcomingEvent() && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Upcoming
                  </span>
                )}

                {isPastEvent() && (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Past
                  </span>
                )}

              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {event.title}
              </h1>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                {academicYear?.name
                  ? `Academic Year ${academicYear.name}`
                  : "Academic calendar event"}
              </p>

            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-2">

              <Link
                to={`/academics/calendar/${id}/edit`}
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
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Start Date */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Start Date
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatDate(event.start_date)}
            </p>

          </div>

          {/* End Date */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              End Date
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatDate(event.end_date)}
            </p>

          </div>

          {/* Duration */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Duration
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {duration !== null
                ? `${duration} ${
                    duration === 1
                      ? "day"
                      : "days"
                  }`
                : "—"}
            </p>

          </div>

          {/* School Status */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              School Status
            </p>

            <p
              className={`mt-2 text-lg font-bold ${
                event.is_school_closed
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {event.is_school_closed
                ? "School Closed"
                : "Normal Operations"}
            </p>

          </div>

        </div>

        {/* ==================================================
            EVENT DETAILS
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main Information */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

                <h2 className="text-lg font-semibold text-gray-900">
                  Event Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Information about this calendar event.
                </p>

              </div>

              <div className="space-y-6 p-5 sm:p-6">

                {/* Description */}

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </p>

                  {event.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {event.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-gray-400">
                      No description provided.
                    </p>
                  )}

                </div>

                {/* Dates */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Begins
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(
                        event.start_date
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Ends
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(
                        event.end_date
                      )}
                    </p>

                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Related Academic Information */}

          <div className="space-y-6">

            {/* Academic Year */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5">

                <h2 className="font-semibold text-gray-900">
                  Academic Year
                </h2>

              </div>

              <div className="p-5">

                {academicYear ? (
                  <>
                    <p className="text-xl font-bold text-gray-900">
                      {academicYear.name}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(
                        academicYear.start_date
                      )}
                      {" → "}
                      {formatDate(
                        academicYear.end_date
                      )}
                    </p>

                    <Link
                      to={`/academics/years/${academicYear.id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      View Academic Year →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Academic year information unavailable.
                  </p>
                )}

              </div>

            </div>

            {/* Academic Term */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5">

                <h2 className="font-semibold text-gray-900">
                  Academic Term
                </h2>

              </div>

              <div className="p-5">

                {academicTerm ? (
                  <>
                    <p className="text-xl font-bold text-gray-900">
                      {academicTerm.term_display ||
                        academicTerm.term}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(
                        academicTerm.start_date
                      )}
                      {" → "}
                      {formatDate(
                        academicTerm.end_date
                      )}
                    </p>

                    <Link
                      to={`/academics/terms/${academicTerm.id}`}
                      className="mt-4 inline-flex text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      View Academic Term →
                    </Link>
                  </>
                ) : (
                  <div>

                    <p className="text-sm text-gray-500">
                      This event is not linked to a
                      specific academic term.
                    </p>

                    <Link
                      to="/academics/terms"
                      className="mt-3 inline-flex text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      View Academic Terms →
                    </Link>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/academics/calendar"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              📅
            </div>

            <h3 className="font-semibold text-gray-900">
              All Calendar Events
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View and manage the complete academic
              calendar.
            </p>
          </Link>

          <Link
            to="/academics/calendar/new"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              +
            </div>

            <h3 className="font-semibold text-gray-900">
              Add Another Event
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create another academic calendar event.
            </p>
          </Link>

          <Link
            to="/academics"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              🏫
            </div>

            <h3 className="font-semibold text-gray-900">
              Academics Dashboard
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Return to the main academics management
              dashboard.
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default CalendarEventDetailsPage;

