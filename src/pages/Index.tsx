import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Zap } from "lucide-react";
const Index = () => {
  const {
    currentUser,
    isAuthenticated,
    loading
  } = useCurrentUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && isAuthenticated && currentUser) {
      // Redirect authenticated users to their dashboard
      if (currentUser.role === "TALENT") {
        navigate("/talent/dashboard");
      } else if (currentUser.role === "RECRUITER") {
        navigate("/recruiter");
      } else if (currentUser.role === "PARTNER_VIEWER") {
        navigate("/partner");
      }
    }
  }, [isAuthenticated, currentUser, loading, navigate]);
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.24,
          ease: [0.22, 1, 0.36, 1]
        }} className="text-center">
            <div className="mb-8">
              <img src="/favicon.png" alt="CongratsAI" className="mx-auto h-16 w-16" />
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"><span className="text-primary">CongratsAI</span></h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground sm:text-2xl">
              Connect exceptional talent with groundbreaking opportunities. A seamless platform for candidates, recruiters, and partners.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/signup")} className="gap-2 text-lg">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg">
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.24,
          delay: 0.12,
          ease: [0.22, 1, 0.36, 1]
        }} className="grid gap-12 sm:grid-cols-3">
            {[{
            icon: Users,
            title: "For Talent",
            description: "Build your profile, showcase your skills, and connect with opportunities that match your aspirations."
          }, {
            icon: Target,
            title: "For Recruiters",
            description: "Manage job descriptions, leverage AI-powered scoring, and create perfect candidate shortlists."
          }, {
            icon: Zap,
            title: "For Partners",
            description: "Review curated shortlists, provide feedback, and make confident hiring decisions."
          }].map((feature, index) => {
            const Icon = feature.icon;
            return <motion.div key={feature.title} initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.24,
              delay: 0.12 + index * 0.06,
              ease: [0.22, 1, 0.36, 1]
            }} className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>;
          })}
          </motion.div>
        </div>
      </div>
    </div>;
};
export default Index;