import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const CalendarEventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);

  // ==================================================
  // STATE
  // ==================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    academic_year:
      searchParams.get("academic_year") || "",
    term: searchParams.get("term") || "",
    title: "",
    event_type: "other",
    start_date: "",
    end_date: "",
    description: "",
    is_school_closed: false,
    is_active: true,
  });

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
  // INITIAL DATA
  // ==================================================

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = [
        axiosInstance.get("/academics/years/"),
      ];

      if (isEditMode) {
        requests.push(
          axiosInstance.get(
            `/academics/calendar-events/${id}/`
          )
        );
      }

      const responses = await Promise.all(requests);

      const yearsResponse = responses[0];

      const years = Array.isArray(yearsResponse.data)
        ? yearsResponse.data
        : yearsResponse.data.results || [];

      setAcademicYears(years);

      // --------------------------------------------------
      // EDIT MODE
      // --------------------------------------------------

      if (isEditMode) {
        const eventResponse = responses[1];
        const event = eventResponse.data;

        const academicYearId =
          event.academic_year?.id ||
          event.academic_year ||
          "";

        const termId =
          event.term?.id ||
          event.term ||
          "";

        setFormData({
          academic_year: academicYearId,
          term: termId,
          title: event.title || "",
          event_type:
            event.event_type || "other",
          start_date:
            event.start_date || "",
          end_date:
            event.end_date || "",
          description:
            event.description || "",
          is_school_closed:
            Boolean(event.is_school_closed),
          is_active:
            event.is_active !== false,
        });
      }
    } catch (err) {
      console.error(
        "Failed to load calendar event form:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the calendar event form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH TERMS
  // ==================================================

  useEffect(() => {
    if (!formData.academic_year) {
      setTerms([]);
      return;
    }

    fetchTerms(formData.academic_year);
  }, [formData.academic_year]);

  const fetchTerms = async (academicYearId) => {
    try {
      const response = await axiosInstance.get(
        `/academics/terms/?academic_year=${academicYearId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setTerms(data);
    } catch (err) {
      console.error(
        "Failed to fetch academic terms:",
        err
      );

      setTerms([]);
    }
  };

  // ==================================================
  // FORM HANDLERS
  // ==================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleAcademicYearChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      academic_year: value,
      term: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {
    if (!formData.academic_year) {
      return "Please select an academic year.";
    }

    if (!formData.title.trim()) {
      return "Please enter an event title.";
    }

    if (!formData.event_type) {
      return "Please select an event type.";
    }

    if (!formData.start_date) {
      return "Please select a start date.";
    }

    if (!formData.end_date) {
      return "Please select an end date.";
    }

    const startDate = new Date(
      formData.start_date
    );

    const endDate = new Date(
      formData.end_date
    );

    if (endDate < startDate) {
      return "End date cannot be earlier than the start date.";
    }

    return "";
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        academic_year: Number(
          formData.academic_year
        ),
        term: formData.term
          ? Number(formData.term)
          : null,
        title: formData.title.trim(),
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description:
          formData.description.trim(),
        is_school_closed:
          formData.is_school_closed,
        is_active: formData.is_active,
      };

      let response;

      if (isEditMode) {
        response = await axiosInstance.put(
          `/academics/calendar-events/${id}/`,
          payload
        );
      } else {
        response = await axiosInstance.post(
          "/academics/calendar-events/",
          payload
        );
      }

      const savedEvent = response.data;

      setSuccess(
        isEditMode
          ? "Calendar event updated successfully."
          : "Calendar event created successfully."
      );

      setTimeout(() => {
        if (savedEvent?.id) {
          navigate(
            `/academics/calendar/${savedEvent.id}`
          );
        } else if (isEditMode) {
          navigate(
            `/academics/calendar/${id}`
          );
        } else {
          navigate("/academics/calendar");
        }
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save calendar event:",
        err
      );

      const backendError =
        err.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = Object.entries(
          backendError
        )
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Failed to save the calendar event."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to save the calendar event. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const getYearName = (year) => {
    return year?.name || "Unnamed Academic Year";
  };

  const getTermLabel = (term) => {
    if (term.term_display) {
      return term.term_display;
    }

    const labels = {
      term_1: "Term 1",
      term_2: "Term 2",
      term_3: "Term 3",
    };

    return (
      labels[term.term] ||
      term.term ||
      "Academic Term"
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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
      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <Link
            to={
              isEditMode
                ? `/academics/calendar/${id}`
                : "/academics/calendar"
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Calendar
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Calendar Event"
                : "Add Calendar Event"}
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              {isEditMode
                ? "Update the details of this academic calendar event."
                : "Create an important event for the school's academic calendar."}
            </p>
          </div>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Event Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Define what this calendar event is about.
              </p>

            </div>

            <div className="grid gap-5 p-5 sm:p-6">

              {/* Academic Year */}

              <div>
                <label
                  htmlFor="academic_year"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Academic Year{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={
                    handleAcademicYearChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">
                    Select academic year
                  </option>

                  {academicYears.map((year) => (
                    <option
                      key={year.id}
                      value={year.id}
                    >
                      {getYearName(year)}
                      {year.is_current
                        ? " — Current"
                        : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-gray-500">
                  Select the academic year this event
                  belongs to.
                </p>
              </div>

              {/* Term */}

              <div>
                <label
                  htmlFor="term"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Academic Term
                </label>

                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  disabled={
                    !formData.academic_year
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    All Terms / Not Term-Specific
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {getTermLabel(term)}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-gray-500">
                  Optional. Leave blank for events that
                  apply to the whole academic year.
                </p>
              </div>

              {/* Title */}

              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Event Title{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Term 1 Mid-Term Break"
                  required
                  maxLength={255}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Give the event a clear and recognizable
                  name.
                </p>
              </div>

              {/* Event Type */}

              <div>
                <label
                  htmlFor="event_type"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Event Type{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
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

            </div>
          </div>

          {/* ==================================================
              DATE INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Event Period
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Specify when the event begins and ends.
              </p>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              {/* Start Date */}

              <div>
                <label
                  htmlFor="start_date"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Start Date{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* End Date */}

              <div>
                <label
                  htmlFor="end_date"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  End Date{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date || undefined}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

            </div>
          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Additional Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add notes or additional information about
                this event.
              </p>

            </div>

            <div className="p-5 sm:p-6">

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
                rows={5}
                placeholder="Add any useful information about this event..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>
          </div>

          {/* ==================================================
              EVENT SETTINGS
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Event Settings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure how this event affects the school
                calendar.
              </p>

            </div>

            <div className="space-y-5 p-5 sm:p-6">

              {/* School Closed */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">

                <input
                  type="checkbox"
                  name="is_school_closed"
                  checked={
                    formData.is_school_closed
                  }
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <div>

                  <p className="font-semibold text-gray-900">
                    School Closed
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Mark this event as a period when the
                    school is closed to normal operations.
                  </p>

                </div>

              </label>

              {/* Active */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <div>

                  <p className="font-semibold text-gray-900">
                    Active Event
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Active events are included in the school's
                    current academic calendar.
                  </p>

                </div>

              </label>

            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              to={
                isEditMode
                  ? `/academics/calendar/${id}`
                  : "/academics/calendar"
              }
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Event"
                : "Create Event"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CalendarEventFormPage;

