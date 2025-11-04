import React from "react";
import directorImage from "../../assets/images/team/DirectorsImage.jpeg"; 

function DirectorMessage() {
  return (
    // We use a different background color (bg-white) to visually separate it from the Hero section (bg-blue-50)
    <section className="grid md:grid-cols-2 items-center px-8 py-16 bg-white shadow-inner">
      
      {/* 1. Image Column (On the Left for MD screens and up) */}
      <div className="flex justify-center mb-8 md:mb-0 md:order-1">
        <img
          src={directorImage}
          alt="Director of Peppercorn Premier School"
          // Class names adjusted for the director image: square and object-cover is usually better for portraits
          className="w-full h-auto max-w-[300px] md:max-w-[80%] rounded-xl shadow-lg object-cover"
        />
      </div>

      {/* 2. Text Column (On the Right for MD screens and up) */}
      <div className="md:order-2 md:pl-12">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4 border-b-4 pb-2 inline-block">
          Director’s Message  
        </h2>
<div className="text-lg text-gray-700 mb-4 italic">

  <p className="mb-4">
    Welcome to Peppercorn Premier Schools Ltd — A Home of Excellence from Early Years to Junior Secondary!
    At PPSL we are more than a school — we are a vibrant learning community where every child’s potential is nurtured with purpose, passion, and pride. From the playful curiosity of our Pre-Schoolers, the growing confidence of our Primary learners, to the bold innovation of our Junior Secondary students, we believe each stage of learning deserves care, creativity, and excellence.
    Our vision is to raise a generation of confident, competent, and compassionate learners — young people who think critically, act responsibly, and lead positively in an ever-changing world.
  </p>
  
  <p className="font-bold mb-2">We achieve this through:</p>
  
  {/* 👇 CRITICAL CHANGE: Use flex container for horizontal display */}
  <ul className="flex flex-col sm:flex-row flex-wrap justify-between gap-4 mb-4 list-none p-0">
    
    {/* Each list item (LI) is now a flex item */}
    <li className="flex items-start">
      <span className="text-xl mr-2">🌟</span> 
      <p className="font-semibold">Quality Teaching</p>
      <span className="text-sm text-gray-500 hidden sm:inline-block ml-1">— delivered by dedicated, caring, and well-trained educators.</span>
    </li>
    
    <li className="flex items-start">
      <span className="text-xl mr-2">🎯</span> 
      <p className="font-semibold">Holistic Development</p>
      <span className="text-sm text-gray-500 hidden sm:inline-block ml-1">— blending academics, talents, technology, and life skills.</span>
    </li>
    
    <li className="flex items-start">
      <span className="text-xl mr-2">🏫</span> 
      <p className="font-semibold">Modern Learning Spaces</p>
      <span className="text-sm text-gray-500 hidden sm:inline-block ml-1">— safe, stimulating, and conducive for exploration and growth.</span>
    </li>
    
    <li className="flex items-start">
      <span className="text-xl mr-2">🤝</span> 
      <p className="font-semibold">Strong School–Parent Partnership</p>
      <span className="text-sm text-gray-500 hidden sm:inline-block ml-1">— because we believe education is a shared journey.</span>
    </li>
  </ul>
  
  <p>
    Every child at Peppercorn Premier Schools is encouraged to dream big, discover their strengths, and develop values that will guide them for life. We take pride in watching our learners progress seamlessly from Pre-School to Junior Secondary — confident, disciplined, and ready to shine anywhere their dreams take them.
    We warmly invite you to join our growing family — where learning is joyful, character is shaped, and greatness begins.
    With warm regards,
  </p>

</div>
        <p className="text-xl font-semibold text-gray-900">
          —Janet Mbaka, School Director
        </p>
      </div>
    </section>
  );
}

export default DirectorMessage;