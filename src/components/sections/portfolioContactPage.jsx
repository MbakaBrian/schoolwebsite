import React from "react";
import { FaEnvelope, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">Get In Touch</h1>

      <p className="text-gray-600 text-center max-w-2xl mb-12">
        Feel free to reach out to me for collaborations, project discussions, 
        or just to say hello 👋. I'm always open to connecting!
      </p>

      <div className="flex flex-wrap justify-center gap-10 text-4xl text-gray-700">
        {/* Email */}
        <a
          href="mailto:brianmbakanc@gmail.com"
          className="flex flex-col items-center gap-2 hover:text-blue-500 transition"
        >
          <FaEnvelope />
          <span className="text-base font-medium">Email</span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/254759707466"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 hover:text-green-500 transition"
        >
          <FaWhatsapp />
          <span className="text-base font-medium">WhatsApp</span>
        </a>

        {/* Phone */}
        <a
          href="tel:+254759707466"
          className="flex flex-col items-center gap-2 hover:text-indigo-500 transition"
        >
          <FaPhoneAlt />
          <span className="text-base font-medium">Call</span>
        </a>
      </div>
    </div>
  );
}
