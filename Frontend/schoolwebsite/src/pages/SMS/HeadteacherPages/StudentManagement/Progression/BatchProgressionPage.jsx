import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


/*
==================================================
BATCH PROGRESSION
==================================================

Workflow:

1. Select source academic year
2. Select source class
3. Select target academic year
4. Select progression decision
5. Load students
6. Select students
7. Review target placement
8. Process progression

Promotion:
- Defaults to ClassLevel.next_class_level
- Keeps current stream where possible

Repeating:
- Defaults to current class
- Keeps current stream

Exit decisions:
- Transferred
- Graduated
- Withdrawn

These do not create a new enrollment.
==================================================
*/


// ==================================================
// HELPERS
// ==================================================

const extractList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const getId = (item) => {
  if (!item) return null;

  return item.id ?? item.pk ?? null;
};


const getStudentName = (student) => {
  if (!student) return "Unknown Student";

  if (student.full_name) {
    return student.full_name;
  }

  return [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown Student";
};


const getClassName = (classLevel) => {
  if (!classLevel) return "—";

  return (
    classLevel.name ||
    classLevel.code ||
    "—"
  );
};


const getStreamName = (stream) => {
  if (!stream) return "No stream";

  return (
    stream.name ||
    stream.code ||
    "No stream"
  );
};


// ==================================================
// COMPONENT
// ==================================================

const BatchProgressionPage = () => {
  const navigate = useNavigate();


  // ==================================================
  // DATA
  // ==================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [streams, setStreams] = useState([]);
  const [enrollments, setEnrollments] = useState([]);


  // ==================================================
  // SELECTION
  // ==================================================

  const [fromAcademicYear, setFromAcademicYear] =
    useState("");

  const [fromClassLevel, setFromClassLevel] =
    useState("");

  const [toAcademicYear, setToAcademicYear] =
    useState("");

  const [decision, setDecision] =
    useState("promoted");


  // ==================================================
  // STUDENTS
  // ==================================================

  const [selectedStudents, setSelectedStudents] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");


  // ==================================================
  // OVERRIDES
  // ==================================================

  const [studentOverrides, setStudentOverrides] =
    useState({});


  // ==================================================
  // UI
  // ==================================================

  const [loading, setLoading] =
    useState(true);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // FETCH ACADEMIC DATA
  // ==================================================

  useEffect(() => {
    const loadAcademicData = async () => {
      try {
        setLoading(true);

        const [
          yearsResponse,
          classesResponse,
          streamsResponse,
        ] = await Promise.all([
          axiosInstance.get(
            "/academics/years/"
          ),
          axiosInstance.get(
            "/academics/class-levels/"
          ),
          axiosInstance.get(
            "/academics/streams/"
          ),
        ]);

        setAcademicYears(
          extractList(yearsResponse)
        );

        setClassLevels(
          extractList(classesResponse)
        );

        setStreams(
          extractList(streamsResponse)
        );

      } catch (err) {
        console.error(
          "Failed to load academic data:",
          err
        );

        setError(
          "Failed to load academic configuration."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAcademicData();
  }, []);


  // ==================================================
  // SELECTED SOURCE CLASS
  // ==================================================

  const sourceClass = useMemo(() => {
    return classLevels.find(
      (item) =>
        String(getId(item)) ===
        String(fromClassLevel)
    );
  }, [
    classLevels,
    fromClassLevel,
  ]);


  // ==================================================
  // DEFAULT TARGET CLASS
  // ==================================================

  const defaultTargetClass = useMemo(() => {

    if (!sourceClass) {
      return null;
    }

    if (decision === "promoted") {
      return (
        sourceClass.next_class_level ||
        null
      );
    }

    if (decision === "repeating") {
      return sourceClass;
    }

    return null;

  }, [
    sourceClass,
    decision,
  ]);


  // ==================================================
  // AVAILABLE TARGET STREAMS
  // ==================================================

  const getStreamsForClass = (classId) => {
    if (!classId) return [];

    return streams.filter(
      (stream) =>
        String(
          stream.class_level
        ) === String(classId) ||
        String(
          stream.class_level?.id
        ) === String(classId)
    );
  };


  // ==================================================
  // LOAD STUDENTS
  // ==================================================

  const loadStudents = async () => {

    if (
      !fromAcademicYear ||
      !fromClassLevel
    ) {
      setError(
        "Select the source academic year and class first."
      );

      return;
    }

    try {

      setLoadingStudents(true);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.get(
          "/students/enrollments/",
          {
            params: {
              academic_year:
                fromAcademicYear,

              class_level:
                fromClassLevel,

              status: "active",
            },
          }
        );

      setEnrollments(
        extractList(response)
      );

      setSelectedStudents([]);
      setStudentOverrides({});

    } catch (err) {

      console.error(
        "Failed to load students:",
        err
      );

      setError(
        "Failed to load students for the selected class."
      );

    } finally {
      setLoadingStudents(false);
    }
  };


  // ==================================================
  // STUDENT SEARCH
  // ==================================================

  const filteredEnrollments =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return enrollments;
      }

      return enrollments.filter(
        (enrollment) => {

          const student =
            enrollment.student;

          const name =
            getStudentName(
              student
            ).toLowerCase();

          const admission =
            (
              student?.admission_number ||
              ""
            ).toLowerCase();

          return (
            name.includes(search) ||
            admission.includes(search)
          );
        }
      );

    }, [
      enrollments,
      searchTerm,
    ]);


  // ==================================================
  // SELECT STUDENT
  // ==================================================

  const toggleStudent = (
    studentId
  ) => {

    setSelectedStudents(
      (current) => {

        if (
          current.includes(studentId)
        ) {
          return current.filter(
            (id) => id !== studentId
          );
        }

        return [
          ...current,
          studentId,
        ];
      }
    );
  };


  // ==================================================
  // SELECT ALL
  // ==================================================

  const selectAllVisible = () => {

    const visibleIds =
      filteredEnrollments
        .map(
          (enrollment) =>
            getId(
              enrollment.student
            ) ||
            enrollment.student
        )
        .filter(Boolean);

    setSelectedStudents(
      (current) => {

        const allSelected =
          visibleIds.every(
            (id) =>
              current.includes(id)
          );

        if (allSelected) {
          return current.filter(
            (id) =>
              !visibleIds.includes(id)
          );
        }

        return Array.from(
          new Set([
            ...current,
            ...visibleIds,
          ])
        );
      }
    );
  };


  // ==================================================
  // UPDATE OVERRIDE
  // ==================================================

  const updateStudentOverride = (
    studentId,
    field,
    value
  ) => {

    setStudentOverrides(
      (current) => ({
        ...current,

        [studentId]: {
          ...(current[studentId] || {}),
          [field]: value
            ? Number(value)
            : null,
        },
      })
    );
  };


  // ==================================================
  // TARGET CLASS
  // ==================================================

  const getTargetClassForStudent = (
    studentId
  ) => {

    const override =
      studentOverrides[
        studentId
      ];

    if (
      override?.to_class_level
    ) {

      return classLevels.find(
        (item) =>
          String(
            getId(item)
          ) === String(
            override.to_class_level
          )
      );
    }

    return defaultTargetClass;
  };


  // ==================================================
  // TARGET STREAM
  // ==================================================

  const getTargetStreamForStudent = (
    studentId,
    enrollment
  ) => {

    const override =
      studentOverrides[
        studentId
      ];

    if (
      override?.to_stream
    ) {

      return streams.find(
        (item) =>
          String(
            getId(item)
          ) === String(
            override.to_stream
          )
      );
    }

    if (
      decision === "promoted" ||
      decision === "repeating"
    ) {

      const currentStream =
        enrollment.stream;

      if (
        currentStream &&
        typeof currentStream ===
          "object"
      ) {
        return currentStream;
      }

      const currentStreamId =
        getId(currentStream);

      return streams.find(
        (stream) =>
          String(
            getId(stream)
          ) ===
          String(currentStreamId)
      );
    }

    return null;
  };


  // ==================================================
  // VALIDATION
  // ==================================================

  const validateBeforeProcessing = () => {

    if (!fromAcademicYear) {
      return "Select the source academic year.";
    }

    if (!fromClassLevel) {
      return "Select the source class.";
    }

    if (!toAcademicYear) {
      return "Select the target academic year.";
    }

    if (
      String(fromAcademicYear) ===
      String(toAcademicYear)
    ) {
      return "Source and target academic years must be different.";
    }

    if (
      selectedStudents.length === 0
    ) {
      return "Select at least one student.";
    }

    if (
      (decision === "promoted" ||
        decision === "repeating") &&
      !defaultTargetClass
    ) {
      return (
        decision === "promoted"
          ? "The selected class has no configured next class."
          : "A target class could not be determined."
      );
    }

    return null;
  };


  // ==================================================
  // PROCESS BATCH
  // ==================================================

  const processBatch = async () => {

    const validationError =
      validateBeforeProcessing();

    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmed =
      window.confirm(
        `Process ${selectedStudents.length} selected student(s) as ${decision}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setProcessing(true);
      setError("");
      setSuccess("");

      const response =
        await axiosInstance.post(
          "/students/progressions/batch/",
          {
            student_ids:
              selectedStudents,

            from_academic_year:
              Number(
                fromAcademicYear
              ),

            from_class_level:
              Number(
                fromClassLevel
              ),

            to_academic_year:
              Number(
                toAcademicYear
              ),

            decision,

            student_overrides:
              studentOverrides,

            remarks:
              "Batch progression",
          }
        );

      setSuccess(
        response.data?.message ||
          "Batch progression completed successfully."
      );

      setSelectedStudents([]);
      setStudentOverrides({});

      await loadStudents();

    } catch (err) {

      console.error(
        "Batch progression failed:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.join(" ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Batch progression could not be completed."
        );
      }

    } finally {
      setProcessing(false);
    }
  };


  // ==================================================
  // RENDER
  // ==================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">
          Loading progression setup...
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/student-management"
            className="hover:text-purple-700"
          >
            Student Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/sms/progression"
            className="hover:text-purple-700"
          >
            Progression
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Batch Progression
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <Users size={25} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Batch Progression
              </h1>

              <p className="text-gray-600 mt-1">
                Progress multiple students from one academic year to another.
              </p>
            </div>

          </div>


          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={17} />
            Back
          </button>

        </div>

      </div>


      {/* ==================================================
          QUICK NAVIGATION
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 overflow-x-auto">

        <div className="flex items-center gap-2 min-w-max">

          <Link
            to="/sms/students"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Students
          </Link>

          <Link
            to="/sms/enrollments"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Enrollments
          </Link>

          <Link
            to="/sms/progression"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Progression History
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Batch Progression
          </span>

        </div>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <X size={19} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}


      {success && (
        <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
          <Check size={19} className="mt-0.5" />
          <span>{success}</span>
        </div>
      )}


      {/* ==================================================
          STEP 1 — PROGRESSION SETUP
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold">
            1
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              Progression Setup
            </h2>

            <p className="text-sm text-gray-500">
              Choose where the students are coming from and where they are going.
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Source Year */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Source Academic Year
            </label>

            <select
              value={fromAcademicYear}
              onChange={(event) => {
                setFromAcademicYear(
                  event.target.value
                );
                setEnrollments([]);
                setSelectedStudents([]);
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">
                Select source year
              </option>

              {academicYears.map((year) => (
                <option
                  key={getId(year)}
                  value={getId(year)}
                >
                  {year.name}
                </option>
              ))}
            </select>

          </div>


          {/* Source Class */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Source Class
            </label>

            <select
              value={fromClassLevel}
              onChange={(event) => {
                setFromClassLevel(
                  event.target.value
                );
                setEnrollments([]);
                setSelectedStudents([]);
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">
                Select source class
              </option>

              {classLevels.map((classLevel) => (
                <option
                  key={getId(classLevel)}
                  value={getId(classLevel)}
                >
                  {getClassName(classLevel)}
                </option>
              ))}
            </select>

          </div>


          {/* Target Year */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Academic Year
            </label>

            <select
              value={toAcademicYear}
              onChange={(event) =>
                setToAcademicYear(
                  event.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">
                Select target year
              </option>

              {academicYears.map((year) => (
                <option
                  key={getId(year)}
                  value={getId(year)}
                >
                  {year.name}
                </option>
              ))}
            </select>

          </div>


          {/* Decision */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Decision
            </label>

            <select
              value={decision}
              onChange={(event) => {
                setDecision(
                  event.target.value
                );
                setStudentOverrides({});
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        </div>


        {/* Target explanation */}
        {(decision === "promoted" ||
          decision === "repeating") && (
          <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

            <div className="flex items-start gap-3">

              <GraduationCap
                size={20}
                className="text-purple-700 mt-0.5"
              />

              <div>

                <p className="font-semibold text-purple-800">
                  Default target placement
                </p>

                {decision === "promoted" ? (
                  <p className="text-sm text-purple-700 mt-1">
                    Students will be moved to{" "}
                    <strong>
                      {getClassName(
                        defaultTargetClass
                      )}
                    </strong>{" "}
                    based on the configured next class.
                    Their current stream will be retained where possible.
                  </p>
                ) : (
                  <p className="text-sm text-purple-700 mt-1">
                    Students will remain in{" "}
                    <strong>
                      {getClassName(
                        defaultTargetClass
                      )}
                    </strong>{" "}
                    and retain their current stream unless changed below.
                  </p>
                )}

              </div>

            </div>

          </div>
        )}


        {(decision === "graduated" ||
          decision === "transferred" ||
          decision === "withdrawn") && (
          <div className="mt-5 p-4 rounded-lg bg-gray-100 border border-gray-200">

            <p className="text-sm text-gray-700">
              This is an exit decision. The student's current enrollment
              will be completed and no new enrollment will be created.
            </p>

            {decision === "graduated" && (
              <p className="text-sm text-purple-700 mt-1 font-medium">
                The student's overall status will become Graduated.
              </p>
            )}

          </div>
        )}


        <div className="mt-5">

          <button
            type="button"
            onClick={loadStudents}
            disabled={
              loadingStudents ||
              !fromAcademicYear ||
              !fromClassLevel
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <RefreshCw
              size={17}
              className={
                loadingStudents
                  ? "animate-spin"
                  : ""
              }
            />

            {loadingStudents
              ? "Loading Students..."
              : "Load Students"}

          </button>

        </div>

      </div>


      {/* ==================================================
          STEP 2 — STUDENTS
      ================================================== */}

      {enrollments.length > 0 && (

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-6">

          <div className="px-5 py-4 bg-gray-800 text-white">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

              <div>

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center font-bold">
                    2
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg">
                      Select Students
                    </h2>

                    <p className="text-sm text-gray-300">
                      {selectedStudents.length} selected
                      {" "}of{" "}
                      {enrollments.length}
                    </p>
                  </div>

                </div>

              </div>


              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search students..."
                  className="pl-9 pr-4 py-2 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none"
                />

              </div>

            </div>

          </div>


          {/* Select all */}
          <div className="px-5 py-3 bg-gray-100 border-b border-gray-200">

            <button
              type="button"
              onClick={selectAllVisible}
              className="text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              Select / deselect all visible
            </button>

          </div>


          {/* Students */}
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="w-12 px-5 py-3"></th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Student
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Current Class
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Current Stream
                  </th>

                  {(decision === "promoted" ||
                    decision === "repeating") && (
                    <>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                        Target Class
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
                        Target Stream
                      </th>
                    </>
                  )}

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {filteredEnrollments.map(
                  (enrollment) => {

                    const student =
                      enrollment.student;

                    const studentId =
                      getId(student) ||
                      enrollment.student;

                    const currentClass =
                      enrollment.class_level;

                    const currentStream =
                      enrollment.stream;

                    const targetClass =
                      getTargetClassForStudent(
                        studentId
                      );

                    const targetStreams =
                      getStreamsForClass(
                        getId(
                          targetClass
                        )
                      );

                    const targetStream =
                      getTargetStreamForStudent(
                        studentId,
                        enrollment
                      );

                    const selected =
                      selectedStudents.includes(
                        studentId
                      );

                    return (
                      <tr
                        key={
                          getId(
                            enrollment
                          )
                        }
                        className={
                          selected
                            ? "bg-purple-50"
                            : "hover:bg-gray-100"
                        }
                      >

                        {/* Checkbox */}
                        <td className="px-5 py-4">

                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleStudent(
                                studentId
                              )
                            }
                            className="w-4 h-4 accent-purple-700"
                          />

                        </td>


                        {/* Student */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                              <Users size={18} />
                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">
                                {getStudentName(
                                  student
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                {student?.admission_number ||
                                  "No admission number"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Current Class */}
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {getClassName(
                            currentClass
                          )}
                        </td>


                        {/* Current Stream */}
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {getStreamName(
                            currentStream
                          )}
                        </td>


                        {(decision === "promoted" ||
                          decision === "repeating") && (
                          <>

                            {/* Target Class */}
                            <td className="px-5 py-4">

                              <select
                                value={
                                  studentOverrides[
                                    studentId
                                  ]?.to_class_level ||
                                  getId(
                                    targetClass
                                  ) ||
                                  ""
                                }
                                onChange={(event) =>
                                  updateStudentOverride(
                                    studentId,
                                    "to_class_level",
                                    event.target.value
                                  )
                                }
                                className="min-w-[160px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                      {getClassName(
                                        classLevel
                                      )}
                                    </option>
                                  )
                                )}

                              </select>

                            </td>


                            {/* Target Stream */}
                            <td className="px-5 py-4">

                              <select
                                value={
                                  studentOverrides[
                                    studentId
                                  ]?.to_stream ||
                                  getId(
                                    targetStream
                                  ) ||
                                  ""
                                }
                                onChange={(event) =>
                                  updateStudentOverride(
                                    studentId,
                                    "to_stream",
                                    event.target.value
                                  )
                                }
                                className="min-w-[160px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >

                                <option value="">
                                  No stream
                                </option>

                                {targetStreams.map(
                                  (stream) => (
                                    <option
                                      key={getId(
                                        stream
                                      )}
                                      value={getId(
                                        stream
                                      )}
                                    >
                                      {getStreamName(
                                        stream
                                      )}
                                    </option>
                                  )
                                )}

                              </select>

                            </td>

                          </>
                        )}

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}


      {/* ==================================================
          STEP 3 — REVIEW
      ================================================== */}

      {enrollments.length > 0 && (

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold">
              3
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">
                Review & Process
              </h2>

              <p className="text-sm text-gray-500">
                Confirm the selected students before processing.
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
              <p className="text-xs uppercase font-semibold text-gray-500">
                Students
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {selectedStudents.length}
              </p>
            </div>


            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs uppercase font-semibold text-purple-600">
                Decision
              </p>

              <p className="text-lg font-bold text-purple-800 mt-1 capitalize">
                {decision}
              </p>
            </div>


            <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
              <p className="text-xs uppercase font-semibold text-gray-500">
                Target Year
              </p>

              <p className="text-lg font-bold text-gray-800 mt-1">
                {
                  academicYears.find(
                    (year) =>
                      String(
                        getId(year)
                      ) ===
                      String(
                        toAcademicYear
                      )
                  )?.name ||
                  "—"
                }
              </p>
            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={processBatch}
              disabled={
                processing ||
                selectedStudents.length === 0
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {processing ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Process {selectedStudents.length} Student
                  {selectedStudents.length === 1
                    ? ""
                    : "s"}
                </>
              )}

            </button>


            <button
              type="button"
              onClick={() => {
                setSelectedStudents([]);
                setStudentOverrides({});
              }}
              disabled={
                processing ||
                selectedStudents.length === 0
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              <X size={18} />
              Clear Selection
            </button>

          </div>

        </div>
      )}


      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {!loadingStudents &&
        enrollments.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Users size={28} />
            </div>

            <h3 className="font-semibold text-gray-800 text-lg">
              No students loaded
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Select a source academic year and class,
              then click Load Students.
            </p>

          </div>
        )}

    </div>
  );
};


export default BatchProgressionPage;

