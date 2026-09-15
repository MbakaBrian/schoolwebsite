import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ArrowRight,
  RefreshCw,
  School,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

export default function HeadTeacherDashboard() {
  const [data, setData] = useState({
    students: [],
    enrollments: [],
    academicYears: [],
    academicTerms: [],
    classLevels: [],
    streams: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------------------------------------
  // FETCH CURRENT FOUNDATION DATA
  // --------------------------------------------------

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const stored = localStorage.getItem("authData");
      const token = stored ? JSON.parse(stored).access : null;

      if (!token) {
        setError("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        studentsResponse,
        enrollmentsResponse,
        academicYearsResponse,
        academicTermsResponse,
        classLevelsResponse,
        streamsResponse,
      ] = await Promise.all([
        axios.get(
          "http://127.0.0.1:8000/api/students/students/",
          { headers }
        ),

        axios.get(
          "http://127.0.0.1:8000/api/students/enrollments/",
          { headers }
        ),

        axios.get(
          "http://127.0.0.1:8000/api/academics/years/",
          { headers }
        ),

        axios.get(
          "http://127.0.0.1:8000/api/academics/terms/",
          { headers }
        ),

        axios.get(
          "http://127.0.0.1:8000/api/academics/class-levels/",
          { headers }
        ),

        axios.get(
          "http://127.0.0.1:8000/api/academics/streams/",
          { headers }
        ),
      ]);

      const getResults = (response) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }

        if (Array.isArray(response.data?.results)) {
          return response.data.results;
        }

        return [];
      };

      setData({
        students: getResults(studentsResponse),
        enrollments: getResults(enrollmentsResponse),
        academicYears: getResults(academicYearsResponse),
        academicTerms: getResults(academicTermsResponse),
        classLevels: getResults(classLevelsResponse),
        streams: getResults(streamsResponse),
      });
    } catch (err) {
      console.error("Error loading Head Teacher dashboard:", err);

      setError(
        "Some dashboard information could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-72 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>

          <div className="h-64 bg-white rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-red-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load dashboard
              </h2>

              <p className="text-gray-500 mb-5">
                {error}
              </p>

              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CALCULATE CURRENT DATA
  // --------------------------------------------------

  const {
    students,
    enrollments,
    academicYears,
    academicTerms,
    classLevels,
    streams,
  } = data;

  const activeStudents = students.filter(
    (student) => student.status === "active"
  );

  const currentYear =
    academicYears.find((year) => year.is_current) ||
    academicYears[0] ||
    null;

  const currentTerm =
    academicTerms.find((term) => term.is_current) ||
    academicTerms[0] ||
    null;

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "active"
  );

  // --------------------------------------------------
  // QUICK ACCESS CARDS
  // --------------------------------------------------

  const quickAccess = [
    {
      title: "Student Management",
      description:
        "Manage students, families, parents and student records.",
      icon: Users,
      path: "/student-management",
    },
    {
      title: "Academic Management",
      description:
        "Manage academic years, terms, classes and streams.",
      icon: GraduationCap,
      path: "/academics",
    },
    {
      title: "Academic Years",
      description:
        "View and manage the school's academic years.",
      icon: CalendarDays,
      path: "/academics/years",
    },
    {
      title: "Classes & Streams",
      description:
        "Manage class levels and their streams.",
      icon: School,
      path: "/academics/classes",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <School className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Head Teacher Portal
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome to School Management
                  </h1>
                </div>
              </div>

              <p className="text-gray-500 max-w-2xl">
                Manage the school's academic structure and student
                information from one central place.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

          </div>

          {/* CURRENT ACADEMIC PERIOD */}

          <div className="mt-6 pt-6 border-t border-gray-100">

            <div className="flex flex-col sm:flex-row gap-4">

              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-purple-600" />

                <div>
                  <p className="text-xs text-gray-500">
                    Current Academic Year
                  </p>

                  <p className="font-semibold text-gray-900">
                    {currentYear?.name || "Not configured"}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-600" />

                <div>
                  <p className="text-xs text-gray-500">
                    Current Term
                  </p>

                  <p className="font-semibold text-gray-900">
                    {currentTerm?.name ||
                      currentTerm?.term ||
                      "Not configured"}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            FOUNDATION STATISTICS
        ================================================== */}

        <section>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                School Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Information currently available in the system.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* STUDENTS */}

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Total Students
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {students.length}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>

                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Student records in the system
                </p>

              </CardContent>
            </Card>


            {/* ACTIVE STUDENTS */}

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Active Students
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {activeStudents.length}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>

                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Currently active student records
                </p>

              </CardContent>
            </Card>


            {/* CLASSES */}

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Class Levels
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {classLevels.length}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                    <School className="w-5 h-5 text-blue-600" />
                  </div>

                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Academic class levels configured
                </p>

              </CardContent>
            </Card>


            {/* STREAMS */}

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-gray-500">
                      Streams
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {streams.length}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-gray-700" />
                  </div>

                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Streams configured across classes
                </p>

              </CardContent>
            </Card>

          </div>
        </section>


        {/* ==================================================
            QUICK ACCESS
        ================================================== */}

        <section>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Access
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Access the main management areas of the school system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {quickAccess.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() => {
                    window.location.href = item.path;
                  }}
                  className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-purple-200 transition group"
                >

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition">
                      <Icon className="w-6 h-6 text-purple-600 group-hover:text-white transition" />
                    </div>

                    <div className="flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />

                      </div>

                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        {item.description}
                      </p>

                    </div>

                  </div>

                </button>
              );
            })}

          </div>

        </section>


        {/* ==================================================
            CURRENT ENROLLMENTS
        ================================================== */}

        <section>

          <Card className="border-0 shadow-sm">

            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Enrollment Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div>
                  <p className="text-sm text-gray-500">
                    Total Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {enrollments.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Active Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeEnrollments.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Academic Terms
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {academicTerms.length}
                  </p>
                </div>

              </div>

            </CardContent>

          </Card>

        </section>


        {/* ==================================================
            FOOTER NOTE
        ================================================== */}

        <div className="text-center py-4">

          <p className="text-sm text-gray-400">
            More management features will become available as the
            School Management System is developed.
          </p>

        </div>

      </div>
    </div>
  );
}
