import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function CTASection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <section className="py-16 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Volunteer Journey?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">Join thousands of volunteers making a difference. Create your profile and start applying to opportunities today.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {!user ? (
            <Button
              onClick={() => setLocation("/auth")}
              className="bg-white text-primary hover:bg-neutral-200 font-semibold py-3 px-8"
            >
              Create Account
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/volunteer/profile")}
              className="bg-white text-primary hover:bg-neutral-200 font-semibold py-3 px-8"
            >
              View Profile
            </Button>
          )}
          <Button
            onClick={() => setLocation("/volunteer/search")}
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-3 px-8"
          >
            Browse Opportunities
          </Button>
        </div>
      </div>
    </section>
  );
}
