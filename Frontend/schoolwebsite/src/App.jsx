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

        {/* HOME - DEFAULT LANDING PAGE */}
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/gallery" element={<Gallery />} />

        <Route path="/events" element={<Events />} />

        <Route path="/enroll" element={<Enroll />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/facilities/:slug" element={<FacilityPage />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PORTFOLIO */}
        <Route path="/portfolio" element={<PortfolioPage />} />

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

        {/* Fees */}
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

        {/* Streams */}
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

        {/* Any unknown frontend URL goes back to the Home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
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