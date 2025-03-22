import React from "react";
import { useQuery } from "@tanstack/react-query";
import { VolunteerNavbar } from "@/components/volunteer-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock } from "lucide-react";
import { Application, NGO, Opportunity } from "@shared/schema";
import { format } from "date-fns";

export default function VolunteerApplications() {
  // Query applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Query NGOs
  const { data: ngos, isLoading: ngosLoading } = useQuery<NGO[]>({
    queryKey: ["/api/ngos"],
  });

  // Query opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  // Helper to get NGO name
  const getNgoName = (ngoId: number) => {
    if (!ngos) return "Loading...";
    const ngo = ngos.find(n => n.id === ngoId);
    return ngo ? ngo.name : "Unknown NGO";
  };

  // Helper to get opportunity details
  const getOpportunity = (opportunityId: number) => {
    if (!opportunities) return null;
    return opportunities.find(o => o.id === opportunityId);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-600">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Format date nicely
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy");
  };

  const isLoading = applicationsLoading || ngosLoading || opportunitiesLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <VolunteerNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">My Applications</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !applications || applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Applications Yet</h3>
                  <p className="text-neutral-500 mb-6">
                    You haven't applied to any volunteer opportunities yet.
                  </p>
                  <a href="/volunteer/search" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    Find Opportunities
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => {
                const opportunity = getOpportunity(application.opportunityId);
                
                return (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">
                            {opportunity?.title || "Unknown Opportunity"}
                          </CardTitle>
                          <p className="text-neutral-600 mt-1">
                            {getNgoName(application.ngoId)}
                          </p>
                        </div>
                        <div>
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-500">Applied On</h3>
                          <p className="flex items-center text-neutral-700">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {formatDate(application.createdAt)}
                          </p>
                        </div>
                        {opportunity && (
                          <>
                            <div>
                              <h3 className="text-sm font-semibold text-neutral-500">Opportunity Location</h3>
                              <p className="text-neutral-700">{opportunity.location}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-neutral-500">Commitment</h3>
                              <p className="flex items-center text-neutral-700">
                                <Clock className="inline h-4 w-4 mr-1" />
                                {opportunity.commitment}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-neutral-500">Time Period</h3>
                              <p className="text-neutral-700">
                                {formatDate(opportunity.startDate)} - {formatDate(opportunity.endDate)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {application.message && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                          <h3 className="text-sm font-semibold text-neutral-500 mb-2">Your Message</h3>
                          <p className="text-neutral-700 italic">{application.message}</p>
                        </div>
                      )}
                      
                      {application.status === "accepted" && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 bg-green-50 p-4 rounded-md">
                          <h3 className="text-sm font-semibold text-green-700 mb-1">Application Accepted!</h3>
                          <p className="text-green-600">
                            Congratulations! The NGO has accepted your application. They will contact you with further details.
                          </p>
                        </div>
                      )}
                      
                      {application.status === "rejected" && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 bg-red-50 p-4 rounded-md">
                          <h3 className="text-sm font-semibold text-red-700 mb-1">Application Not Accepted</h3>
                          <p className="text-red-600">
                            Unfortunately, the NGO has not selected your application at this time. Don't be discouraged - there are many other opportunities waiting for you!
                          </p>
                        </div>
                      )}
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
