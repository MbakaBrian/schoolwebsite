import React from "react";
import Hero from "../components/sections/Hero";
import Facilities from "../components/ui/Facilities";
import CoreValues from "../components/ui/CoreValues";
import DirectorMessage from "../components/sections/DirectorMessage";


function Home() {
  return (
    <>
      <Hero />
      <CoreValues />
      <DirectorMessage />
      <Facilities />
      
    </>
  );
}

export default Home;
