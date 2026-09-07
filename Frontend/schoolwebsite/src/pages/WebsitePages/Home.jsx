import React from "react";
import Hero from "../../components/sections/Hero";
import Facilities from "../../components/ui/Facilities";
import CoreValues from "../../components/ui/CoreValues";
import DirectorMessage from "../../components/sections/DirectorMessage";
import WhyUS from "../../components/ui/WhyUs"


function Home() {
  return (
    <>
      <Hero />
      <CoreValues />
      <DirectorMessage />
      <WhyUS />
      <Facilities />
      
    </>
  );
}

export default Home;
