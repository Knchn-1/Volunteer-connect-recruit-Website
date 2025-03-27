import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { VolunteerNavbar } from "@/components/volunteer-navbar";
import { Footer } from "@/components/footer";
import { SuggestionForm } from "@/components/suggestion-form";
import { NGO, Opportunity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  SendHorizontal,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

export default function NgoDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  // Query NGO details
  const { data: ngo, isLoading: ngoLoading } = useQuery<NGO>({
    queryKey: ['/api/ngos', id],
  });

  // Query opportunities for this NGO
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ['/api/opportunities', { ngoId: id }],
    enabled: !!id,
  });

  // Apply to opportunity mutation
  const applyMutation = useMutation({
    mutationFn: async (opportunityId: number) => {
      const res = await apiRequest("POST", "/api/applications", {
        opportunityId,
        message: applicationMessage,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
      setIsApplicationModalOpen(false);
      setApplicationMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Flexible";
    return format(new Date(date), "MMM d, yyyy");
  };

  const handleApplyClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsApplicationModalOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedOpportunity) return;
    applyMutation.mutate(selectedOpportunity.id);
  };

  const isLoading = ngoLoading || opportunitiesLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <VolunteerNavbar />

      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !ngo ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">NGO Not Found</h3>
                  <p className="text-neutral-500 mb-6">
                    The NGO you're looking for doesn't exist or has been removed.
                  </p>
                  <Button onClick={() => setLocation("/volunteer/search")}>
                    Back to Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* NGO Header */}
              <Card className="mb-8 overflow-hidden">
                <CardHeader className="border-b bg-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold">{ngo.name}</CardTitle>
                      <CardDescription className="mt-2">
                        <Badge className="bg-primary">{ngo.cause}</Badge>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsSuggestionModalOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Suggest</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold mb-3">About</h3>
                      <p className="text-neutral-600 mb-6">{ngo.description}</p>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                          <span>{ngo.location}</span>
                        </div>
                        {ngo.email && (
                          <div className="flex items-start">
                            <Mail className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                            <a
                              href={`mailto:${ngo.email}`}
                              className="text-primary hover:underline"
                            >
                              {ngo.email}
                            </a>
                          </div>
                        )}
                        {ngo.phoneNumber && (
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                            <span>{ngo.phoneNumber}</span>
                          </div>
                        )}
                        {ngo.website && (
                          <div className="flex items-start">
                            <Globe className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                            <a
                              href={ngo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {ngo.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities Section */}
              <h2 className="text-2xl font-bold mb-6">Volunteer Opportunities</h2>
              
              {!opportunities || opportunities.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Opportunities Available</h3>
                      <p className="text-neutral-500">
                        This NGO doesn't have any active volunteer opportunities at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                        {opportunity.remote && (
                          <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Remote
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="pt-2 flex-grow">
                        <p className="text-neutral-600 mb-4">{opportunity.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{opportunity.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{opportunity.commitment}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>
                              {formatDate(opportunity.startDate)} - {formatDate(opportunity.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-neutral-500 mr-2" />
                            <span>{opportunity.openings} {opportunity.openings === 1 ? 'opening' : 'openings'}</span>
                          </div>
                        </div>
                        
                        {opportunity.skills && opportunity.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2">Skills Required:</p>
                            <div className="flex flex-wrap gap-2">
                              {opportunity.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <div className="px-6 pb-6 mt-auto">
                        <Button
                          onClick={() => handleApplyClick(opportunity)}
                          className="w-full bg-primary hover:bg-primary-dark"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Application Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Volunteer Position</DialogTitle>
            <DialogDescription>
              {selectedOpportunity && (
                <span>
                  You're applying for: <strong>{selectedOpportunity.title}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Message to the Organization (Optional)
              </label>
              <Textarea
                placeholder="Tell them why you're interested in this opportunity and what skills you can bring..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplicationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              className="ml-2"
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="mr-2 h-4 w-4" />
              )}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggestion Modal */}
      <Dialog open={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Suggestions</DialogTitle>
            <DialogDescription>
              Your feedback helps improve volunteer opportunities at {ngo?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <SuggestionForm 
            ngoId={Number(id)} 
            onClose={() => setIsSuggestionModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
