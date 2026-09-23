import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ==================================================
// CONSTANTS
// ==================================================

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];


const EMPLOYMENT_TYPE_OPTIONS = [
  {
    value: "permanent",
    label: "Permanent",
  },
  {
    value: "contract",
    label: "Contract",
  },
  {
    value: "part_time",
    label: "Part-time",
  },
  {
    value: "casual",
    label: "Casual",
  },
  {
    value: "intern",
    label: "Intern",
  },
  {
    value: "volunteer",
    label: "Volunteer",
  },
];


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
  if (!item) {
    return null;
  }

  return item.id ?? item.pk ?? null;
};


const getStaffName = (staff) => {
  if (!staff) {
    return "Unknown Staff Member";
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
    .trim() || "Unknown Staff Member";
};


const getRoleName = (role) => {
  if (!role) {
    return "Unknown Role";
  }

  return (
    role.name ||
    role.code ||
    "Unknown Role"
  );
};


const getEmploymentTypeLabel = (
  value
) => {
  return (
    EMPLOYMENT_TYPE_OPTIONS.find(
      (item) =>
        item.value === value
    )?.label ||
    value ||
    "—"
  );
};


const getStatusLabel = (value) => {
  return (
    STATUS_OPTIONS.find(
      (item) =>
        item.value === value
    )?.label ||
    value ||
    "—"
  );
};


// ==================================================
// ERROR HANDLER
// ==================================================

const extractErrorMessage = (
  error
) => {
  const data =
    error?.response?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    Array.isArray(data.detail)
  ) {
    return data.detail.join(" ");
  }

  if (
    typeof data === "string"
  ) {
    return data;
  }

  const messages = [];

  Object.entries(data).forEach(
    ([field, value]) => {

      if (Array.isArray(value)) {
        messages.push(
          `${field}: ${value.join(" ")}`
        );
      } else if (
        typeof value === "string"
      ) {
        messages.push(
          `${field}: ${value}`
        );
      }
    }
  );

  return (
    messages.join(" ") ||
    "Unable to save the role assignment."
  );
};


// ==================================================
// COMPONENT
// ==================================================

const StaffRoleAssignmentFormPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);


  // ==================================================
  // DATA
  // ==================================================

  const [staffMembers, setStaffMembers] =
    useState([]);

  const [roles, setRoles] =
    useState([]);


  // ==================================================
  // FORM
  // ==================================================

  const [staff, setStaff] =
    useState("");

  const [role, setRole] =
    useState("");

  const [employmentType, setEmploymentType] =
    useState("permanent");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [isPrimary, setIsPrimary] =
    useState(false);

  const [assignmentStatus, setAssignmentStatus] =
    useState("active");

  const [notes, setNotes] =
    useState("");


  // ==================================================
  // ORIGINAL ASSIGNMENT
  // ==================================================

  const [originalAssignment, setOriginalAssignment] =
    useState(null);


  // ==================================================
  // UI STATE
  // ==================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // LOAD FORM DATA
  // ==================================================

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);
        setError("");

        const requests = [
          axiosInstance.get(
            "/staff/"
          ),

          axiosInstance.get(
            "/staff/roles/"
          ),
        ];


        if (isEditMode) {

          requests.push(
            axiosInstance.get(
              `/staff/role-assignments/${id}/`
            )
          );

        }


        const responses =
          await Promise.all(
            requests
          );


        setStaffMembers(
          extractList(
            responses[0]
          )
        );

        setRoles(
          extractList(
            responses[1]
          )
        );


        // ==================================================
        // EDIT MODE DATA
        // ==================================================

        if (isEditMode) {

          const assignment =
            responses[2]?.data;

          setOriginalAssignment(
            assignment
          );

          setStaff(
            assignment?.staff ??
              ""
          );

          setRole(
            assignment?.role ??
              ""
          );

          setEmploymentType(
            assignment?.employment_type ||
              "permanent"
          );

          setStartDate(
            assignment?.start_date ||
              ""
          );

          setEndDate(
            assignment?.end_date ||
              ""
          );

          setIsPrimary(
            Boolean(
              assignment?.is_primary
            )
          );

          setAssignmentStatus(
            assignment?.status ||
              "active"
          );

          setNotes(
            assignment?.notes ||
              ""
          );
        }


        // ==================================================
        // CREATE MODE DEFAULTS
        // ==================================================

        if (!isEditMode) {

          setStartDate(
            new Date()
              .toISOString()
              .split("T")[0]
          );

        }

      } catch (err) {

        console.error(
          "Failed to load role assignment form:",
          err
        );

        setError(
          extractErrorMessage(err)
        );

      } finally {

        setLoading(false);

      }
    };


    loadData();

  }, [
    id,
    isEditMode,
  ]);


  // ==================================================
  // SELECTED STAFF
  // ==================================================

  const selectedStaff = useMemo(() => {

    return staffMembers.find(
      (item) =>
        String(
          getId(item)
        ) === String(staff)
    );

  }, [
    staffMembers,
    staff,
  ]);


  // ==================================================
  // SELECTED ROLE
  // ==================================================

  const selectedRole = useMemo(() => {

    return roles.find(
      (item) =>
        String(
          getId(item)
        ) === String(role)
    );

  }, [
    roles,
    role,
  ]);


  // ==================================================
  // ACTIVE STAFF
  // ==================================================

  const availableStaff = useMemo(() => {

    return staffMembers.filter(
      (member) => {

        const isActive =
          member.status ===
            "active" ||
          member.is_active === true;

        const isCurrentStaff =
          String(
            getId(member)
          ) === String(staff);

        return (
          isActive ||
          isCurrentStaff
        );
      }
    );

  }, [
    staffMembers,
    staff,
  ]);


  // ==================================================
  // ACTIVE ROLES
  // ==================================================

  const availableRoles = useMemo(() => {

    return roles.filter(
      (item) => {

        const isActive =
          item.is_active !== false;

        const isCurrentRole =
          String(
            getId(item)
          ) === String(role);

        return (
          isActive ||
          isCurrentRole
        );
      }
    );

  }, [
    roles,
    role,
  ]);


  // ==================================================
  // ROLE ACTIVE CHECK
  // ==================================================

  const selectedRoleInactive =
    selectedRole &&
    selectedRole.is_active === false;


  // ==================================================
  // FORM VALIDATION
  // ==================================================

  const validateForm = () => {

    if (!staff) {
      return "Select a staff member.";
    }

    if (!role) {
      return "Select a staff role.";
    }

    if (!employmentType) {
      return "Select an employment type.";
    }

    if (!startDate) {
      return "Select the assignment start date.";
    }

    if (
      endDate &&
      endDate < startDate
    ) {
      return "The end date cannot be earlier than the start date.";
    }

    if (
      assignmentStatus === "active" &&
      selectedRoleInactive
    ) {
      return "An active assignment cannot be assigned to an inactive role.";
    }

    return null;
  };


  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    const validationError =
      validateForm();

    if (validationError) {

      setError(
        validationError
      );

      return;
    }


    try {

      setSaving(true);


      const payload = {
        staff: Number(staff),

        role: Number(role),

        employment_type:
          employmentType,

        start_date:
          startDate,

        end_date:
          endDate || null,

        is_primary:
          Boolean(isPrimary),

        status:
          assignmentStatus,

        notes:
          notes.trim(),
      };


      let response;


      // ==================================================
      // CREATE
      // ==================================================

      if (!isEditMode) {

        response =
          await axiosInstance.post(
            "/staff/role-assignments/",
            payload
          );

      }


      // ==================================================
      // UPDATE
      // ==================================================

      else {

        /*
         * The backend protects the staff relationship
         * during updates.
         *
         * We therefore keep the existing staff ID.
         */

        response =
          await axiosInstance.patch(
            `/staff/role-assignments/${id}/`,
            {
              role:
                Number(role),

              employment_type:
                employmentType,

              start_date:
                startDate,

              end_date:
                endDate || null,

              is_primary:
                Boolean(isPrimary),

              status:
                assignmentStatus,

              notes:
                notes.trim(),
            }
          );

      }


      const savedAssignment =
        response?.data;


      setSuccess(
        isEditMode
          ? "Role assignment updated successfully."
          : "Role assignment created successfully."
      );


      // ==================================================
      // NAVIGATE TO DETAILS
      // ==================================================

      const assignmentId =
        savedAssignment?.id ||
        id;


      setTimeout(() => {

        navigate(
          `/staff/role-assignments/${assignmentId}`
        );

      }, 700);


    } catch (err) {

      console.error(
        "Failed to save role assignment:",
        err
      );

      setError(
        extractErrorMessage(err)
      );

    } finally {

      setSaving(false);

    }

  };


  // ==================================================
  // CANCEL
  // ==================================================

  const handleCancel = () => {

    if (saving) {
      return;
    }

    navigate(-1);

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

        <div className="flex items-center gap-3 text-gray-600">

          <RefreshCw
            size={20}
            className="animate-spin"
          />

          <span>
            Loading role assignment form...
          </span>

        </div>

      </div>
    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/staff"
            className="hover:text-purple-700"
          >
            Staff Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/staff/role-assignments"
            className="hover:text-purple-700"
          >
            Role Assignments
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Assignment"
              : "New Assignment"}
          </span>

        </div>


        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">
              <ShieldCheck size={25} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {isEditMode
                  ? "Edit Role Assignment"
                  : "Create Role Assignment"}
              </h1>

              <p className="text-gray-600 mt-1">
                {isEditMode
                  ? "Update the staff member's role assignment."
                  : "Assign a staff member to a role."}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
          >

            <ArrowLeft size={17} />

            Cancel

          </button>

        </div>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (

        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <AlertCircle
            size={19}
            className="mt-0.5 flex-shrink-0"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {success && (

        <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">

          <Check
            size={19}
            className="mt-0.5 flex-shrink-0"
          />

          <span>
            {success}
          </span>

        </div>

      )}


      {/* ==================================================
          FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto"
      >

        {/* ==================================================
            ASSIGNMENT INFORMATION
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <Briefcase size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Assignment Information
              </h2>

              <p className="text-sm text-gray-500">
                Select the staff member, role and employment arrangement.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ==================================================
                STAFF
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                Staff Member
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>

              <select
                value={staff}
                onChange={(event) => {

                  if (isEditMode) {
                    return;
                  }

                  setStaff(
                    event.target.value
                  );

                }}
                disabled={isEditMode}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="">
                  Select staff member
                </option>

                {availableStaff.map(
                  (member) => (

                    <option
                      key={getId(member)}
                      value={getId(member)}
                    >
                      {getStaffName(member)}
                      {member.employee_number
                        ? ` — ${member.employee_number}`
                        : ""}
                    </option>

                  )
                )}

              </select>


              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1.5">
                  The staff member cannot be changed after an assignment has been created.
                </p>
              )}

            </div>


            {/* ==================================================
                ROLE
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                Staff Role
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value
                  )
                }
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="">
                  Select role
                </option>

                {availableRoles.map(
                  (item) => (

                    <option
                      key={getId(item)}
                      value={getId(item)}
                    >
                      {getRoleName(item)}
                      {item.code
                        ? ` — ${item.code}`
                        : ""}
                      {item.is_active === false
                        ? " (Inactive)"
                        : ""}
                    </option>

                  )
                )}

              </select>


              {selectedRoleInactive && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1.5">

                  <AlertCircle
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                  />

                  This role is inactive. An active assignment cannot be created for it.

                </p>
              )}

            </div>


            {/* ==================================================
                EMPLOYMENT TYPE
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                Employment Type
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>

              <select
                value={employmentType}
                onChange={(event) =>
                  setEmploymentType(
                    event.target.value
                  )
                }
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                {EMPLOYMENT_TYPE_OPTIONS.map(
                  (item) => (

                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>

                  )
                )}

              </select>

              <p className="text-xs text-gray-500 mt-1.5">
                This records the employment arrangement for this particular role assignment.
              </p>

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                Assignment Status
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>

              <select
                value={assignmentStatus}
                onChange={(event) =>
                  setAssignmentStatus(
                    event.target.value
                  )
                }
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                {STATUS_OPTIONS.map(
                  (item) => (

                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>

        </div>


        {/* ==================================================
            ASSIGNMENT PERIOD
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <CalendarDays size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Assignment Period
              </h2>

              <p className="text-sm text-gray-500">
                Define when the role assignment starts and ends.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Start Date */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                Start Date
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>


            {/* End Date */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">

                End Date

              </label>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <p className="text-xs text-gray-500 mt-1.5">
                Leave blank if the assignment has no scheduled end date.
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            PRIMARY ROLE
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-start gap-4">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 flex-shrink-0">
              <ShieldCheck size={20} />
            </div>

            <div className="flex-1">

              <h2 className="font-semibold text-gray-800">
                Primary Role
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-4">
                A staff member may have several roles, but only one active role can be marked as primary.
              </p>


              <label className="flex items-start gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(event) =>
                    setIsPrimary(
                      event.target.checked
                    )
                  }
                  className="w-5 h-5 mt-0.5 accent-purple-700"
                />

                <span>

                  <span className="block font-medium text-gray-800">
                    Mark this as the primary role
                  </span>

                  <span className="block text-sm text-gray-500 mt-0.5">
                    This will become the staff member's main active role.
                  </span>

                </span>

              </label>


              {isPrimary &&
                assignmentStatus ===
                  "active" && (
                <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">

                  <p className="text-sm text-purple-800">
                    If the staff member already has another active primary role, the backend will prevent the assignment from being saved.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            NOTES
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <FileText size={20} />
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Notes
              </h2>

              <p className="text-sm text-gray-500">
                Add any additional information about this assignment.
              </p>

            </div>

          </div>


          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value
              )
            }
            rows={5}
            placeholder="Enter assignment notes..."
            className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

        </div>


        {/* ==================================================
            SELECTED INFORMATION
        ================================================== */}

        {selectedStaff && selectedRole && (

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">

            <div className="flex items-center gap-3 mb-4">

              <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700">
                <User size={19} />
              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Assignment Summary
                </h2>

                <p className="text-sm text-gray-500">
                  Review the assignment before saving.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Staff */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Staff Member
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {getStaffName(
                    selectedStaff
                  )}
                </p>

                {selectedStaff.employee_number && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedStaff.employee_number}
                  </p>
                )}

              </div>


              {/* Role */}
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">

                <p className="text-xs uppercase font-semibold text-purple-600">
                  Role
                </p>

                <p className="font-semibold text-purple-800 mt-1">
                  {getRoleName(
                    selectedRole
                  )}
                </p>

                {selectedRole.code && (
                  <p className="text-xs text-purple-600 mt-1">
                    {selectedRole.code}
                  </p>
                )}

              </div>


              {/* Employment */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">

                <p className="text-xs uppercase font-semibold text-gray-500">
                  Employment Type
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {getEmploymentTypeLabel(
                    employmentType
                  )}
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            FORM ACTIONS
        ================================================== */}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pb-8">

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >

            <X size={18} />

            Cancel

          </button>


          <button
            type="submit"
            disabled={
              saving ||
              Boolean(
                selectedRoleInactive &&
                assignmentStatus ===
                  "active"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {saving ? (
              <>
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={18} />

                {isEditMode
                  ? "Update Assignment"
                  : "Create Assignment"}
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};


export default StaffRoleAssignmentFormPage;

