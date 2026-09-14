import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicTermFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);

  // ==================================================
  // FORM STATE
  // ==================================================

  const [formData, setFormData] = useState({
    academic_year: searchParams.get("academic_year") || "",
    term: "term_1",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const [academicYears, setAcademicYears] = useState([]);
  const [existingTerm, setExistingTerm] = useState(null);

  const [loading, setLoading] = useState(isEditMode);
  const [loadingYears, setLoadingYears] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // FETCH ACADEMIC YEARS
  // ==================================================

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoadingYears(true);

      const response = await axiosInstance.get(
        "/academics/years/"
      );

      setAcademicYears(response.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch academic years:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load academic years."
      );
    } finally {
      setLoadingYears(false);
    }
  };

  // ==================================================
  // FETCH TERM FOR EDITING
  // ==================================================

  useEffect(() => {
    if (isEditMode) {
      fetchTerm();
    }
  }, [id]);

  const fetchTerm = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/terms/${id}/`
      );

      const term = response.data;

      setExistingTerm(term);

      setFormData({
        academic_year:
          typeof term.academic_year === "object"
            ? term.academic_year.id
            : term.academic_year || "",
        term: term.term || "term_1",
        start_date: term.start_date || "",
        end_date: term.end_date || "",
        is_current: Boolean(term.is_current),
      });
    } catch (err) {
      console.error(
        "Failed to fetch academic term:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the academic term."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {
    if (!formData.academic_year) {
      return "Please select an academic year.";
    }

    if (!formData.term) {
      return "Please select an academic term.";
    }

    if (!formData.start_date) {
      return "Please select a start date.";
    }

    if (!formData.end_date) {
      return "Please select an end date.";
    }

    if (
      new Date(formData.end_date) <
      new Date(formData.start_date)
    ) {
      return "The end date cannot be before the start date.";
    }

    return "";
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        academic_year: Number(formData.academic_year),
        term: formData.term,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
      };

      if (isEditMode) {
        await axiosInstance.put(
          `/academics/terms/${id}/`,
          payload
        );

        setSuccess(
          "Academic term updated successfully."
        );

        setTimeout(() => {
          navigate(`/academics/terms/${id}`);
        }, 700);
      } else {
        const response = await axiosInstance.post(
          "/academics/terms/",
          payload
        );

        const createdTerm = response.data;

        setSuccess(
          "Academic term created successfully."
        );

        setTimeout(() => {
          if (createdTerm?.id) {
            navigate(
              `/academics/terms/${createdTerm.id}`
            );
          } else {
            navigate("/academics/terms");
          }
        }, 700);
      }
    } catch (err) {
      console.error(
        "Failed to save academic term:",
        err
      );

      const responseData = err.response?.data;

      if (!responseData) {
        setError(
          "Unable to save the academic term. Please check your connection and try again."
        );
        return;
      }

      if (typeof responseData === "string") {
        setError(responseData);
        return;
      }

      if (responseData.detail) {
        setError(responseData.detail);
        return;
      }

      const messages = Object.entries(responseData)
        .map(([field, value]) => {
          const message = Array.isArray(value)
            ? value.join(" ")
            : String(value);

          return `${field}: ${message}`;
        })
        .join(" ");

      setError(
        messages ||
          "Failed to save the academic term."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // BACK NAVIGATION
  // ==================================================

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/academics/terms/${id}`);
      return;
    }

    const academicYear =
      searchParams.get("academic_year");

    if (academicYear) {
      navigate(
        `/academics/years/${academicYear}`
      );
    } else {
      navigate("/academics/terms");
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading || loadingYears) {
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

          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            ← Back
          </button>

          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-600">
            Academic Management
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isEditMode
              ? "Edit Academic Term"
              : "Create Academic Term"}
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {isEditMode
              ? "Update the term dates and academic status."
              : "Create a term and define its academic period."}
          </p>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">

              <span className="text-lg text-red-600">
                ⚠
              </span>

              <div>
                <h3 className="font-semibold text-red-800">
                  Unable to save
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">

              <span className="text-lg text-green-600">
                ✓
              </span>

              <p className="text-sm font-medium text-green-800">
                {success}
              </p>

            </div>
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>

          {/* ==================================================
              TERM INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Term Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the academic year and term period.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* ==================================================
                  ACADEMIC YEAR
              ================================================== */}

              <div>
                <label
                  htmlFor="academic_year"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Academic Year
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  disabled={saving || isEditMode}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    Select Academic Year
                  </option>

                  {academicYears.map((year) => (
                    <option
                      key={year.id}
                      value={year.id}
                    >
                      {year.name}
                      {year.is_current
                        ? " — Current"
                        : ""}
                    </option>
                  ))}
                </select>

                {isEditMode && (
                  <p className="mt-2 text-xs text-gray-500">
                    The academic year cannot be changed while
                    editing a term.
                  </p>
                )}
              </div>

              {/* ==================================================
                  TERM
              ================================================== */}

              <div>
                <label
                  htmlFor="term"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Term
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="term_1">
                    Term 1
                  </option>

                  <option value="term_2">
                    Term 2
                  </option>

                  <option value="term_3">
                    Term 3
                  </option>
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Each academic year supports Term 1,
                  Term 2 and Term 3.
                </p>
              </div>

              {/* ==================================================
                  DATES
              ================================================== */}

              <div className="grid gap-6 sm:grid-cols-2">

                {/* Start Date */}
                <div>
                  <label
                    htmlFor="start_date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Start Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="end_date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    End Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    disabled={saving}
                    min={formData.start_date || undefined}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

              </div>

              {/* ==================================================
                  CURRENT TERM
              ================================================== */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50">

                <input
                  type="checkbox"
                  name="is_current"
                  checked={formData.is_current}
                  onChange={handleChange}
                  disabled={saving}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Current Academic Term
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Mark this as the school's currently active
                    term. The backend will ensure that only one
                    term is current within the applicable academic
                    year.
                  </p>
                </div>

              </label>

            </div>
          </div>

          {/* ==================================================
              TERM RULES
          ================================================== */}

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                ℹ️
              </div>

              <div>
                <h2 className="text-sm font-semibold text-blue-900">
                  Term validation
                </h2>

                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-blue-800">
                  <li>
                    • A term belongs to exactly one academic year.
                  </li>

                  <li>
                    • The end date must be after the start date.
                  </li>

                  <li>
                    • Terms within an academic year cannot overlap.
                  </li>

                  <li>
                    • Only one term can be marked as current.
                  </li>

                  <li>
                    • The backend remains the final authority for
                    these rules.
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* ==================================================
              EXISTING TERM INFO
          ================================================== */}

          {isEditMode && existingTerm && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <h2 className="text-sm font-semibold text-gray-900">
                Current Record
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Term
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {existingTerm.term_display ||
                      existingTerm.term ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Academic Year
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {existingTerm.academic_year_name ||
                      academicYears.find(
                        (year) =>
                          String(year.id) ===
                          String(formData.academic_year)
                      )?.name ||
                      "—"}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? isEditMode
                  ? "Saving Changes..."
                  : "Creating Term..."
                : isEditMode
                ? "Save Changes"
                : "Create Academic Term"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AcademicTermFormPage;

