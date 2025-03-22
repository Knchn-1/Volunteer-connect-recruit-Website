import React from "react";
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-primary flex flex-col justify-center items-center p-8 min-h-[50vh] md:min-h-screen text-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">I'm a Volunteer</h1>
          <p className="mb-6">Find meaningful opportunities to make a difference and contribute your skills to causes you care about.</p>
          <button 
            onClick={() => setLocation("/volunteer")}
            className="bg-white text-primary font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-neutral-200 transition duration-300"
          >
            Continue as Volunteer
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-secondary flex flex-col justify-center items-center p-8 min-h-[50vh] md:min-h-screen text-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">I'm a Recruiter</h1>
          <p className="mb-6">Find passionate volunteers for your cause and manage your recruitment process efficiently.</p>
          <button 
            onClick={() => setLocation("/recruiter")}
            className="bg-white text-secondary font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-neutral-200 transition duration-300"
          >
            Continue as Recruiter
          </button>
        </div>
      </div>
      
      <div className="absolute top-4 left-4">
        <h1 className="text-2xl font-bold text-white">VolunteerConnect</h1>
      </div>
    </div>
  );
}
