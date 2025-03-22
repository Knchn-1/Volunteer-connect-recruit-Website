import React from "react";
import { CauseCard } from "@/components/ui/cause-card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

interface Cause {
  id: string;
  title: string;
  description: string;
  ngosCount: number;
  opportunitiesCount: number;
  imageUrl: string;
}

const causes: Cause[] = [
  {
    id: "education",
    title: "Education",
    description: "Help provide quality education to underprivileged children and adults. Teach, mentor, and support educational initiatives.",
    ngosCount: 120,
    opportunitiesCount: 450,
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "environment",
    title: "Environment",
    description: "Protect our planet through conservation efforts, clean-ups, awareness campaigns, and sustainable initiatives.",
    ngosCount: 85,
    opportunitiesCount: 320,
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description: "Support medical camps, healthcare education, and initiatives providing care to underserved communities.",
    ngosCount: 92,
    opportunitiesCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1571503977079-e92c0a5dea7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
  }
];

export function CausesSection() {
  const [, setLocation] = useLocation();

  const handleCauseClick = (causeId: string) => {
    setLocation(`/volunteer/search?cause=${causeId}`);
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-neutral-700 mb-12">Causes You Can Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {causes.map((cause) => (
          <CauseCard
            key={cause.id}
            title={cause.title}
            description={cause.description}
            ngosCount={cause.ngosCount}
            opportunitiesCount={cause.opportunitiesCount}
            imageUrl={cause.imageUrl}
            onClick={() => handleCauseClick(cause.id)}
          />
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Button 
          onClick={() => setLocation("/volunteer/search")}
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white"
        >
          View All Causes
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </section>
  );
}
