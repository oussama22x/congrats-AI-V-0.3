import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { useTalentSkills } from "@/hooks/useTalentSkills";
import { useSmartWizard } from "@/hooks/useSmartWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NameStep } from "@/components/profile/wizard/NameStep";
import { LinkedInStep } from "@/components/profile/wizard/LinkedInStep";
import { CategoriesStep } from "@/components/profile/wizard/CategoriesStep";
import { ExperienceLevelStep } from "@/components/profile/wizard/ExperienceLevelStep";
import { CurrentRoleStep } from "@/components/profile/wizard/CurrentRoleStep";
import { WorkPreferencesStep } from "@/components/profile/wizard/WorkPreferencesStep";
import { SalaryStep } from "@/components/profile/wizard/SalaryStep";
import { ResumeStep } from "@/components/profile/wizard/ResumeStep";
import { ConfirmStep } from "@/components/profile/wizard/ConfirmStep";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const TOTAL_STEPS = 9;

const stepTitles: Record<WizardStep, string> = {
  1: "Your Name",
  2: "LinkedIn Profile",
  3: "Work Categories",
  4: "Experience Level",
  5: "Target Job Titles",
  6: "Work Preferences",
  7: "Salary Expectations",
  8: "Upload Resume",
  9: "Complete Profile",
};

export default function ProfileWizard() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { profile, isLoading } = useTalentProfile();
  const { skills, isLoading: skillsLoading } = useTalentSkills();
  const {
    incompleteSteps,
    currentWizardStep,
    isFirstStep,
    isLastStep,
    goToNext,
    goToPrevious,
    progress: smartProgress,
    isLoading: wizardLoading,
    totalIncomplete,
    totalSteps,
  } = useSmartWizard();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    linkedin_url: "",
    categories: [] as string[],
    experience_level: null as string | null,
    desired_roles: [] as string[],
    work_arrangements: [] as string[],
    location_preferences: [] as string[],
    current_city: "",
    current_country: "",
    start_timing: "",
    desired_salary: 50000,
  });

  // Load existing profile data
  useEffect(() => {
    if (profile && !skillsLoading) {
      const categories = skills.map(s => s.skill_name);
      
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        linkedin_url: profile.linkedin_url || "",
        categories: categories,
        experience_level: profile.experience_level,
        desired_roles: profile.desired_roles || [],
        work_arrangements: profile.work_arrangements || [],
        location_preferences: profile.location_preferences || [],
        current_city: profile.current_city || "",
        current_country: profile.current_country || "",
        start_timing: profile.start_timing || "",
        desired_salary: profile.desired_salary_min || 50000,
      });
    }
  }, [profile, skills, skillsLoading]);

  const saveProgress = async (data: Partial<typeof formData>) => {
    if (!currentUser?.id) return;

    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({
          ...data,
          wizard_step: currentWizardStep,
        })
        .eq("user_id", currentUser.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  };

  const handleNameNext = async (data: { first_name: string; last_name: string }) => {
    setFormData({ ...formData, ...data });
    await saveProgress(data);
    goToNext();
  };

  const handleLinkedInNext = async (data: { linkedin_url?: string }) => {
    setFormData({ ...formData, ...data });
    await saveProgress(data);
    goToNext();
  };

  const handleCategoriesNext = async (categories: string[]) => {
    if (!currentUser?.id) return;
    
    setFormData({ ...formData, categories });
    
    // Save categories to talent_skills
    try {
      // Delete existing skills
      await supabase.from("talent_skills").delete().eq("user_id", currentUser.id);
      
      // Insert new skills
      const skillsData = categories.map((cat) => ({
        user_id: currentUser.id,
        skill_name: cat,
      }));
      
      await supabase.from("talent_skills").insert(skillsData);
    } catch (error) {
      console.error("Error saving categories:", error);
    }
    
    await saveProgress({});
    goToNext();
  };

  const handleCurrentRoleNext = async (data: { desired_roles: string[] }) => {
    setFormData({ ...formData, ...data });
    await saveProgress(data);
    goToNext();
  };

  const handleExperienceLevelNext = async (level: string) => {
    setFormData({ ...formData, experience_level: level });
    await saveProgress({ experience_level: level });
    goToNext();
  };

  const handleWorkPreferencesNext = async (data: {
    work_arrangements: string[];
    location_preferences: string[];
    current_city: string;
    current_country: string;
    start_timing: string;
  }) => {
    setFormData({ ...formData, ...data });
    await saveProgress(data);
    goToNext();
  };

  const handleSalaryNext = async (salary: number) => {
    if (!currentUser?.id) return;

    const salaryMin = Math.floor(salary * 0.9);
    const salaryMax = Math.ceil(salary * 1.1);

    setFormData({ ...formData, desired_salary: salary });
    
    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({
          desired_salary_min: salaryMin,
          desired_salary_max: salaryMax,
          wizard_step: currentWizardStep,
        })
        .eq("user_id", currentUser.id);

      if (error) throw error;
      goToNext();
    } catch (error) {
      console.error("Error saving salary:", error);
      toast.error("Failed to save salary");
    }
  };

  const handleResumeNext = async () => {
    await saveProgress({});
    goToNext();
  };

  const handleConfirmFinish = async () => {
    if (!currentUser?.id) return;

    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({
          onboarding_completed: true,
          is_profile_complete: true,
          wizard_step: 9,
        })
        .eq("user_id", currentUser.id);

      if (error) throw error;

      toast.success("Profile completed successfully!");
      navigate("/talent/dashboard");
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Failed to complete profile");
    }
  };

  // Redirect if profile is 100% complete
  useEffect(() => {
    if (!wizardLoading && smartProgress === 100 && profile?.onboarding_completed) {
      toast.success("Your profile is already complete!");
      navigate("/talent/dashboard");
    }
  }, [wizardLoading, smartProgress, profile?.onboarding_completed, navigate]);

  if (isLoading || skillsLoading || wizardLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all steps complete but not confirmed, show only Step 9
  const shouldRenderStep = (step: number) => {
    if (totalIncomplete === 0) {
      return step === 9;
    }
    return incompleteSteps.includes(step);
  };

  // Calculate current step position in incomplete steps array
  const currentStepIndex = incompleteSteps.indexOf(currentWizardStep);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Step {currentStepIndex + 1} of {totalIncomplete}: {stepTitles[currentWizardStep as WizardStep]}
          </CardDescription>
          <Progress value={smartProgress} className="mt-4" />
        </CardHeader>
        <CardContent className="pt-6">
          {shouldRenderStep(1) && currentWizardStep === 1 && (
            <NameStep
              defaultValues={{ first_name: formData.first_name, last_name: formData.last_name }}
              onNext={handleNameNext}
            />
          )}
          {shouldRenderStep(2) && currentWizardStep === 2 && (
            <LinkedInStep
              defaultValues={{ linkedin_url: formData.linkedin_url }}
              onNext={handleLinkedInNext}
            />
          )}
          {shouldRenderStep(3) && currentWizardStep === 3 && (
            <CategoriesStep
              defaultValues={formData.categories}
              onNext={handleCategoriesNext}
              onBack={goToPrevious}
            />
          )}
          {shouldRenderStep(4) && currentWizardStep === 4 && (
            <ExperienceLevelStep
              defaultValue={formData.experience_level}
              onNext={handleExperienceLevelNext}
              onBack={goToPrevious}
            />
          )}
          {shouldRenderStep(5) && currentWizardStep === 5 && (
            <CurrentRoleStep
              defaultValues={{ desired_roles: formData.desired_roles }}
              onNext={handleCurrentRoleNext}
              onBack={goToPrevious}
            />
          )}
          {shouldRenderStep(6) && currentWizardStep === 6 && (
            <WorkPreferencesStep
              defaultValues={{
                work_arrangements: formData.work_arrangements,
                location_preferences: formData.location_preferences,
                current_city: formData.current_city,
                current_country: formData.current_country,
                start_timing: formData.start_timing,
              }}
              onNext={handleWorkPreferencesNext}
              onBack={goToPrevious}
            />
          )}
          {shouldRenderStep(7) && currentWizardStep === 7 && (
            <SalaryStep
              defaultValue={formData.desired_salary}
              experienceLevel={formData.experience_level}
              onBack={goToPrevious}
              onFinish={handleSalaryNext}
            />
          )}
          {shouldRenderStep(8) && currentWizardStep === 8 && (
            <ResumeStep
              onBack={goToPrevious}
              onFinish={handleResumeNext}
            />
          )}
          {shouldRenderStep(9) && currentWizardStep === 9 && (
            <ConfirmStep
              onBack={goToPrevious}
              onFinish={handleConfirmFinish}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
