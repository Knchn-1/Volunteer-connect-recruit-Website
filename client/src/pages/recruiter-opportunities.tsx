import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RecruiterNavbar } from "@/components/recruiter-navbar";
import { Footer } from "@/components/footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertOpportunitySchema, Opportunity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

// Extended schema for opportunity creation with validation
const opportunitySchema = insertOpportunitySchema
  .omit({
    ngoId: true
  })
  .extend({
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
    skills: z.array(z.string()).default([]),
  });

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export default function RecruiterOpportunities() {
  const [isCreating, setIsCreating] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Open create dialog automatically if the path is /recruiter/opportunities/new
  React.useEffect(() => {
    if (location === '/recruiter/opportunities/new') {
      setIsCreating(true);
    }
  }, [location]);
  
  // Redirect to base path when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open && location === '/recruiter/opportunities/new') {
      setLocation('/recruiter/opportunities');
    }
    setIsCreating(open);
  };

  // Query opportunities
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ['/api/opportunities', user?.ngoId],
    enabled: !!user?.ngoId,
  });

  // Create opportunity form
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      remote: false,
      skills: [],
      commitment: "",
      openings: 1,
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormValues) => {
      // Add skills as array
      const skillsArray = data.skills || [];
      
      // Format dates properly for the API
      const formattedData = {
        ...data,
        skills: skillsArray,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        endDate: data.endDate ? data.endDate.toISOString() : null
      };
      
      // Log what we're sending to the API
      console.log("Data being sent to API:", formattedData);

      const res = await apiRequest("POST", "/api/opportunities", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Opportunity created",
        description: "Your volunteer opportunity has been created successfully.",
      });
      handleOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities', user?.ngoId] });
    },
    onError: (error: Error) => {
      // Log detailed error
      console.error("Opportunity creation error:", error);
      
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: OpportunityFormValues) => {
    if (!user?.ngoId) {
      toast({
        title: "NGO Required",
        description: "You need to create an NGO profile first.",
        variant: "destructive",
      });
      return;
    }
    
    // Get skills array from form data
    let skillsArray: string[] = [];
    if (Array.isArray(data.skills)) {
      skillsArray = data.skills;
    }
    
    createOpportunityMutation.mutate({
      ...data,
      skills: skillsArray,
      // The formatting of dates is now handled in the mutation function
    });
  };

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Flexible";
    return format(new Date(date), "MMM d, yyyy");
  };
  
  // Add new skill
  const [newSkill, setNewSkill] = useState("");
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues("skills") || [];
    if (!currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill]);
    }
    setNewSkill("");
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <RecruiterNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Volunteer Opportunities</h1>
            <Button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Opportunity</span>
            </Button>
          </div>
          
          {!user?.ngoId ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Complete Your Profile</h3>
                  <p className="text-neutral-500 mb-6">
                    You need to complete your NGO profile before you can create volunteer opportunities.
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
          ) : opportunitiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : !opportunities || opportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Opportunities Yet</h3>
                <p className="text-neutral-500 mb-6">
                  You haven't created any volunteer opportunities yet.
                </p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-secondary hover:bg-secondary-dark"
                >
                  Create Your First Opportunity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{opportunity.title}</CardTitle>
                    <CardDescription>
                      {opportunity.remote && (
                        <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Remote
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
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
                        <CalendarIcon className="h-4 w-4 text-neutral-500 mr-2" />
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
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" className="text-neutral-600">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Create Opportunity Dialog */}
      <Dialog open={isCreating} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Volunteer Opportunity</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new volunteer opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Teaching Assistant, Event Organizer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the volunteer opportunity, responsibilities, and impact..." 
                        {...field} 
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Commitment</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 hours/week, Weekends only" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? field.value : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? field.value : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="openings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Openings</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          value={field.value?.toString() || "1"}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remote Option</FormLabel>
                        <FormDescription>
                          Can this opportunity be done remotely?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a skill (e.g., Teaching, Communication)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-secondary hover:bg-secondary-dark"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("skills")?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="py-1 px-3">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 rounded-full hover:bg-neutral-200 h-4 w-4 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary-dark"
                  disabled={createOpportunityMutation.isPending}
                >
                  {createOpportunityMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Create Opportunity
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}