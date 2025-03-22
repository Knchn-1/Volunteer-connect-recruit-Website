import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  imageUrl?: string;
}

export function Testimonial({ quote, name, role, imageUrl }: TestimonialProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="mt-12 bg-white shadow-md">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4 text-neutral-700">Volunteer Testimonial</h3>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-primary-100">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="md:w-3/4 md:pl-8">
            <blockquote className="italic text-neutral-600 mb-4">
              "{quote}"
            </blockquote>
            <p className="font-bold text-neutral-700">- {name}, {role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
