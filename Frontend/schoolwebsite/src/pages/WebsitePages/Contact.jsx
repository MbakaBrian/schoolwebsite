import React from "react";

function Contact() {
  return (
    <div className="px-8 py-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
        Contact Us
      </h2>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Information */}
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Get in Touch</h3>

          <div>
            <p className="font-medium text-gray-900">📞 Office Contacts</p>
            <p className="text-gray-700">+254 717 655 382</p>
            <p className="text-gray-700">+254 765 655 382</p>
          </div>

          <div>
            <p className="font-medium text-gray-900">✉️ Email</p>
            <p className="text-gray-700">info@peppercornpremierschools.sc.ke</p>
            {/* <p className="text-gray-700">admissions@peppercornpremierschools.ac.ke</p> */}
          </div>

          <div>
            <p className="font-medium text-gray-900">📍 Location</p>
            <p className="text-gray-700">
              Peppercorn Premier School, Naivasha, Kenya
            </p>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <iframe
            title="School Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5642.021577444246!2d36.46969332034201!3d-0.7103171265222877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1829185daf5a5e29%3A0x279ca40394f6de7b!2sPEPPERCORN%20PREMIER%20SCHOOLS%20LTD!5e0!3m2!1sen!2ske!4v1758724570821!5m2!1sen!2ske"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Contact;
