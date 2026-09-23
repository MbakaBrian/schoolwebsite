import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Bus,
  Check,
  ChevronRight,
  RefreshCw,
  Save,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../../../../utils/axiosInstance";


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

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return item;
  }

  return item.id ?? item.pk ?? null;
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
    .join(" ")
    .trim() || "Unknown Student";
};


const getRouteName = (route) => {
  if (!route) {
    return "Unnamed Route";
  }

  return (
    route.name ||
    route.route_name ||
    route.title ||
    "Unnamed Route"
  );
};


const getRouteCode = (route) => {
  if (!route) {
    return "";
  }

  return (
    route.code ||
    route.route_code ||
    ""
  );
};


const getStageName = (stage) => {
  if (!stage) {
    return "Unnamed Stage";
  }

  return (
    stage.name ||
    stage.stage_name ||
    stage.title ||
    "Unnamed Stage"
  );
};


const getErrorMessage = (error) => {
  const data =
    error?.response?.data;

  if (!data) {
    return "An unexpected error occurred.";
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
    typeof data === "object"
  ) {
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

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return "Unable to save the transport assignment.";
};


// ==================================================
// COMPONENT
// ==================================================

const TransportAssignmentFormPage = () => {
  const navigate = useNavigate();

  const {
    id,
  } = useParams();

  const isEditMode = Boolean(id);


  // ==================================================
  // DATA
  // ==================================================

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    routes,
    setRoutes,
  ] = useState([]);

  const [
    stages,
    setStages,
  ] = useState([]);


  // ==================================================
  // FORM
  // ==================================================

  const [
    formData,
    setFormData,
  ] = useState({
    student: "",
    route: "",
    stage: "",
    start_date: "",
    end_date: "",
    status: "active",
    notes: "",
  });


  // ==================================================
  // UI
  // ==================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // ==================================================
  // LOAD REFERENCE DATA
  // ==================================================

  useEffect(() => {

    const loadReferenceData =
      async () => {

        try {

          setLoading(true);
          setError("");

          const [
            studentsResponse,
            routesResponse,
            stagesResponse,
          ] = await Promise.all([

            axiosInstance.get(
              "/students/"
            ),

            axiosInstance.get(
              "/transport/routes/"
            ),

            axiosInstance.get(
              "/transport/stages/"
            ),

          ]);


          setStudents(
            extractList(
              studentsResponse
            )
          );

          setRoutes(
            extractList(
              routesResponse
            )
          );

          setStages(
            extractList(
              stagesResponse
            )
          );

        } catch (err) {

          console.error(
            "Failed to load transport assignment data:",
            err
          );

          setError(
            "Failed to load students, routes, or stages."
          );

        } finally {

          setLoading(false);

        }

      };


    loadReferenceData();

  }, []);


  // ==================================================
  // LOAD EXISTING ASSIGNMENT
  // ==================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }

    const loadAssignment =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await axiosInstance.get(
              `/transport/assignments/${id}/`
            );

          const assignment =
            response.data;


          setFormData({

            student:
              getId(
                assignment.student
              ) ??
              assignment.student ??
              "",

            route:
              getId(
                assignment.route
              ) ??
              assignment.route ??
              "",

            stage:
              getId(
                assignment.stage
              ) ??
              assignment.stage ??
              "",

            start_date:
              assignment.start_date ||
              assignment.assignment_start_date ||
              "",

            end_date:
              assignment.end_date ||
              assignment.assignment_end_date ||
              "",

            status:
              assignment.status ||
              (
                assignment.is_active
                  ? "active"
                  : "inactive"
              ) ||
              "active",

            notes:
              assignment.notes ||
              "",

          });

        } catch (err) {

          console.error(
            "Failed to load assignment:",
            err
          );

          setError(
            "Failed to load the transport assignment."
          );

        } finally {

          setLoading(false);

        }

      };


    loadAssignment();

  }, [
    id,
    isEditMode,
  ]);


  // ==================================================
  // SELECTED ROUTE
  // ==================================================

  const selectedRoute =
    useMemo(() => {

      return routes.find(
        (route) =>
          String(
            getId(route)
          ) === String(
            formData.route
          )
      ) || null;

    }, [
      routes,
      formData.route,
    ]);


  // ==================================================
  // ROUTE STAGES
  // ==================================================

  const routeStages =
    useMemo(() => {

      if (!formData.route) {
        return [];
      }

      return stages
        .filter(
          (stage) => {

            const stageRoute =
              stage.route;

            const stageRouteId =
              getId(
                stageRoute
              ) ??
              stageRoute;

            return (
              String(
                stageRouteId
              ) === String(
                formData.route
              )
            );

          }
        )
        .sort(
          (a, b) => {

            const aOrder =
              a.sequence ??
              a.stage_order ??
              a.order ??
              a.position ??
              0;

            const bOrder =
              b.sequence ??
              b.stage_order ??
              b.order ??
              b.position ??
              0;

            return (
              Number(aOrder) -
              Number(bOrder)
            );

          }
        );

    }, [
      stages,
      formData.route,
    ]);


  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");


    // --------------------------------------------
    // ROUTE CHANGE
    // --------------------------------------------

    if (
      name === "route"
    ) {

      setFormData(
        (current) => ({
          ...current,
          route: value,
          stage: "",
        })
      );

    }

  };


  // ==================================================
  // VALIDATION
  // ==================================================

  const validateForm = () => {

    if (!formData.student) {
      return "Select a student.";
    }

    if (!formData.route) {
      return "Select a transport route.";
    }

    if (!formData.stage) {
      return "Select a transport stage.";
    }

    if (!formData.start_date) {
      return "Enter the assignment start date.";
    }

    if (
      formData.end_date &&
      formData.end_date <
        formData.start_date
    ) {
      return (
        "The assignment end date cannot be earlier than the start date."
      );
    }

    return null;
  };


  // ==================================================
  // SAVE
  // ==================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

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
      setError("");
      setSuccess("");


      const payload = {

        student:
          Number(
            formData.student
          ),

        route:
          Number(
            formData.route
          ),

        stage:
          Number(
            formData.stage
          ),

        start_date:
          formData.start_date,

        end_date:
          formData.end_date ||
          null,

        status:
          formData.status,

        notes:
          formData.notes.trim(),

      };


      let response;


      if (isEditMode) {

        response =
          await axiosInstance.patch(
            `/transport/assignments/${id}/`,
            payload
          );

      } else {

        response =
          await axiosInstance.post(
            "/transport/assignments/",
            payload
          );

      }


      setSuccess(
        isEditMode
          ? "Transport assignment updated successfully."
          : "Transport assignment created successfully."
      );


      const savedId =
        getId(
          response.data
        ) || id;


      setTimeout(() => {

        if (savedId) {

          navigate(
            `/transport/assignments/${savedId}`
          );

        } else {

          navigate(
            "/transport/assignments"
          );

        }

      }, 700);

    } catch (err) {

      console.error(
        "Failed to save transport assignment:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setSaving(false);

    }

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            size={28}
            className="mx-auto text-purple-700 animate-spin mb-3"
          />

          <p className="text-gray-600">
            Loading transport assignment...
          </p>

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

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">

          <Link
            to="/transport"
            className="hover:text-purple-700"
          >
            Transport Management
          </Link>

          <ChevronRight size={15} />

          <Link
            to="/transport/assignments"
            className="hover:text-purple-700"
          >
            Student Assignments
          </Link>

          <ChevronRight size={15} />

          <span className="text-gray-700 font-medium">
            {isEditMode
              ? "Edit Assignment"
              : "New Assignment"}
          </span>

        </div>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-800 text-white">

              <Bus size={25} />

            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">

                {isEditMode
                  ? "Edit Transport Assignment"
                  : "New Transport Assignment"}

              </h1>

              <p className="text-gray-600 mt-1">

                {isEditMode
                  ? "Update the student's transport arrangement."
                  : "Assign a student to a school transport route and stage."}

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/transport/assignments"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
          >

            <ArrowLeft size={17} />

            Back to Assignments

          </button>

        </div>

      </div>


      {/* ==================================================
          QUICK NAVIGATION
      ================================================== */}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 overflow-x-auto">

        <div className="flex items-center gap-2 min-w-max">

          <Link
            to="/transport"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Dashboard
          </Link>

          <Link
            to="/transport/drivers"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Drivers
          </Link>

          <Link
            to="/transport/vehicles"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Vehicles
          </Link>

          <Link
            to="/transport/routes"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Routes & Stages
          </Link>

          <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold">
            Student Assignments
          </span>

          <Link
            to="/transport/expenses"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Vehicle Expenses
          </Link>

          <Link
            to="/transport/reports"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-800"
          >
            Driver Reports
          </Link>

        </div>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (

        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">

          <X
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
        className="max-w-5xl"
      >

        {/* ==================================================
            STUDENT & ROUTE
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold">
              1
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Student & Route
              </h2>

              <p className="text-sm text-gray-500">
                Select the student and the transport route.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Student */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Student <span className="text-red-500">*</span>
              </label>

              <select
                name="student"
                value={formData.student}
                onChange={handleChange}
                disabled={isEditMode}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                      {" — "}

                      {student.admission_number ||
                        student.admission_no ||
                        "No admission number"}

                    </option>

                  )
                )}

              </select>

              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1.5">
                  The student cannot be changed on an existing assignment.
                </p>
              )}

            </div>


            {/* Route */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Transport Route <span className="text-red-500">*</span>
              </label>

              <select
                name="route"
                value={formData.route}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="">
                  Select route
                </option>

                {routes.map(
                  (route) => (

                    <option
                      key={getId(route)}
                      value={getId(route)}
                    >

                      {getRouteName(
                        route
                      )}

                      {getRouteCode(
                        route
                      )
                        ? ` (${getRouteCode(route)})`
                        : ""}

                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* Selected route info */}

          {selectedRoute && (

            <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

              <div className="flex items-start gap-3">

                <Bus
                  size={20}
                  className="text-purple-700 mt-0.5"
                />

                <div>

                  <p className="font-semibold text-purple-800">
                    {getRouteName(
                      selectedRoute
                    )}
                  </p>

                  {getRouteCode(
                    selectedRoute
                  ) && (
                    <p className="text-sm text-purple-700 mt-0.5">
                      Route code:{" "}
                      {getRouteCode(
                        selectedRoute
                      )}
                    </p>
                  )}

                  {selectedRoute.description && (
                    <p className="text-sm text-purple-700 mt-1">
                      {selectedRoute.description}
                    </p>
                  )}

                </div>

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            STAGE & DATES
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold">
              2
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Stage & Assignment Period
              </h2>

              <p className="text-sm text-gray-500">
                Select the student's transport stage and assignment dates.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Stage */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Transport Stage <span className="text-red-500">*</span>
              </label>

              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                disabled={!formData.route}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >

                <option value="">
                  {!formData.route
                    ? "Select route first"
                    : routeStages.length === 0
                      ? "No stages available"
                      : "Select stage"}
                </option>

                {routeStages.map(
                  (stage) => (

                    <option
                      key={getId(stage)}
                      value={getId(stage)}
                    >

                      {getStageName(
                        stage
                      )}

                    </option>

                  )
                )}

              </select>

              {formData.route &&
                routeStages.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    This route currently has no configured stages.
                  </p>
                )}

            </div>


            {/* Start date */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>


            {/* End date */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                min={formData.start_date || undefined}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <p className="text-xs text-gray-500 mt-1.5">
                Leave blank for an ongoing assignment.
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            STATUS & NOTES
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center font-bold">
              3
            </div>

            <div>

              <h2 className="font-semibold text-gray-800">
                Assignment Status
              </h2>

              <p className="text-sm text-gray-500">
                Set the current status and add any relevant notes.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Status */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="ended">
                  Ended
                </option>

                <option value="suspended">
                  Suspended
                </option>

              </select>

            </div>


            {/* Notes */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any relevant transport assignment notes..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>

        </div>


        {/* ==================================================
            FORM ACTIONS
        ================================================== */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <p className="text-sm text-gray-500">
              Fields marked with{" "}
              <span className="text-red-500">*</span>
              {" "}are required.
            </p>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/transport/assignments"
                  )
                }
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >

                <X size={18} />

                Cancel

              </button>


              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-purple-800 text-white hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
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

          </div>

        </div>

      </form>

    </div>
  );
};


export default TransportAssignmentFormPage;

