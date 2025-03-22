import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RecruiterNavbar } from "@/components/recruiter-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suggestion, User } from "@shared/schema";
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  User as UserIcon, 
  MapPin, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";

export default function RecruiterSuggestions() {
  const [searchTerm, setSearchTerm] = useState("");

  // Query suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  // Query users (volunteers)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter suggestions based on search term
  const filteredSuggestions = React.useMemo(() => {
    if (!suggestions) return [];
    
    if (!searchTerm) return suggestions;
    
    const term = searchTerm.toLowerCase();
    return suggestions.filter(suggestion => {
      // Search in content
      if (suggestion.content.toLowerCase().includes(term)) return true;
      
      // Search in volunteer name/username (if user data is available)
      if (users) {
        const user = users.find(u => u.id === suggestion.volunteerId);
        if (user && (
          (user.fullName && user.fullName.toLowerCase().includes(term)) ||
          user.username.toLowerCase().includes(term) ||
          (user.location && user.location.toLowerCase().includes(term))
        )) {
          return true;
        }
      }
      
      return false;
    });
  }, [suggestions, users, searchTerm]);

  // Helper to get volunteer details
  const getVolunteerDetails = (volunteerId: number) => {
    if (!users) return { name: "Volunteer", location: null };
    
    const user = users.find(u => u.id === volunteerId);
    return {
      name: user?.fullName || user?.username || "Volunteer",
      location: user?.location || null
    };
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  const isLoading = suggestionsLoading || usersLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <RecruiterNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Volunteer Suggestions</h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <Input
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : !filteredSuggestions.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-500 mb-2">No suggestions found.</p>
                <p className="text-neutral-400 text-sm">When volunteers provide suggestions, they will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredSuggestions.map((suggestion) => {
                const volunteer = getVolunteerDetails(suggestion.volunteerId);
                
                return (
                  <Card key={suggestion.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(suggestion.createdAt)}</span>
                      </div>
                      
                      <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200 mb-4">
                        <p className="text-neutral-700">{suggestion.content}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <UserIcon className="h-4 w-4 text-secondary" />
                          <span>From: <span className="font-medium">{volunteer.name}</span></span>
                        </div>
                        
                        {volunteer.location && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <MapPin className="h-4 w-4 text-secondary" />
                            <span>{volunteer.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
