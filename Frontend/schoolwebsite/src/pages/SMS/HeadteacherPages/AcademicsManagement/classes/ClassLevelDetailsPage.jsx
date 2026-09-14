import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const ClassLevelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classLevel, setClassLevel] = useState(null);
  const [streams, setStreams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH CLASS LEVEL
  // ==================================================

  useEffect(() => {
    fetchClassLevel();
  }, [id]);

  const fetchClassLevel = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/academics/class-levels/${id}/`
      );

      const level = response.data;

      setClassLevel(level);

      // --------------------------------------------------
      // FETCH STREAMS FOR THIS CLASS LEVEL
      // --------------------------------------------------

      try {
        const streamsResponse =
          await axiosInstance.get(
            `/academics/streams/?class_level=${id}`
          );

        const data = streamsResponse.data;

        const streamList = Array.isArray(data)
          ? data
          : data?.results || [];

        setStreams(streamList);
      } catch (streamError) {
        console.error(
          "Failed to fetch streams:",
          streamError
        );

        // Do not fail the whole page if the
        // stream request fails.
        setStreams([]);
      }
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
  // DELETE
  // ==================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${classLevel?.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(
        `/academics/class-levels/${id}/`
      );

      navigate("/academics/classes");
    } catch (err) {
      console.error(
        "Failed to delete class level:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete this class level. It may already be linked to streams or other academic records."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const getStatusBadge = () => {
    if (classLevel?.is_active) {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        Inactive
      </span>
    );
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="animate-pulse space-y-6">

              <div className="h-5 w-40 rounded bg-gray-200" />

              <div className="h-10 w-72 rounded bg-gray-200" />

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="h-28 rounded-xl bg-gray-200" />
                <div className="h-28 rounded-xl bg-gray-200" />
                <div className="h-28 rounded-xl bg-gray-200" />

              </div>

              <div className="h-64 rounded-xl bg-gray-200" />

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR / NOT FOUND
  // ==================================================

  if (error && !classLevel) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate("/academics/classes")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Class Levels
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h2 className="text-lg font-semibold text-red-800">
              Unable to load class level
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchClassLevel}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    );
  }

  if (!classLevel) {
    return null;
  }

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
              navigate("/academics/classes")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
          >
            ← Back to Class Levels
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <div className="mb-3 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Class Level
                </span>

                {getStatusBadge()}

              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {classLevel.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">

                {classLevel.code && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-700">
                    {classLevel.code}
                  </span>
                )}

                <span className="text-sm text-gray-500">
                  Display Order:{" "}
                  <span className="font-semibold text-gray-700">
                    {classLevel.display_order ??
                      "—"}
                  </span>
                </span>

              </div>

            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-2">

              <Link
                to={`/academics/classes/${id}/edit`}
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

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          {/* Status */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </p>

            <div className="mt-3">
              {getStatusBadge()}
            </div>

          </div>

          {/* Streams */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Streams
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {streams.length}
            </p>

          </div>

          {/* Display Order */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Display Order
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {classLevel.display_order ??
                "—"}
            </p>

          </div>

        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="lg:col-span-1">

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5">

                <h2 className="text-lg font-semibold text-gray-900">
                  Class Information
                </h2>

              </div>

              <div className="space-y-5 p-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {classLevel.name}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
                  </p>

                  <p className="mt-1 font-mono font-semibold text-gray-900">
                    {classLevel.code ||
                      "Not assigned"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </p>

                  {classLevel.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {classLevel.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm italic text-gray-400">
                      No description provided.
                    </p>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              STREAMS
          ================================================== */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Streams
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Streams belonging to{" "}
                    <span className="font-semibold">
                      {classLevel.name}
                    </span>
                    .
                  </p>

                </div>

                <Link
                  to={`/academics/streams/new?class_level=${id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  + Add Stream
                </Link>

              </div>

              <div className="p-5">

                {streams.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">

                    <div className="text-4xl">
                      🏫
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-900">
                      No streams yet
                    </h3>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                      This class level does not have
                      any streams yet. Create the first
                      stream to organize students into
                      classes.
                    </p>

                    <Link
                      to={`/academics/streams/new?class_level=${id}`}
                      className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Add First Stream
                    </Link>

                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">

                    {streams.map(
                      (stream, index) => (
                        <Link
                          key={stream.id}
                          to={`/academics/streams/${stream.id}`}
                          className="group rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
                                {index + 1}
                              </div>

                              <div className="min-w-0">

                                <h3 className="truncate font-semibold text-gray-900 group-hover:text-green-700">
                                  {stream.name}
                                </h3>

                                <p className="mt-1 font-mono text-xs text-gray-500">
                                  {stream.code ||
                                    "No code"}
                                </p>

                              </div>

                            </div>

                            <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600">
                              →
                            </span>

                          </div>

                          <div className="mt-4">

                            {stream.is_active ? (
                              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                Inactive
                              </span>
                            )}

                          </div>

                        </Link>
                      )
                    )}

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
            to="/academics/classes"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              🎓
            </div>

            <h3 className="font-semibold text-gray-900">
              All Class Levels
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Return to the complete list of class
              levels.
            </p>

          </Link>

          <Link
            to="/academics/streams"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              🏫
            </div>

            <h3 className="font-semibold text-gray-900">
              Manage Streams
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View and manage streams across all
              class levels.
            </p>

          </Link>

          <Link
            to="/academics"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
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

export default ClassLevelDetailsPage;

