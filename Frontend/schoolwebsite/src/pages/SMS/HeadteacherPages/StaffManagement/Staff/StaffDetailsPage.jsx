import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const getId = (item) => {
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const getFullName = (staff) => {
  if (!staff) {
    return "Unknown Staff";
  }

  if (staff.full_name) {
    return staff.full_name;
  }

  return [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unknown Staff";
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const formatLabel = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};


const getRoleName = (assignment) => {
  if (!assignment) {
    return "Assigned Role";
  }

  return (
    assignment.role_name ||
    assignment.role?.name ||
    assignment.role?.title ||
    "Assigned Role"
  );
};


const getAssignmentStatus = (
  assignment
) => {
  if (!assignment) {
    return "inactive";
  }

  if (assignment.status) {
    return assignment.status;
  }

  return assignment.is_active === false
    ? "inactive"
    : "active";
};


const getStatusClass = (status) => {
  const classes = {
    active:
      "bg-green-100 text-green-700 border-green-200",

    inactive:
      "bg-gray-100 text-gray-600 border-gray-200",

    suspended:
      "bg-amber-100 text-amber-700 border-amber-200",

    resigned:
      "bg-blue-100 text-blue-700 border-blue-200",

    terminated:
      "bg-red-100 text-red-700 border-red-200",

    retired:
      "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    classes[status] ||
    "bg-gray-100 text-gray-600 border-gray-200"
  );
};


const getRoleStatusClass = (status) => {
  if (status === "active") {
    return "bg-green-100 text-green-700";
  }

  if (status === "suspended") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-gray-100 text-gray-600";
};


// ============================================================
// COMPONENT
// ============================================================

const StaffDetailsPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();


  // ==========================================================
  // STATE
  // ==========================================================

  const [staff, setStaff] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deactivating, setDeactivating] =
    useState(false);


  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  useEffect(() => {
    loadStaff();
  }, [id]);


  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          `/staff/${id}/`
        );

      setStaff(
        response.data
      );
    } catch (err) {
      console.error(
        "Failed to load staff details:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to load this staff member."
        );
      }

      setStaff(null);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // DEACTIVATE STAFF
  // ==========================================================

  const handleDeactivate = async () => {
    if (!staff) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deactivate ${getFullName(
          staff
        )}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);
      setError("");

      await axiosInstance.patch(
        `/staff/${id}/`,
        {
          status: "inactive",
        }
      );

      await loadStaff();
    } catch (err) {
      console.error(
        "Failed to deactivate staff:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to deactivate this staff member."
        );
      }
    } finally {
      setDeactivating(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">
          Loading staff details...
        </div>
      </div>
    );
  }


  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <X size={25} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Staff Member Not Found
            </h2>

            <p className="text-gray-500 mt-2">
              {error ||
                "The requested staff member could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/staff/members"
                )
              }
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >
              <ArrowLeft size={17} />

              Back to Staff
            </button>

          </div>
        </div>
      </div>
    );
  }


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const fullName =
    getFullName(staff);

  const referees =
    Array.isArray(staff.referees)
      ? staff.referees
      : [];

  const roleAssignments =
    Array.isArray(
      staff.role_assignments
    )
      ? staff.role_assignments
      : [];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        {/* Breadcrumb */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/staff"
            className="hover:text-purple-700"
          >
            Staff Management
          </Link>

          <span>/</span>

          <Link
            to="/staff/members"
            className="hover:text-purple-700"
          >
            Staff Members
          </Link>

          <span>/</span>

          <span className="text-gray-700 font-medium">
            Details
          </span>

        </div>


        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-4">

            {/* Photo / Avatar */}

            <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">

              {staff.photo ? (
                <img
                  src={staff.photo}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={30} />
              )}

            </div>


            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {fullName}
                </h1>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClass(
                    staff.status
                  )}`}
                >
                  {formatLabel(
                    staff.status
                  )}
                </span>

              </div>

              <p className="text-gray-600 mt-1">
                {staff.employee_number ||
                  "No employee number"}
              </p>

              {staff.staff_id && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Staff ID: {staff.staff_id}
                </p>
              )}

            </div>

          </div>


          {/* Actions */}

          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >
              <ArrowLeft size={17} />

              Back
            </button>


            <Link
              to={`/staff/members/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900"
            >
              <Edit size={17} />

              Edit Staff
            </Link>


            {staff.status !==
              "inactive" && (
              <button
                type="button"
                onClick={
                  handleDeactivate
                }
                disabled={
                  deactivating
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 size={17} />

                {deactivating
                  ? "Deactivating..."
                  : "Deactivate"}
              </button>
            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
            size={19}
            className="mt-0.5"
          />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ======================================================
          OVERVIEW CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Employment */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <BriefcaseBusiness
                size={20}
              />
            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Employment
              </p>

              <p className="font-bold text-gray-800 mt-1">
                {formatLabel(
                  staff.employment_type
                )}
              </p>

            </div>

          </div>

        </div>


        {/* Date Joined */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <CalendarDays
                size={20}
              />
            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Date Joined
              </p>

              <p className="font-bold text-gray-800 mt-1">
                {formatDate(
                  staff.date_joined
                )}
              </p>

            </div>

          </div>

        </div>


        {/* Roles */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-green-100 text-green-700">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Role Assignments
              </p>

              <p className="font-bold text-gray-800 mt-1">
                {roleAssignments.length}
              </p>

            </div>

          </div>

        </div>


        {/* Referees */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Users size={20} />
            </div>

            <div>

              <p className="text-xs uppercase font-semibold text-gray-500">
                Referees
              </p>

              <p className="font-bold text-gray-800 mt-1">
                {referees.length}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ====================================================
            LEFT / MAIN INFORMATION
        ==================================================== */}

        <div className="xl:col-span-2 space-y-6">


          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <User size={19} />
              }
              iconClass="bg-purple-100 text-purple-700"
              title="Personal Information"
              subtitle="Basic identity information"
            />

            <div className="p-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                <InfoItem
                  label="First Name"
                  value={
                    staff.first_name
                  }
                />

                <InfoItem
                  label="Middle Name"
                  value={
                    staff.middle_name
                  }
                />

                <InfoItem
                  label="Last Name"
                  value={
                    staff.last_name
                  }
                />

                <InfoItem
                  label="Date of Birth"
                  value={formatDate(
                    staff.date_of_birth
                  )}
                />

                <InfoItem
                  label="Gender"
                  value={formatLabel(
                    staff.gender
                  )}
                />

                <InfoItem
                  label="Nationality"
                  value={
                    staff.nationality
                  }
                />

                <InfoItem
                  label="Religion"
                  value={
                    staff.religion
                  }
                />

                <InfoItem
                  label="National ID"
                  value={
                    staff.national_id
                  }
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <Phone size={19} />
              }
              iconClass="bg-blue-100 text-blue-700"
              title="Contact Information"
              subtitle="Phone, email and address"
            />

            <div className="p-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                <InfoItem
                  label="Phone"
                  value={
                    staff.phone
                  }
                  icon={
                    <Phone size={15} />
                  }
                />

                <InfoItem
                  label="Alternative Phone"
                  value={
                    staff.alternative_phone
                  }
                  icon={
                    <Phone size={15} />
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    staff.email
                  }
                  icon={
                    <Mail size={15} />
                  }
                />

                <InfoItem
                  label="County"
                  value={
                    staff.county
                  }
                  icon={
                    <MapPin size={15} />
                  }
                />

                <InfoItem
                  label="Subcounty"
                  value={
                    staff.subcounty
                  }
                  icon={
                    <MapPin size={15} />
                  }
                />

                <div className="md:col-span-2">

                  <InfoItem
                    label="Address"
                    value={
                      staff.address
                    }
                    icon={
                      <MapPin size={15} />
                    }
                  />

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              EMPLOYMENT INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <BriefcaseBusiness
                  size={19}
                />
              }
              iconClass="bg-purple-100 text-purple-700"
              title="Employment Information"
              subtitle="Employment history and status"
            />

            <div className="p-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                <InfoItem
                  label="Employee Number"
                  value={
                    staff.employee_number
                  }
                />

                <InfoItem
                  label="Staff ID"
                  value={
                    staff.staff_id
                  }
                />

                <InfoItem
                  label="Employment Type"
                  value={formatLabel(
                    staff.employment_type
                  )}
                />

                <InfoItem
                  label="Status"
                  value={formatLabel(
                    staff.status
                  )}
                />

                <InfoItem
                  label="Date Joined"
                  value={formatDate(
                    staff.date_joined
                  )}
                />

                <InfoItem
                  label="Date Left"
                  value={formatDate(
                    staff.date_left
                  )}
                />

                <div className="md:col-span-2">

                  <InfoItem
                    label="Previous Employment"
                    value={
                      staff.previous_employment
                    }
                  />

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              REFEREES
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <div className="px-5 py-4 bg-gray-100 border-b border-gray-200">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                    <Users size={19} />
                  </div>

                  <div>

                    <h2 className="font-semibold text-gray-800">
                      Referees
                    </h2>

                    <p className="text-sm text-gray-500">
                      Registered professional references
                    </p>

                  </div>

                </div>


                <Link
                  to={`/staff/members/${id}/edit`}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100"
                >
                  <Edit size={16} />

                  Edit
                </Link>

              </div>

            </div>


            <div className="p-5">

              {referees.length === 0 ? (

                <div className="text-center py-8">

                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <Users size={22} />
                  </div>

                  <p className="font-medium text-gray-700 mt-3">
                    No referees registered
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Referee information can be added from the staff edit form.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {referees.map(
                    (
                      referee,
                      index
                    ) => (

                      <div
                        key={
                          getId(
                            referee
                          ) ||
                          index
                        }
                        className="border border-gray-200 rounded-xl p-4 bg-white"
                      >

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-3">

                              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>

                              <div>

                                <h3 className="font-semibold text-gray-800">
                                  {referee.name ||
                                    "Unnamed Referee"}
                                </h3>

                                {referee.relationship && (
                                  <p className="text-sm text-purple-700">
                                    {
                                      referee.relationship
                                    }
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>


                          <div className="flex flex-wrap gap-2">

                            {referee.phone && (
                              <a
                                href={`tel:${referee.phone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                              >
                                <Phone
                                  size={14}
                                />

                                {
                                  referee.phone
                                }
                              </a>
                            )}


                            {referee.email && (
                              <a
                                href={`mailto:${referee.email}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                              >
                                <Mail
                                  size={14}
                                />

                                Email
                              </a>
                            )}

                          </div>

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-5">

                          <InfoItem
                            label="Alternative Phone"
                            value={
                              referee.alternative_phone
                            }
                          />

                          <InfoItem
                            label="Occupation"
                            value={
                              referee.occupation
                            }
                          />

                          <InfoItem
                            label="Company / Organisation"
                            value={
                              referee.company
                            }
                          />

                          <InfoItem
                            label="Address"
                            value={
                              referee.address
                            }
                          />

                          <div className="md:col-span-2">

                            <InfoItem
                              label="Notes"
                              value={
                                referee.notes
                              }
                            />

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        </div>


        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <div className="space-y-6">


          {/* ==================================================
              ROLE ASSIGNMENTS
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              iconClass="bg-green-100 text-green-700"
              title="Role Assignments"
              subtitle="Staff responsibilities"
            />

            <div className="p-5">

              {roleAssignments.length === 0 ? (

                <div className="text-center py-6">

                  <div className="w-11 h-11 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <ShieldCheck
                      size={20}
                    />
                  </div>

                  <p className="font-medium text-gray-700 mt-3">
                    No roles assigned
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Roles can be assigned from Staff Management.
                  </p>

                  <Link
                    to="/staff/role-assignments/new"
                    className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-purple-800 text-white text-sm hover:bg-purple-900"
                  >
                    <ShieldCheck
                      size={16}
                    />

                    Assign Role
                  </Link>

                </div>

              ) : (

                <div className="space-y-3">

                  {roleAssignments.map(
                    (
                      assignment,
                      index
                    ) => {

                      const roleName =
                        getRoleName(
                          assignment
                        );

                      const assignmentStatus =
                        getAssignmentStatus(
                          assignment
                        );

                      return (
                        <Link
                          key={
                            getId(
                              assignment
                            ) ||
                            index
                          }
                          to={`/staff/role-assignments/${getId(
                            assignment
                          )}`}
                          className="block border border-gray-200 rounded-xl p-4 bg-white hover:border-purple-300 hover:bg-purple-50 transition"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="font-semibold text-gray-800 break-words">
                                {roleName}
                              </p>

                              {assignment.is_primary && (
                                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
                                  Primary Role
                                </span>
                              )}

                              {assignment.start_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  From{" "}
                                  {formatDate(
                                    assignment.start_date
                                  )}
                                </p>
                              )}

                              {assignment.end_date && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  To{" "}
                                  {formatDate(
                                    assignment.end_date
                                  )}
                                </p>
                              )}

                            </div>


                            <span
                              className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleStatusClass(
                                assignmentStatus
                              )}`}
                            >
                              {formatLabel(
                                assignmentStatus
                              )}
                            </span>

                          </div>

                        </Link>
                      );
                    }
                  )}

                </div>

              )}


              {/* Assign another role */}

              {roleAssignments.length >
                0 && (
                <Link
                  to="/staff/role-assignments/new"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-50"
                >
                  <ShieldCheck
                    size={16}
                  />

                  Assign Another Role
                </Link>
              )}

            </div>

          </section>


          {/* ==================================================
              EMPLOYMENT TIMELINE
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <CalendarDays
                  size={19}
                />
              }
              iconClass="bg-blue-100 text-blue-700"
              title="Employment Timeline"
              subtitle="Important dates"
            />

            <div className="p-5">

              <div className="relative pl-6">

                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />


                {/* Joined */}

                <div className="relative mb-6">

                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-700 border-2 border-gray-50" />

                  <p className="text-xs uppercase font-semibold text-gray-500">
                    Joined
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {formatDate(
                      staff.date_joined
                    )}
                  </p>

                </div>


                {/* Left */}

                {staff.date_left && (
                  <div className="relative">

                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-50" />

                    <p className="text-xs uppercase font-semibold text-gray-500">
                      Left
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {formatDate(
                        staff.date_left
                      )}
                    </p>

                  </div>
                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              RECORD INFORMATION
          ================================================== */}

          <section className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">

            <SectionHeader
              icon={
                <FileText
                  size={19}
                />
              }
              iconClass="bg-gray-200 text-gray-700"
              title="Record Information"
              subtitle="System record details"
            />

            <div className="p-5 space-y-4">

              <InfoItem
                label="Created"
                value={formatDateTime(
                  staff.created_at
                )}
              />

              <InfoItem
                label="Last Updated"
                value={formatDateTime(
                  staff.updated_at
                )}
              />

            </div>

          </section>


          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="bg-gray-800 rounded-xl p-5 text-white">

            <h3 className="font-semibold">
              Quick Actions
            </h3>

            <div className="mt-4 space-y-2">

              <Link
                to={`/staff/members/${id}/edit`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Edit
                  size={17}
                />

                <span className="text-sm">
                  Edit Staff Information
                </span>
              </Link>


              <Link
                to="/staff/role-assignments/new"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <ShieldCheck
                  size={17}
                />

                <span className="text-sm">
                  Assign Staff Role
                </span>
              </Link>


              <Link
                to="/staff/members"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Users
                  size={17}
                />

                <span className="text-sm">
                  View All Staff
                </span>
              </Link>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
};


// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
  icon,
  iconClass,
  title,
  subtitle,
}) => {
  return (
    <div className="px-5 py-4 bg-gray-100 border-b border-gray-200">

      <div className="flex items-center gap-3">

        <div
          className={`p-2.5 rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <div>

          <h2 className="font-semibold text-gray-800">
            {title}
          </h2>

          <p className="text-sm text-gray-500">
            {subtitle}
          </p>

        </div>

      </div>

    </div>
  );
};


// ============================================================
// INFO ITEM
// ============================================================

const InfoItem = ({
  label,
  value,
  icon = null,
}) => {

  const displayValue =
    value ||
    "—";

  return (
    <div>

      <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
        {label}
      </p>

      <div className="flex items-start gap-2 mt-1">

        {icon && (
          <span className="text-gray-400 mt-0.5">
            {icon}
          </span>
        )}

        <p className="text-sm text-gray-800 whitespace-pre-line break-words">
          {displayValue}
        </p>

      </div>

    </div>
  );
};


export default StaffDetailsPage;

