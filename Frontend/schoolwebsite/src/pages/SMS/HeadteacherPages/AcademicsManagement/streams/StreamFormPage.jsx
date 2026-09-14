import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const initialFormData = {
  class_level: "",
  name: "",
  code: "",
  is_active: true,
};

const StreamFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);
  const preselectedClassLevel = searchParams.get("class_level");

  const [formData, setFormData] = useState(initialFormData);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [loadingClassLevels, setLoadingClassLevels] = useState(true);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // --------------------------------------------------
  // FETCH CLASS LEVELS
  // --------------------------------------------------
  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        setLoadingClassLevels(true);

        const response = await axiosInstance.get(
          "/academics/class-levels/"
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setClassLevels(data);

        // Preselect class level when creating a stream
        if (!isEditMode && preselectedClassLevel) {
          const exists = data.some(
            (level) => String(level.id) === String(preselectedClassLevel)
          );

          if (exists) {
            setFormData((prev) => ({
              ...prev,
              class_level: preselectedClassLevel,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load class levels:", err);
        setError("Failed to load class levels. Please try again.");
      } finally {
        setLoadingClassLevels(false);
      }
    };

    fetchClassLevels();
  }, [isEditMode, preselectedClassLevel]);

  // --------------------------------------------------
  // FETCH STREAM FOR EDITING
  // --------------------------------------------------
  useEffect(() => {
    if (!isEditMode) return;

    const fetchStream = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          `/academics/streams/${id}/`
        );

        const stream = response.data;

        setFormData({
          class_level:
            typeof stream.class_level === "object"
              ? stream.class_level.id
              : stream.class_level || "",
          name: stream.name || "",
          code: stream.code || "",
          is_active: stream.is_active ?? true,
        });
      } catch (err) {
        console.error("Failed to load stream:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to load stream. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [id, isEditMode]);

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error once user edits the field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const validateForm = () => {
    const errors = {};

    if (!formData.class_level) {
      errors.class_level = "Please select a class level.";
    }

    if (!formData.name.trim()) {
      errors.name = "Stream name is required.";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Stream name cannot exceed 100 characters.";
    }

    if (!formData.code.trim()) {
      errors.code = "Stream code is required.";
    } else if (formData.code.trim().length > 50) {
      errors.code = "Stream code cannot exceed 50 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------
  // HANDLE SUBMIT
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});

      const payload = {
        class_level: Number(formData.class_level),
        name: formData.name.trim(),
        code: formData.code.trim(),
        is_active: formData.is_active,
      };

      let response;

      if (isEditMode) {
        response = await axiosInstance.put(
          `/academics/streams/${id}/`,
          payload
        );
      } else {
        response = await axiosInstance.post(
          "/academics/streams/",
          payload
        );
      }

      const savedStream = response.data;

      navigate(`/academics/streams/${savedStream.id}`);
    } catch (err) {
      console.error("Failed to save stream:", err);

      const responseData = err.response?.data;

      // Handle DRF field-level validation errors
      if (responseData && typeof responseData === "object") {
        const errors = {};

        Object.entries(responseData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errors[field] = messages.join(" ");
          } else if (typeof messages === "string") {
            errors[field] = messages;
          }
        });

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        } else {
          setError(
            responseData.detail ||
              "Failed to save stream. Please check the form and try again."
          );
        }
      } else {
        setError("Failed to save stream. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // BACK LINK
  // --------------------------------------------------
  const getBackPath = () => {
    if (isEditMode) {
      return `/academics/streams/${id}`;
    }

    if (preselectedClassLevel) {
      return `/academics/classes/${preselectedClassLevel}`;
    }

    return "/academics/streams";
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            to={getBackPath()}
            className="mb-3 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            ← Back
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isEditMode ? "Edit Stream" : "Create Stream"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update the details of this academic stream."
              : "Create a stream under an academic class level."}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* NO CLASS LEVELS */}
        {!loadingClassLevels && classLevels.length === 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-800">
              No class levels available
            </h2>

            <p className="mt-1 text-sm text-amber-700">
              You need to create at least one class level before creating a
              stream.
            </p>

            <Link
              to="/academics/classes/new"
              className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Class Level
            </Link>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Stream Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the basic information for this stream.
            </p>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-6">
            {/* CLASS LEVEL */}
            <div>
              <label
                htmlFor="class_level"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Class Level <span className="text-red-500">*</span>
              </label>

              <select
                id="class_level"
                name="class_level"
                value={formData.class_level}
                onChange={handleChange}
                disabled={
                  isEditMode ||
                  loadingClassLevels ||
                  classLevels.length === 0
                }
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  fieldErrors.class_level
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                } ${
                  isEditMode
                    ? "cursor-not-allowed bg-gray-100 text-gray-600"
                    : "bg-white"
                }`}
              >
                <option value="">
                  {loadingClassLevels
                    ? "Loading class levels..."
                    : "Select a class level"}
                </option>

                {classLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                    {level.code ? ` (${level.code})` : ""}
                  </option>
                ))}
              </select>

              {isEditMode && (
                <p className="mt-1.5 text-xs text-gray-500">
                  The class level cannot be changed while editing a stream.
                </p>
              )}

              {fieldErrors.class_level && (
                <p className="mt-1.5 text-sm text-red-600">
                  {fieldErrors.class_level}
                </p>
              )}
            </div>

            {/* NAME + CODE */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Stream Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. East"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                    fieldErrors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  {formData.name.length}/100 characters
                </p>

                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* CODE */}
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Stream Code <span className="text-red-500">*</span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. E"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm uppercase outline-none transition focus:ring-2 ${
                    fieldErrors.code
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  {formData.code.length}/50 characters
                </p>

                {fieldErrors.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.code}
                  </p>
                )}
              </div>
            </div>

            {/* ACTIVE STATUS */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    Active stream
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Active streams are available for current school
                    operations and student enrollment.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Link
              to={getBackPath()}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || loadingClassLevels}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                ? "Save Changes"
                : "Create Stream"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StreamFormPage;