import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <div className="bg-primary text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Make a Difference Today</h1>
          <p className="text-lg mb-6">Join thousands of volunteers who are changing lives and communities around the world.</p>
          <Button 
            onClick={() => setLocation("/volunteer/search")}
            className="bg-white text-primary hover:bg-neutral-200 font-semibold py-3 px-6"
          >
            Find Opportunities
          </Button>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <img 
            src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
            alt="Volunteers working together" 
            className="rounded-lg shadow-lg"
            width="600"
            height="400"
          />
        </div>
      </div>
    </div>
  );
}
