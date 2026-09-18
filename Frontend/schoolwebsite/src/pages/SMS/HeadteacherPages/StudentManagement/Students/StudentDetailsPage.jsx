// ==================================================
// STUDENT DETAILS PAGE
// ==================================================
// Path:
// src/pages/SMS/HeadteacherPages/StudentManagement/Students/StudentDetailsPage.jsx
//
// Purpose:
// - Display complete student overview
// - Provide easy navigation to related student modules
// - Display family information
// - Display current/latest enrollment
// - Provide quick access to edit, parents, documents,
//   emergency contacts and progression
// ==================================================

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  User,
  Users,
  GraduationCap,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  HeartPulse,
  Award,
  FileText,
  GitBranch,
  UserRound,
  School,
  ShieldAlert,
  BookOpen,
  Home,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// HELPER FUNCTIONS
// ==================================================

const extractList = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const getRelationName = (value, fallback = "Not provided") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return fallback;
  }

  return (
    value.name ||
    value.full_name ||
    value.title ||
    value.label ||
    value.display_name ||
    fallback
  );
};


const formatDate = (date) => {
  if (!date) return "Not provided";

  try {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
};


const formatShortDate = (date) => {
  if (!date) return "Not provided";

  try {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
};


const calculateAge = (dob) => {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "N/A";
};


const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


// ==================================================
// STATUS BADGE
// ==================================================

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();

  let classes =
    "bg-gray-200 text-gray-700 border-gray-300";

  let Icon = AlertCircle;

  if (["active", "completed"].includes(normalized)) {
    classes =
      "bg-green-100 text-green-700 border-green-200";
    Icon = CheckCircle;
  }

  if (
    ["inactive", "withdrawn", "transferred"].includes(
      normalized
    )
  ) {
    classes =
      "bg-red-100 text-red-700 border-red-200";
    Icon = XCircle;
  }

  if (normalized === "graduated") {
    classes =
      "bg-purple-100 text-purple-700 border-purple-200";
    Icon = GraduationCap;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${classes}`}
    >
      <Icon size={14} />
      {formatStatus(status)}
    </span>
  );
};


// ==================================================
// INFORMATION ITEM
// ==================================================

const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 border border-gray-200">
    <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100 text-purple-700">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800 break-words">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);


// ==================================================
// SECTION CARD
// ==================================================

const SectionCard = ({
  title,
  icon: Icon,
  children,
  action,
}) => (
  <section className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-gray-200 border-b border-gray-300">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-800 text-white">
          <Icon size={18} />
        </div>

        <h2 className="text-base md:text-lg font-bold text-gray-800">
          {title}
        </h2>
      </div>

      {action}
    </div>

    <div className="p-5">
      {children}
    </div>
  </section>
);


// ==================================================
// MAIN COMPONENT
// ==================================================

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [family, setFamily] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH STUDENT
  // --------------------------------------------------

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const studentResponse =
          await axiosInstance.get(
            `/students/students/${id}/`
          );

        const studentData = studentResponse.data;

        setStudent(studentData);

        // --------------------------------------------
        // FAMILY
        // --------------------------------------------

        if (studentData.family_details) {
          setFamily(studentData.family_details);
        } else if (studentData.family) {
          try {
            const familyResponse =
              await axiosInstance.get(
                `/students/families/${studentData.family}/`
              );

            setFamily(familyResponse.data);
          } catch (familyError) {
            console.error(
              "Failed to load family:",
              familyError
            );

            setFamily(null);
          }
        }

        // --------------------------------------------
        // ENROLLMENTS
        // --------------------------------------------

        try {
          const enrollmentResponse =
            await axiosInstance.get(
              `/students/enrollments/?student=${id}`
            );

          const enrollments = extractList(
            enrollmentResponse.data
          );

          /*
           * Prefer the active enrollment.
           * If the student is graduated/transferred/etc.,
           * show the most recent historical enrollment.
           */

          const activeEnrollment = enrollments.find(
            (item) =>
              String(item.status).toLowerCase() ===
              "active"
          );

          const latestEnrollment =
            activeEnrollment || enrollments[0] || null;

          setEnrollment(latestEnrollment);
        } catch (enrollmentError) {
          console.error(
            "Failed to load enrollment:",
            enrollmentError
          );

          setEnrollment(null);
        }
      } catch (err) {
        console.error(
          "Failed to fetch student:",
          err
        );

        if (err.response?.status === 404) {
          setError("Student record was not found.");
        } else {
          setError(
            "Failed to load the student record. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentDetails();
    }
  }, [id]);


  // --------------------------------------------------
  // DEACTIVATE STUDENT
  // --------------------------------------------------

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this student?"
    );

    if (!confirmed) return;

    try {
      setDeactivating(true);

      await axiosInstance.delete(
        `/students/students/${id}/`
      );

      setStudent((previous) => ({
        ...previous,
        status: "inactive",
      }));
    } catch (err) {
      console.error(
        "Failed to deactivate student:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to deactivate the student."
      );
    } finally {
      setDeactivating(false);
    }
  };


  // ==================================================
  // LOADING STATE
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">

          <div className="h-10 w-40 bg-gray-300 rounded-lg animate-pulse mb-6" />

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 animate-pulse">
            <div className="h-8 w-64 bg-gray-300 rounded mb-3" />
            <div className="h-4 w-40 bg-gray-300 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="h-48 bg-gray-50 border border-gray-200 rounded-2xl animate-pulse" />
            <div className="h-48 bg-gray-50 border border-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }


  // ==================================================
  // ERROR STATE
  // ==================================================

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() =>
              navigate("/sms/students")
            }
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>

          <div className="bg-gray-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle
              size={42}
              className="mx-auto text-red-500 mb-4"
            />

            <h2 className="text-xl font-bold text-gray-800">
              Unable to Load Student
            </h2>

            <p className="text-gray-600 mt-2">
              {error || "Student record was not found."}
            </p>

            <button
              onClick={() =>
                navigate("/sms/students")
              }
              className="mt-5 px-5 py-2.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition"
            >
              Return to Students
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ==================================================
  // STUDENT DATA
  // ==================================================

  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const familyId =
    family?.id ||
    student.family ||
    null;

  const familyName =
    family?.family_name ||
    "No family assigned";

  const className =
    getRelationName(
      enrollment?.class_level_details,
      enrollment?.class_level_name
        ? enrollment.class_level_name
        : "Not assigned"
    );

  const streamName =
    getRelationName(
      enrollment?.stream_details,
      enrollment?.stream_name
        ? enrollment.stream_name
        : "Not assigned"
    );

  const academicYearName =
    getRelationName(
      enrollment?.academic_year_details,
      enrollment?.academic_year_name
        ? enrollment.academic_year_name
        : "Not assigned"
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
          <button
            onClick={() =>
              navigate("/student-management")
            }
            className="hover:text-purple-700 transition"
          >
            Student Management
          </button>

          <ChevronRight size={15} />

          <button
            onClick={() =>
              navigate("/sms/students")
            }
            className="hover:text-purple-700 transition"
          >
            Students
          </button>

          <ChevronRight size={15} />

          <span className="font-medium text-gray-700">
            {fullName || "Student Details"}
          </span>
        </div>


        {/* ==================================================
            TOP NAVIGATION
        ================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          <button
            onClick={() =>
              navigate("/sms/students")
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>

          <button
            onClick={() =>
              navigate(`/sms/students/${id}/edit`)
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition shadow-sm"
          >
            <Edit size={18} />
            Edit Student
          </button>
        </div>


        {/* ==================================================
            STUDENT HERO
        ================================================== */}

        <div className="bg-gray-800 text-white rounded-2xl shadow-lg overflow-hidden mb-5">

          <div className="p-5 md:p-7">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="flex items-center gap-4">

                <div className="w-20 h-20 rounded-2xl bg-purple-800 flex items-center justify-center overflow-hidden border-2 border-gray-600">

                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={38} />
                  )}

                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {fullName || "Unnamed Student"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mt-2">

                    <span className="text-gray-300 text-sm">
                      Admission No:
                    </span>

                    <span className="font-semibold">
                      {student.admission_number ||
                        "Not provided"}
                    </span>

                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">

                    <span className="text-gray-300 text-sm">
                      Student ID:
                    </span>

                    <span className="font-semibold">
                      {student.student_id ||
                        "Not provided"}
                    </span>

                  </div>
                </div>
              </div>


              <div className="flex flex-col items-start lg:items-end gap-3">

                <StatusBadge
                  status={student.status}
                />

                {enrollment && (
                  <div className="text-sm text-gray-300">
                    {className}
                    {streamName !== "Not assigned"
                      ? ` • ${streamName}`
                      : ""}
                  </div>
                )}

              </div>

            </div>

          </div>


          {/* ==================================================
              STUDENT QUICK NAVIGATION
          ================================================== */}

          <div className="bg-gray-900 border-t border-gray-700 px-3 py-3">

            <div className="flex gap-2 overflow-x-auto pb-1">

              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-lg text-sm font-medium"
              >
                <User size={16} />
                Overview
              </button>


              <button
                onClick={() =>
                  navigate(
                    `/sms/students/${id}/edit`
                  )
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <Edit size={16} />
                Edit
              </button>


              <button
                onClick={() =>
                  navigate("/sms/enrollments", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <School size={16} />
                Enrollment
              </button>


              <button
                onClick={() =>
                  navigate("/sms/parents", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <Users size={16} />
                Parents
              </button>


              <button
                onClick={() =>
                  navigate("/sms/emergency-contacts", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <ShieldAlert size={16} />
                Emergency
              </button>


              <button
                onClick={() =>
                  navigate("/sms/documents", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <FileText size={16} />
                Documents
              </button>


              <button
                onClick={() =>
                  navigate("/sms/progression", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                <GitBranch size={16} />
                Progression
              </button>

            </div>

          </div>

        </div>


        {/* ==================================================
            STUDENT OVERVIEW
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Personal Summary */}

          <div className="lg:col-span-2">
            <SectionCard
              title="Personal Information"
              icon={User}
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={fullName}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={formatDate(
                    student.date_of_birth
                  )}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Age"
                  value={`${calculateAge(
                    student.date_of_birth
                  )} years`}
                />

                <InfoItem
                  icon={UserRound}
                  label="Gender"
                  value={formatStatus(
                    student.gender
                  )}
                />

                <InfoItem
                  icon={MapPin}
                  label="Place of Birth"
                  value={student.place_of_birth}
                />

                <InfoItem
                  icon={User}
                  label="Nationality"
                  value={student.nationality}
                />

                <InfoItem
                  icon={BookOpen}
                  label="Religion"
                  value={student.religion}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Record Created"
                  value={formatDate(
                    student.created_at
                  )}
                />

              </div>

            </SectionCard>
          </div>


          {/* Status Summary */}

          <div>
            <SectionCard
              title="Student Status"
              icon={GraduationCap}
            >

              <div className="space-y-4">

                <div className="p-4 rounded-xl bg-purple-100 border border-purple-200">
                  <p className="text-xs font-medium text-purple-600">
                    Current Status
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={student.status}
                    />
                  </div>
                </div>


                <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500">
                    Admission Number
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-800">
                    {student.admission_number ||
                      "Not provided"}
                  </p>
                </div>

              </div>

            </SectionCard>
          </div>

        </div>


        {/* ==================================================
            ACADEMIC ENROLLMENT
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Academic Enrollment"
            icon={School}
            action={
              <button
                onClick={() =>
                  navigate("/sms/enrollments", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="text-sm font-semibold text-purple-800 hover:text-purple-950"
              >
                View Enrollments
              </button>
            }
          >

            {enrollment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                <InfoItem
                  icon={CalendarDays}
                  label="Academic Year"
                  value={academicYearName}
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Class Level"
                  value={className}
                />

                <InfoItem
                  icon={Users}
                  label="Stream"
                  value={streamName}
                />

                <InfoItem
                  icon={CheckCircle}
                  label="Enrollment Status"
                  value={
                    <StatusBadge
                      status={enrollment.status}
                    />
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Enrollment Date"
                  value={formatDate(
                    enrollment.enrollment_date
                  )}
                />

                <InfoItem
                  icon={School}
                  label="Previous School"
                  value={enrollment.previous_school}
                />

                {enrollment.exit_date && (
                  <InfoItem
                    icon={CalendarDays}
                    label="Exit Date"
                    value={formatDate(
                      enrollment.exit_date
                    )}
                  />
                )}

                {enrollment.exit_reason && (
                  <InfoItem
                    icon={AlertCircle}
                    label="Exit Reason"
                    value={enrollment.exit_reason}
                  />
                )}

              </div>
            ) : (
              <div className="p-6 text-center bg-gray-100 rounded-xl border border-gray-200">

                <School
                  size={34}
                  className="mx-auto text-gray-400 mb-3"
                />

                <h3 className="font-semibold text-gray-700">
                  No Enrollment Found
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  This student does not currently have
                  an enrollment record.
                </p>

                <button
                  onClick={() =>
                    navigate("/sms/enrollments", {
                      state: {
                        studentId: id,
                      },
                    })
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition"
                >
                  <School size={16} />
                  Manage Enrollment
                </button>

              </div>
            )}

          </SectionCard>

        </div>


        {/* ==================================================
            FAMILY INFORMATION
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Family / Household"
            icon={Home}
            action={
              familyId && (
                <button
                  onClick={() =>
                    navigate(
                      `/sms/families/${familyId}`
                    )
                  }
                  className="text-sm font-semibold text-purple-800 hover:text-purple-950"
                >
                  View Family
                </button>
              )
            }
          >

            {family ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                <InfoItem
                  icon={Home}
                  label="Family Name"
                  value={familyName}
                />

                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={family.address}
                />

                <InfoItem
                  icon={MapPin}
                  label="Town"
                  value={family.town}
                />

                <InfoItem
                  icon={MapPin}
                  label="County"
                  value={family.county}
                />

                <InfoItem
                  icon={MapPin}
                  label="Sub County"
                  value={family.sub_county}
                />

                <InfoItem
                  icon={FileText}
                  label="Postal Address"
                  value={family.postal_address}
                />

                <InfoItem
                  icon={Home}
                  label="Family ID"
                  value={family.family_id}
                />

                <InfoItem
                  icon={CheckCircle}
                  label="Family Status"
                  value={
                    family.is_active
                      ? "Active"
                      : "Inactive"
                  }
                />

              </div>
            ) : (
              <div className="p-6 text-center bg-gray-100 rounded-xl border border-gray-200">

                <Home
                  size={34}
                  className="mx-auto text-gray-400 mb-3"
                />

                <h3 className="font-semibold text-gray-700">
                  No Family Assigned
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  This student has not been assigned
                  to a family household.
                </p>

              </div>
            )}

          </SectionCard>

        </div>


        {/* ==================================================
            IDENTIFICATION
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Identification & Registration"
            icon={FileText}
          >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              <InfoItem
                icon={FileText}
                label="Birth Certificate Number"
                value={
                  student.birth_certificate_number
                }
              />

              <InfoItem
                icon={FileText}
                label="Birth Certificate Entry Number"
                value={
                  student.birth_certificate_entry_number
                }
              />

              <InfoItem
                icon={CheckCircle}
                label="Birth Certificate Submitted"
                value={
                  student.birth_certificate_submitted
                    ? "Yes"
                    : "No"
                }
              />

              <InfoItem
                icon={FileText}
                label="NEMIS / KEMIS Number"
                value={
                  student.nemis_kemis_number
                }
              />

              <InfoItem
                icon={FileText}
                label="Child Assessment Number"
                value={
                  student.child_assessment_number
                }
              />

            </div>

          </SectionCard>

        </div>


        {/* ==================================================
            HOME / LOCATION
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Home & Location"
            icon={MapPin}
          >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <InfoItem
                icon={MapPin}
                label="Home County"
                value={student.home_county}
              />

              <InfoItem
                icon={MapPin}
                label="Home Sub County"
                value={student.home_subcounty}
              />

              <InfoItem
                icon={Home}
                label="Family Residence"
                value={family?.address}
              />

            </div>

          </SectionCard>

        </div>


        {/* ==================================================
            MEDICAL INFORMATION
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Medical Information"
            icon={HeartPulse}
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">

                <div className="flex items-center gap-3 mb-3">

                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <HeartPulse size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Allergies / Illness
                    </p>

                    <p className="font-semibold text-gray-800">
                      {student.has_allergies_or_illness
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>

                </div>

                {student.has_allergies_or_illness && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {student.medical_conditions ||
                      "No details provided."}
                  </p>
                )}

              </div>


              <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">

                <div className="flex items-center gap-3 mb-3">

                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <Award size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Special Abilities
                    </p>

                    <p className="font-semibold text-gray-800">
                      {student.has_special_abilities
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>

                </div>

                {student.has_special_abilities && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {student.special_abilities ||
                      "No details provided."}
                  </p>
                )}

              </div>

            </div>

          </SectionCard>

        </div>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Student Management"
            icon={Users}
          >

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

              <button
                onClick={() =>
                  navigate("/sms/enrollments", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 transition"
              >
                <School size={22} />
                <span className="text-xs font-semibold text-center">
                  Enrollment
                </span>
              </button>


              <button
                onClick={() =>
                  navigate("/sms/parents", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition"
              >
                <Users size={22} />
                <span className="text-xs font-semibold text-center">
                  Parents
                </span>
              </button>


              <button
                onClick={() =>
                  navigate(
                    "/sms/emergency-contacts",
                    {
                      state: {
                        studentId: id,
                      },
                    }
                  )
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition"
              >
                <ShieldAlert size={22} />
                <span className="text-xs font-semibold text-center">
                  Emergency
                </span>
              </button>


              <button
                onClick={() =>
                  navigate("/sms/documents", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition"
              >
                <FileText size={22} />
                <span className="text-xs font-semibold text-center">
                  Documents
                </span>
              </button>


              <button
                onClick={() =>
                  navigate("/sms/progression", {
                    state: {
                      studentId: id,
                    },
                  })
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition"
              >
                <GitBranch size={22} />
                <span className="text-xs font-semibold text-center">
                  Progression
                </span>
              </button>


              <button
                onClick={() =>
                  navigate(
                    `/sms/students/${id}/edit`
                  )
                }
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 transition"
              >
                <Edit size={22} />
                <span className="text-xs font-semibold text-center">
                  Edit Student
                </span>
              </button>

            </div>

          </SectionCard>

        </div>


        {/* ==================================================
            RECORD INFORMATION
        ================================================== */}

        <div className="mb-5">

          <SectionCard
            title="Record Information"
            icon={FileText}
          >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <InfoItem
                icon={FileText}
                label="Student ID"
                value={student.student_id}
              />

              <InfoItem
                icon={CalendarDays}
                label="Created"
                value={formatShortDate(
                  student.created_at
                )}
              />

              <InfoItem
                icon={CalendarDays}
                label="Last Updated"
                value={formatShortDate(
                  student.updated_at
                )}
              />

            </div>

          </SectionCard>

        </div>


        {/* ==================================================
            DANGER ZONE
        ================================================== */}

        {String(student.status).toLowerCase() !==
          "inactive" && (
          <div className="bg-gray-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-5 py-4 bg-red-50 border-b border-red-200">

              <h2 className="font-bold text-red-800">
                Student Record Actions
              </h2>

              <p className="text-sm text-red-600 mt-1">
                Deactivating a student should only be
                done when the student is no longer active
                in the school.
              </p>

            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <p className="font-semibold text-gray-800">
                  Deactivate Student
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  The student record will remain in the
                  system but will no longer be active.
                </p>
              </div>

              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <XCircle size={17} />

                {deactivating
                  ? "Deactivating..."
                  : "Deactivate Student"}
              </button>

            </div>

          </div>
        )}


        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-300">

          <button
            onClick={() =>
              navigate("/sms/students")
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>


          <button
            onClick={() =>
              navigate(
                `/sms/students/${id}/edit`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition"
          >
            <Edit size={18} />
            Edit Student
          </button>

        </div>

      </div>

    </div>
  );
};

export default StudentDetailsPage;

