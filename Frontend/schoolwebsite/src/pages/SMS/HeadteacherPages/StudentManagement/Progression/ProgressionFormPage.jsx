import React, { useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  Save,
  School,
  User,
} from "lucide-react";

// ==================================================
// HELPERS
// ==================================================

const getId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return value.id ?? value.pk ?? null;
  }

  return value;
};

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
      "—"
    );
  }

  return String(value);
};

const getStudentName = (student) => {
  if (!student) {
    return "Unknown Student";
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
    "Unknown Student"
  );
};

const getAcademicYearName = (enrollment) => {
  if (!enrollment) {
    return "—";
  }

  return (
    enrollment.academic_year_name ||
    enrollment.academic_year?.name ||
    getName(enrollment.academic_year)
  );
};

const getClassLevelName = (enrollment) => {
  if (!enrollment) {
    return "—";
  }

  return (
    enrollment.class_level_name ||
    enrollment.class_level?.name ||
    getName(enrollment.class_level)
  );
};

const getStreamName = (enrollment) => {
  if (!enrollment) {
    return "—";
  }

  return (
    enrollment.stream_name ||
    enrollment.stream?.name ||
    getName(enrollment.stream)
  );
};

// ==================================================
// MAIN COMPONENT
// ==================================================

const ProgressionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  // ==================================================
  // STATE
  // ==================================================

  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [streams, setStreams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [selectedEnrollment, setSelectedEnrollment] =
    useState("");

  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState("");

  const [decision, setDecision] =
    useState("promoted");

  const [selectedClassLevel, setSelectedClassLevel] =
    useState("");

  const [selectedStream, setSelectedStream] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  // ==================================================
  // LOAD INITIAL DATA
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          studentsResponse,
          enrollmentsResponse,
          yearsResponse,
          classesResponse,
          streamsResponse,
        ] = await Promise.all([
          axiosInstance.get("/students/students/"),
          axiosInstance.get("/students/enrollments/"),
          axiosInstance.get("/academics/years/"),
          axiosInstance.get("/academics/class-levels/"),
          axiosInstance.get("/academics/streams/"),
        ]);

        if (cancelled) {
          return;
        }

        const studentsData =
          studentsResponse?.data?.results ??
          studentsResponse?.data ??
          [];

        const enrollmentsData =
          enrollmentsResponse?.data?.results ??
          enrollmentsResponse?.data ??
          [];

        const yearsData =
          yearsResponse?.data?.results ??
          yearsResponse?.data ??
          [];

        const classesData =
          classesResponse?.data?.results ??
          classesResponse?.data ??
          [];

        const streamsData =
          streamsResponse?.data?.results ??
          streamsResponse?.data ??
          [];

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : []
        );

        setEnrollments(
          Array.isArray(enrollmentsData)
            ? enrollmentsData
            : []
        );

        setAcademicYears(
          Array.isArray(yearsData)
            ? yearsData
            : []
        );

        setClassLevels(
          Array.isArray(classesData)
            ? classesData
            : []
        );

        setStreams(
          Array.isArray(streamsData)
            ? streamsData
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load progression form data:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load progression form data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==================================================
  // LOAD EXISTING PROGRESSION
  // ==================================================

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let cancelled = false;

    const loadProgression = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          `/students/progressions/${id}/`
        );

        if (cancelled) {
          return;
        }

        const progression =
          response?.data?.data ??
          response?.data;

        setSelectedStudent(
          String(
            getId(progression?.student) ||
              getId(progression?.student_details) ||
              ""
          )
        );

        setSelectedEnrollment(
          String(
            getId(progression?.from_enrollment) ||
              getId(
                progression?.from_enrollment_details
              ) ||
              ""
          )
        );

        setSelectedAcademicYear(
          String(
            getId(
              progression?.to_academic_year
            ) || ""
          )
        );

        setDecision(
          progression?.decision || "promoted"
        );

        setSelectedClassLevel(
          String(
            getId(
              progression?.to_class_level
            ) || ""
          )
        );

        setSelectedStream(
          String(
            getId(
              progression?.to_stream
            ) || ""
          )
        );

        setRemarks(
          progression?.remarks || ""
        );
      } catch (err) {
        console.error(
          "Failed to load progression:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load progression."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProgression();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  // ==================================================
  // AVAILABLE ENROLLMENTS FOR SELECTED STUDENT
  // ==================================================

  const studentEnrollments = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    return enrollments.filter(
      (enrollment) =>
        String(
          getId(enrollment.student)
        ) === String(selectedStudent)
    );
  }, [enrollments, selectedStudent]);

  // ==================================================
  // CURRENT SOURCE ENROLLMENT
  // ==================================================

  const sourceEnrollment = useMemo(() => {
    if (!selectedEnrollment) {
      return null;
    }

    return (
      enrollments.find(
        (enrollment) =>
          String(
            getId(enrollment)
          ) === String(selectedEnrollment)
      ) || null
    );
  }, [enrollments, selectedEnrollment]);

  // ==================================================
  // TARGET ACADEMIC YEAR
  // ==================================================

  const targetAcademicYear = useMemo(() => {
    if (!selectedAcademicYear) {
      return null;
    }

    return (
      academicYears.find(
        (year) =>
          String(getId(year)) ===
          String(selectedAcademicYear)
      ) || null
    );
  }, [
    academicYears,
    selectedAcademicYear,
  ]);

  // ==================================================
  // TARGET CLASS LEVEL
  // ==================================================

  const targetClassLevel = useMemo(() => {
    if (!selectedClassLevel) {
      return null;
    }

    return (
      classLevels.find(
        (classLevel) =>
          String(getId(classLevel)) ===
          String(selectedClassLevel)
      ) || null
    );
  }, [
    classLevels,
    selectedClassLevel,
  ]);

  // ==================================================
  // AVAILABLE TARGET STREAMS
  // ==================================================

  const targetStreams = useMemo(() => {
    if (!selectedClassLevel) {
      return [];
    }

    return streams.filter(
      (stream) =>
        String(
          getId(stream.class_level)
        ) === String(selectedClassLevel)
    );
  }, [
    streams,
    selectedClassLevel,
  ]);

  // ==================================================
  // STUDENT SELECTION
  // ==================================================

  const handleStudentChange = (event) => {
    const value = event.target.value;

    setSelectedStudent(value);

    // Reset source enrollment
    setSelectedEnrollment("");

    // Reset target placement
    setSelectedClassLevel("");
    setSelectedStream("");
  };

  // ==================================================
  // SOURCE ENROLLMENT SELECTION
  // ==================================================

  const handleEnrollmentChange = (event) => {
    const value = event.target.value;

    setSelectedEnrollment(value);

    const enrollment = enrollments.find(
      (item) =>
        String(getId(item)) ===
        String(value)
    );

    if (!enrollment) {
      setSelectedClassLevel("");
      setSelectedStream("");
      return;
    }

    /*
      Default target placement based on
      the selected decision.
    */

    if (decision === "repeating") {
      const currentClassId = getId(
        enrollment.class_level
      );

      setSelectedClassLevel(
        currentClassId
          ? String(currentClassId)
          : ""
      );

      const currentStreamId = getId(
        enrollment.stream
      );

      setSelectedStream(
        currentStreamId
          ? String(currentStreamId)
          : ""
      );
    }

    if (decision === "promoted") {
      const currentClass =
        classLevels.find(
          (classLevel) =>
            String(getId(classLevel)) ===
            String(
              getId(
                enrollment.class_level
              )
            )
        );

      const nextClassId =
        getId(
          currentClass?.next_class_level
        );

      setSelectedClassLevel(
        nextClassId
          ? String(nextClassId)
          : ""
      );

      /*
        Only retain the current stream if
        that stream belongs to the target class.
      */

      const currentStreamId = getId(
        enrollment.stream
      );

      const nextClassStreams =
        streams.filter(
          (stream) =>
            String(
              getId(stream.class_level)
            ) === String(nextClassId)
        );

      const sameStreamExists =
        nextClassStreams.some(
          (stream) =>
            String(getId(stream)) ===
            String(currentStreamId)
        );

      setSelectedStream(
        sameStreamExists &&
          currentStreamId
          ? String(currentStreamId)
          : ""
      );
    }
  };

  // ==================================================
  // DECISION CHANGE
  // ==================================================

  const handleDecisionChange = (event) => {
    const value = event.target.value;

    setDecision(value);

    if (!sourceEnrollment) {
      setSelectedClassLevel("");
      setSelectedStream("");
      return;
    }

    const currentClassId = getId(
      sourceEnrollment.class_level
    );

    const currentStreamId = getId(
      sourceEnrollment.stream
    );

    // ------------------------------------------------
    // REPEATING
    // ------------------------------------------------

    if (value === "repeating") {
      setSelectedClassLevel(
        currentClassId
          ? String(currentClassId)
          : ""
      );

      setSelectedStream(
        currentStreamId
          ? String(currentStreamId)
          : ""
      );

      return;
    }

    // ------------------------------------------------
    // PROMOTED
    // ------------------------------------------------

    if (value === "promoted") {
      const currentClass =
        classLevels.find(
          (classLevel) =>
            String(getId(classLevel)) ===
            String(currentClassId)
        );

      const nextClassId = getId(
        currentClass?.next_class_level
      );

      setSelectedClassLevel(
        nextClassId
          ? String(nextClassId)
          : ""
      );

      const nextClassStreams =
        streams.filter(
          (stream) =>
            String(
              getId(stream.class_level)
            ) === String(nextClassId)
        );

      const sameStreamExists =
        nextClassStreams.some(
          (stream) =>
            String(getId(stream)) ===
            String(currentStreamId)
        );

      setSelectedStream(
        sameStreamExists &&
          currentStreamId
          ? String(currentStreamId)
          : ""
      );

      return;
    }

    // Other decisions do not have a target class
    setSelectedClassLevel("");
    setSelectedStream("");
  };

  // ==================================================
  // CLASS CHANGE
  // ==================================================

  const handleClassChange = (event) => {
    const value = event.target.value;

    setSelectedClassLevel(value);

    /*
      The current stream may no longer belong
      to the newly selected class.
    */

    if (!value) {
      setSelectedStream("");
      return;
    }

    const streamStillValid =
      streams.some(
        (stream) =>
          String(getId(stream)) ===
            String(selectedStream) &&
          String(
            getId(stream.class_level)
          ) === String(value)
      );

    if (!streamStillValid) {
      setSelectedStream("");
    }
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {
    if (!selectedStudent) {
      return "Please select a student.";
    }

    if (!selectedEnrollment) {
      return "Please select the student's current enrollment.";
    }

    if (!selectedAcademicYear) {
      return "Please select the destination academic year.";
    }

    if (
      sourceEnrollment &&
      String(
        getId(sourceEnrollment.academic_year)
      ) === String(selectedAcademicYear)
    ) {
      return "The destination academic year must be different from the source academic year.";
    }

    if (
      ["promoted", "repeating"].includes(
        decision
      ) &&
      !selectedClassLevel
    ) {
      return "Please select the destination class level.";
    }

    if (
      selectedStream &&
      selectedClassLevel
    ) {
      const streamBelongsToClass =
        streams.some(
          (stream) =>
            String(getId(stream)) ===
              String(selectedStream) &&
            String(
              getId(stream.class_level)
            ) ===
              String(selectedClassLevel)
        );

      if (!streamBelongsToClass) {
        return "The selected stream does not belong to the selected class level.";
      }
    }

    return "";
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        student: Number(selectedStudent),

        from_enrollment: Number(
          selectedEnrollment
        ),

        to_academic_year: Number(
          selectedAcademicYear
        ),

        decision,

        remarks: remarks.trim(),
      };

      /*
        Only promoted/repeating decisions
        receive a target class/stream.
      */

      if (
        ["promoted", "repeating"].includes(
          decision
        )
      ) {
        payload.to_class_level =
          Number(selectedClassLevel);

        payload.to_stream = selectedStream
          ? Number(selectedStream)
          : null;
      }

      let response;

      if (isEditMode) {
        response =
          await axiosInstance.put(
            `/students/progressions/${id}/`,
            payload
          );
      } else {
        response =
          await axiosInstance.post(
            "/students/progressions/",
            payload
          );
      }

      const savedProgression =
        response?.data?.data ??
        response?.data;

      const savedId =
        getId(savedProgression);

      setSuccess(
        isEditMode
          ? "Progression updated successfully."
          : "Progression processed successfully."
      );

      /*
        Give the user a short moment to see
        the success state before navigating.
      */

      setTimeout(() => {
        if (savedId) {
          navigate(
            `/sms/progression/${savedId}`
          );
        } else {
          navigate("/sms/progression");
        }
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save progression:",
        err
      );

      const responseData =
        err?.response?.data;

      let message =
        "Failed to save progression.";

      if (
        typeof responseData === "string"
      ) {
        message = responseData;
      } else if (
        responseData?.detail
      ) {
        message = responseData.detail;
      } else if (
        responseData?.message
      ) {
        message = responseData.message;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError =
          Object.values(
            responseData
          )[0];

        if (Array.isArray(firstError)) {
          message = firstError[0];
        } else if (
          typeof firstError === "string"
        ) {
          message = firstError;
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

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
            Loading progression form...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link
            to="/sms/progression"
            className="hover:text-purple-700"
          >
            Progression
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-900 font-medium">
            {isEditMode
              ? "Edit Progression"
              : "New Progression"}
          </span>
        </div>

        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/sms/progression")
          }
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft size={17} />
          Back to Progression
        </button>

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <GraduationCap size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode
                    ? "Edit Student Progression"
                    : "Process Student Progression"}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Move a student from one academic
                  placement to another.
                </p>
              </div>
            </div>

            <Link
              to="/sms/progression/batch"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-50"
            >
              <UsersIcon />
              Batch Progression
            </Link>
          </div>
        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ==================================================
                MAIN FORM
            ================================================== */}

            <div className="lg:col-span-2 space-y-6">

              {/* ==================================================
                  STUDENT & SOURCE
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <User size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Student & Current Placement
                    </h2>

                    <p className="text-sm text-gray-500">
                      Select the student and enrollment
                      being progressed.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">

                  {/* STUDENT */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student
                      <span className="text-red-500">
                        {" "}
                        *
                      </span>
                    </label>

                    <select
                      value={selectedStudent}
                      onChange={
                        handleStudentChange
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                    >
                      <option value="">
                        Select student
                      </option>

                      {students.map(
                        (student) => (
                          <option
                            key={getId(student)}
                            value={getId(student)}
                          >
                            {getStudentName(
                              student
                            )}
                            {student.admission_number
                              ? ` — ${student.admission_number}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* SOURCE ENROLLMENT */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Enrollment
                      <span className="text-red-500">
                        {" "}
                        *
                      </span>
                    </label>

                    <select
                      value={
                        selectedEnrollment
                      }
                      onChange={
                        handleEnrollmentChange
                      }
                      disabled={
                        !selectedStudent
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">
                        {!selectedStudent
                          ? "Select a student first"
                          : "Select current enrollment"}
                      </option>

                      {studentEnrollments.map(
                        (enrollment) => (
                          <option
                            key={getId(
                              enrollment
                            )}
                            value={getId(
                              enrollment
                            )}
                          >
                            {getAcademicYearName(
                              enrollment
                            )}{" "}
                            —{" "}
                            {getClassLevelName(
                              enrollment
                            )}
                            {getStreamName(
                              enrollment
                            ) !== "—"
                              ? ` — Stream ${getStreamName(
                                  enrollment
                                )}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* CURRENT PLACEMENT SUMMARY */}

                  {sourceEnrollment && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                        Current Placement
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            Academic Year
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {getAcademicYearName(
                              sourceEnrollment
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Class
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {getClassLevelName(
                              sourceEnrollment
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Stream
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {getStreamName(
                              sourceEnrollment
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ==================================================
                  DECISION
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Progression Decision
                    </h2>

                    <p className="text-sm text-gray-500">
                      Determine what happens to this
                      student's current enrollment.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision
                    <span className="text-red-500">
                      {" "}
                      *
                    </span>
                  </label>

                  <select
                    value={decision}
                    onChange={
                      handleDecisionChange
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  >
                    <option value="promoted">
                      Promoted
                    </option>

                    <option value="repeating">
                      Repeating
                    </option>

                    <option value="transferred">
                      Transferred
                    </option>

                    <option value="graduated">
                      Graduated
                    </option>

                    <option value="withdrawn">
                      Withdrawn
                    </option>
                  </select>
                </div>

                {/* DECISION EXPLANATION */}

                <div className="mt-4 rounded-xl bg-purple-50 border border-purple-100 p-4">
                  <p className="text-sm text-purple-800">
                    {decision ===
                      "promoted" &&
                      "The system will suggest the next configured class level for this student."}

                    {decision ===
                      "repeating" &&
                      "The system will suggest keeping the student in their current class level."}

                    {decision ===
                      "transferred" &&
                      "The student will leave the school without creating a new academic enrollment."}

                    {decision ===
                      "graduated" &&
                      "The student's final enrollment will be completed and their student status will become graduated."}

                    {decision ===
                      "withdrawn" &&
                      "The student's current enrollment will be completed and their student status will become withdrawn."}
                  </p>
                </div>
              </div>

              {/* ==================================================
                  TARGET PLACEMENT
              ================================================== */}

              {[
                "promoted",
                "repeating",
              ].includes(decision) && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <School size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        New Academic Placement
                      </h2>

                      <p className="text-sm text-gray-500">
                        Confirm or change the student's
                        destination placement.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* TARGET YEAR */}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Academic Year
                        <span className="text-red-500">
                          {" "}
                          *
                        </span>
                      </label>

                      <select
                        value={
                          selectedAcademicYear
                        }
                        onChange={(event) =>
                          setSelectedAcademicYear(
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                      >
                        <option value="">
                          Select academic year
                        </option>

                        {academicYears.map(
                          (year) => (
                            <option
                              key={getId(year)}
                              value={getId(year)}
                            >
                              {year.name}
                              {year.is_current
                                ? " — Current"
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* TARGET CLASS */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Class
                        <span className="text-red-500">
                          {" "}
                          *
                        </span>
                      </label>

                      <select
                        value={
                          selectedClassLevel
                        }
                        onChange={
                          handleClassChange
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                      >
                        <option value="">
                          Select class
                        </option>

                        {classLevels.map(
                          (classLevel) => (
                            <option
                              key={getId(
                                classLevel
                              )}
                              value={getId(
                                classLevel
                              )}
                            >
                              {classLevel.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* TARGET STREAM */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Stream
                      </label>

                      <select
                        value={
                          selectedStream
                        }
                        onChange={(event) =>
                          setSelectedStream(
                            event.target.value
                          )
                        }
                        disabled={
                          !selectedClassLevel
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {!selectedClassLevel
                            ? "Select class first"
                            : targetStreams.length ===
                              0
                            ? "No streams available"
                            : "Select stream"}
                        </option>

                        {targetStreams.map(
                          (stream) => (
                            <option
                              key={getId(stream)}
                              value={getId(stream)}
                            >
                              {stream.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* TARGET SUMMARY */}

                  {targetAcademicYear &&
                    targetClassLevel && (
                      <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <div className="flex items-start gap-3">
                          <ArrowRight
                            size={20}
                            className="text-purple-700 mt-0.5"
                          />

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                              Proposed Placement
                            </p>

                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {targetAcademicYear.name}
                              {" — "}
                              {targetClassLevel.name}
                              {selectedStream
                                ? ` — Stream ${
                                    targetStreams.find(
                                      (
                                        stream
                                      ) =>
                                        String(
                                          getId(
                                            stream
                                          )
                                        ) ===
                                        String(
                                          selectedStream
                                        )
                                    )?.name ||
                                    ""
                                  }`
                                : ""}
                            </p>

                            <p className="text-sm text-purple-700 mt-1">
                              This placement will
                              become the student's
                              new active enrollment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* ==================================================
                  REMARKS
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Remarks
                    </h2>

                    <p className="text-sm text-gray-500">
                      Optional notes about this decision.
                    </p>
                  </div>
                </div>

                <textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Enter any remarks about this progression..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>
            </div>

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <div className="space-y-6">

              {/* ==================================================
                  SUMMARY
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-6">

                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                  Progression Summary
                </h2>

                {/* STUDENT */}

                <div className="pb-4 mb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    Student
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedStudent
                      ? getStudentName(
                          students.find(
                            (student) =>
                              String(
                                getId(student)
                              ) ===
                              String(
                                selectedStudent
                              )
                          )
                        )
                      : "Not selected"}
                  </p>
                </div>

                {/* FROM */}

                <div className="pb-4 mb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    Current Placement
                  </p>

                  {sourceEnrollment ? (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {getAcademicYearName(
                        sourceEnrollment
                      )}
                      <br />
                      {getClassLevelName(
                        sourceEnrollment
                      )}
                      {getStreamName(
                        sourceEnrollment
                      ) !== "—"
                        ? ` — ${getStreamName(
                            sourceEnrollment
                          )}`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">
                      Not selected
                    </p>
                  )}
                </div>

                {/* DECISION */}

                <div className="pb-4 mb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    Decision
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {decision ===
                    "promoted" ? (
                      <ArrowRight
                        size={17}
                        className="text-emerald-600"
                      />
                    ) : decision ===
                      "repeating" ? (
                      <RefreshCw
                        size={17}
                        className="text-amber-600"
                      />
                    ) : decision ===
                      "graduated" ? (
                      <GraduationCap
                        size={17}
                        className="text-purple-600"
                      />
                    ) : (
                      <CheckCircle
                        size={17}
                        className="text-gray-500"
                      />
                    )}

                    <span className="text-sm font-semibold text-gray-900">
                      {decision
                        ? decision
                            .charAt(0)
                            .toUpperCase() +
                          decision.slice(1)
                        : "Not selected"}
                    </span>
                  </div>
                </div>

                {/* TARGET */}

                <div>
                  <p className="text-xs text-gray-500">
                    Destination
                  </p>

                  {[
                    "promoted",
                    "repeating",
                  ].includes(decision) ? (
                    selectedAcademicYear &&
                    selectedClassLevel ? (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {targetAcademicYear?.name ||
                          "—"}
                        <br />
                        {targetClassLevel?.name ||
                          "—"}
                        {selectedStream
                          ? ` — ${
                              targetStreams.find(
                                (stream) =>
                                  String(
                                    getId(
                                      stream
                                    )
                                  ) ===
                                  String(
                                    selectedStream
                                  )
                              )?.name || ""
                            }`
                          : ""}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">
                        Not selected
                      </p>
                    )
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      No new enrollment
                    </p>
                  )}
                </div>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {isEditMode
                        ? "Update Progression"
                        : "Process Progression"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/sms/progression"
                    )
                  }
                  disabled={saving}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
                >
                  <ArrowLeft size={17} />
                  Cancel
                </button>
              </div>

              {/* ==================================================
                  INFORMATION
              ================================================== */}

              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={20}
                    className="text-purple-700 mt-0.5"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-purple-900">
                      Progression Rule
                    </h3>

                    <p className="text-sm text-purple-800 mt-2 leading-6">
                      Promoted students are normally
                      moved to the class configured as
                      the current class level's next class.
                      Repeating students remain in their
                      current class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================================================
// SMALL ICON COMPONENT
// ==================================================

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default ProgressionFormPage;

