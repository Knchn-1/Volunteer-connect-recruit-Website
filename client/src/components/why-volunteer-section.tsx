import React from "react";
import { Testimonial } from "@/components/ui/testimonial";
import { 
  PuzzleIcon, 
  Users, 
  Heart 
} from "lucide-react";

export function WhyVolunteerSection() {
  return (
    <section className="py-16 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-neutral-700 mb-12">Why Volunteer?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 inline-flex p-3 rounded-full mb-4">
              <PuzzleIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-700">Develop New Skills</h3>
            <p className="text-neutral-600">Gain valuable experience and build skills that can enhance your career prospects while making a difference.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 inline-flex p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-700">Connect With Others</h3>
            <p className="text-neutral-600">Meet like-minded individuals, build your network, and form meaningful relationships with people who share your values.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-primary-100 inline-flex p-3 rounded-full mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-700">Make a Real Impact</h3>
            <p className="text-neutral-600">Be part of the solution and see firsthand how your contributions make a tangible difference in communities.</p>
          </div>
        </div>
        
        <Testimonial
          quote="Volunteering with the literacy program has been the most rewarding experience of my life. I've helped dozens of adults learn to read, and watching their confidence grow has been incredible. The skills I've gained in communication and teaching have even helped me in my professional career."
          name="Sarah J."
          role="Environmental Education Volunteer"
          imageUrl="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
        />
      </div>
    </section>
  );
}
