import React, { useState } from "react";
import { VolunteerNavbar } from "@/components/volunteer-navbar";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Opportunity, NGO } from "@shared/schema";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function VolunteerHome() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  // Fetch opportunities
  const { data: opportunities = [], isLoading: isLoadingOpportunities } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  // Fetch NGOs
  const { data: ngos = [], isLoading: isLoadingNgos } = useQuery<NGO[]>({
    queryKey: ["/api/ngos"],
  });

  // Get active opportunities (not deleted)
  const activeOpportunities = opportunities.filter(opp => !opp.deleted);

  // Filter opportunities based on search term and selected cause
  const filteredOpportunities = activeOpportunities.filter((opportunity) => {
    const matchesSearch = searchTerm === "" || 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause = selectedCause === null || ngos.find(ngo => ngo.id === opportunity.ngoId)?.cause === selectedCause;
    
    return matchesSearch && matchesCause;
  });

  // Get unique causes from NGOs
  const uniqueCauses = Array.from(new Set(ngos.map(ngo => ngo.cause)));

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Flexible";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Find NGO name
  const getNgoName = (ngoId: number) => {
    const ngo = ngos.find(n => n.id === ngoId);
    return ngo ? ngo.name : "Unknown Organization";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <VolunteerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Volunteer Opportunity</h1>
          <p className="text-xl mb-8">Browse through opportunities that match your interests and skills</p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for opportunities..."
              className="pl-10 bg-white text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Filter by Cause</h2>
              <Separator className="mb-4" />
              
              <div className="space-y-2">
                <div 
                  className={`cursor-pointer py-2 px-3 rounded-md ${selectedCause === null ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedCause(null)}
                >
                  All Causes
                </div>
                
                {uniqueCauses.map((cause) => (
                  <div 
                    key={cause} 
                    className={`cursor-pointer py-2 px-3 rounded-md ${selectedCause === cause ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedCause(cause)}
                  >
                    {cause}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Opportunities List */}
          <div className="w-full md:w-3/4">
            <h2 className="text-2xl font-bold mb-6">Available Opportunities</h2>
            
            {isLoadingOpportunities || isLoadingNgos ? (
              <div className="text-center py-8">Loading opportunities...</div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{opportunity.title}</CardTitle>
                          <CardDescription className="mt-1">{getNgoName(opportunity.ngoId)}</CardDescription>
                        </div>
                        <Badge variant={opportunity.remote ? "secondary" : "outline"}>
                          {opportunity.remote ? "Remote" : "On-site"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-700 mb-4 line-clamp-3">{opportunity.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span>{opportunity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span>{opportunity.commitment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span>{formatDate(opportunity.startDate)} - {formatDate(opportunity.endDate)}</span>
                        </div>
                      </div>
                      
                      {opportunity.skills && opportunity.skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Skills needed:</p>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button asChild className="w-full">
                        <Link to={`/ngo-details/${opportunity.ngoId}?opportunityId=${opportunity.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
