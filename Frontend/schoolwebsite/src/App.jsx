import React, { useEffect, useState } from "react";
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

import CreateStudent from "./pages/SMS/HeadteacherPages/CreateStudent";
import CreateParent from "./pages/SMS/HeadteacherPages/CreateParent";
import CreateTeacher from "./pages/SMS/HeadteacherPages/CreateTeacher";
import GradeFeeStructurePage from "./pages/SMS/HeadteacherPages/GradeFeeStructurePage";
import TransportRoutesPage from "./pages/SMS/HeadteacherPages/TransportRoutes";
import ManageTeachers from "./pages/SMS/HeadteacherPages/ManageTeachers";
import StreamsPage from "./pages/SMS/HeadteacherPages/StreamsPage";

import ReceiptsPage from "./pages/SMS/HeadteacherPages/ReceiptsPage";
import ReceiptDetailPage from "./pages/SMS/HeadteacherPages/ReceiptDetailPage";
import ReceiptFormPage from "./pages/SMS/HeadteacherPages/ReceiptFormPage";
import ReceiptItemsPage from "./pages/SMS/HeadteacherPages/ReceiptItemsPage";
import ReceiptSummaryPage from "./pages/SMS/HeadteacherPages/ReceiptSummaryPage";

import InventoryDashboard from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryDashboard";
import StoresPage from "./pages/SMS/HeadteacherPages/InventoryManagement/StoresPage";
import InventoryLocationsPage from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryLocationsPage";
import InventoryItemsPage from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryItemsPage";
import InventoryStockPage from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryStockPage";
import AddStockPage from "./pages/SMS/HeadteacherPages/InventoryManagement/AddStockPage";
import RemoveStockPage from "./pages/SMS/HeadteacherPages/InventoryManagement/RemoveStockPage";
import TransferStockPage from "./pages/SMS/HeadteacherPages/InventoryManagement/TransferStockPage";
import AdjustStockPage from "./pages/SMS/HeadteacherPages/InventoryManagement/AdjustStockPage";
import InventoryTransactionsPage from "./pages/SMS/HeadteacherPages/InventoryManagement/InventoryTransactionsPage";

import EventsPanel from "./pages/SMS/WebsiteManagementPages/EventsPanel";
import AdminDashboard from "./pages/SMS/WebsiteManagementPages/AdminDashboard";
import GalleryPanel from "./pages/SMS/WebsiteManagementPages/GalleryPanel";
import FacilitiesPanel from "./pages/SMS/WebsiteManagementPages/AdminFacilities";
import AdminTeamManagement from "./pages/SMS/WebsiteManagementPages/AdminTeamManagement";
import AdminAboutUs from "./pages/SMS/WebsiteManagementPages/AdminAboutUs";

import DepartmentsPage from "./pages/SMS/HeadteacherPages/DepatmentManagement/DepartmentsPage";
import DepartmentFormPage from "./pages/SMS/HeadteacherPages/DepatmentManagement/DepartmentFormPage";

// ==================================================
// ACADEMICS MANAGEMENT
// ==================================================

import AcademicsDashboard from "./pages/SMS/HeadteacherPages/AcademicsManagement/AcademicsDashboard";

// Academic Years
import AcademicYearsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearsPage";
import AcademicYearFormPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearFormPage";
import AcademicYearDetailsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/years/AcademicYearDetailsPage";

// Academic Terms
import AcademicTermsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermsPage";
import AcademicTermFormPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermFormPage";
import AcademicTermDetailsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/terms/AcademicTermDetailsPage";

// Academic Calendar
import AcademicCalendarPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/AcademicCalendarPage";
import CalendarEventFormPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/CalendarEventFormPage";
import CalendarEventDetailsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/calendar/CalendarEventDetailsPage";

// Class Levels
import ClassLevelsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelsPage";
import ClassLevelFormPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelFormPage";
import ClassLevelDetailsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/classes/ClassLevelDetailsPage";

// Streams
// IMPORTANT:
// These files are directly inside AcademicsManagement,
// NOT inside AcademicsManagement/streams/
import AcademicStreamsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamsPage";
import AcademicStreamFormPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamFormPage";
import AcademicStreamDetailsPage from "./pages/SMS/HeadteacherPages/AcademicsManagement/streams/StreamDetailsPage";

import axiosInstance from "./utils/axiosInstance";

// --------------------------------------------------
// APP CONTENT
// --------------------------------------------------

function AppContent() {
  const location = useLocation();

  // Hide the public Navbar/Footer only on the portfolio page.
  const hideLayout = location.pathname === "/portfolio";

  return (
    <div className="font-sans">
      {!hideLayout && <Navbar />}

      <Routes>
        {/* ==================================================
            PUBLIC WEBSITE ROUTES
        ================================================== */}

        {/* HOME */}
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/gallery" element={<Gallery />} />

        <Route path="/events" element={<Events />} />

        <Route path="/enroll" element={<Enroll />} />

        <Route path="/contact" element={<Contact />} />

        <Route
          path="/facilities/:slug"
          element={<FacilityPage />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PORTFOLIO */}
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
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <EventsPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <GalleryPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <FacilitiesPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/team"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <AdminTeamManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/aboutUs"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
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
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ACADEMICS MANAGEMENT
        ================================================== */}

        {/* Academics Dashboard */}
        <Route
          path="/academics"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicsDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ACADEMIC YEARS
        ================================================== */}

        {/* Academic Years List */}
        <Route
          path="/academics/years"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicYearsPage />
            </ProtectedRoute>
          }
        />

        {/* Create Academic Year */}
        <Route
          path="/academics/years/new"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicYearFormPage />
            </ProtectedRoute>
          }
        />

        {/* Academic Year Details */}
        <Route
          path="/academics/years/:id"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicYearDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Academic Year */}
        <Route
          path="/academics/years/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicYearFormPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ACADEMIC TERMS
        ================================================== */}

        {/* Academic Terms List */}
        <Route
          path="/academics/terms"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicTermsPage />
            </ProtectedRoute>
          }
        />

        {/* Create Academic Term */}
        <Route
          path="/academics/terms/new"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicTermFormPage />
            </ProtectedRoute>
          }
        />

        {/* Academic Term Details */}
        <Route
          path="/academics/terms/:id"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicTermDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Academic Term */}
        <Route
          path="/academics/terms/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicTermFormPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ACADEMIC CALENDAR
        ================================================== */}

        {/* Academic Calendar */}
        <Route
          path="/academics/calendar"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicCalendarPage />
            </ProtectedRoute>
          }
        />

        {/* Create Calendar Event */}
        <Route
          path="/academics/calendar/new"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CalendarEventFormPage />
            </ProtectedRoute>
          }
        />

        {/* Calendar Event Details */}
        <Route
          path="/academics/calendar/:id"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CalendarEventDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Calendar Event */}
        <Route
          path="/academics/calendar/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CalendarEventFormPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            CLASS LEVELS / GRADES
        ================================================== */}

        {/* Class Levels */}
        <Route
          path="/academics/classes"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ClassLevelsPage />
            </ProtectedRoute>
          }
        />

        {/* Create Class Level */}
        <Route
          path="/academics/classes/new"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ClassLevelFormPage />
            </ProtectedRoute>
          }
        />

        {/* Class Level Details */}
        <Route
          path="/academics/classes/:id"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ClassLevelDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Class Level */}
        <Route
          path="/academics/classes/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ClassLevelFormPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            STREAMS
        ================================================== */}

        {/* Streams */}
        <Route
          path="/academics/streams"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicStreamsPage />
            </ProtectedRoute>
          }
        />

        {/* Create Stream */}
        <Route
          path="/academics/streams/new"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicStreamFormPage />
            </ProtectedRoute>
          }
        />

        {/* Stream Details */}
        <Route
          path="/academics/streams/:id"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicStreamDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Stream */}
        <Route
          path="/academics/streams/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AcademicStreamFormPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            SCHOOL MANAGEMENT SYSTEM
        ================================================== */}

        {/* Students */}
        <Route
          path="/students/create"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CreateStudent />
            </ProtectedRoute>
          }
        />

        {/* Parents */}
        <Route
          path="/parents/create"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CreateParent />
            </ProtectedRoute>
          }
        />

        {/* Teachers */}
        <Route
          path="/teachers/create"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <CreateTeacher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/management"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            FEES
        ================================================== */}

        <Route
          path="/fees/GradeFeeStructure"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <GradeFeeStructurePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees/transport/routes"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <TransportRoutesPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OLD STREAMS ROUTE
        ================================================== */}

        {/* 
          This is the old standalone Streams page.
          Keep it temporarily if other parts of the application
          still use /streams.
        */}
        <Route
          path="/streams"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
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
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/create"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <DepartmentFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
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
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/add"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/summary"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptSummaryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId/edit"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts/:receiptId/items"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <ReceiptItemsPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            INVENTORY MANAGEMENT
        ================================================== */}

        {/* Inventory Dashboard */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />

        {/* Stores */}
        <Route
          path="/inventory/stores"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <StoresPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Locations */}
        <Route
          path="/inventory/locations"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <InventoryLocationsPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Items */}
        <Route
          path="/inventory/items"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <InventoryItemsPage />
            </ProtectedRoute>
          }
        />

        {/* Current Stock */}
        <Route
          path="/inventory/stock"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <InventoryStockPage />
            </ProtectedRoute>
          }
        />

        {/* Add Stock */}
        <Route
          path="/inventory/stock/add"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AddStockPage />
            </ProtectedRoute>
          }
        />

        {/* Remove Stock */}
        <Route
          path="/inventory/stock/remove"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <RemoveStockPage />
            </ProtectedRoute>
          }
        />

        {/* Transfer Stock */}
        <Route
          path="/inventory/stock/transfer"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <TransferStockPage />
            </ProtectedRoute>
          }
        />

        {/* Adjust Stock */}
        <Route
          path="/inventory/stock/adjust"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <AdjustStockPage />
            </ProtectedRoute>
          }
        />

        {/* Transactions */}
        <Route
          path="/inventory/transactions"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <InventoryTransactionsPage />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

// --------------------------------------------------
// APP
// --------------------------------------------------

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Backend connection error:", err);
      });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}