import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline";
import SchoolLogo from "../../assets/images/SchoolLogo.jpeg";
import axiosInstance from "../../utils/axiosInstance";

// Dashboard mapping
const DASHBOARD_PATHS = {
  "Master Admin": "/WebsiteAdminPanel",
  "Website Admin": "/WebsiteAdminPanel",
  "Head Teacher": "/headteacher/dashboard",
  Teacher: "/teacher-dashboard",
  Student: "/student-dashboard",
  Parent: "/parent-dashboard",
  Accountant: "/accountant-dashboard",
  default: "/",
};

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [facilitiesDropdown, setFacilitiesDropdown] = useState(false);
  const [mobileFacilitiesOpen, setMobileFacilitiesOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);

  const [facilities, setFacilities] = useState([]);

  const dropdownRef = useRef(null);
  const facilitiesRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath = user
    ? DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default
    : "/login";

  // Fetch facilities
  useEffect(() => {
    axiosInstance
      .get("/facilities/")
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error("Failed loading facilities:", err));
  }, []);

  // Group facilities by category
  const grouped = facilities.reduce((acc, f) => {
    const category = f.category || "Others";
    if (!acc[category]) acc[category] = [];
    acc[category].push(f);
    return acc;
  }, {});

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (facilitiesRef.current && !facilitiesRef.current.contains(e.target)) {
        setFacilitiesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLinkClick = () => {
    setDropdownOpen(false);
    setFacilitiesDropdown(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* NAVBAR HEADER */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 md:px-8 py-4 shadow-md bg-purple-700 z-50">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 z-50">
          <img
            src={SchoolLogo}
            alt="Peppercorn Premier Schools Logo"
            className="h-12 w-12 object-contain rounded-lg bg-white p-1"
          />
          <span className="text-2xl font-bold text-white">
            Peppercorn Premier Schools Ltd
          </span>
        </Link>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-7 w-7" />
            ) : (
              <MenuIcon className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex space-x-6 text-white font-medium items-center">
          <Link to="/" className="hover:text-blue-300" onClick={handleLinkClick}>
            Home
          </Link>
          <Link
            to="/about"
            className="hover:text-blue-300"
            onClick={handleLinkClick}
          >
            About
          </Link>

          {/* SCHOOL LIFE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:text-blue-300 flex items-center"
            >
              School Life <span className="ml-1 text-xs">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-md border z-10">
                <Link
                  to="/gallery"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  onClick={handleLinkClick}
                >
                  Gallery
                </Link>
                <Link
                  to="/photo-tour"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  onClick={handleLinkClick}
                >
                  Photo Tour
                </Link>
              </div>
            )}
          </div>

          {/* *** FACILITIES DROPDOWN (NEW) *** */}
          <div className="relative" ref={facilitiesRef}>
            <button
              onClick={() => setFacilitiesDropdown(!facilitiesDropdown)}
              className="hover:text-blue-300 flex items-center"
            >
              Facilities <span className="ml-1 text-xs">▼</span>
            </button>

            {facilitiesDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-md border z-10 p-2">
                {Object.keys(grouped).map((category) => (
                  <div key={category} className="border-b last:border-none pb-2">
                    <button
                      onClick={() =>
                        setOpenCategory(
                          openCategory === category ? null : category
                        )
                      }
                      className="w-full text-left px-2 py-2 text-gray-800 hover:bg-gray-100 flex justify-between"
                    >
                      {category}
                      <span>{openCategory === category ? "▲" : "▼"}</span>
                    </button>

                    {/* Facilities under each category */}
                    {openCategory === category && (
                      <div className="pl-4">
                        {grouped[category].map((facility) => (
                          <Link
                            key={facility.slug}
                            to={`/facilities/${facility.slug}`}
                            onClick={handleLinkClick}
                            className="block px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                          >
                            {facility.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/events"
            className="hover:text-blue-300"
            onClick={handleLinkClick}
          >
            Events
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-300"
            onClick={handleLinkClick}
          >
            Contact Us
          </Link>

          {user && (
            <Link
              to={dashboardPath}
              className="text-blue-300 font-bold hover:text-blue-100 flex items-center"
            >
              <UserCircleIcon className="h-5 w-5 mr-1" /> Dashboard
            </Link>
          )}

          {!user ? (
            <Link
              to="/login"
              className="hover:text-blue-300"
              onClick={handleLinkClick}
            >
              Log In
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-100 font-medium"
            >
              Log Out
            </button>
          )}

          <Link to="/enroll">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700">
              Enroll Now
            </button>
          </Link>
        </nav>
      </header>

      {/* SPACER */}
      <div className="h-20"></div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 w-full h-screen bg-white z-40 pt-24 pb-8 px-8 overflow-y-auto">
          <div className="flex flex-col space-y-4 font-medium">
            <Link to="/" onClick={handleLinkClick} className="text-gray-700 text-lg">
              Home
            </Link>

            <Link
              to="/about"
              onClick={handleLinkClick}
              className="text-gray-700 text-lg"
            >
              About
            </Link>

            {/* MOBILE Facilities Section */}
            <div>
              <button
                className="text-gray-700 text-lg w-full text-left flex justify-between"
                onClick={() =>
                  setMobileFacilitiesOpen(!mobileFacilitiesOpen)
                }
              >
                Facilities
                <span>{mobileFacilitiesOpen ? "▲" : "▼"}</span>
              </button>

              {mobileFacilitiesOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  {Object.keys(grouped).map((category) => (
                    <div key={category}>
                      <button
                        className="w-full flex justify-between text-gray-600"
                        onClick={() =>
                          setMobileCategoryOpen(
                            mobileCategoryOpen === category ? null : category
                          )
                        }
                      >
                        {category}
                        <span>
                          {mobileCategoryOpen === category ? "▲" : "▼"}
                        </span>
                      </button>

                      {mobileCategoryOpen === category && (
                        <div className="ml-4 mt-1">
                          {grouped[category].map((facility) => (
                            <Link
                              key={facility.slug}
                              to={`/facilities/${facility.slug}`}
                              onClick={handleLinkClick}
                              className="block py-1 text-sm text-gray-500"
                            >
                              {facility.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/events"
              className="text-gray-700 text-lg"
              onClick={handleLinkClick}
            >
              Events
            </Link>

            <Link
              to="/contact"
              className="text-gray-700 text-lg"
              onClick={handleLinkClick}
            >
              Contact Us
            </Link>

            <div className="w-full h-px bg-gray-200"></div>

            {user && (
              <Link
                to={dashboardPath}
                className="text-blue-600 text-lg"
                onClick={handleLinkClick}
              >
                <UserCircleIcon className="h-6 w-6 inline-block mr-2" /> Dashboard
              </Link>
            )}

            {!user ? (
              <Link
                to="/login"
                className="text-gray-700 text-lg"
                onClick={handleLinkClick}
              >
                Log In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-600 text-lg"
              >
                Log Out ({user.role})
              </button>
            )}

            <Link to="/enroll">
              <button className="w-full mt-4 px-4 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 text-lg">
                Enroll Now
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
