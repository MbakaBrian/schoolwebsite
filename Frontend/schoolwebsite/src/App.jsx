import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/sections/Footer";

import Home from "./pages/WebsitePages/Home";
import About from "./pages/WebsitePages/About";
import Gallery from "./pages/WebsitePages/Gallery";
import Events from "./pages/WebsitePages/Events";
import Enroll from "./pages/WebsitePages/Enroll";
import Contact from "./pages/WebsitePages/Contact";
import Login from "./pages/WebsitePages/Login";
import FacilityPage from "./pages/WebsitePages/FacilityPage";

import PortfolioPage from "./pages/PortfolioPage";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./pages/SMS/Dashboard";


// ============================================================
// STUDENT & FAMILY MANAGEMENT
// ============================================================

// Student Management
import StudentsDashboard
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentsDashboard";

import StudentsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Students/StudentsPage";

import StudentFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Students/StudentFormPage";

import StudentDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Students/StudentDetailsPage";

import EditStudentPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Students/EditStudentPage";


// Families
import FamiliesPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Families/FamiliesPage";

import FamilyDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Families/FamilyDetailsPage";

import FamilyFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Families/FamilyFormPage";


// Existing parent page - kept temporarily
import ParentsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Parents/ParentsPage";

import ParentFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Parents/ParentFormPage";

import ParentDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Parents/ParentDetailsPage";


// StudentParent
import StudentParentRelationshipsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentParents/StudentParentRelationshipsPage";

import StudentParentFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentParents/StudentParentFormPage";

import StudentParentDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentParents/StudentParentDetailsPage";


// Enrollments
import EnrollmentsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Enrollments/EnrollmentsPage";

import EnrollmentFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Enrollments/EnrollmentFormPage";

import EnrollmentDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Enrollments/EnrollmentDetailsPage";


// Progression
import StudentProgressionPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Progression/StudentProgressionPage";

import BatchProgressionPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Progression/BatchProgressionPage";

import ProgressionFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Progression/ProgressionFormPage";

import ProgressionDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/Progression/ProgressionDetailsPage";


// Emergency Contacts
import EmergencyContactsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/EmergencyContacts/EmergencyContactsPage";

import EmergencyContactFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/EmergencyContacts/EmergencyContactFormPage";

import EmergencyContactDetailsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/EmergencyContacts/EmergencyContactDetailsPage";


// Student Documents
import StudentDocumentsPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentDocuments/StudentDocumentsPage";

import StudentDocumentFormPage
  from "./pages/SMS/HeadteacherPages/StudentManagement/StudentDocuments/StudentDocumentFormPage";


// ============================================================
// OTHER HEAD TEACHER MANAGEMENT
// ============================================================

import CreateTeacher
  from "./pages/SMS/HeadteacherPages/CreateTeacher";

import GradeFeeStructurePage
  from "./pages/SMS/HeadteacherPages/GradeFeeStructurePage";

import ManageTeachers
  from "./pages/SMS/HeadteacherPages/ManageTeachers";

import StreamsPage
  from "./pages/SMS/HeadteacherPages/StreamsPage";


// ============================================================
// RECEIPTS
// ============================================================

import ReceiptsPage
  from "./pages/SMS/HeadteacherPages/ReceiptsPage";

import ReceiptDetailPage
  from "./pages/SMS/HeadteacherPages/ReceiptDetailPage";

import ReceiptFormPage
  from "./pages/SMS/HeadteacherPages/ReceiptFormPage";

import ReceiptItemsPage
  from "./pages/SMS/HeadteacherPages/ReceiptItemsPage";

import ReceiptSummaryPage
  from "./pages/SMS/HeadteacherPages/ReceiptSummaryPage";


// ============================================================
// INVENTORY
// ============================================================

import InventoryDashboard
  from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryDashboard";

import StoresPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/StoresPage";

import InventoryLocationsPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryLocationsPage";

import InventoryItemsPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryItemsPage";

import InventoryStockPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryStockPage";

import AddStockPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/AddStockPage";

import RemoveStockPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/RemoveStockPage";

import TransferStockPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/TransferStockPage";

import AdjustStockPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/AdjustStockPage";

import InventoryTransactionsPage
  from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryTransactionsPage";


// ============================================================
// WEBSITE ADMINISTRATION
// ============================================================

import EventsPanel
  from "./pages/SMS/WebsiteManagementPages/EventsPanel";

import AdminDashboard
  from "./pages/SMS/WebsiteManagementPages/AdminDashboard";

import GalleryPanel
  from "./pages/SMS/WebsiteManagementPages/GalleryPanel";

import FacilitiesPanel
  from "./pages/SMS/WebsiteManagementPages/AdminFacilities";

import AdminTeamManagement
  from "./pages/SMS/WebsiteManagementPages/AdminTeamManagement";

import AdminAboutUs
  from "./pages/SMS/WebsiteManagementPages/AdminAboutUs";


// ============================================================
// DEPARTMENT MANAGEMENT
// ============================================================

import DepartmentsPage
  from "./pages/SMS/HeadteacherPages/DepatmentManagement/DepartmentsPage";

import DepartmentFormPage
  from "./pages/SMS/HeadteacherPages/DepatmentManagement/DepartmentFormPage";


// ============================================================
// ACADEMICS MANAGEMENT
// ============================================================

import AcademicsDashboard
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/AcademicsDashboard";


// Academic Years
import AcademicYearsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearsPage";

import AcademicYearFormPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearFormPage";

import AcademicYearDetailsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearDetailsPage";


// Academic Terms
import AcademicTermsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermsPage";

import AcademicTermFormPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermFormPage";

import AcademicTermDetailsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermDetailsPage";


// Academic Calendar
import AcademicCalendarPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/AcademicCalendarPage";

import CalendarEventFormPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/CalendarEventFormPage";

import CalendarEventDetailsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/CalendarEventDetailsPage";


// Class Levels
import ClassLevelsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelsPage";

import ClassLevelFormPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelFormPage";

import ClassLevelDetailsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelDetailsPage";


// Streams
import AcademicStreamsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamsPage";

import AcademicStreamFormPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamFormPage";

import AcademicStreamDetailsPage
  from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamDetailsPage";


// ============================================================
// STAFF MANAGEMENT
// ============================================================

import StaffDashboard
  from "./pages/SMS/HeadteacherPages/StaffManagement/StaffDashboard";

import StaffListPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Staff/StaffListPage";

import StaffFormPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Staff/StaffFormPage";

import StaffDetailsPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Staff/StaffDetailsPage";


import StaffRolesPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Roles/StaffRolesPage";

import StaffRoleFormPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Roles/StaffRoleFormPage";

import StaffRoleDetailsPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Roles/StaffRoleDetailsPage";


import StaffRoleAssignmentsPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Assignments/StaffRoleAssignmentsPage";

import StaffRoleAssignmentFormPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Assignments/StaffRoleAssignmentFormPage";

import StaffRoleAssignmentDetailsPage
  from "./pages/SMS/HeadteacherPages/StaffManagement/Assignments/StaffRoleAssignmentDetailsPage";


// ============================================================
// TRANSPORT MANAGEMENT
// ============================================================

import TransportDashboard
  from "./pages/SMS/HeadteacherPages/TransportManagement/TransportDashboard";


// --------------------------------------------------
// DRIVERS
// --------------------------------------------------

import DriversListPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Drivers/DriverListPage";

import DriverFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Drivers/DriverFormPage";

import DriverDetailsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Drivers/DriverDetailsPage";


// --------------------------------------------------
// VEHICLES
// --------------------------------------------------

import VehiclesPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Vehicles/VehiclesPage";

import VehicleFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Vehicles/VehicleFormPage";

import VehicleDetailsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Vehicles/VehicleDetailsPage";


// --------------------------------------------------
// ROUTES & STAGES
// --------------------------------------------------

import RoutesPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Routes/RoutesPage";

import RouteFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Routes/RouteFormPage";

import RouteDetailsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Routes/RouteDetailsPage";

import StageFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Routes/StageFormPage";


// --------------------------------------------------
// STUDENT TRANSPORT ASSIGNMENTS
// --------------------------------------------------

import TransportAssignmentsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Assignments/TransportAssignmentsPage";

import TransportAssignmentFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Assignments/TransportAssignmentFormPage";

import TransportAssignmentDetailsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Assignments/TransportAssignmentDetailsPage";


// --------------------------------------------------
// VEHICLE EXPENSES
// --------------------------------------------------

import VehicleExpensesPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Expenses/VehicleExpensesPage";

import FuelingFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Expenses/FuelingFormPage";

import MaintenanceFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Expenses/MaintenanceFormPage";

import InsuranceFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Expenses/InsuranceFormPage";


// --------------------------------------------------
// DRIVER REPORTS
// --------------------------------------------------

import DriverReportsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Reports/DriverReportsPage";

import DriverReportFormPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Reports/DriverReportFormPage";

import DriverReportDetailsPage
  from "./pages/SMS/HeadteacherPages/TransportManagement/Reports/DriverReportDetailsPage";


// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {

  const location = useLocation();

  // Portfolio has its own standalone layout.
  const hideLayout =
    location.pathname === "/portfolio";


  return (
    <div className="font-sans">

      {!hideLayout && <Navbar />}


      <Routes>


        {/* ==================================================
            PUBLIC WEBSITE
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/gallery"
          element={<Gallery />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/enroll"
          element={<Enroll />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/facilities/:slug"
          element={<FacilityPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/portfolio"
          element={<PortfolioPage />}
        />


        {/* ==================================================
            WEBSITE ADMIN
        ================================================== */}

        <Route
          path="/WebsiteAdminPanel"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <EventsPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <GalleryPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <FacilitiesPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/team"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <AdminTeamManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/aboutUs"
          element={
            <ProtectedRoute
              allowedRoles={["Website Admin"]}
            >
              <AdminAboutUs />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            HEAD TEACHER DASHBOARD
        ================================================== */}

        <Route
          path="/headteacher/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            STUDENT & FAMILY MANAGEMENT
        ================================================== */}

        {/* --------------------------------------------------
            Student Management Dashboard
        -------------------------------------------------- */}

        <Route
          path="/student-management"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentsDashboard />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Students
        -------------------------------------------------- */}

        <Route
          path="/sms/students"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/students/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/students/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EditStudentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/students/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Families
        -------------------------------------------------- */}

        <Route
          path="/sms/families"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FamiliesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/families/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FamilyDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/families/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FamilyFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/families/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FamilyFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Parents & Guardians
        -------------------------------------------------- */}

        <Route
          path="/sms/parents"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ParentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/parents/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ParentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/parents/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ParentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/parents/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ParentDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            StudentParent Relationships
        -------------------------------------------------- */}

        <Route
          path="/sms/student-parents"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentParentRelationshipsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/student-parents/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentParentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/student-parents/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentParentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/student-parents/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentParentDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Enrollments
        -------------------------------------------------- */}

        <Route
          path="/sms/enrollments"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EnrollmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/enrollments/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EnrollmentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/enrollments/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EnrollmentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/enrollments/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EnrollmentDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Progression
        -------------------------------------------------- */}

        <Route
          path="/sms/progression"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentProgressionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/progression/batch"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <BatchProgressionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/progression/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ProgressionFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/progression/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ProgressionDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/progression/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ProgressionFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Emergency Contacts
        -------------------------------------------------- */}

        <Route
          path="/sms/emergency-contacts"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EmergencyContactsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/emergency-contacts/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EmergencyContactFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/emergency-contacts/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EmergencyContactFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/emergency-contacts/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <EmergencyContactDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Student Documents
        -------------------------------------------------- */}

        <Route
          path="/sms/documents"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentDocumentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/documents/upload"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentDocumentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sms/documents/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StudentDocumentFormPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            ACADEMICS MANAGEMENT
        ================================================== */}

        <Route
          path="/academics"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicsDashboard />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Academic Years
        -------------------------------------------------- */}

        <Route
          path="/academics/years"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicYearsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/years/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicYearFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/years/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicYearDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/years/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicYearFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Academic Terms
        -------------------------------------------------- */}

        <Route
          path="/academics/terms"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicTermsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/terms/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicTermFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/terms/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicTermDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/terms/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicTermFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Academic Calendar
        -------------------------------------------------- */}

        <Route
          path="/academics/calendar"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicCalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/calendar/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <CalendarEventFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/calendar/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <CalendarEventDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/calendar/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <CalendarEventFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Class Levels
        -------------------------------------------------- */}

        <Route
          path="/academics/classes"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ClassLevelsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/classes/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ClassLevelFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/classes/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ClassLevelDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/classes/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ClassLevelFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Academic Streams
        -------------------------------------------------- */}

        <Route
          path="/academics/streams"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicStreamsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/streams/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicStreamFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/streams/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicStreamDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academics/streams/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AcademicStreamFormPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            TEACHER MANAGEMENT
        ================================================== */}

        <Route
          path="/teachers/create"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <CreateTeacher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/management"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ManageTeachers />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            STAFF MANAGEMENT
        ================================================== */}

        {/* --------------------------------------------------
            Staff Dashboard
        -------------------------------------------------- */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffDashboard />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Staff Members
        -------------------------------------------------- */}

        <Route
          path="/staff/members"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/members/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/members/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/members/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Staff Roles
        -------------------------------------------------- */}

        <Route
          path="/staff/roles"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRolesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/roles/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/roles/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/roles/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            Staff Role Assignments
        -------------------------------------------------- */}

        <Route
          path="/staff/role-assignments"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleAssignmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/role-assignments/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleAssignmentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/role-assignments/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleAssignmentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/role-assignments/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StaffRoleAssignmentFormPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            TRANSPORT MANAGEMENT
        ================================================== */}

        {/* --------------------------------------------------
            Transport Dashboard
        -------------------------------------------------- */}

        <Route
          path="/transport"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransportDashboard />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            DRIVERS
        -------------------------------------------------- */}

        {/* Drivers List */}

        <Route
          path="/transport/drivers"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriversListPage />
            </ProtectedRoute>
          }
        />

        {/* Add Driver */}

        <Route
          path="/transport/drivers/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverFormPage />
            </ProtectedRoute>
          }
        />

        {/* Driver Details */}

        <Route
          path="/transport/drivers/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Driver */}

        <Route
          path="/transport/drivers/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            VEHICLES
        -------------------------------------------------- */}

        {/* Vehicles List */}

        <Route
          path="/transport/vehicles"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <VehiclesPage />
            </ProtectedRoute>
          }
        />

        {/* Add Vehicle */}

        <Route
          path="/transport/vehicles/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <VehicleFormPage />
            </ProtectedRoute>
          }
        />

        {/* Vehicle Details */}

        <Route
          path="/transport/vehicles/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <VehicleDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Vehicle */}

        <Route
          path="/transport/vehicles/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <VehicleFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            TRANSPORT ROUTES
        -------------------------------------------------- */}

        {/* Routes List */}

        <Route
          path="/transport/routes"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <RoutesPage />
            </ProtectedRoute>
          }
        />

        {/* Add Route */}

        <Route
          path="/transport/routes/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <RouteFormPage />
            </ProtectedRoute>
          }
        />

        {/* Route Details */}

        <Route
          path="/transport/routes/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <RouteDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Route */}

        <Route
          path="/transport/routes/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <RouteFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            ROUTE STAGES
        -------------------------------------------------- */}

        {/* Add Stage */}

        <Route
          path="/transport/routes/:id/stages/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StageFormPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Stage */}

        <Route
          path="/transport/routes/:id/stages/:stageId/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StageFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            STUDENT TRANSPORT ASSIGNMENTS
        -------------------------------------------------- */}

        {/* Assignments List */}

        <Route
          path="/transport/assignments"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransportAssignmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Add Assignment */}

        <Route
          path="/transport/assignments/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransportAssignmentFormPage />
            </ProtectedRoute>
          }
        />

        {/* Assignment Details */}

        <Route
          path="/transport/assignments/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransportAssignmentDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Assignment */}

        <Route
          path="/transport/assignments/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransportAssignmentFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            VEHICLE EXPENSES
        -------------------------------------------------- */}

        {/* Expenses Dashboard */}

        <Route
          path="/transport/expenses"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <VehicleExpensesPage />
            </ProtectedRoute>
          }
        />

        {/* Fueling */}

        <Route
          path="/transport/expenses/fueling/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FuelingFormPage />
            </ProtectedRoute>
          }
        />

        {/* Fueling Edit */}

        <Route
          path="/transport/expenses/fueling/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <FuelingFormPage />
            </ProtectedRoute>
          }
        />


        {/* Maintenance */}

        <Route
          path="/transport/expenses/maintenance/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <MaintenanceFormPage />
            </ProtectedRoute>
          }
        />

        {/* Maintenance Edit */}

        <Route
          path="/transport/expenses/maintenance/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <MaintenanceFormPage />
            </ProtectedRoute>
          }
        />


        {/* Insurance */}

        <Route
          path="/transport/expenses/insurance/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InsuranceFormPage />
            </ProtectedRoute>
          }
        />

        {/* Insurance Edit */}

        <Route
          path="/transport/expenses/insurance/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InsuranceFormPage />
            </ProtectedRoute>
          }
        />


        {/* --------------------------------------------------
            DRIVER REPORTS
        -------------------------------------------------- */}

        {/* Reports List */}

        <Route
          path="/transport/reports"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Add Report */}

        <Route
          path="/transport/reports/new"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverReportFormPage />
            </ProtectedRoute>
          }
        />

        {/* Report Details */}

        <Route
          path="/transport/reports/:id"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverReportDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Report */}

        <Route
          path="/transport/reports/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DriverReportFormPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            FEES
        ================================================== */}

        <Route
          path="/fees/GradeFeeStructure"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <GradeFeeStructurePage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            OLD STANDALONE STREAMS
        ================================================== */}

        <Route
          path="/streams"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StreamsPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            DEPARTMENT MANAGEMENT
        ================================================== */}

        <Route
          path="/departments"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/create"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DepartmentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <DepartmentFormPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            RECEIPTS
        ================================================== */}

        <Route
          path="/receipts"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/summary"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptSummaryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId/edit"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId/items"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <ReceiptItemsPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            INVENTORY MANAGEMENT
        ================================================== */}

        <Route
          path="/inventory"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stores"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <StoresPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/locations"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InventoryLocationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/items"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InventoryItemsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stock"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InventoryStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stock/add"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AddStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stock/remove"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <RemoveStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stock/transfer"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <TransferStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/stock/adjust"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <AdjustStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/transactions"
          element={
            <ProtectedRoute
              allowedRoles={["Head Teacher"]}
            >
              <InventoryTransactionsPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>


      {!hideLayout && <Footer />}

    </div>
  );
}


// ============================================================
// APP
// ============================================================

export default function App() {

  return (
    <Router>

      <AuthProvider>

        <AppContent />

      </AuthProvider>

    </Router>
  );
}
