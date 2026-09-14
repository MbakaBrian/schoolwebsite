import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const ClassLevelFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    display_order: 1,
    is_active: true,
  });

  const [loading, setLoading] = useState(
    isEditMode
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(
    {}
  );

  // ==================================================
  // FETCH EXISTING CLASS LEVEL
  // ==================================================

  useEffect(() => {
    if (isEditMode) {
      fetchClassLevel();
    }
  }, [id]);

  const fetchClassLevel = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/class-levels/${id}/`
      );

      const level = response.data;

      setFormData({
        name: level.name || "",
        code: level.code || "",
        description:
          level.description || "",
        display_order:
          level.display_order ?? 1,
        is_active:
          level.is_active ?? true,
      });
    } catch (err) {
      console.error(
        "Failed to fetch class level:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load the class level. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // Clear field-specific error once user
    // starts correcting the field.
    if (fieldErrors[name]) {
      setFieldErrors((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[name];

        return updated;
      });
    }

    if (error) {
      setError("");
    }
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {
    const errors = {};

    const name = formData.name.trim();
    const code = formData.code.trim();

    if (!name) {
      errors.name =
        "Class level name is required.";
    }

    if (name.length > 100) {
      errors.name =
        "Class level name cannot exceed 100 characters.";
    }

    if (!code) {
      errors.code =
        "Class level code is required.";
    }

    if (code.length > 50) {
      errors.code =
        "Class level code cannot exceed 50 characters.";
    }

    if (
      formData.display_order === "" ||
      Number.isNaN(
        Number(formData.display_order)
      )
    ) {
      errors.display_order =
        "Display order must be a valid number.";
    } else if (
      Number(formData.display_order) < 0
    ) {
      errors.display_order =
        "Display order cannot be negative.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==================================================
  // HANDLE SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description:
        formData.description.trim(),
      display_order: Number(
        formData.display_order
      ),
      is_active: formData.is_active,
    };

    try {
      setSaving(true);

      let response;

      if (isEditMode) {
        response = await axiosInstance.put(
          `/academics/class-levels/${id}/`,
          payload
        );
      } else {
        response = await axiosInstance.post(
          "/academics/class-levels/",
          payload
        );
      }

      const savedLevel = response.data;

      navigate(
        `/academics/classes/${savedLevel.id}`
      );
    } catch (err) {
      console.error(
        "Failed to save class level:",
        err
      );

      const responseData =
        err.response?.data;

      // --------------------------------------------------
      // HANDLE DJANGO / DRF FIELD ERRORS
      // --------------------------------------------------

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const parsedErrors = {};

        Object.entries(responseData).forEach(
          ([field, messages]) => {
            if (Array.isArray(messages)) {
              parsedErrors[field] =
                messages.join(" ");
            } else if (
              typeof messages === "string"
            ) {
              parsedErrors[field] =
                messages;
            } else {
              parsedErrors[field] =
                JSON.stringify(messages);
            }
          }
        );

        if (
          Object.keys(parsedErrors).length > 0
        ) {
          setFieldErrors(parsedErrors);

          const generalError =
            parsedErrors.detail ||
            parsedErrors.non_field_errors;

          if (generalError) {
            setError(generalError);
          }

          return;
        }
      }

      setError(
        responseData?.detail ||
          "Failed to save the class level. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="animate-pulse space-y-6">

              <div className="h-8 w-64 rounded bg-gray-200" />

              <div className="h-12 rounded bg-gray-200" />

              <div className="h-12 rounded bg-gray-200" />

              <div className="h-32 rounded bg-gray-200" />

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
                ? `/academics/classes/${id}`
                : "/academics/classes"
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ←{" "}
            {isEditMode
              ? "Back to Class Level"
              : "Back to Class Levels"}
          </Link>

          <div className="mt-4">

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {isEditMode
                ? "Edit Class Level"
                : "Add Class Level"}
            </h1>

            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              {isEditMode
                ? "Update the class level information."
                : "Create a class level for the school's academic structure."}
            </p>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex gap-3">

              <div className="mt-0.5">
                ⚠️
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  Unable to save class level
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

            </div>

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
                Class Level Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the basic information for this
                class level.
              </p>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              {/* Name */}

              <div className="sm:col-span-2">

                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Class Level Name{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Grade 1"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                    fieldErrors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />

                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.name}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-gray-500">
                  Examples: Grade 1, Grade 2,
                  PP1, PP2, Form 1.
                </p>

              </div>

              {/* Code */}

              <div>

                <label
                  htmlFor="code"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Class Code{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. G1"
                  className={`w-full rounded-xl border px-4 py-3 text-sm uppercase outline-none transition focus:ring-2 ${
                    fieldErrors.code
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />

                {fieldErrors.code && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.code}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-gray-500">
                  A short unique code used to
                  identify the class level.
                </p>

              </div>

              {/* Display Order */}

              <div>

                <label
                  htmlFor="display_order"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Display Order{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="display_order"
                  name="display_order"
                  type="number"
                  min="0"
                  value={
                    formData.display_order
                  }
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                    fieldErrors.display_order
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />

                {fieldErrors.display_order && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                      fieldErrors.display_order
                    }
                  </p>
                )}

                <p className="mt-1.5 text-xs text-gray-500">
                  Controls the order in which
                  class levels are displayed.
                </p>

              </div>

              {/* Description */}

              <div className="sm:col-span-2">

                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Optional description of this class level..."
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Optional information about the
                  class level.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Control whether this class level is
                currently available for use.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    formData.is_active
                  }
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <span>

                  <span className="block text-sm font-semibold text-gray-800">
                    Active Class Level
                  </span>

                  <span className="mt-1 block text-sm text-gray-500">
                    Active class levels can be used
                    when creating streams and
                    student enrollments.
                  </span>

                </span>

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
                  ? `/academics/classes/${id}`
                  : "/academics/classes"
              }
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create Class Level"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default ClassLevelFormPage;

