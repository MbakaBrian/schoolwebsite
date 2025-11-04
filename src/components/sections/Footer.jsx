import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaGlobe,
  FaPhoneAlt,
  FaEnvelope,
  FaTiktok,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-purple-800 text-white py-12 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10 text-sm">
        {/* Find Us Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Find us</h3>
          <p className="mb-3 leading-relaxed">
            Naivasha, Peppercorn Area next to Peppercorn Holiday Resort.
          </p>
          <p className="flex items-center gap-2 mb-2">
            <FaPhoneAlt /> 0765-655382 / 0717-655382
          </p>
          <p className="flex items-center gap-2">
            <FaEnvelope /> info@peppercornpremierschools.sc.ke
          </p>
        </div>

        {/* Schools Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Schools</h3>
          <ul className="space-y-2">
            <li><Link to="/facilities/kindergarten" className="hover:underline">Kindergarten</Link></li>
            <li><Link to="/facilities/lower-primary" className="hover:underline">Lower Primary</Link></li>
            <li><Link to="/facilities/upper-primary" className="hover:underline">Upper Primary</Link></li>
            <li><Link to="/facilities/junior-secondary-school" className="hover:underline">Junior Secondary</Link></li>
            <li><Link to="/facilities/boarding" className="hover:underline">Boarding</Link></li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Quick links</h3>
          <ul className="space-y-2">
            <li><Link to="/contact" className="hover:underline">Find Us</Link></li>
            <li><Link to="/application-forms" className="hover:underline">Application Forms</Link></li>
            <li><Link to="/transport-routes" className="hover:underline">Transport Routes</Link></li>
            <li><Link to="/term-dates" className="hover:underline">Term Dates</Link></li>
            <li><Link to="/curriculum" className="hover:underline">Curriculum & Uniform</Link></li>
          </ul>
        </div>

        {/* Media Links Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Media Links</h3>
          <ul className="space-y-2">
            <li><Link to="/events" className="hover:underline">Events</Link></li>
            <li><Link to="/news" className="hover:underline">Latest News</Link></li>
            <li><Link to="/magazine" className="hover:underline">School Magazine</Link></li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Follow us</h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://www.facebook.com/PEPPERCORNPREMIER/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaFacebookF /> Facebook
              </a>
            </li>
            <li>
              <a 
                href="https://www.instagram.com/peppercornpremier" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://wa.me/254717655382" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaWhatsapp /> WhatsApp
              </a>
            </li>
            <li>
              <a 
                href="https://www.tiktok.com/@peppercornpremier" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaTiktok /> TikTok
              </a>
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/company/bran-den-junior-school/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaLinkedinIn /> LinkedIn
              </a>
            </li>
            <li>
              <a 
                href="https://www.peppercornpremierschools.sc.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FaGlobe /> Website
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-600 pt-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© 2025 Peppercorn Premier Schools. All Rights Reserved.</p>
        <div className="flex space-x-4 mt-3 md:mt-0">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/tour" className="hover:underline">Tour</Link>
          <Link to="/facilities" className="hover:underline">Facilities</Link>
          <Link to="/events" className="hover:underline">Events</Link>
          <Link to="/enroll" className="hover:underline">Enroll Now</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;