import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  History,
  RefreshCw,
  School,
  User,
  UserRound,
} from "lucide-react";

// ==================================================
// HELPERS
// ==================================================

const getEntityId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return value.id ?? value.pk ?? null;
  }

  return value;
};

// --------------------------------------------------
// Safe Date Formatter
// --------------------------------------------------

const formatDate = (value) => {
  // Nothing supplied
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  // If already a Date object
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "—";
    }

    return value.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Only accept strings/numbers from here
  if (typeof value !== "string" && typeof value !== "number") {
    return "—";
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return "—";
  }

  // ------------------------------------------------
  // Django DateField usually returns YYYY-MM-DD.
  // Parse it manually to avoid timezone shifting.
  // ------------------------------------------------

  const dateOnlyMatch = rawValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    const date = new Date(year, month - 1, day);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ------------------------------------------------
  // Handle ISO datetime values
  // Example:
  // 2026-09-15T10:30:00Z
  // ------------------------------------------------

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --------------------------------------------------
// Date + Time Formatter
// --------------------------------------------------

const formatDateTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return "—";
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return "—";
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --------------------------------------------------
// Display Helpers
// --------------------------------------------------

const getName = (value) => {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.full_name ||
      value.display_name ||
      value.title ||
      value.first_name ||
      "—"
    );
  }

  return String(value);
};

const getStudentName = (student) => {
  if (!student) {
    return "Student";
  }

  if (typeof student === "string") {
    return student;
  }

  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    student.full_name ||
    student.name ||
    "Student"
  );
};

const getYearName = (enrollment, progression) => {
  return (
    enrollment?.academic_year_name ||
    enrollment?.academic_year?.name ||
    getName(enrollment?.academic_year) ||
    progression?.from_academic_year_name ||
    "—"
  );
};

const getClassName = (enrollment, progression, target = false) => {
  if (target) {
    return (
      enrollment?.class_level_name ||
      enrollment?.class_level?.name ||
      getName(enrollment?.class_level) ||
      progression?.to_class_level_name ||
      "—"
    );
  }

  return (
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    getName(enrollment?.class_level) ||
    "—"
  );
};

const getStreamName = (enrollment, progression, target = false) => {
  if (target) {
    return (
      enrollment?.stream_name ||
      enrollment?.stream?.name ||
      getName(enrollment?.stream) ||
      progression?.to_stream_name ||
      "—"
    );
  }

  return (
    enrollment?.stream_name ||
    enrollment?.stream?.name ||
    getName(enrollment?.stream) ||
    "—"
  );
};

const getDecisionLabel = (decision) => {
  const labels = {
    promoted: "Promoted",
    repeating: "Repeating",
    transferred: "Transferred",
    graduated: "Graduated",
    withdrawn: "Withdrawn",
  };

  return labels[decision] || decision || "Unknown";
};

const getDecisionStyles = (decision) => {
  switch (decision) {
    case "promoted":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };

    case "repeating":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
      };

    case "transferred":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
      };

    case "graduated":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
      };

    case "withdrawn":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
      };

    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
};

// ==================================================
// INFO ROW
// ==================================================

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </div>

    <div className="text-sm font-medium text-gray-900 text-right">
      {value || "—"}
    </div>
  </div>
);

// ==================================================
// DECISION ICON
// ==================================================

const DecisionIcon = ({ decision, size = 22 }) => {
  switch (decision) {
    case "promoted":
      return <ArrowRight size={size} />;

    case "repeating":
      return <RefreshCw size={size} />;

    case "graduated":
      return <GraduationCap size={size} />;

    case "transferred":
      return <School size={size} />;

    case "withdrawn":
      return <History size={size} />;

    default:
      return <CheckCircle size={size} />;
  }
};

// ==================================================
// MAIN COMPONENT
// ==================================================

const ProgressionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH PROGRESSION
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    const fetchProgression = async () => {
      if (!id) {
        setError("No progression record was specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          `/students/progressions/${id}/`
        );

        if (cancelled) {
          return;
        }

        const responseData = response?.data;

        // Support both:
        // response.data
        // response.data.data
        const progressionData =
          responseData?.data ?? responseData;

        setProgression(progressionData);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to fetch progression:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load progression details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProgression();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw
            size={28}
            className="animate-spin text-purple-600"
          />

          <p className="text-sm">
            Loading progression details...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !progression) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/sms/progression")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft size={17} />
            Back to Progression
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <History size={26} />
            </div>

            <h1 className="text-xl font-semibold text-gray-900">
              Unable to Load Progression
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {error || "The progression record could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/sms/progression")}
              className="mt-6 px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              Return to Progression
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // DATA
  // ==================================================

  const studentDetails =
    progression.student_details ||
    (typeof progression.student === "object"
      ? progression.student
      : null) ||
    {};

  const fromEnrollment =
    progression.from_enrollment_details || {};

  const toEnrollment =
    progression.to_enrollment_details || {};

  const decision = progression.decision;

  const studentId =
    getEntityId(progression.student) ||
    getEntityId(studentDetails);

  const fromEnrollmentId =
    getEntityId(progression.from_enrollment) ||
    getEntityId(fromEnrollment);

  const toEnrollmentId =
    getEntityId(progression.to_enrollment) ||
    getEntityId(toEnrollment);

  const studentName = getStudentName(studentDetails);

  const decisionLabel = getDecisionLabel(decision);
  const decisionStyles = getDecisionStyles(decision);

  const sourceYear = getYearName(
    fromEnrollment,
    progression
  );

  const sourceClass = getClassName(
    fromEnrollment,
    progression
  );

  const sourceStream = getStreamName(
    fromEnrollment,
    progression
  );

  const targetYear =
    toEnrollment?.academic_year_name ||
    toEnrollment?.academic_year?.name ||
    getName(toEnrollment?.academic_year) ||
    progression.to_academic_year_name ||
    "—";

  const targetClass = getClassName(
    toEnrollment,
    progression,
    true
  );

  const targetStream = getStreamName(
    toEnrollment,
    progression,
    true
  );

  const hasTargetPlacement =
    Boolean(
      toEnrollmentId ||
        progression.to_class_level ||
        progression.to_class_level_name ||
        progression.to_stream ||
        progression.to_stream_name
    );

  const createsNewEnrollment =
    ["promoted", "repeating"].includes(decision) &&
    hasTargetPlacement;

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            to="/sms/progression"
            className="hover:text-purple-700"
          >
            Progression
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-900 font-medium">
            Details
          </span>
        </div>

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate("/sms/progression")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft size={17} />
          Back to Progression
        </button>

        {/* ==================================================
            HERO
        ================================================== */}

        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white">
                  <UserRound size={32} />
                </div>

                <div>
                  <p className="text-purple-200 text-sm">
                    Student Progression
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {studentName}
                  </h1>

                  {studentDetails.admission_number && (
                    <p className="text-purple-200 text-sm mt-1">
                      Admission No:{" "}
                      <span className="font-medium text-white">
                        {studentDetails.admission_number}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-full ${decisionStyles.bg} ${decisionStyles.text} border ${decisionStyles.border} font-semibold text-sm`}
              >
                <DecisionIcon decision={decision} size={18} />
                {decisionLabel}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==================================================
              LEFT / MAIN
          ================================================== */}

          <div className="lg:col-span-2 space-y-6">

            {/* ==================================================
                PROGRESSION FLOW
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BookOpen size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Progression
                  </h2>

                  <p className="text-sm text-gray-500">
                    Academic placement movement
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">

                {/* SOURCE */}

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    From
                  </p>

                  <h3 className="font-semibold text-gray-900 text-lg">
                    {sourceClass}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {sourceStream !== "—"
                      ? `Stream ${sourceStream}`
                      : "No stream"}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    {sourceYear}
                  </p>

                  {fromEnrollmentId && studentId && (
                    <Link
                      to={`/sms/enrollments/${fromEnrollmentId}`}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-purple-700 hover:text-purple-900"
                    >
                      View Enrollment
                      <ChevronRight size={15} />
                    </Link>
                  )}
                </div>

                {/* ARROW */}

                <div className="hidden md:flex w-11 h-11 rounded-full bg-purple-100 text-purple-700 items-center justify-center">
                  <ArrowRight size={21} />
                </div>

                {/* TARGET */}

                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-3">
                    {createsNewEnrollment
                      ? "To"
                      : "Outcome"}
                  </p>

                  {createsNewEnrollment ? (
                    <>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {targetClass}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {targetStream !== "—"
                          ? `Stream ${targetStream}`
                          : "No stream"}
                      </p>

                      <p className="text-sm text-gray-500 mt-3">
                        {targetYear}
                      </p>

                      {toEnrollmentId && (
                        <Link
                          to={`/sms/enrollments/${toEnrollmentId}`}
                          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-purple-700 hover:text-purple-900"
                        >
                          View Enrollment
                          <ChevronRight size={15} />
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {decisionLabel}
                      </h3>

                      <p className="text-sm text-gray-600 mt-2">
                        No new academic enrollment was created.
                      </p>

                      {progression.to_academic_year_name && (
                        <p className="text-sm text-gray-500 mt-3">
                          Decision year:{" "}
                          {progression.to_academic_year_name}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Student Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Learner identification
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <InfoRow
                  label="Student Name"
                  value={studentName}
                  icon={User}
                />

                <InfoRow
                  label="Student ID"
                  value={
                    studentDetails.student_id ||
                    progression.student_id ||
                    "—"
                  }
                />

                <InfoRow
                  label="Admission Number"
                  value={
                    studentDetails.admission_number ||
                    "—"
                  }
                />

                <InfoRow
                  label="Date of Birth"
                  value={formatDate(
                    studentDetails.date_of_birth ||
                      studentDetails.dob
                  )}
                  icon={CalendarDays}
                />

                <InfoRow
                  label="Gender"
                  value={
                    studentDetails.gender
                      ? String(
                          studentDetails.gender
                        ).replace(
                          /^./,
                          (char) =>
                            char.toUpperCase()
                        )
                      : "—"
                  }
                />
              </div>

              {studentId && (
                <Link
                  to={`/sms/students/${studentId}`}
                  className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  View Student Profile
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>

            {/* ==================================================
                REMARKS
            ================================================== */}

            {progression.remarks && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Remarks
                    </h2>

                    <p className="text-sm text-gray-500">
                      Additional information
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                    {progression.remarks}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-6">

            {/* ==================================================
                DECISION INFORMATION
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Decision Information
              </h2>

              <div className="divide-y divide-gray-100">
                <InfoRow
                  label="Decision"
                  value={decisionLabel}
                />

                <InfoRow
                  label="Decision Date"
                  value={formatDate(
                    progression.decision_date
                  )}
                  icon={CalendarDays}
                />

                <InfoRow
                  label="Progression ID"
                  value={
                    progression.id ??
                    progression.pk ??
                    "—"
                  }
                />
              </div>
            </div>

            {/* ==================================================
                RECORD INFORMATION
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Record Information
              </h2>

              <div className="divide-y divide-gray-100">
                <InfoRow
                  label="Created"
                  value={formatDateTime(
                    progression.created_at
                  )}
                  icon={CalendarDays}
                />

                <InfoRow
                  label="Last Updated"
                  value={formatDateTime(
                    progression.updated_at
                  )}
                  icon={CalendarDays}
                />
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>

              <div className="space-y-3">

                {studentId && (
                  <Link
                    to={`/sms/students/${studentId}`}
                    className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <User size={17} />
                      Student Profile
                    </span>

                    <ChevronRight size={17} />
                  </Link>
                )}

                {fromEnrollmentId && (
                  <Link
                    to={`/sms/enrollments/${fromEnrollmentId}`}
                    className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <School size={17} />
                      Source Enrollment
                    </span>

                    <ChevronRight size={17} />
                  </Link>
                )}

                {toEnrollmentId && (
                  <Link
                    to={`/sms/enrollments/${toEnrollmentId}`}
                    className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-purple-200 text-sm font-medium text-purple-700 hover:bg-purple-50"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight size={17} />
                      New Enrollment
                    </span>

                    <ChevronRight size={17} />
                  </Link>
                )}

                <Link
                  to="/sms/progression"
                  className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                >
                  <span className="flex items-center gap-2">
                    <History size={17} />
                    All Progressions
                  </span>

                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            FOOTER NAVIGATION
        ================================================== */}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/sms/progression")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-700"
          >
            <ArrowLeft size={17} />
            Back to Progression
          </button>

          {studentId && (
            <Link
              to={`/sms/students/${studentId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              Student Profile
              <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressionDetailsPage;

