import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { RoleGuard } from "@/components/RoleGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignupFlow from "./pages/SignupFlow";
import TalentDashboard from "./pages/talent/TalentDashboard";
import ProfileWizard from "./pages/talent/ProfileWizard";
import ProfileEditor from "./pages/talent/ProfileEditor";
import Opportunities from "./pages/talent/Opportunities";
import DemoInterview from "./pages/talent/DemoInterview";
import SubmissionDetailPage from "./pages/talent/SubmissionDetailPage";
import AuditionLandingPage from "./pages/talent/AuditionLandingPage";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SignupFlow />} />
          
          {/* Talent Routes */}
          <Route
            path="/talent/dashboard"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <TalentDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/talent/profile/wizard"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <ProfileWizard />
              </RoleGuard>
            }
          />
          <Route
            path="/talent/profile"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <ProfileEditor />
              </RoleGuard>
            }
          />
          <Route
            path="/opportunities"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <Opportunities />
              </RoleGuard>
            }
          />
          <Route
            path="/audition/demo"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <DemoInterview />
              </RoleGuard>
            }
          />
          <Route
            path="/audition/:opportunityId/start"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <AuditionLandingPage />
              </RoleGuard>
            }
          />
          <Route
            path="/applications/:submissionId"
            element={
              <RoleGuard allowedRoles={["TALENT"]}>
                <SubmissionDetailPage />
              </RoleGuard>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter"
            element={
              <RoleGuard allowedRoles={["RECRUITER"]}>
                <RecruiterDashboard />
              </RoleGuard>
            }
          />

          {/* Partner Routes */}
          <Route
            path="/partner"
            element={
              <RoleGuard allowedRoles={["PARTNER_VIEWER"]}>
                <PartnerDashboard />
              </RoleGuard>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
