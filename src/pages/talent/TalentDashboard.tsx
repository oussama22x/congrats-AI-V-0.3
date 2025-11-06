import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { useTalentFiles } from "@/hooks/useTalentFiles";
import { useTalentSkills } from "@/hooks/useTalentSkills";
import { useWizardProgress } from "@/hooks/useWizardProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, FileText, MapPin, Briefcase, DollarSign, Lock, Download, Globe, Calendar, Linkedin, X, PencilLine, ClipboardList, Eye, GraduationCap, Sparkles, Search } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { VettingChallengeCard } from "@/components/vetting/VettingChallengeCard";
import { VettingChallengeDrawer } from "@/components/vetting/VettingChallengeDrawer";
import { OpportunityCard } from "@/components/OpportunityCard";

// Backend URL - using environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TalentDashboard = () => {
  const {
    currentUser
  } = useCurrentUser();
  const {
    profile,
    isLoading: profileLoading
  } = useTalentProfile();
  const {
    resume,
    isLoading: filesLoading
  } = useTalentFiles();
  const {
    skills,
    isLoading: skillsLoading
  } = useTalentSkills();
  const {
    progress,
    wizardProgress,
    vettingProgress,
    hasCompletedVetting,
    incompleteSteps,
    isLoading: progressLoading
  } = useWizardProgress();
  const navigate = useNavigate();
  const [isVettingDrawerOpen, setIsVettingDrawerOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const isLoading = profileLoading || filesLoading || skillsLoading || progressLoading;

  // State for submissions (My Applications)
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  // State for opportunities (Browse Opportunities)
  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  
  // State to track user's submissions (prevent duplicate applications)
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());

  // Fetch submissions from backend
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!currentUser?.id) {
        setSubmissionsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/submissions?userId=${currentUser.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSubmissions(data.data);
            
            // Create a Set of opportunity IDs the user has already applied to
            const appliedOpportunityIds = new Set<string>(
              data.data.map((sub: any) => sub.opportunityId || sub.opportunity_id as string)
            );
            setUserSubmissions(appliedOpportunityIds);
          }
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchSubmissions();
  }, [currentUser?.id]);

  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setOpportunitiesLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/opportunities`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        
        const data = await response.json();
        
        // Transform questions from backend format to frontend format
        const transformedData = data.map((opp: any) => ({
          ...opp,
          questions: (opp.questions || []).map((q: any, index: number) => ({
            id: `q${index + 1}`,
            text: q.question_text || q.text || q,
            duration: q.time_limit_seconds || q.duration || 120,
          })),
        }));
        
        setOpportunities(transformedData);
        setOpportunitiesError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load opportunities';
        setOpportunitiesError(errorMessage);
      } finally {
        setOpportunitiesLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Show celebration only once when reaching 100% AND completing vetting
  useEffect(() => {
    if (progress === 100 && hasCompletedVetting && !isLoading) {
      const hasSeenCelebration = localStorage.getItem('vetting-celebration-seen');
      if (!hasSeenCelebration) {
        setShowCelebration(true);
        localStorage.setItem('vetting-celebration-seen', 'true');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
      }
    }
  }, [progress, hasCompletedVetting, isLoading]);
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    // Convert from annual to hourly (divide by 2080)
    const minHourly = min ? Math.round(min / 2080) : null;
    const maxHourly = max ? Math.round(max / 2080) : null;
    if (minHourly && maxHourly) return `$${minHourly} - $${maxHourly}/hour`;
    if (minHourly) return `$${minHourly}+/hour`;
    return `Up to $${maxHourly}/hour`;
  };
  const getExperienceLevelDisplay = (level: string | null) => {
    const levels: Record<string, string> = {
      "emerging-talent": "Emerging Talent",
      "entry-level": "Entry Level",
      "mid-level": "Mid-Level",
      senior: "Senior",
      expert: "Expert"
    };
    return level ? levels[level] || level : null;
  };
  const getLocationPreferenceDisplay = (pref: string) => {
    const prefs: Record<string, string> = {
      "east-africa": "East Africa",
      "west-africa": "West Africa",
      "southern-africa": "Southern Africa",
      "north-africa": "North Africa",
      "outside-africa": "Outside Africa",
      "global-remote": "Global Remote"
    };
    return prefs[pref] || pref;
  };
  const getStartTimingDisplay = (timing: string | null) => {
    const timings: Record<string, string> = {
      immediately: "Immediately",
      "within-1-month": "Within 1 month",
      "within-3-months": "Within 3 months",
      "within-6-months": "Within 6 months",
      "just-exploring": "Just exploring"
    };
    return timing ? timings[timing] || timing : null;
  };
  const getWorkArrangementDisplay = (arr: string) => {
    const arrangements: Record<string, string> = {
      "full-time": "Full-time",
      "part-time": "Part-time"
    };
    return arrangements[arr] || arr;
  };
  const getStepDescription = (step: number) => {
    const descriptions: Record<number, string> = {
      1: "Your name",
      2: "LinkedIn profile",
      3: "Work categories/skills",
      4: "Experience level",
      5: "Desired roles",
      6: "Work preferences & location",
      7: "Desired compensation",
      8: "Resume",
      9: "Profile confirmation"
    };
    return descriptions[step] || `Step ${step}`;
  };
  return <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 8
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1]
      }} className="space-y-8">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back
              {profile?.first_name && `, ${profile.first_name}`}
              {!profile?.first_name && currentUser?.email && `, ${currentUser.email.split("@")[0]}`}
            </h1>
            <p className="text-xl text-muted-foreground">Your <span className="text-primary">CongratsAI</span> dashboard</p>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-3">
              <TabsTrigger value="opportunities" className="gap-2">
                <Search className="h-4 w-4" />
                Browse Opportunities
              </TabsTrigger>
              <TabsTrigger value="applications">
                <ClipboardList className="h-4 w-4 mr-2" />
                My Applications
                {submissions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {submissions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="profile">
                <UserCircle className="h-4 w-4 mr-2" />
                My Profile
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Browse Opportunities */}
            <TabsContent value="opportunities" className="space-y-6 mt-8">
              {/* Loading State */}
              {opportunitiesLoading && (
                <div className="flex items-center justify-center py-12">
                  <h2 className="text-2xl text-muted-foreground">Loading opportunities...</h2>
                </div>
              )}
              
              {/* Error State */}
              {opportunitiesError && !opportunitiesLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <h2 className="text-2xl text-destructive">Failed to load opportunities</h2>
                  <p className="text-muted-foreground">{opportunitiesError}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              )}
              
              {/* Opportunities Grid */}
              {!opportunitiesLoading && !opportunitiesError && opportunities.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {opportunities.map((opportunity: any) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunityId={opportunity.id}
                      title={opportunity.title}
                      company={opportunity.company}
                      location={opportunity.location}
                      type={opportunity.type}
                      rate={opportunity.rate}
                      skills={opportunity.skills}
                      hasApplied={userSubmissions.has(opportunity.id)}
                      isCheckingStatus={submissionsLoading}
                    />
                  ))}
                </div>
              )}
              
              {/* Empty State */}
              {!opportunitiesLoading && !opportunitiesError && opportunities.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <h2 className="text-2xl text-muted-foreground">No opportunities available at the moment</h2>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: My Applications */}
            <TabsContent value="applications" className="space-y-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    My Audition Applications
                  </CardTitle>
                  <CardDescription>
                    Track your submitted auditions and their review status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submissionsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading your applications...</p>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        You haven't submitted any auditions yet. Start exploring opportunities!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission: any) => (
                        <Card key={submission.id} className="border-2 hover:border-primary/50 transition-colors">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-lg font-semibold">{submission.title}</h4>
                                    <p className="text-sm text-muted-foreground">{submission.company}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Badge variant="outline" className="gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {submission.location}
                                  </Badge>
                                  <Badge variant="outline" className="gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {submission.type}
                                  </Badge>
                                  <Badge variant="outline" className="gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {submission.rate}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                >
                                  {submission.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Submitted {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                                </p>
                                <Link to={`/applications/${submission.id}`}>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Review Answers
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: My Profile */}
            <TabsContent value="profile" className="space-y-8 mt-8">
          {isLoading && incompleteSteps.length > 0 ? (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Loading profile status...</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ) : incompleteSteps.length > 0 ? (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Complete your profile</CardTitle>
                <CardDescription>
                  {incompleteSteps.length} step{incompleteSteps.length !== 1 ? "s" : ""} remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Progress value={wizardProgress} className="flex-1" />
                    <span className="text-sm font-medium">{wizardProgress}%</span>
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">Still needed:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {incompleteSteps.map(step => (
                        <li key={step}>{getStepDescription(step)}</li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={() => navigate("/talent/profile/wizard")}>
                    Continue Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* One-time Celebration Card */}
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="relative"
            >
              <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setShowCelebration(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-2xl">
                    🎉 Congratulations!
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-500 text-base">
                    Your profile is 100% complete and ready for recruiters!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You've completed all steps including the vetting challenge. Recruiters can now discover your profile.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vetting Challenge Card */}
          <VettingChallengeCard
            progress={progress}
            wizardProgress={wizardProgress}
            vettingProgress={vettingProgress}
            hasCompleted={hasCompletedVetting}
            onStartChallenge={() => setIsVettingDrawerOpen(true)}
            isLoading={isLoading}
          />

          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {isLoading ? <Skeleton className="h-8 w-48" /> : profile?.first_name || profile?.last_name ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : <span className="text-muted-foreground">Add your name</span>}
                      </h2>
                      {isLoading ? <Skeleton className="h-6 w-40 mt-2" /> : profile?.desired_roles && profile.desired_roles.length > 0 ? <p className="text-lg text-muted-foreground mt-1">{profile.desired_roles.join(" • ")}</p> : null}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => navigate("/talent/profile")} className="gap-2 shrink-0">
                      <PencilLine className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {isLoading ? <>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-32" />
                      </> : <>
                        {profile?.current_city && profile?.current_country && <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.current_city}, {profile.current_country}</span>
                          </div>}
                        {profile?.experience_level && <Badge variant="secondary" className="gap-1">
                            <Briefcase className="h-3 w-3" />
                            {getExperienceLevelDisplay(profile.experience_level)}
                          </Badge>}
                        {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Profile
                          </a>}
                      </>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* About Me Card */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div> : profile?.bio ? <p className="text-sm leading-relaxed">{profile.bio}</p> : <p className="text-sm text-muted-foreground">
                    Add a bio to tell recruiters about yourself and your career goals
                  </p>}
              </CardContent>
            </Card>

            {/* Work Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Work Preferences</CardTitle>
                <CardDescription>Your ideal work arrangement</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div> : <div className="space-y-4">
                    {profile?.work_arrangements && profile.work_arrangements.length > 0 && <div>
                        <p className="text-sm font-medium mb-2">Work Arrangements</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.work_arrangements.map(arr => <Badge key={arr} variant="outline">
                              {getWorkArrangementDisplay(arr)}
                            </Badge>)}
                        </div>
                      </div>}
                    {profile?.location_preferences && profile.location_preferences.length > 0 && <div>
                        <p className="text-sm font-medium mb-2">Location Preferences</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.location_preferences.map(pref => <Badge key={pref} variant="outline" className="gap-1">
                              <Globe className="h-3 w-3" />
                              {getLocationPreferenceDisplay(pref)}
                            </Badge>)}
                        </div>
                      </div>}
                    {profile?.start_timing && <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Available: {getStartTimingDisplay(profile.start_timing)}</span>
                      </div>}
                    {!profile?.work_arrangements && !profile?.location_preferences && <p className="text-sm text-muted-foreground">
                        Add your work preferences to help recruiters match you with opportunities
                      </p>}
                  </div>}
              </CardContent>
            </Card>

            {/* Work Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle>Work Categories</CardTitle>
                <CardDescription>Your areas of expertise</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-28" />
                  </div> : skills.length > 0 ? <div className="flex flex-wrap gap-2">
                    {skills.map(skill => <Badge key={skill.id} variant="default">
                        {skill.skill_name}
                      </Badge>)}
                  </div> : <p className="text-sm text-muted-foreground">
                    Add your work categories to help recruiters find you
                  </p>}
              </CardContent>
            </Card>

            {/* Compensation Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Compensation Expectations
                  </CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                </div>
                <CardDescription>Hourly rate (USD)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-40" /> : <>
                    {formatSalary(profile?.desired_salary_min || null, profile?.desired_salary_max || null) ? <p className="text-2xl font-semibold">
                        {formatSalary(profile?.desired_salary_min || null, profile?.desired_salary_max || null)}
                      </p> : <p className="text-sm text-muted-foreground">
                        Add your desired hourly rate
                      </p>}
                  </>}
              </CardContent>
            </Card>

            {/* Resume Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-12 w-full" /> : resume ? <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{resume.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resume.file_size ? `${(resume.file_size / 1024).toFixed(0)} KB` : ""}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(resume.file_url, "_blank")}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div> : <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No resume uploaded yet
                    </p>
                    <Button variant="outline" onClick={() => navigate("/talent/profile#resume")}>
                      Upload Resume
                    </Button>
                  </div>}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>More features coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button 
                  onClick={() => navigate("/opportunities")}
                  className="rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <h4 className="font-medium mb-1">View Opportunities</h4>
                  <p className="text-sm text-muted-foreground">Browse matching positions</p>
                  <Badge variant="default" className="mt-2">Available Now</Badge>
                </button>
                <div className="rounded-lg border p-4 opacity-60">
                  <h4 className="font-medium mb-1">Track Applications</h4>
                  <p className="text-sm text-muted-foreground">See your application status</p>
                  <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                </div>
                <div className="rounded-lg border p-4 opacity-60">
                  <h4 className="font-medium mb-1">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Track your profile views</p>
                  <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Vetting Challenge Modal */}
        <VettingChallengeDrawer
          isOpen={isVettingDrawerOpen}
          onClose={() => setIsVettingDrawerOpen(false)}
        />
    </div>;
};
export default TalentDashboard;