import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RecruiterNavbar } from "@/components/recruiter-navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { User as UserType, NGO, insertNgoSchema } from "@shared/schema";

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

// NGO update schema
const ngoSchema = insertNgoSchema.extend({
  id: z.number().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type NGOFormValues = z.infer<typeof ngoSchema>;

export default function RecruiterProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("profile");

  // Get user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserType>({
    queryKey: ["/api/profile"],
  });

  // Get NGO details if the user has an associated NGO
  const { data: ngo, isLoading: ngoLoading } = useQuery<NGO>({
    queryKey: [`/api/ngos/${user?.ngoId}`],
    enabled: !!user?.ngoId,
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      location: "",
      bio: "",
    },
  });

  // NGO form
  const ngoForm = useForm<NGOFormValues>({
    resolver: zodResolver(ngoSchema),
    defaultValues: {
      name: "",
      description: "",
      cause: "",
      location: "",
      email: "",
      phoneNumber: "",
      website: "",
      logo: "",
    },
  });

  // Update form values when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, profileForm]);

  // Update NGO form values when NGO data is loaded
  React.useEffect(() => {
    if (ngo) {
      ngoForm.reset({
        name: ngo.name || "",
        description: ngo.description || "",
        cause: ngo.cause || "",
        location: ngo.location || "",
        email: ngo.email || "",
        phoneNumber: ngo.phoneNumber || "",
        website: ngo.website || "",
        logo: ngo.logo || "",
      });
    }
  }, [ngo, ngoForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], data);
      queryClient.setQueryData(["/api/user"], data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create/Update NGO mutation
  const saveNgoMutation = useMutation({
    mutationFn: async (data: NGOFormValues) => {
      let res;
      if (user?.ngoId) {
        // Update existing NGO
        res = await apiRequest("PATCH", `/api/ngos/${user.ngoId}`, data);
      } else {
        // Create new NGO
        res = await apiRequest("POST", "/api/ngos", data);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/ngos/${data.id}`], data);
      
      // If this was a new NGO, also update the user profile
      if (!user?.ngoId) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      }
      
      toast({
        title: user?.ngoId ? "NGO updated" : "NGO created",
        description: `Your NGO profile has been ${user?.ngoId ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle NGO form submission
  const onNgoSubmit = (data: NGOFormValues) => {
    saveNgoMutation.mutate(data);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profile?.fullName) return "R";
    return profile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <RecruiterNavbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <RecruiterNavbar />
      
      <main className="flex-grow bg-neutral-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">Recruiter Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Profile summary */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="flex flex-col items-center pb-2">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-secondary text-white text-xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-center">{profile?.fullName}</CardTitle>
                  <p className="text-neutral-500 text-center">@{profile?.username}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Account Type</p>
                      <p className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-2 text-secondary" />
                        Recruiter (NGO)
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {profile?.location && (
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Location</p>
                        <p className="mt-1">{profile.location}</p>
                      </div>
                    )}
                    
                    {profile?.email && (
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Email</p>
                        <p className="mt-1">{profile.email}</p>
                      </div>
                    )}
                    
                    {profile?.phoneNumber && (
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Phone</p>
                        <p className="mt-1">{profile.phoneNumber}</p>
                      </div>
                    )}
                    
                    {user?.ngoId && ngo && (
                      <div>
                        <p className="text-sm font-medium text-neutral-500">NGO</p>
                        <p className="mt-1">{ngo.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Profile forms */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Personal Profile</TabsTrigger>
                      <TabsTrigger value="ngo">NGO Details</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="profile" className="mt-0">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
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
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about yourself and your role in the organization" 
                                  className="resize-none min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save Profile
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="ngo" className="mt-0">
                    <Form {...ngoForm}>
                      <form onSubmit={ngoForm.handleSubmit(onNgoSubmit)} className="space-y-6">
                        <FormField
                          control={ngoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NGO Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Organization name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={ngoForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your organization's mission and work" 
                                  className="resize-none min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={ngoForm.control}
                            name="cause"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Cause</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select primary cause" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Environment">Environment</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Human Rights">Human Rights</SelectItem>
                                    <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                                    <SelectItem value="Community Development">Community Development</SelectItem>
                                    <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                                    <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ngoForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NGO Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="City, Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={ngoForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="NGO contact email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={ngoForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="NGO phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={ngoForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.org" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={ngoForm.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input placeholder="URL to your organization's logo" {...field} />
                              </FormControl>
                              <FormDescription>
                                Provide a direct link to your logo image (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto bg-secondary hover:bg-secondary-dark"
                          disabled={saveNgoMutation.isPending}
                        >
                          {saveNgoMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {user?.ngoId ? "Update NGO" : "Create NGO"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
