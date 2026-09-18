import { useEffect, useMemo, useState } from "react";
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

  // ==================================================
  // FORM STATE
  // ==================================================

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    display_order: 1,
    next_class_level: "",
    is_active: true,
  });

  // ==================================================
  // STATE
  // ==================================================

  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ==================================================
  // FETCH CLASS LEVELS FOR PROGRESSION
  // ==================================================

  useEffect(() => {
    fetchClassLevels();
  }, []);

  const fetchClassLevels = async () => {
    try {
      setLoadingClasses(true);

      const response = await axiosInstance.get(
        "/academics/class-levels/?is_active=true"
      );

      const data = response.data;

      const levels = Array.isArray(data)
        ? data
        : data.results || [];

      setClassLevels(levels);
    } catch (err) {
      console.error(
        "Failed to fetch class levels:",
        err
      );

      // We don't block the entire form if the
      // progression list cannot be loaded.
      setClassLevels([]);
    } finally {
      setLoadingClasses(false);
    }
  };

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
        next_class_level:
          level.next_class_level ?? "",
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
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // Clear field-specific error
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
  // AVAILABLE NEXT CLASS LEVELS
  // ==================================================

  const availableNextClasses = useMemo(() => {
    return classLevels.filter(
      (classLevel) =>
        String(classLevel.id) !== String(id)
    );
  }, [classLevels, id]);

  // ==================================================
  // SELECTED NEXT CLASS
  // ==================================================

  const selectedNextClass = useMemo(() => {
    if (!formData.next_class_level) {
      return null;
    }

    return classLevels.find(
      (classLevel) =>
        String(classLevel.id) ===
        String(formData.next_class_level)
    );
  }, [
    classLevels,
    formData.next_class_level,
  ]);

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

    // Prevent a class from progressing to itself.
    if (
      formData.next_class_level &&
      isEditMode &&
      String(formData.next_class_level) ===
        String(id)
    ) {
      errors.next_class_level =
        "A class level cannot progress to itself.";
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

      next_class_level:
        formData.next_class_level
          ? Number(formData.next_class_level)
          : null,

      is_active:
        formData.is_active,
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

      const savedId =
        savedLevel.id ??
        savedLevel.pk;

      if (savedId) {
        navigate(
          `/academics/classes/${savedId}`
        );
      } else {
        navigate("/academics/classes");
      }
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

        Object.entries(
          responseData
        ).forEach(
          ([field, messages]) => {
            if (Array.isArray(messages)) {
              parsedErrors[field] =
                messages.join(" ");
            } else if (
              typeof messages ===
              "string"
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
          Object.keys(parsedErrors)
            .length > 0
        ) {
          setFieldErrors(
            parsedErrors
          );

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
                ? "Update the class level information and progression path."
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

              {/* ==================================================
                  NAME
              ================================================== */}

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

              {/* ==================================================
                  CODE
              ================================================== */}

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

              {/* ==================================================
                  DISPLAY ORDER
              ================================================== */}

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

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

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
              PROGRESSION
          ================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Student Progression
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Define which class students normally
                move to after completing this class.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <label
                htmlFor="next_class_level"
                className="mb-1.5 block text-sm font-semibold text-gray-700"
              >
                Next Class Level
              </label>

              <select
                id="next_class_level"
                name="next_class_level"
                value={
                  formData.next_class_level
                }
                onChange={handleChange}
                disabled={loadingClasses}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  fieldErrors.next_class_level
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-green-500 focus:ring-green-100"
                }`}
              >

                <option value="">
                  {loadingClasses
                    ? "Loading class levels..."
                    : "No next class — final level"}
                </option>

                {!loadingClasses &&
                  availableNextClasses.map(
                    (classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name}

                        {classLevel.code
                          ? ` (${classLevel.code})`
                          : ""}
                      </option>
                    )
                  )}

              </select>

              {fieldErrors.next_class_level && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {
                    fieldErrors.next_class_level
                  }
                </p>
              )}

              <p className="mt-1.5 text-xs text-gray-500">
                When students are promoted from this
                class, this is the class suggested as
                their next placement.
              </p>

              {/* ==================================================
                  PROGRESSION PREVIEW
              ================================================== */}

              {formData.next_class_level &&
                selectedNextClass && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Progression Path
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">

                      <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        {formData.name ||
                          "Current class"}
                      </span>

                      <span className="text-green-600">
                        →
                      </span>

                      <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        {
                          selectedNextClass.name
                        }
                      </span>

                    </div>

                    <p className="mt-3 text-xs text-green-700">
                      Students promoted from{" "}
                      <strong>
                        {formData.name ||
                          "this class"}
                      </strong>{" "}
                      will normally be proposed for{" "}
                      <strong>
                        {
                          selectedNextClass.name
                        }
                      </strong>
                      .
                    </p>

                  </div>
                )}

              {/* ==================================================
                  FINAL LEVEL INFORMATION
              ================================================== */}

              {!formData.next_class_level && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

                  <p className="text-sm font-semibold text-gray-800">
                    Final Class Level
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    No next class is configured. This
                    class will therefore be treated as
                    the end of the configured progression
                    path unless a next class is added
                    later.
                  </p>

                </div>
              )}

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

