import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

const StreamDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [classLevel, setClassLevel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH STREAM
  // --------------------------------------------------
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          `/academics/streams/${id}/`
        );

        const streamData = response.data;

        setStream(streamData);

        // If serializer returns the class level as an object,
        // use it directly.
        if (
          streamData.class_level &&
          typeof streamData.class_level === "object"
        ) {
          setClassLevel(streamData.class_level);
        } else if (streamData.class_level) {
          // Otherwise fetch it using the ID.
          const classLevelResponse = await axiosInstance.get(
            `/academics/class-levels/${streamData.class_level}/`
          );

          setClassLevel(classLevelResponse.data);
        }
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
  }, [id]);

  // --------------------------------------------------
  // DELETE STREAM
  // --------------------------------------------------
  const handleDelete = async () => {
    if (!stream) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the stream "${stream.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await axiosInstance.delete(`/academics/streams/${id}/`);

      navigate("/academics/streams");
    } catch (err) {
      console.error("Failed to delete stream:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete stream. The stream may already be in use."
      );
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR / NOT FOUND
  // --------------------------------------------------
  if (!stream) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link
              to="/academics/streams"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              ← Back to Streams
            </Link>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Stream Not Found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "The requested stream could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DISPLAY HELPERS
  // --------------------------------------------------
  const classLevelId =
    typeof stream.class_level === "object"
      ? stream.class_level?.id
      : stream.class_level;

  const classLevelName =
    classLevel?.name ||
    stream.class_level_name ||
    (typeof stream.class_level === "object"
      ? stream.class_level?.name
      : "Unknown Class Level");

  const classLevelCode =
    classLevel?.code ||
    stream.class_level_code ||
    (typeof stream.class_level === "object"
      ? stream.class_level?.code
      : "");

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6">
          <Link
            to="/academics/streams"
            className="mb-3 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            ← Back to Streams
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {stream.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    stream.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {stream.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Stream details and configuration
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/academics/streams/${id}/edit`}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Stream
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* STREAM INFORMATION */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Stream Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Basic information about this academic stream.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* NAME */}
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Stream Name
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {stream.name || "—"}
                  </p>
                </div>

                {/* CODE */}
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Stream Code
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {stream.code || "—"}
                  </p>
                </div>

                {/* CLASS LEVEL */}
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Class Level
                  </p>

                  {classLevelId ? (
                    <Link
                      to={`/academics/classes/${classLevelId}`}
                      className="mt-1 inline-flex items-center text-base font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {classLevelName}

                      {classLevelCode && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({classLevelCode})
                        </span>
                      )}
                    </Link>
                  ) : (
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {classLevelName}
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        stream.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stream.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* ID */}
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Stream ID
                  </p>

                  <p className="mt-1 font-mono text-sm text-gray-700">
                    #{stream.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* CLASS LEVEL CARD */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Parent Class Level
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                This stream belongs to:
              </p>

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">
                  {classLevelName}
                </p>

                {classLevelCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Code: {classLevelCode}
                  </p>
                )}

                {classLevelId && (
                  <Link
                    to={`/academics/classes/${classLevelId}`}
                    className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Class Level →
                  </Link>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h2>

              <div className="mt-4 space-y-2">
                <Link
                  to={`/academics/streams/${id}/edit`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Stream
                  <span>→</span>
                </Link>

                {classLevelId && (
                  <Link
                    to={`/academics/classes/${classLevelId}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Class Level
                    <span>→</span>
                  </Link>
                )}

                <Link
                  to="/academics/streams"
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  All Streams
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMATION NOTE */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="text-sm font-semibold text-blue-900">
            About Academic Streams
          </h2>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            A stream represents a subdivision of a class level, such as
            Grade 4 East, Grade 4 West, or Grade 4 North. Students can
            later be enrolled into a specific stream through the student
            enrollment system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreamDetailsPage;