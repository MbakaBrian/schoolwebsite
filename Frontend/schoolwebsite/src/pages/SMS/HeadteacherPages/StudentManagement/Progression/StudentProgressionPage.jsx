import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Filter,
  GraduationCap,
  History,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../utils/axiosInstance";

/*
==================================================
STUDENT PROGRESSION PAGE
==================================================

Purpose:
- View progression history.
- Filter progression records.
- Search students.
- Navigate to progression details.
- Start a new progression.

Progression decisions:
- Promoted
- Repeating
- Transferred
- Graduated
- Withdrawn

Important:
This page does NOT automatically promote students.

The actual progression decision is made explicitly
from StudentProgressionFormPage.jsx.
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

  const name = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || student.admission_number || "Unknown Student";
};


const getStudentAdmissionNumber = (student) => {
  return student?.admission_number || "No admission number";
};


const getRelationName = (value, fallback = "Not specified") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ||
    value.title ||
    value.code ||
    value.label ||
    value.full_name ||
    fallback
  );
};


const getStatusLabel = (decision) => {
  const labels = {
    promoted: "Promoted",
    repeating: "Repeating",
    transferred: "Transferred",
    graduated: "Graduated",
    withdrawn: "Withdrawn",
  };

  return labels[decision] || decision || "Unknown";
};


const getDecisionClasses = (decision) => {
  const classes = {
    promoted:
      "bg-green-100 text-green-700 border border-green-200",

    repeating:
      "bg-amber-100 text-amber-700 border border-amber-200",

    transferred:
      "bg-blue-100 text-blue-700 border border-blue-200",

    graduated:
      "bg-purple-100 text-purple-700 border border-purple-200",

    withdrawn:
      "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    classes[decision] ||
    "bg-gray-100 text-gray-700 border border-gray-200"
  );
};


const getDecisionIcon = (decision) => {
  switch (decision) {
    case "promoted":
      return <ArrowRight size={15} />;

    case "repeating":
      return <RefreshCw size={15} />;

    case "graduated":
      return <GraduationCap size={15} />;

    case "transferred":
      return <Users size={15} />;

    case "withdrawn":
      return <X size={15} />;

    default:
      return <History size={15} />;
  }
};


const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ==================================================
// COMPONENT
// ==================================================

const StudentProgressionPage = () => {
  const navigate = useNavigate();

  const [progressions, setProgressions] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [streams, setStreams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [showFilters, setShowFilters] = useState(false);


  // ==================================================
  // FETCH DATA
  // ==================================================

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        progressionsResponse,
        studentsResponse,
        yearsResponse,
        classesResponse,
        streamsResponse,
      ] = await Promise.all([
        axiosInstance.get("/students/progressions/"),
        axiosInstance.get("/students/students/"),
        axiosInstance.get("/academics/years/"),
        axiosInstance.get("/academics/class-levels/"),
        axiosInstance.get("/academics/streams/"),
      ]);

      setProgressions(extractList(progressionsResponse));
      setStudents(extractList(studentsResponse));
      setAcademicYears(extractList(yearsResponse));
      setClassLevels(extractList(classesResponse));
      setStreams(extractList(streamsResponse));
    } catch (error) {
      console.error(
        "Failed to load student progression data:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  // ==================================================
  // LOOKUP MAPS
  // ==================================================

  const studentMap = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      const id = getId(student);

      if (id !== null) {
        map[String(id)] = student;
      }
    });

    return map;
  }, [students]);


  const yearMap = useMemo(() => {
    const map = {};

    academicYears.forEach((year) => {
      const id = getId(year);

      if (id !== null) {
        map[String(id)] = year;
      }
    });

    return map;
  }, [academicYears]);


  const classMap = useMemo(() => {
    const map = {};

    classLevels.forEach((classLevel) => {
      const id = getId(classLevel);

      if (id !== null) {
        map[String(id)] = classLevel;
      }
    });

    return map;
  }, [classLevels]);


  const streamMap = useMemo(() => {
    const map = {};

    streams.forEach((stream) => {
      const id = getId(stream);

      if (id !== null) {
        map[String(id)] = stream;
      }
    });

    return map;
  }, [streams]);


  // ==================================================
  // RESOLVE RELATED OBJECTS
  // ==================================================

  const resolveStudent = (progression) => {
    if (progression.student && typeof progression.student === "object") {
      return progression.student;
    }

    const studentId = getId(progression.student);

    return studentMap[String(studentId)] || null;
  };


  const resolveYear = (progression) => {
    if (
      progression.to_academic_year &&
      typeof progression.to_academic_year === "object"
    ) {
      return progression.to_academic_year;
    }

    const yearId = getId(progression.to_academic_year);

    return yearMap[String(yearId)] || null;
  };


  const resolveClass = (progression) => {
    if (
      progression.to_class_level &&
      typeof progression.to_class_level === "object"
    ) {
      return progression.to_class_level;
    }

    const classId = getId(progression.to_class_level);

    return classMap[String(classId)] || null;
  };


  const resolveStream = (progression) => {
    if (
      progression.to_stream &&
      typeof progression.to_stream === "object"
    ) {
      return progression.to_stream;
    }

    const streamId = getId(progression.to_stream);

    return streamMap[String(streamId)] || null;
  };


  // ==================================================
  // FILTER PROGRESSIONS
  // ==================================================

  const filteredProgressions = useMemo(() => {
    return progressions.filter((progression) => {
      const student = resolveStudent(progression);
      const targetYear = resolveYear(progression);
      const targetClass = resolveClass(progression);

      const studentName = getStudentName(student).toLowerCase();

      const admissionNumber = (
        student?.admission_number || ""
      ).toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        studentName.includes(search) ||
        admissionNumber.includes(search);

      const matchesDecision =
        !decisionFilter ||
        progression.decision === decisionFilter;

      const targetYearId = getId(
        progression.to_academic_year
      );

      const matchesYear =
        !yearFilter ||
        String(targetYearId) === String(yearFilter);

      const targetClassId = getId(
        progression.to_class_level
      );

      const matchesClass =
        !classFilter ||
        String(targetClassId) === String(classFilter);

      return (
        matchesSearch &&
        matchesDecision &&
        matchesYear &&
        matchesClass
      );
    });
  }, [
    progressions,
    students,
    academicYears,
    classLevels,
    streams,
    searchTerm,
    decisionFilter,
    yearFilter,
    classFilter,
  ]);


  // ==================================================
  // STATISTICS
  // ==================================================

  const statistics = useMemo(() => {
    return {
      total: progressions.length,

      promoted: progressions.filter(
        (item) => item.decision === "promoted"
      ).length,

      repeating: progressions.filter(
        (item) => item.decision === "repeating"
      ).length,

      graduated: progressions.filter(
        (item) => item.decision === "graduated"
      ).length,

      transferred: progressions.filter(
        (item) => item.decision === "transferred"
      ).length,

      withdrawn: progressions.filter(
        (item) => item.decision === "withdrawn"
      ).length,
    };
  }, [progressions]);


  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  const clearFilters = () => {
    setSearchTerm("");
    setDecisionFilter("");
    setYearFilter("");
    setClassFilter("");
  };


  const hasActiveFilters =
    searchTerm ||
    decisionFilter ||
    yearFilter ||
    classFilter;


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="mb-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link
            to="/student-management"
            className="hover:text-purple-700"
          >
            Student Management
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            Progression
          </span>
        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-800 rounded-xl text-white">
                <History size={25} />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Student Progression
                </h1>

                <p className="text-gray-600 mt-1">
                  Manage and review student academic progression.
                </p>
              </div>
            </div>
          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

        <Link
        to="/sms/progression/batch"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
        >
        <Users size={17} />
        Batch Progression
        </Link>

        <Link
        to="/sms/progression/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 transition"
        >
        <GraduationCap size={17} />
        New Progression
        </Link>

          </div>
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
            to="/sms/families"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Families
          </Link>

          <Link
            to="/sms/parents"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Parents
          </Link>

          <Link
            to="/sms/enrollments"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Enrollments
          </Link>

          <Link
            to="/sms/emergency-contacts"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Emergency Contacts
          </Link>

          <Link
            to="/sms/documents"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Documents
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Progression
          </span>

        </div>
      </div>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

        {/* Total */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Total Decisions
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {statistics.total}
          </p>
        </div>


        {/* Promoted */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">
            Promoted
          </p>

          <p className="text-2xl font-bold text-green-800 mt-1">
            {statistics.promoted}
          </p>
        </div>


        {/* Repeating */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            Repeating
          </p>

          <p className="text-2xl font-bold text-amber-800 mt-1">
            {statistics.repeating}
          </p>
        </div>


        {/* Graduated */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700">
            Graduated
          </p>

          <p className="text-2xl font-bold text-purple-800 mt-1">
            {statistics.graduated}
          </p>
        </div>


        {/* Transferred */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            Transferred
          </p>

          <p className="text-2xl font-bold text-blue-800 mt-1">
            {statistics.transferred}
          </p>
        </div>


        {/* Withdrawn */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            Withdrawn
          </p>

          <p className="text-2xl font-bold text-red-800 mt-1">
            {statistics.withdrawn}
          </p>
        </div>

      </div>


      {/* ==================================================
          SEARCH + FILTERS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by student name or admission number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>


          {/* Filter button */}
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition ${
              showFilters
                ? "bg-purple-100 border-purple-300 text-purple-800"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter size={17} />
            Filters
          </button>


          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <X size={17} />
              Clear
            </button>
          )}

        </div>


        {/* Filter panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">

            {/* Decision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Decision
              </label>

              <select
                value={decisionFilter}
                onChange={(event) =>
                  setDecisionFilter(event.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">
                  All decisions
                </option>

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


            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Academic Year
              </label>

              <select
                value={yearFilter}
                onChange={(event) =>
                  setYearFilter(event.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">
                  All academic years
                </option>

                {academicYears.map((year) => {
                  const yearId = getId(year);

                  return (
                    <option
                      key={yearId}
                      value={yearId}
                    >
                      {year.name || `Year ${yearId}`}
                    </option>
                  );
                })}
              </select>
            </div>


            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Class
              </label>

              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(event.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">
                  All classes
                </option>

                {classLevels.map((classLevel) => {
                  const classId = getId(classLevel);

                  return (
                    <option
                      key={classId}
                      value={classId}
                    >
                      {classLevel.name ||
                        classLevel.code ||
                        `Class ${classId}`}
                    </option>
                  );
                })}
              </select>
            </div>

          </div>
        )}

      </div>


      {/* ==================================================
          RESULTS
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

        {/* Table Header */}
        <div className="px-5 py-4 bg-gray-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-2">

          <div>
            <h2 className="font-semibold text-lg">
              Progression History
            </h2>

            <p className="text-sm text-gray-300">
              Showing {filteredProgressions.length} of{" "}
              {progressions.length} records
            </p>
          </div>

        </div>


        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading progression records...
          </div>
        ) : filteredProgressions.length === 0 ? (
          <div className="p-10 text-center">

            <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <History size={25} />
            </div>

            <h3 className="font-semibold text-gray-800">
              No progression records found
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              {hasActiveFilters
                ? "Try changing or clearing your filters."
                : "No student progression decisions have been recorded yet."}
            </p>

            {!hasActiveFilters && (
              <Link
                to="/sms/progression/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
              >
                <GraduationCap size={17} />
                Record First Progression
              </Link>
            )}

          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100 border-b border-gray-200">

                <tr>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Student
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Decision
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Target Year
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Target Class
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Stream
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Decision Date
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200">

                {filteredProgressions.map((progression) => {

                  const progressionId = getId(progression);

                  const student = resolveStudent(progression);
                  const targetYear = resolveYear(progression);
                  const targetClass = resolveClass(progression);
                  const targetStream = resolveStream(progression);

                  return (
                    <tr
                      key={progressionId}
                      className="hover:bg-purple-50/40 transition"
                    >

                      {/* Student */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {getStudentName(student)}
                            </p>

                            <p className="text-xs text-gray-500">
                              {getStudentAdmissionNumber(student)}
                            </p>
                          </div>

                        </div>

                      </td>


                      {/* Decision */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getDecisionClasses(
                            progression.decision
                          )}`}
                        >
                          {getDecisionIcon(
                            progression.decision
                          )}

                          {getStatusLabel(
                            progression.decision
                          )}
                        </span>

                      </td>


                      {/* Target Year */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getRelationName(
                          targetYear,
                          "—"
                        )}
                      </td>


                      {/* Target Class */}
                      <td className="px-5 py-4">

                        {targetClass ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {getRelationName(
                                targetClass,
                                "—"
                              )}
                            </p>

                            {targetClass.code && (
                              <p className="text-xs text-gray-500">
                                {targetClass.code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}

                      </td>


                      {/* Stream */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {getRelationName(
                          targetStream,
                          "—"
                        )}
                      </td>


                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          progression.decision_date
                        )}
                      </td>


                      {/* Action */}
                      <td className="px-5 py-4 text-right">

                        <Link
                          to={`/sms/progression/${progressionId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 text-sm font-medium transition"
                        >
                          View
                          <ChevronRight size={15} />
                        </Link>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};


export default StudentProgressionPage;

