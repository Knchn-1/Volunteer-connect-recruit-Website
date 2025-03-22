import React from "react";
import { VolunteerNavbar } from "@/components/volunteer-navbar";
import { HeroSection } from "@/components/hero-section";
import { CausesSection } from "@/components/causes-section";
import { WhyVolunteerSection } from "@/components/why-volunteer-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function VolunteerHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <VolunteerNavbar />
      <HeroSection />
      <CausesSection />
      <WhyVolunteerSection />
      <CTASection />
      <Footer />
    </div>
  );
}
