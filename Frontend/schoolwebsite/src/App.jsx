import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route ,useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/sections/Footer";
import Home from "./pages/WebsitePages/Home";
import About from "./pages/WebsitePages/About";
import Gallery from "./pages/WebsitePages/Gallery";
import Events from "./pages/WebsitePages/Events";
import Enroll from "./pages/WebsitePages/Enroll";
import Contact from "./pages/WebsitePages/Contact";
import Login from "./pages/WebsitePages/Login";
import axios from "axios";
import EventsPanel from "./pages/SMS/WebsiteManagementPages/EventsPanel";
import AdminDashboard from "./pages/SMS/WebsiteManagementPages/AdminDashboard";
import GalleryPanel from "./pages/SMS/WebsiteManagementPages/GalleryPanel";
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
import FacilitiesPanel from "./pages/SMS/WebsiteManagementPages/AdminFacilities";
import axiosInstance from "./utils/axiosInstance";
import AdminTeamManagement from "./pages/SMS/WebsiteManagementPages/AdminTeamManagement";
import FacilityPage from "./pages/WebsitePages/FacilityPage";
import AdminAboutUs from "./pages/SMS/WebsiteManagementPages/AdminAboutUs";
import PortfolioPage from "./pages/PortfolioPage";


import ReceiptsPage from "./pages/SMS/HeadteacherPages/ReceiptsPage";
import ReceiptDetailPage from "./pages/SMS/HeadteacherPages/ReceiptDetailPage";
import ReceiptFormPage from "./pages/SMS/HeadteacherPages/ReceiptFormPage";
import ReceiptItemsPage from "./pages/SMS/HeadteacherPages/ReceiptItemsPage";
import ReceiptSummaryPage from "./pages/SMS/HeadteacherPages/ReceiptSummaryPage";

// inside your <Routes>:



function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === "/portfolio"; // 👈 hide Navbar + Footer on this route

  return (
    <div className="font-sans">
      {!hideLayout && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/facilities/:slug" element={<FacilityPage />} />
        <Route path="/login" element={<Login />} />

        {/* Portfolio Route (No Navbar/Footer) */}
        <Route path="/portfolio" element={<PortfolioPage />} />

        {/* Protected Routes */}
        <Route
          path="/WebsiteAdminPanel"
          element={
            <ProtectedRoute allowedRoles={["Website Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/headteacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

        {/* Receipts Routes */}
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/receipts/add" element={<ReceiptFormPage />} />
        <Route path="/receipts/summary" element={<ReceiptSummaryPage />} />
        <Route path="/receipts/:receiptId" element={<ReceiptDetailPage />} />
        <Route path="/receipts/:receiptId/edit" element={<ReceiptFormPage />} />
        <Route path="/receipts/:receiptId/items" element={<ReceiptItemsPage />} />

        {/* Admin Pages */}
        <Route path="/admin/events" element={<EventsPanel />} />
        <Route path="/admin/gallery" element={<GalleryPanel />} />
        <Route path="/admin/facilities" element={<FacilitiesPanel />} />
        <Route path="/admin/team" element={<AdminTeamManagement />} />
        <Route path="/admin/aboutUs" element={<AdminAboutUs />} />

        {/* School Management System */}
        <Route path="/headteacher/dashboard" element={<DashboardLayout />} />
        <Route path="/students/create" element={<CreateStudent />} />
        <Route path="/parents/create" element={<CreateParent />} />
        <Route path="/teachers/create" element={<CreateTeacher />} />
        <Route path="/fees/GradeFeeStructure" element={<GradeFeeStructurePage />} />
        <Route path="/fees/transport/routes" element={<TransportRoutesPage />} />
        <Route path="/teachers/management" element={<ManageTeachers />} />
        <Route path="/streams" element={<StreamsPage />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
    const [message, setMessage] = useState("");

  useEffect(() => {
      axiosInstance
      .get("/")
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);
  return (
    <Router>
      {/* ✅ Wrap the entire app with AuthProvider */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
