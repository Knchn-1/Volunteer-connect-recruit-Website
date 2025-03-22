import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CauseCardProps {
  title: string;
  description: string;
  ngosCount: number;
  opportunitiesCount: number;
  imageUrl: string;
  onClick?: () => void;
}

export function CauseCard({
  title,
  description,
  ngosCount,
  opportunitiesCount,
  imageUrl,
  onClick,
}: CauseCardProps) {
  return (
    <Card 
      className="overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-48 relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 text-neutral-700">{title}</h3>
        <p className="text-neutral-600 mb-4">{description}</p>
        <div className="flex items-center text-sm text-neutral-500">
          <span className="mr-4"><strong>{ngosCount}</strong> NGOs</span>
          <span><strong>{opportunitiesCount}+</strong> Opportunities</span>
        </div>
      </CardContent>
    </Card>
  );
}
