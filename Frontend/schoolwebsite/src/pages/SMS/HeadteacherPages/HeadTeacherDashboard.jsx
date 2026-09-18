import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

import {
  Users,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ArrowRight,
  RefreshCw,
  School,
  Layers,
  Settings,
  ChevronRight,
  CircleCheck,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";


// ============================================================
// HELPER
// ============================================================

const getResults = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  return [];
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-purple-100 text-purple-700",
}) => {
  return (
    <Card
      className="
        border-0
        shadow-sm
        bg-gray-100
        hover:bg-white
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {value}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {description}
            </p>
          </div>

          <div
            className={`
              w-11 h-11
              rounded-xl
              flex
              items-center
              justify-center
              shrink-0
              ${iconClassName}
            `}
          >
            <Icon className="w-5 h-5" />
          </div>

        </div>
      </CardContent>
    </Card>
  );
};


// ============================================================
// QUICK ACCESS CARD
// ============================================================

const QuickAccessCard = ({
  title,
  description,
  path,
  icon: Icon,
}) => {
  return (
    <Link
      to={path}
      className="
        group
        block
        rounded-2xl
        border border-gray-200
        bg-gray-100
        hover:bg-white
        hover:border-purple-200
        hover:shadow-md
        transition-all
        duration-200
        p-5
      "
    >
      <div className="flex items-start gap-4">

        <div
          className="
            w-11 h-11
            rounded-xl
            bg-purple-100
            text-purple-700
            flex
            items-center
            justify-center
            shrink-0
            group-hover:bg-purple-700
            group-hover:text-white
            transition-colors
          "
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between gap-3">

            <h3 className="font-semibold text-gray-900">
              {title}
            </h3>

            <ArrowRight
              className="
                w-4 h-4
                text-gray-400
                group-hover:text-purple-700
                group-hover:translate-x-1
                transition-all
                shrink-0
              "
            />

          </div>

          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            {description}
          </p>

        </div>

      </div>
    </Link>
  );
};


// ============================================================
// MAIN DASHBOARD
// ============================================================

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


  // ============================================================
  // FETCH DASHBOARD DATA
  // ============================================================

  const fetchDashboardData = async () => {

    setLoading(true);
    setError(null);

    try {

      /*
       * IMPORTANT:
       *
       * All API requests go through the shared axiosInstance.
       *
       * axiosInstance already:
       * - knows the API base URL
       * - attaches the JWT access token
       * - handles token refresh
       *
       * Therefore we do NOT manually read authData
       * or manually create Authorization headers here.
       */

      const [
        studentsResponse,
        enrollmentsResponse,
        academicYearsResponse,
        academicTermsResponse,
        classLevelsResponse,
        streamsResponse,
      ] = await Promise.all([

        axiosInstance.get(
          "/students/students/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

        axiosInstance.get(
          "/students/enrollments/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

        axiosInstance.get(
          "/academics/years/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

        axiosInstance.get(
          "/academics/terms/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

        axiosInstance.get(
          "/academics/class-levels/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

        axiosInstance.get(
          "/academics/streams/",
          {
            params: {
              _t: Date.now(),
            },
          }
        ),

      ]);


      setData({
        students: getResults(studentsResponse),
        enrollments: getResults(enrollmentsResponse),
        academicYears: getResults(academicYearsResponse),
        academicTerms: getResults(academicTermsResponse),
        classLevels: getResults(classLevelsResponse),
        streams: getResults(streamsResponse),
      });

    } catch (err) {

      console.error(
        "Error loading Head Teacher dashboard:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        "Some dashboard information could not be loaded. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);


  // ============================================================
  // CURRENT DATA
  // ============================================================

  const {
    students,
    enrollments,
    academicYears,
    academicTerms,
    classLevels,
    streams,
  } = data;


  // ------------------------------------------------------------
  // ACTIVE STUDENTS
  // ------------------------------------------------------------

  const activeStudents = useMemo(() => {

    return students.filter(
      (student) => student.status === "active"
    );

  }, [students]);


  // ------------------------------------------------------------
  // CURRENT ACADEMIC YEAR
  // ------------------------------------------------------------

  const currentYear = useMemo(() => {

    return (
      academicYears.find(
        (year) => year.is_current === true
      ) || null
    );

  }, [academicYears]);


  // ------------------------------------------------------------
  // CURRENT TERM
  // ------------------------------------------------------------

  const currentTerm = useMemo(() => {

    if (!currentYear) {
      return null;
    }

    return (
      academicTerms.find(
        (term) =>
          term.is_current === true &&
          String(term.academic_year) ===
            String(currentYear.id)
      ) || null
    );

  }, [academicTerms, currentYear]);


  // ------------------------------------------------------------
  // ACTIVE ENROLLMENTS
  // ------------------------------------------------------------

  const activeEnrollments = useMemo(() => {

    return enrollments.filter(
      (enrollment) =>
        enrollment.status === "active"
    );

  }, [enrollments]);


  // ============================================================
  // QUICK ACCESS
  // ============================================================

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


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-200 p-4 sm:p-6">

        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header Skeleton */}

          <div className="bg-gray-900 rounded-2xl p-6 animate-pulse">

            <div className="h-4 bg-gray-700 rounded w-36 mb-3" />

            <div className="h-8 bg-gray-700 rounded w-80 mb-3" />

            <div className="h-4 bg-gray-700 rounded w-full max-w-xl" />

            <div className="mt-6 pt-6 border-t border-gray-700">

              <div className="flex gap-6">

                <div className="h-10 bg-gray-700 rounded w-44" />

                <div className="h-10 bg-gray-700 rounded w-36" />

              </div>

            </div>

          </div>


          {/* Statistics Skeleton */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="
                  bg-gray-100
                  rounded-2xl
                  p-6
                  animate-pulse
                "
              >

                <div className="h-4 bg-gray-300 rounded w-24 mb-4" />

                <div className="h-9 bg-gray-300 rounded w-16 mb-3" />

                <div className="h-3 bg-gray-300 rounded w-32" />

              </div>

            ))}

          </div>


          {/* Main Skeleton */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />

            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />

          </div>

        </div>

      </div>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (
      <div className="min-h-screen bg-gray-200 p-4 sm:p-6">

        <div className="max-w-4xl mx-auto pt-8">

          <Card className="border-0 shadow-md bg-gray-100">

            <CardContent className="p-8 text-center">

              <div
                className="
                  w-14 h-14
                  mx-auto
                  mb-4
                  rounded-full
                  bg-red-100
                  flex
                  items-center
                  justify-center
                "
              >

                <RefreshCw
                  className="w-6 h-6 text-red-600"
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load dashboard
              </h2>

              <p className="text-gray-500 mb-5">
                {error}
              </p>

              <button
                onClick={fetchDashboardData}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-purple-700
                  text-white
                  hover:bg-purple-800
                  transition
                "
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


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="min-h-screen bg-gray-200 p-4 sm:p-6">

      <div className="max-w-7xl mx-auto space-y-6">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <section
          className="
            bg-gray-900
            rounded-2xl
            shadow-lg
            overflow-hidden
          "
        >

          <div className="p-6 md:p-8">

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-start
                lg:justify-between
                gap-6
              "
            >

              <div>

                <div className="flex items-center gap-3 mb-3">

                  <div
                    className="
                      w-11 h-11
                      rounded-xl
                      bg-purple-700
                      text-white
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <School className="w-6 h-6" />

                  </div>

                  <div>

                    <p className="text-sm font-medium text-purple-300">
                      Head Teacher Portal
                    </p>

                    <h1
                      className="
                        text-2xl
                        md:text-3xl
                        font-bold
                        text-white
                      "
                    >
                      School Management Dashboard
                    </h1>

                  </div>

                </div>

                <p className="text-gray-400 max-w-2xl leading-relaxed">
                  Manage the school's academic structure and
                  student information from one central place.
                </p>

              </div>


              {/* Refresh */}

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border border-gray-700
                  bg-gray-800
                  text-gray-200
                  hover:bg-gray-700
                  disabled:opacity-50
                  transition
                "
              >

                <RefreshCw
                  className={`
                    w-4 h-4
                    ${loading ? "animate-spin" : ""}
                  `}
                />

                Refresh

              </button>

            </div>


            {/* ==================================================
                CURRENT ACADEMIC PERIOD
            ================================================== */}

            <div
              className="
                mt-7
                pt-6
                border-t border-gray-800
              "
            >

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >

                {/* Current Year */}

                <div
                  className="
                    rounded-xl
                    bg-gray-800
                    border border-gray-700
                    p-4
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10 h-10
                        rounded-lg
                        bg-purple-900
                        text-purple-300
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <CalendarDays className="w-5 h-5" />

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Current Academic Year
                      </p>

                      <p className="mt-1 font-semibold text-white">

                        {currentYear?.name ||
                          "No current year configured"}

                      </p>

                    </div>

                  </div>

                </div>


                {/* Current Term */}

                <div
                  className="
                    rounded-xl
                    bg-gray-800
                    border border-gray-700
                    p-4
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10 h-10
                        rounded-lg
                        bg-purple-900
                        text-purple-300
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <BookOpen className="w-5 h-5" />

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Current Term
                      </p>

                      <p className="mt-1 font-semibold text-white">

                        {currentTerm?.term_display ||
                          currentTerm?.name ||
                          currentTerm?.term ||
                          "No current term configured"}

                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* Manage Academic Year */}

              <div className="mt-4">

                <Link
                  to="/academics/years"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-purple-300
                    hover:text-white
                    transition
                  "
                >

                  Manage academic years

                  <ChevronRight className="w-4 h-4" />

                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            SCHOOL OVERVIEW
        ====================================================== */}

        <section>

          <div className="flex items-end justify-between mb-4">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                School Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current information available in the system.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >

            <StatCard
              title="Total Students"
              value={students.length}
              description="Student records in the system"
              icon={Users}
              iconClassName="bg-purple-100 text-purple-700"
            />

            <StatCard
              title="Active Students"
              value={activeStudents.length}
              description="Currently active students"
              icon={GraduationCap}
              iconClassName="bg-green-100 text-green-700"
            />

            <StatCard
              title="Class Levels"
              value={classLevels.length}
              description="Academic classes configured"
              icon={School}
              iconClassName="bg-blue-100 text-blue-700"
            />

            <StatCard
              title="Streams"
              value={streams.length}
              description="Streams across class levels"
              icon={Layers}
              iconClassName="bg-gray-200 text-gray-700"
            />

          </div>

        </section>


        {/* ======================================================
            QUICK ACCESS
        ====================================================== */}

        <section>

          <div className="mb-4">

            <h2 className="text-xl font-semibold text-gray-900">
              Quick Access
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Access the main management areas of the school system.
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            {quickAccess.map((item) => (

              <QuickAccessCard
                key={item.title}
                title={item.title}
                description={item.description}
                path={item.path}
                icon={item.icon}
              />

            ))}

          </div>

        </section>


        {/* ======================================================
            ENROLLMENT OVERVIEW
        ====================================================== */}

        <section>

          <Card
            className="
              border-0
              shadow-sm
              bg-gray-100
              overflow-hidden
            "
          >

            <CardHeader
              className="
                border-b
                border-gray-200
                bg-gray-900
                text-white
              "
            >

              <CardTitle
                className="
                  flex
                  items-center
                  gap-2
                  text-white
                "
              >

                <GraduationCap className="w-5 h-5 text-purple-300" />

                Enrollment Overview

              </CardTitle>

            </CardHeader>


            <CardContent className="p-5 md:p-6">

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                "
              >

                {/* Total */}

                <div
                  className="
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-5
                  "
                >

                  <p className="text-sm text-gray-500">
                    Total Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {enrollments.length}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Enrollment records
                  </p>

                </div>


                {/* Active */}

                <div
                  className="
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-5
                  "
                >

                  <p className="text-sm text-gray-500">
                    Active Enrollments
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeEnrollments.length}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Current active placements
                  </p>

                </div>


                {/* Terms */}

                <div
                  className="
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-5
                  "
                >

                  <p className="text-sm text-gray-500">
                    Academic Terms
                  </p>

                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {academicTerms.length}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Terms configured
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        </section>


        {/* ======================================================
            ACADEMIC CONFIGURATION
        ====================================================== */}

        <section>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            {/* Academic Configuration */}

            <div
              className="
                rounded-2xl
                bg-gray-100
                border border-gray-200
                shadow-sm
                p-5
              "
            >

              <div className="flex items-start justify-between mb-5">

                <div>

                  <h2 className="font-semibold text-gray-900">
                    Academic Configuration
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Current academic structure.
                  </p>

                </div>

                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-purple-100
                    text-purple-700
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Settings className="w-5 h-5" />

                </div>

              </div>


              <div className="space-y-2">

                {/* Academic Year */}

                <Link
                  to="/academics/years"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-3
                    hover:border-purple-200
                    hover:shadow-sm
                    transition
                  "
                >

                  <div className="flex items-center gap-3">

                    <CircleCheck
                      className="
                        w-4 h-4
                        text-purple-700
                      "
                    />

                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        Academic Year
                      </p>

                      <p className="text-xs text-gray-500">
                        {currentYear?.name ||
                          "No current year configured"}
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    className="w-4 h-4 text-gray-400"
                  />

                </Link>


                {/* Terms */}

                <Link
                  to="/academics/terms"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-3
                    hover:border-purple-200
                    hover:shadow-sm
                    transition
                  "
                >

                  <div className="flex items-center gap-3">

                    <CircleCheck
                      className="
                        w-4 h-4
                        text-purple-700
                      "
                    />

                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        Academic Terms
                      </p>

                      <p className="text-xs text-gray-500">
                        {academicTerms.length} configured
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    className="w-4 h-4 text-gray-400"
                  />

                </Link>


                {/* Classes */}

                <Link
                  to="/academics/classes"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-3
                    hover:border-purple-200
                    hover:shadow-sm
                    transition
                  "
                >

                  <div className="flex items-center gap-3">

                    <CircleCheck
                      className="
                        w-4 h-4
                        text-purple-700
                      "
                    />

                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        Class Levels
                      </p>

                      <p className="text-xs text-gray-500">
                        {classLevels.length} configured
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    className="w-4 h-4 text-gray-400"
                  />

                </Link>


                {/* Streams */}

                <Link
                  to="/academics/streams"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    bg-white
                    border border-gray-200
                    p-3
                    hover:border-purple-200
                    hover:shadow-sm
                    transition
                  "
                >

                  <div className="flex items-center gap-3">

                    <CircleCheck
                      className="
                        w-4 h-4
                        text-purple-700
                      "
                    />

                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        Streams
                      </p>

                      <p className="text-xs text-gray-500">
                        {streams.length} configured
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    className="w-4 h-4 text-gray-400"
                  />

                </Link>

              </div>

            </div>


            {/* Current Academic Period */}

            <div
              className="
                rounded-2xl
                bg-purple-900
                shadow-sm
                p-6
                text-white
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-purple-300">
                    Active Academic Period
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    {currentYear?.name ||
                      "No current year"}
                  </h2>

                  <p className="text-sm text-purple-200 mt-1">
                    {currentTerm?.term_display ||
                      currentTerm?.name ||
                      currentTerm?.term ||
                      "No current term"}
                  </p>

                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-purple-800
                    flex
                    items-center
                    justify-center
                  "
                >

                  <CalendarDays className="w-5 h-5" />

                </div>

              </div>


              <div className="mt-7 space-y-3">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-purple-800/60
                    border border-purple-700
                    px-4
                    py-3
                  "
                >

                  <span className="text-sm text-purple-200">
                    Academic years
                  </span>

                  <span className="font-semibold">
                    {academicYears.length}
                  </span>

                </div>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-purple-800/60
                    border border-purple-700
                    px-4
                    py-3
                  "
                >

                  <span className="text-sm text-purple-200">
                    Current year
                  </span>

                  <span className="font-semibold">
                    {currentYear
                      ? "Active"
                      : "Not configured"}
                  </span>

                </div>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-purple-800/60
                    border border-purple-700
                    px-4
                    py-3
                  "
                >

                  <span className="text-sm text-purple-200">
                    Current term
                  </span>

                  <span className="font-semibold">
                    {currentTerm
                      ? "Active"
                      : "Not configured"}
                  </span>

                </div>

              </div>


              <Link
                to="/academics/years"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  bg-white
                  text-purple-900
                  text-sm
                  font-semibold
                  hover:bg-purple-50
                  transition
                "
              >

                Manage academic years

                <ArrowRight className="w-4 h-4" />

              </Link>

            </div>

          </div>

        </section>


        {/* ======================================================
            FOOTER NOTE
        ====================================================== */}

        <div className="text-center py-2">

          <p className="text-xs text-gray-500">
            School Management System · Head Teacher Portal
          </p>

        </div>

      </div>

    </div>
  );
}
