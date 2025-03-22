import React from "react";
import { useQuery } from "@tanstack/react-query";
import { RecruiterNavbar } from "@/components/recruiter-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Application, Suggestion, Opportunity, NGO } from "@shared/schema";
import { 
  Briefcase, 
  Users, 
  MessageSquare, 
  Clock, 
  PlusCircle, 
  Loader2, 
  ChevronRight 
} from "lucide-react";

export default function RecruiterDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Query applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Query suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  // Query opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: [`/api/opportunities?ngoId=${user?.ngoId}`],
    enabled: !!user?.ngoId,
  });

  // Query NGO details
  const { data: ngo, isLoading: ngoLoading } = useQuery<NGO>({
    queryKey: [`/api/ngos/${user?.ngoId}`],
    enabled: !!user?.ngoId,
  });

  const pendingApplications = applications?.filter(a => a.status === "pending") || [];
  const recentSuggestions = suggestions?.slice(0, 3) || [];

  const isLoading = applicationsLoading || suggestionsLoading || opportunitiesLoading || ngoLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <RecruiterNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Recruiter Dashboard</h1>
            <Button 
              onClick={() => setLocation("/recruiter/opportunities/new")}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Opportunity</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : (
            <>
              {/* NGO Information */}
              {!ngo ? (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">Complete Your Profile</h3>
                      <p className="text-neutral-500 mb-6">
                        You need to complete your NGO profile before you can start recruiting volunteers.
                      </p>
                      <Button 
                        onClick={() => setLocation("/recruiter/profile")}
                        className="bg-secondary hover:bg-secondary-dark"
                      >
                        Create NGO Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{ngo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 mb-4">{ngo.description}</p>
                    <Badge className="bg-secondary">{ngo.cause}</Badge>
                  </CardContent>
                </Card>
              )}

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100 mr-4">
                        <Briefcase className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Active Opportunities</p>
                        <p className="text-2xl font-bold">{opportunities?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-yellow-100 mr-4">
                        <Users className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Pending Applications</p>
                        <p className="text-2xl font-bold">{pendingApplications.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100 mr-4">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-neutral-600 text-sm">Total Suggestions</p>
                        <p className="text-2xl font-bold">{suggestions?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Applications */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-neutral-800">Pending Applications</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation("/recruiter/applications")}
                    className="text-secondary"
                  >
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                
                {pendingApplications.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center">
                      <p className="text-neutral-500">No pending applications at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingApplications.slice(0, 3).map((application) => (
                      <Card key={application.id} className="overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-neutral-400 mr-2" />
                              <span className="text-sm text-neutral-500">
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge>Pending</Badge>
                          </div>
                          <h3 className="font-semibold">Opportunity {application.opportunityId}</h3>
                          {application.message && (
                            <p className="text-neutral-600 mt-2 italic">"{application.message}"</p>
                          )}
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setLocation("/recruiter/applications")}
                              className="text-sm"
                            >
                              Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Suggestions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-neutral-800">Recent Suggestions</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation("/recruiter/suggestions")}
                    className="text-secondary"
                  >
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                
                {recentSuggestions.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center">
                      <p className="text-neutral-500">No suggestions received yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {recentSuggestions.map((suggestion) => (
                      <Card key={suggestion.id}>
                        <CardContent className="pt-6">
                          <p className="text-neutral-600 mb-4">"{suggestion.content}"</p>
                          <div className="flex justify-between items-center text-sm text-neutral-500">
                            <span>Volunteer ID: {suggestion.volunteerId}</span>
                            <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
