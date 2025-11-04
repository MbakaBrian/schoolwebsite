import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route ,useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/sections/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Enroll from "./pages/Enroll";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import axios from "axios";
import EventsPanel from "./pages/EventsPanel";
import AdminDashboard from "./pages/AdminDashboard";
import GalleryPanel from "./pages/GalleryPanel";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./pages/SMS/Dashboard";
import CreateStudent from "./pages/SMS/CreateStudent";
import CreateParent from "./pages/SMS/CreateParent";
import CreateTeacher from "./pages/SMS/CreateTeacher";
import GradeFeeStructurePage from "./pages/SMS/GradeFeeStructurePage";
import TransportRoutesPage from "./pages/SMS/TransportRoutes";
import ManageTeachers from "./pages/SMS/ManageTeachers";
import StreamsPage from "./pages/SMS/StreamsPage";
import FacilitiesPanel from "./pages/AdminFacilities";
import axiosInstance from "./utils/axiosInstance";
import AdminTeamManagement from "./pages/AdminTeamManagement";
import FacilityPage from "./pages/FacilityPage";
import AdminAboutUs from "./pages/AdminAboutUs";
import PortfolioPage from "./pages/PortfolioPage";


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
          path="/HeadTeacherDashboard"
          element={
            <ProtectedRoute allowedRoles={["Head Teacher"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

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
