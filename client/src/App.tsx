import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import VolunteerHome from "@/pages/volunteer-home";
import SearchNGOs from "@/pages/search-ngos";
import VolunteerApplications from "@/pages/volunteer-applications";
import VolunteerProfile from "@/pages/volunteer-profile";
import AuthPage from "@/pages/auth-page";
import RecruiterDashboard from "@/pages/recruiter-dashboard";
import RecruiterApplications from "@/pages/recruiter-applications";
import RecruiterSuggestions from "@/pages/recruiter-suggestions";
import RecruiterOpportunities from "@/pages/recruiter-opportunities";
import RecruiterProfile from "@/pages/recruiter-profile";
import NgoDetails from "@/pages/ngo-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Volunteer routes */}
      <ProtectedRoute path="/volunteer" component={VolunteerHome} allowedUserType="volunteer" />
      <ProtectedRoute path="/volunteer/search" component={SearchNGOs} allowedUserType="volunteer" />
      <ProtectedRoute path="/volunteer/applications" component={VolunteerApplications} allowedUserType="volunteer" />
      <ProtectedRoute path="/volunteer/profile" component={VolunteerProfile} allowedUserType="volunteer" />
      <ProtectedRoute path="/volunteer/ngo/:id" component={NgoDetails} allowedUserType="volunteer" />
      
      {/* Recruiter routes */}
      <ProtectedRoute path="/recruiter" component={RecruiterDashboard} allowedUserType="recruiter" />
      <ProtectedRoute path="/recruiter/applications" component={RecruiterApplications} allowedUserType="recruiter" />
      <ProtectedRoute path="/recruiter/suggestions" component={RecruiterSuggestions} allowedUserType="recruiter" />
      <ProtectedRoute path="/recruiter/opportunities" component={RecruiterOpportunities} allowedUserType="recruiter" />
      <ProtectedRoute path="/recruiter/profile" component={RecruiterProfile} allowedUserType="recruiter" />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
