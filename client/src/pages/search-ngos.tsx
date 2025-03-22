import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VolunteerNavbar } from "@/components/volunteer-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, Globe, Phone, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { NGO, Opportunity } from "@shared/schema";

export default function SearchNGOs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCause, setSelectedCause] = useState("");
  const [, setLocation] = useLocation();

  // Get the URL search parameters
  const searchParams = new URLSearchParams(window.location.search);
  const causeFromUrl = searchParams.get("cause");

  // Set the selected cause from URL if available
  React.useEffect(() => {
    if (causeFromUrl) {
      setSelectedCause(causeFromUrl);
    }
  }, [causeFromUrl]);

  // Query NGOs
  const { data: ngos, isLoading: ngosLoading } = useQuery<NGO[]>({
    queryKey: ["/api/ngos"],
  });

  // Query opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  // Filter NGOs based on search term and selected cause
  const filteredNGOs = React.useMemo(() => {
    if (!ngos) return [];
    
    return ngos.filter(ngo => {
      const matchesSearch = searchTerm 
        ? ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ngo.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesCause = selectedCause && selectedCause !== 'all'
        ? ngo.cause.toLowerCase() === selectedCause.toLowerCase() 
        : true;
      
      return matchesSearch && matchesCause;
    });
  }, [ngos, searchTerm, selectedCause]);

  // Get opportunities count by NGO
  const getOpportunitiesCount = (ngoId: number) => {
    if (!opportunities) return 0;
    return opportunities.filter(opp => opp.ngoId === ngoId).length;
  };

  // Handle view NGO details
  const handleViewNGO = (ngoId: number) => {
    setLocation(`/volunteer/ngo/${ngoId}`);
  };

  // Unique causes for filter
  const causes = React.useMemo(() => {
    if (!ngos) return [];
    const uniqueCauses = new Set(ngos.map(ngo => ngo.cause));
    return Array.from(uniqueCauses);
  }, [ngos]);

  return (
    <div className="flex flex-col min-h-screen">
      <VolunteerNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">Find NGOs & Opportunities</h1>
          
          {/* Search and filter section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <Input
                    id="search"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-64">
                <label htmlFor="cause" className="block text-sm font-medium text-neutral-700 mb-1">Filter by Cause</label>
                <Select value={selectedCause} onValueChange={setSelectedCause}>
                  <SelectTrigger id="cause">
                    <SelectValue placeholder="All Causes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Causes</SelectItem>
                    {causes.map(cause => (
                      <SelectItem key={cause} value={cause}>{cause}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCause("all");
                  }}
                  className="mb-0.5"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results section */}
          <div className="space-y-6">
            {ngosLoading || opportunitiesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNGOs.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-neutral-600">No NGOs found matching your search criteria.</p>
              </div>
            ) : (
              filteredNGOs.map((ngo) => (
                <Card key={ngo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">{ngo.name}</CardTitle>
                        <Badge className="mt-2 bg-primary">{ngo.cause}</Badge>
                      </div>
                      <Button 
                        onClick={() => handleViewNGO(ngo.id)}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 mb-4">{ngo.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-neutral-500">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{ngo.location}</span>
                      </div>
                      {ngo.website && (
                        <div className="flex items-center">
                          <Globe size={16} className="mr-1" />
                          <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {ngo.website.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </div>
                      )}
                      {ngo.email && (
                        <div className="flex items-center">
                          <Mail size={16} className="mr-1" />
                          <a href={`mailto:${ngo.email}`} className="text-primary hover:underline">{ngo.email}</a>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-neutral-600">
                        <span className="font-semibold">{getOpportunitiesCount(ngo.id)}</span> active volunteer opportunities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
