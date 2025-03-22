import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RecruiterNavbar } from "@/components/recruiter-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Application, User, Opportunity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Loader2,
  Clock,
  User as UserIcon
} from "lucide-react";
import { format } from "date-fns";

type ApplicationStatus = "pending" | "accepted" | "rejected" | "all";

export default function RecruiterApplications() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>("pending");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  // Query applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Query users (volunteers)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Query opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptClick = (application: Application) => {
    setSelectedApplication(application);
    setIsAcceptDialogOpen(true);
  };

  const handleRejectClick = (application: Application) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  const handleAcceptConfirm = () => {
    if (selectedApplication) {
      updateStatusMutation.mutate({ id: selectedApplication.id, status: "accepted" });
      setIsAcceptDialogOpen(false);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedApplication) {
      updateStatusMutation.mutate({ id: selectedApplication.id, status: "rejected" });
      setIsRejectDialogOpen(false);
    }
  };

  // Helper to get user (volunteer) details
  const getVolunteerName = (volunteerId: number) => {
    if (!users) return "Volunteer";
    const user = users.find(u => u.id === volunteerId);
    return user?.fullName || user?.username || "Volunteer";
  };

  // Helper to get opportunity details
  const getOpportunityTitle = (opportunityId: number) => {
    if (!opportunities) return "Opportunity";
    const opportunity = opportunities.find(o => o.id === opportunityId);
    return opportunity?.title || "Opportunity";
  };

  // Filter applications based on active tab
  const filteredApplications = React.useMemo(() => {
    if (!applications) return [];
    
    if (activeTab === "all") return applications;
    
    return applications.filter(app => app.status === activeTab);
  }, [applications, activeTab]);

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
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

  const isLoading = applicationsLoading || usersLoading || opportunitiesLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <RecruiterNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">Manage Applications</h1>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ApplicationStatus)} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-500 mb-2">No {activeTab !== "all" ? activeTab : ""} applications found.</p>
                    {activeTab === "pending" && (
                      <p className="text-neutral-400 text-sm">When volunteers apply to your opportunities, they will appear here.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(application.status)}
                              <span className="text-sm text-neutral-500">
                                Applied on {formatDate(application.createdAt)}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold">
                                {getOpportunityTitle(application.opportunityId)}
                              </h3>
                              <div className="flex items-center mt-1 text-neutral-600">
                                <UserIcon className="h-4 w-4 mr-2" />
                                <span>{getVolunteerName(application.volunteerId)}</span>
                              </div>
                            </div>
                            
                            {application.message && (
                              <div className="bg-neutral-50 p-4 rounded border border-neutral-200">
                                <p className="text-neutral-600 italic">"{application.message}"</p>
                              </div>
                            )}
                          </div>
                          
                          {application.status === "pending" && (
                            <div className="flex flex-row md:flex-col gap-2 self-end md:self-auto">
                              <Button
                                onClick={() => handleAcceptClick(application)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Accept</span>
                              </Button>
                              <Button
                                onClick={() => handleRejectClick(application)}
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Decline</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Accept Confirmation Dialog */}
      <AlertDialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this application? The volunteer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAcceptConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this application? The volunteer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
}
