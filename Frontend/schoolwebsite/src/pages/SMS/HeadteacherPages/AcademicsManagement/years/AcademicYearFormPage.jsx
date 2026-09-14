import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const AcademicYearFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    is_current: false,
    is_active: true,
  });

  const [existingTerms, setExistingTerms] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // FETCH ACADEMIC YEAR
  // ==================================================

  useEffect(() => {
    if (isEditMode) {
      fetchAcademicYear();
    }
  }, [id]);

  const fetchAcademicYear = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/years/${id}/`
      );

      const year = response.data;

      setFormData({
        name: year.name || "",
        is_current: Boolean(year.is_current),
        is_active: Boolean(year.is_active),
      });

      setExistingTerms(year.terms || []);
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
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError("Academic year is required.");
      return;
    }

    // Basic validation for the year format.
    if (!/^\d{4}$/.test(trimmedName)) {
      setError("Please enter a valid academic year, for example 2026.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: trimmedName,
        is_current: formData.is_current,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        await axiosInstance.put(
          `/academics/years/${id}/`,
          payload
        );

        setSuccess("Academic year updated successfully.");

        setTimeout(() => {
          navigate(`/academics/years/${id}`);
        }, 700);
      } else {
        const response = await axiosInstance.post(
          "/academics/years/",
          payload
        );

        const createdYear = response.data;

        setSuccess("Academic year created successfully.");

        setTimeout(() => {
          navigate(
            createdYear?.id
              ? `/academics/years/${createdYear.id}`
              : "/academics/years"
          );
        }, 700);
      }
    } catch (err) {
      console.error("Failed to save academic year:", err);

      const responseData = err.response?.data;

      if (responseData) {
        if (typeof responseData === "string") {
          setError(responseData);
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.name) {
          setError(
            Array.isArray(responseData.name)
              ? responseData.name.join(" ")
              : responseData.name
          );
        } else {
          const messages = Object.entries(responseData)
            .map(([field, value]) => {
              const message = Array.isArray(value)
                ? value.join(" ")
                : String(value);

              return `${field}: ${message}`;
            })
            .join(" ");

          setError(
            messages || "Failed to save the academic year."
          );
        }
      } else {
        setError(
          "Unable to save the academic year. Please check your connection and try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING STATE
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-16">
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
            onClick={() =>
              navigate(
                isEditMode
                  ? `/academics/years/${id}`
                  : "/academics/years"
              )
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-700"
          >
            <span>←</span>
            Back
          </button>

          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-green-600">
              Academic Management
            </p>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {isEditMode
                ? "Edit Academic Year"
                : "Create Academic Year"}
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              {isEditMode
                ? "Update the academic year information and status."
                : "Create a new academic year for your school's academic calendar."}
            </p>
          </div>
        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg text-red-600">⚠</span>

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
              <span className="text-lg text-green-600">✓</span>

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
              BASIC INFORMATION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Academic Year Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the basic information for this academic year.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* Academic Year */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Academic Year
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100 sm:max-w-md"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Enter the four-digit year, for example{" "}
                  <span className="font-medium">2026</span>.
                </p>
              </div>

              {/* ==================================================
                  STATUS OPTIONS
              ================================================== */}

              <div className="grid gap-4 sm:grid-cols-2">

                {/* Active */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Active Academic Year
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Keep this academic year available for use
                      throughout the system.
                    </p>
                  </div>
                </label>

                {/* Current */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50">
                  <input
                    type="checkbox"
                    name="is_current"
                    checked={formData.is_current}
                    onChange={handleChange}
                    disabled={saving || !formData.is_active}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Current Academic Year
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Mark this as the school's current academic
                      year. Only one year can be current.
                    </p>
                  </div>
                </label>

              </div>

              {/* Warning */}
              {formData.is_current && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💡</span>

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Current academic year
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Setting this year as current will make it
                        the active academic year used by the system.
                        If another year is currently marked as
                        current, the backend will handle the
                        current-year rule.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ==================================================
              TERM STRUCTURE
          ================================================== */}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Academic Term Structure
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Terms are managed separately after creating the
                academic year.
              </p>
            </div>

            <div className="p-5 sm:p-6">

              {existingTerms.length > 0 ? (
                <div className="space-y-3">
                  {existingTerms.map((term) => (
                    <div
                      key={term.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {term.term_display ||
                            term.term ||
                            "Academic Term"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {term.start_date || "No start date"}{" "}
                          →{" "}
                          {term.end_date || "No end date"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {term.is_current && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Current
                          </span>
                        )}

                        {term.is_active !== false && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/academics/terms?academic_year=${id}`
                      )
                    }
                    className="mt-2 text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    Manage academic terms →
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                    📅
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900">
                    No terms configured yet
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
                    Save this academic year first, then create
                    Term 1, Term 2 and Term 3 from the Academic
                    Terms section.
                  </p>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/academics/terms/new?academic_year=${id}`
                        )
                      }
                      className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                    >
                      Add First Term
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  isEditMode
                    ? `/academics/years/${id}`
                    : "/academics/years"
                )
              }
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
                  : "Creating Academic Year..."
                : isEditMode
                ? "Save Changes"
                : "Create Academic Year"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AcademicYearFormPage;

