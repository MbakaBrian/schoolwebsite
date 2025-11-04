import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { MenuIcon, XIcon, UserCircleIcon } from '@heroicons/react/outline'; 
import SchoolLogo from '../../assets/images/SchoolLogo.jpeg';

// ✅ Define the mapping for all roles to their specific dashboard paths
const DASHBOARD_PATHS = {
  "Master Admin": "/WebsiteAdminPanel",
  "Website Admin": "/WebsiteAdminPanel",
  "Head Teacher": "/headteacher/dashboard",
  "Teacher": "/teacher-dashboard",
  "Student": "/student-dashboard",
  "Parent": "/parent-dashboard",
  "Accountant": "/accountant-dashboard",
  "default": "/" 
};

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath = user 
    ? DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default 
    : '/login';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false); 
    navigate("/login");
  };

  const handleLinkClick = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 md:px-8 py-4 shadow-md bg-purple-700 z-50">
        {/* Logo and School Name */}
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

        {/* Hamburger/Close Button for Mobile */}
        <div className="md:hidden z-50">
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-7 w-7" />
            ) : (
              <MenuIcon className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-white font-medium items-center">
          <Link to="/" className="hover:text-blue-300" onClick={handleLinkClick}>Home</Link>
          <Link to="/about" className="hover:text-blue-300" onClick={handleLinkClick}>About</Link>
          
          {/* School Life Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="hover:text-blue-300 flex items-center"
            >
              School Life <span className="ml-1 text-xs">▼</span>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10 border border-gray-100">
                <Link to="/gallery" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={handleLinkClick}>Gallery</Link>
                <Link to="/photo-tour" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={handleLinkClick}>Photo Tour</Link>
              </div>
            )}
          </div>

          <a href="/#facilities" className="hover:text-blue-300" onClick={handleLinkClick}>Facilities</a>
          <Link to="/events" className="hover:text-blue-300" onClick={handleLinkClick}>Events</Link>
          <Link to="/contact" className="hover:text-blue-300" onClick={handleLinkClick}>Contact Us</Link>

          {/* Dashboard Link (Logged In Only) */}
          {user && (
            <Link 
              to={dashboardPath} 
              className="text-blue-300 font-bold hover:text-blue-100 flex items-center"
              onClick={handleLinkClick}
            >
               <UserCircleIcon className="h-5 w-5 mr-1" /> Dashboard
            </Link>
          )}

          {/* Login / Logout button */}
          {!user ? (
            <Link to="/login" className="hover:text-blue-300" onClick={handleLinkClick}>Log In</Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-100 font-medium"
            >
              Log Out
            </button>
          )}
          
          {/* Enroll button */}
          <Link to="/enroll">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition duration-150 ease-in-out">
              Enroll Now
            </button>
          </Link>
        </nav>
      </header>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>

      {/* Mobile Menu (Full Screen Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 w-full h-screen bg-white z-40 pt-24 pb-8 px-8 overflow-y-auto">
          <div className="flex flex-col items-start space-y-4 font-medium">
            <Link to="/" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>About</Link>
            <div className="text-gray-700 text-lg w-full border-t pt-4">School Life</div>
            <Link to="/gallery" className="ml-4 text-gray-600 hover:text-blue-600 w-full py-1" onClick={handleLinkClick}>- Gallery</Link>
            <Link to="/photo-tour" className="ml-4 text-gray-600 hover:text-blue-600 w-full py-1" onClick={handleLinkClick}>- Photo Tour</Link>
            <a href="/#facilities" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>Facilities</a>
            <Link to="/events" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>Events</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>Contact Us</Link>

            <div className="w-full h-px bg-gray-200 my-2"></div>

            {/* Dashboard Link (Mobile) */}
            {user && (
              <Link 
                to={dashboardPath} 
                className="text-blue-600 font-bold text-lg w-full py-2 flex items-center" 
                onClick={handleLinkClick}
              >
                <UserCircleIcon className="h-6 w-6 mr-2" /> Dashboard
              </Link>
            )}

            {/* Login / Logout (Mobile) */}
            {!user ? (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 text-lg w-full py-2" onClick={handleLinkClick}>Log In</Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 text-lg w-full py-2 text-left"
              >
                Log Out ({user.role})
              </button>
            )}

            <Link to="/enroll" className="w-full pt-4">
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 text-lg">
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