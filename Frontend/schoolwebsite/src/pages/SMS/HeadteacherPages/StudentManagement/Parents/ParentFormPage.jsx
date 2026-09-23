import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


// ============================================================
// HELPERS
// ============================================================

const extractResults = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const getRelatedId = (relationship) => {
  return (
    relationship.student ||
    relationship.student_id ||
    relationship.student?.id ||
    null
  );
};


const getStudentName = (student) => {
  if (!student) {
    return "Unknown Student";
  }

  if (student.full_name) {
    return student.full_name;
  }

  return [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");
};


// ============================================================
// RELATIONSHIP OPTIONS
// ============================================================

const RELATIONSHIP_OPTIONS = [
  {
    value: "mother",
    label: "Mother",
  },
  {
    value: "father",
    label: "Father",
  },
  {
    value: "guardian",
    label: "Guardian",
  },
  {
    value: "step_mother",
    label: "Step Mother",
  },
  {
    value: "step_father",
    label: "Step Father",
  },
  {
    value: "grandparent",
    label: "Grandparent",
  },
  {
    value: "sibling",
    label: "Sibling",
  },
  {
    value: "other",
    label: "Other",
  },
];


// ============================================================
// INITIAL FORM DATA
// ============================================================

const INITIAL_FORM_DATA = {
  family: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  national_id: "",
  gender: "",
  mobile: "",
  alternative_mobile: "",
  email: "",
  occupation: "",
  employer: "",
  address: "",
  is_active: true,
};


// ============================================================
// FIELD COMPONENT
// ============================================================

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  children,
}) {
  const baseClasses =
    "w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-purple-900">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseClasses}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ParentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [formData, setFormData] = useState(
    INITIAL_FORM_DATA
  );

  const [families, setFamilies] = useState([]);
  const [students, setStudents] = useState([]);

  const [relationships, setRelationships] =
    useState({});

  const [loading, setLoading] = useState(
    isEditMode
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // FETCH FAMILIES
  // ==========================================================

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response =
          await axiosInstance.get(
            "/students/families/"
          );

        setFamilies(
          extractResults(response.data)
        );
      } catch (err) {
        console.error(
          "Failed to fetch families:",
          err
        );
      }
    };

    fetchFamilies();
  }, []);


  // ==========================================================
  // FETCH EXISTING PARENT
  // ==========================================================

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchParent = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get(
            `/students/parents/${id}/`
          );

        const parent = response.data;

        setFormData({
          family:
            parent.family ?? "",
          first_name:
            parent.first_name ?? "",
          middle_name:
            parent.middle_name ?? "",
          last_name:
            parent.last_name ?? "",
          national_id:
            parent.national_id ?? "",
          gender:
            parent.gender ?? "",
          mobile:
            parent.mobile ?? "",
          alternative_mobile:
            parent.alternative_mobile ?? "",
          email:
            parent.email ?? "",
          occupation:
            parent.occupation ?? "",
          employer:
            parent.employer ?? "",
          address:
            parent.address ?? "",
          is_active:
            parent.is_active ?? true,
        });
      } catch (err) {
        console.error(
          "Failed to fetch parent:",
          err
        );

        setError(
          "Unable to load the parent information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchParent();
  }, [id, isEditMode]);


  // ==========================================================
  // FETCH FAMILY STUDENTS
  // ==========================================================

  useEffect(() => {
    if (!formData.family) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const response =
          await axiosInstance.get(
            "/students/students/",
            {
              params: {
                family: formData.family,
              },
            }
          );

        const studentList =
          extractResults(response.data);

        setStudents(studentList);

        // ----------------------------------------------------
        // INITIALISE RELATIONSHIP STATE
        // ----------------------------------------------------

        setRelationships((current) => {
          const next = {
            ...current,
          };

          studentList.forEach(
            (student) => {
              if (!next[student.id]) {
                next[student.id] = {
                  student: student.id,
                  linked: false,
                  relationship: "guardian",
                  is_primary: false,
                  has_parental_responsibility:
                    true,
                  receives_communication:
                    true,
                  receives_fee_notifications:
                    true,
                  is_emergency_contact:
                    false,
                  existingId: null,
                };
              }
            }
          );

          return next;
        });
      } catch (err) {
        console.error(
          "Failed to fetch family students:",
          err
        );

        setStudents([]);
      }
    };

    fetchStudents();
  }, [formData.family]);


  // ==========================================================
  // FETCH EXISTING RELATIONSHIPS
  // ==========================================================

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const fetchRelationships = async () => {
      try {
        const response =
          await axiosInstance.get(
            "/students/student-parents/",
            {
              params: {
                parent_guardian: id,
              },
            }
          );

        const existing =
          extractResults(response.data);

        setRelationships((current) => {
          const next = {
            ...current,
          };

          existing.forEach(
            (relationship) => {
              const studentId =
                getRelatedId(relationship);

              if (!studentId) {
                return;
              }

              next[studentId] = {
                student: studentId,
                linked: true,
                relationship:
                  relationship.relationship ??
                  "guardian",
                is_primary:
                  relationship.is_primary ??
                  false,
                has_parental_responsibility:
                  relationship.has_parental_responsibility ??
                  true,
                receives_communication:
                  relationship.receives_communication ??
                  true,
                receives_fee_notifications:
                  relationship.receives_fee_notifications ??
                  true,
                is_emergency_contact:
                  relationship.is_emergency_contact ??
                  false,
                existingId:
                  relationship.id ??
                  null,
              };
            }
          );

          return next;
        });
      } catch (err) {
        console.error(
          "Failed to fetch student relationships:",
          err
        );
      }
    };

    fetchRelationships();
  }, [id, isEditMode]);


  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // ==========================================================
  // RELATIONSHIP HANDLER
  // ==========================================================

  const updateRelationship = (
    studentId,
    field,
    value
  ) => {
    setRelationships((current) => ({
      ...current,

      [studentId]: {
        ...(current[studentId] || {
          student: studentId,
          linked: false,
          relationship: "guardian",
          is_primary: false,
          has_parental_responsibility:
            true,
          receives_communication:
            true,
          receives_fee_notifications:
            true,
          is_emergency_contact:
            false,
          existingId: null,
        }),

        [field]: value,
      },
    }));
  };


  // ==========================================================
  // LINK / UNLINK STUDENT
  // ==========================================================

  const toggleStudent = (studentId) => {
    setRelationships((current) => ({
      ...current,

      [studentId]: {
        ...(current[studentId] || {
          student: studentId,
          relationship: "guardian",
          is_primary: false,
          has_parental_responsibility:
            true,
          receives_communication:
            true,
          receives_fee_notifications:
            true,
          is_emergency_contact:
            false,
          existingId: null,
        }),

        linked:
          !(
            current[studentId]?.linked
          ),
      },
    }));
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!formData.family) {
      return "Please select a family.";
    }

    if (!formData.first_name.trim()) {
      return "First name is required.";
    }

    if (!formData.last_name.trim()) {
      return "Last name is required.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    return null;
  };


  // ==========================================================
  // SAVE PARENT
  // ==========================================================

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

    setSaving(true);

    try {
      // ------------------------------------------------------
      // PARENT PAYLOAD
      // ------------------------------------------------------

      const payload = {
        family: formData.family,
        first_name:
          formData.first_name.trim(),
        middle_name:
          formData.middle_name.trim(),
        last_name:
          formData.last_name.trim(),
        national_id:
          formData.national_id.trim(),
        gender:
          formData.gender,
        mobile:
          formData.mobile.trim(),
        alternative_mobile:
          formData.alternative_mobile.trim(),
        email:
          formData.email.trim(),
        occupation:
          formData.occupation.trim(),
        employer:
          formData.employer.trim(),
        address:
          formData.address.trim(),
        is_active:
          formData.is_active,
      };

      // ------------------------------------------------------
      // CREATE / UPDATE PARENT
      // ------------------------------------------------------

      let savedParent;

      if (isEditMode) {
        const response =
          await axiosInstance.put(
            `/students/parents/${id}/`,
            payload
          );

        savedParent =
          response.data;
      } else {
        const response =
          await axiosInstance.post(
            "/students/parents/",
            payload
          );

        savedParent =
          response.data;
      }

      const parentId =
        savedParent.id || id;

      // ======================================================
      // SAVE STUDENT RELATIONSHIPS
      // ======================================================

      const relationshipEntries =
        Object.values(
          relationships
        );

      for (
        const relationship
        of relationshipEntries
      ) {
        // ----------------------------------------------------
        // SKIP STUDENTS THAT ARE NOT LINKED
        // ----------------------------------------------------

        if (
          !relationship.linked
        ) {
          // --------------------------------------------------
          // DELETE EXISTING RELATIONSHIP
          // --------------------------------------------------

          if (
            relationship.existingId
          ) {
            await axiosInstance.delete(
              `/students/student-parents/${relationship.existingId}/`
            );
          }

          continue;
        }

        // ----------------------------------------------------
        // RELATIONSHIP PAYLOAD
        // ----------------------------------------------------

        const relationshipPayload = {
          student:
            relationship.student,

          parent_guardian:
            parentId,

          relationship:
            relationship.relationship,

          is_primary:
            relationship.is_primary,

          has_parental_responsibility:
            relationship.has_parental_responsibility,

          receives_communication:
            relationship.receives_communication,

          receives_fee_notifications:
            relationship.receives_fee_notifications,

          is_emergency_contact:
            relationship.is_emergency_contact,
        };

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        if (
          relationship.existingId
        ) {
          await axiosInstance.put(
            `/students/student-parents/${relationship.existingId}/`,
            relationshipPayload
          );
        }

        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        else {
          await axiosInstance.post(
            "/students/student-parents/",
            relationshipPayload
          );
        }
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        isEditMode
          ? "Parent information updated successfully."
          : "Parent created successfully."
      );

      setTimeout(() => {
        navigate(
          `/sms/parents/${parentId}`
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save parent:",
        err
      );

      const backendError =
        err.response?.data;

      let message =
        "Failed to save parent information.";

      if (
        typeof backendError ===
        "string"
      ) {
        message =
          backendError;
      } else if (
        backendError?.detail
      ) {
        message =
          backendError.detail;
      } else if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        const firstError =
          Object.values(
            backendError
          )[0];

        if (
          Array.isArray(firstError)
        ) {
          message =
            firstError[0];
        } else if (
          typeof firstError ===
          "string"
        ) {
          message =
            firstError;
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-purple-900 p-8 text-center text-white shadow-lg">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-purple-300 border-t-white" />

            <p className="text-sm font-medium">
              Loading parent information...
            </p>
          </div>
        </div>
      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-purple-50">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="bg-gradient-to-r from-purple-950 via-purple-800 to-purple-700 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-purple-200">
                <Link
                  to="/sms/parents"
                  className="hover:text-white"
                >
                  Parents
                </Link>

                <span>/</span>

                <span>
                  {isEditMode
                    ? "Edit Parent"
                    : "Add Parent"}
                </span>
              </div>

              <h1 className="text-2xl font-bold">
                {isEditMode
                  ? "Edit Parent / Guardian"
                  : "Add Parent / Guardian"}
              </h1>

              <p className="mt-1 text-sm text-purple-200">
                Manage parent information and
                student relationships.
              </p>
            </div>

            <Link
              to="/sms/parents"
              className="rounded-lg border border-purple-400 bg-purple-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              ← Back to Parents
            </Link>
          </div>
        </div>
      </div>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-6">

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <div className="flex items-start gap-2">
              <span className="font-bold">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-purple-300 bg-purple-100 px-4 py-3 text-sm font-medium text-purple-900 shadow-sm">
            ✓ {success}
          </div>
        )}


        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <div className="bg-purple-800 px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold">
                Personal Information
              </h2>

              <p className="mt-0.5 text-xs text-purple-200">
                Basic identification details
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field
                label="First Name"
                name="first_name"
                value={
                  formData.first_name
                }
                onChange={
                  handleChange
                }
                required
              />

              <Field
                label="Middle Name"
                name="middle_name"
                value={
                  formData.middle_name
                }
                onChange={
                  handleChange
                }
              />

              <Field
                label="Last Name"
                name="last_name"
                value={
                  formData.last_name
                }
                onChange={
                  handleChange
                }
                required
              />

              <Field
                label="National ID"
                name="national_id"
                value={
                  formData.national_id
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
              />

              <Field
                label="Gender"
                name="gender"
                value={
                  formData.gender
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </Field>
            </div>
          </section>


          {/* ==================================================
              FAMILY
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <div className="bg-purple-700 px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold">
                Family
              </h2>

              <p className="mt-0.5 text-xs text-purple-200">
                Connect this parent or guardian to a
                family.
              </p>
            </div>

            <div className="p-5">
              <div className="max-w-xl">
                <Field
                  label="Family"
                  name="family"
                  value={
                    formData.family
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select family
                  </option>

                  {families.map(
                    (family) => (
                      <option
                        key={family.id}
                        value={family.id}
                      >
                        {family.family_name ||
                          family.name ||
                          family.family_id ||
                          `Family ${family.id}`}
                      </option>
                    )
                  )}
                </Field>
              </div>
            </div>
          </section>


          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <div className="bg-purple-800 px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold">
                Contact Information
              </h2>

              <p className="mt-0.5 text-xs text-purple-200">
                Phone, email and address details
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field
                label="Mobile Number"
                name="mobile"
                value={
                  formData.mobile
                }
                onChange={
                  handleChange
                }
              />

              <Field
                label="Alternative Mobile"
                name="alternative_mobile"
                value={
                  formData.alternative_mobile
                }
                onChange={
                  handleChange
                }
              />

              <Field
                label="Email Address"
                name="email"
                type="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
              />

              <Field
                label="Address"
                name="address"
                value={
                  formData.address
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
              />
            </div>
          </section>


          {/* ==================================================
              EMPLOYMENT
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <div className="bg-purple-700 px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold">
                Employment
              </h2>

              <p className="mt-0.5 text-xs text-purple-200">
                Employment information, if applicable
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field
                label="Occupation"
                name="occupation"
                value={
                  formData.occupation
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
              />

              <Field
                label="Employer / Company"
                name="employer"
                value={
                  formData.employer
                }
                onChange={
                  handleChange
                }
                placeholder="Optional"
              />
            </div>
          </section>


          {/* ==================================================
              STUDENT RELATIONSHIPS
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-300 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-purple-900 to-purple-700 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold">
                    Student Relationships
                  </h2>

                  <p className="mt-0.5 text-xs text-purple-200">
                    Link this parent or guardian to
                    children in the selected family.
                  </p>
                </div>

                <div className="hidden rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold sm:block">
                  {students.length}{" "}
                  {students.length === 1
                    ? "Student"
                    : "Students"}
                </div>
              </div>
            </div>

            <div className="p-4">
              {!formData.family ? (
                <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-purple-900">
                    Select a family first
                  </p>

                  <p className="mt-1 text-xs text-purple-600">
                    The students belonging to that family
                    will appear here.
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-purple-900">
                    No students found
                  </p>

                  <p className="mt-1 text-xs text-purple-600">
                    There are currently no students
                    registered under this family.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map(
                    (student) => {
                      const relationship =
                        relationships[
                          student.id
                        ] || {
                          student:
                            student.id,
                          linked: false,
                          relationship:
                            "guardian",
                          is_primary:
                            false,
                          has_parental_responsibility:
                            true,
                          receives_communication:
                            true,
                          receives_fee_notifications:
                            true,
                          is_emergency_contact:
                            false,
                          existingId:
                            null,
                        };

                      return (
                        <div
                          key={student.id}
                          className={`rounded-xl border transition ${
                            relationship.linked
                              ? "border-purple-400 bg-purple-50"
                              : "border-purple-100 bg-white"
                          }`}
                        >
                          {/* --------------------------------
                              STUDENT HEADER
                          -------------------------------- */}

                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white">
                                {student.first_name?.[0] ||
                                  "S"}
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-purple-950">
                                  {getStudentName(
                                    student
                                  )}
                                </h3>

                                <p className="text-xs text-purple-600">
                                  {student.admission_number ||
                                    student.student_id ||
                                    "Student"}
                                </p>
                              </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-800">
                              <input
                                type="checkbox"
                                checked={
                                  relationship.linked
                                }
                                onChange={() =>
                                  toggleStudent(
                                    student.id
                                  )
                                }
                                className="h-4 w-4 rounded border-white text-purple-600 focus:ring-purple-300"
                              />

                              Linked to student
                            </label>
                          </div>


                          {/* --------------------------------
                              RELATIONSHIP SETTINGS
                          -------------------------------- */}

                          {relationship.linked && (
                            <div className="border-t border-purple-200 bg-white p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                  label="Relationship"
                                  name={`relationship-${student.id}`}
                                  value={
                                    relationship.relationship
                                  }
                                  onChange={(event) =>
                                    updateRelationship(
                                      student.id,
                                      "relationship",
                                      event.target.value
                                    )
                                  }
                                  required
                                >
                                  {RELATIONSHIP_OPTIONS.map(
                                    (
                                      option
                                    ) => (
                                      <option
                                        key={
                                          option.value
                                        }
                                        value={
                                          option.value
                                        }
                                      >
                                        {
                                          option.label
                                        }
                                      </option>
                                    )
                                  )}
                                </Field>

                                <div>
                                  <label className="mb-1.5 block text-xs font-semibold text-purple-900">
                                    Primary Parent / Contact
                                  </label>

                                  <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-3">
                                    <input
                                      type="checkbox"
                                      checked={
                                        relationship.is_primary
                                      }
                                      onChange={(event) =>
                                        updateRelationship(
                                          student.id,
                                          "is_primary",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    <span className="text-xs font-medium text-purple-900">
                                      This parent/contact is
                                      primary for this student
                                    </span>
                                  </label>
                                </div>
                              </div>


                              {/* --------------------------------
                                  RELATIONSHIP FLAGS
                              -------------------------------- */}

                              <div className="mt-4 rounded-xl bg-purple-50 p-3">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-purple-800">
                                  Relationship Settings
                                </p>

                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

                                  <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-purple-900 shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={
                                        relationship.has_parental_responsibility
                                      }
                                      onChange={(event) =>
                                        updateRelationship(
                                          student.id,
                                          "has_parental_responsibility",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    Parental Responsibility
                                  </label>


                                  <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-purple-900 shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={
                                        relationship.receives_communication
                                      }
                                      onChange={(event) =>
                                        updateRelationship(
                                          student.id,
                                          "receives_communication",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    Receives Communication
                                  </label>


                                  <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-purple-900 shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={
                                        relationship.receives_fee_notifications
                                      }
                                      onChange={(event) =>
                                        updateRelationship(
                                          student.id,
                                          "receives_fee_notifications",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    Fee Notifications
                                  </label>


                                  <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-purple-900 shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={
                                        relationship.is_emergency_contact
                                      }
                                      onChange={(event) =>
                                        updateRelationship(
                                          student.id,
                                          "is_emergency_contact",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                                    />

                                    Emergency Contact
                                  </label>

                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>


          {/* ==================================================
              ACCOUNT STATUS
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <div className="bg-purple-700 px-5 py-3.5 text-white">
              <h2 className="text-sm font-bold">
                Account Status
              </h2>

              <p className="mt-0.5 text-xs text-purple-200">
                Control whether this parent record is
                active.
              </p>
            </div>

            <div className="p-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    formData.is_active
                  }
                  onChange={
                    handleChange
                  }
                  className="h-4 w-4 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                />

                <div>
                  <p className="text-sm font-semibold text-purple-950">
                    Active Parent / Guardian
                  </p>

                  <p className="text-xs text-purple-600">
                    Inactive records are retained for
                    historical purposes.
                  </p>
                </div>
              </label>
            </div>
          </section>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 rounded-2xl bg-purple-900 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={
                isEditMode
                  ? `/sms/parents/${id}`
                  : "/sms/parents"
              }
              className="rounded-lg border border-purple-400 bg-purple-800 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-purple-900 shadow-sm transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Parent"
                : "Create Parent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}