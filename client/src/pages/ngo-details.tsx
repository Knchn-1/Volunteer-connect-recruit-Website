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
  FileUp,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function NgoDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");

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
    mutationFn: async (data: { opportunityId: number; message: string; resume: string | null }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });
      setIsApplicationModalOpen(false);
      setApplicationMessage("");
      setResumeFile(null);
      setResumeError("");
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

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError("");
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError("File size should be less than 5MB");
        return;
      }
      
      // Check file type (PDF, DOC, DOCX)
      const fileType = file.type;
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
        setResumeError("Only PDF, DOC, or DOCX files are accepted");
        return;
      }
      
      setResumeFile(file);
    }
  };
  
  const handleSubmitApplication = async () => {
    if (!selectedOpportunity) return;
    
    // If a resume file exists, convert it to a base64 string
    let resumeData = null;
    if (resumeFile) {
      try {
        resumeData = await convertFileToBase64(resumeFile);
      } catch (error) {
        setResumeError("Error processing resume file");
        return;
      }
    }
    
    applyMutation.mutate({
      opportunityId: selectedOpportunity.id,
      message: applicationMessage,
      resume: resumeData,
    });
  };
  
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
      <Dialog 
        open={isApplicationModalOpen} 
        onOpenChange={(open) => {
          setIsApplicationModalOpen(open);
          if (!open) {
            setResumeFile(null);
            setResumeError("");
            setApplicationMessage("");
          }
        }}
      >
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
              <Label className="text-sm font-medium mb-1 block">
                Message to the Organization (Optional)
              </Label>
              <Textarea
                placeholder="Tell them why you're interested in this opportunity and what skills you can bring..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium mb-1 block">
                Resume / CV (Optional)
              </Label>
              
              {resumeFile ? (
                <div className="mt-2 p-3 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileUp className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm truncate max-w-[200px]">{resumeFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="resume-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileUp className="w-8 h-8 mb-2 text-neutral-500" />
                        <p className="mb-1 text-sm text-neutral-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-neutral-500">PDF, DOC, or DOCX (up to 5MB)</p>
                      </div>
                      <input 
                        id="resume-upload" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeChange}
                      />
                    </Label>
                  </div>
                </div>
              )}
              
              {resumeError && (
                <p className="text-sm text-red-500 mt-2">{resumeError}</p>
              )}
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
