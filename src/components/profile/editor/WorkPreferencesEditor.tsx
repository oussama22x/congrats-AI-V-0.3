import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { useTalentSkills } from "@/hooks/useTalentSkills";
import { useSkillsManagement } from "@/hooks/useSkillsManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeMultiSelect } from "@/components/profile/wizard/BadgeMultiSelect";
import { JobTitleMultiSelect } from "@/components/ui/job-title-multi-select";
import { LOCATION_PREFERENCES } from "@/lib/locationPreferences";
import { WORK_ARRANGEMENTS } from "@/lib/workArrangements";
import { countries } from "@/lib/countries";
import { workCategoryOptions } from "@/lib/workCategories";

const workPreferencesSchema = z.object({
  experience_level: z.string().optional(),
  desired_roles: z.array(z.string()).optional(),
  work_arrangements: z.array(z.string()).optional(),
  location_preferences: z.array(z.string()).optional(),
  current_city: z.string().optional(),
  current_country: z.string().optional(),
  start_timing: z.string().optional(),
});

type WorkPreferencesFormData = z.infer<typeof workPreferencesSchema>;

// Work arrangements and location preferences now use centralized constants
const workArrangementOptions = WORK_ARRANGEMENTS;
const locationOptions = LOCATION_PREFERENCES;

const startTimingOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "within-3-months", label: "Within 3 months" },
  { value: "within-6-months", label: "Within 6 months" },
  { value: "just-exploring", label: "Just exploring" },
];

export function WorkPreferencesEditor() {
  const { profile, updateProfile, isUpdating, isLoading } = useTalentProfile();
  const { skills } = useTalentSkills();
  const { addSkill, removeSkill } = useSkillsManagement();
  const [isEditing, setIsEditing] = useState(false);
  const [workArrangements, setWorkArrangements] = useState<string[]>(profile?.work_arrangements || []);
  const [locationPrefs, setLocationPrefs] = useState<string[]>(profile?.location_preferences || []);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<WorkPreferencesFormData>({
    resolver: zodResolver(workPreferencesSchema),
    defaultValues: {
      experience_level: profile?.experience_level || "",
      desired_roles: profile?.desired_roles || [],
      work_arrangements: profile?.work_arrangements || [],
      location_preferences: profile?.location_preferences || [],
      current_city: profile?.current_city || "",
      current_country: profile?.current_country || "",
      start_timing: profile?.start_timing || "",
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        experience_level: profile.experience_level || "",
        desired_roles: profile.desired_roles || [],
        work_arrangements: profile.work_arrangements || [],
        location_preferences: profile.location_preferences || [],
        current_city: profile.current_city || "",
        current_country: profile.current_country || "",
        start_timing: profile.start_timing || "",
      });
      // Update local state for BadgeMultiSelect components
      setWorkArrangements(profile.work_arrangements || []);
      setLocationPrefs(profile.location_preferences || []);
    }
  }, [profile, reset]);

  const onSubmit = (data: WorkPreferencesFormData) => {
    const payload = {
      ...data,
      work_arrangements: workArrangements,
      location_preferences: locationPrefs,
    };
    updateProfile(payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setWorkArrangements(profile?.work_arrangements || []);
    setLocationPrefs(profile?.location_preferences || []);
  };

  const handleCategoryChange = (values: string[]) => {
    const currentCategories = skills.map(s => s.skill_name);
    
    // Add new categories
    values.forEach(category => {
      if (!currentCategories.includes(category)) {
        addSkill(category);
      }
    });
    
    // Remove deselected categories
    currentCategories.forEach(category => {
      if (!values.includes(category)) {
        const skillToRemove = skills.find(s => s.skill_name === category);
        if (skillToRemove) {
          removeSkill(skillToRemove.id);
        }
      }
    });
  };

  const currentCategories = skills.map(s => s.skill_name);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Work Categories Card */}
      <Card>
        <CardHeader>
          <CardTitle>Work Categories</CardTitle>
          <CardDescription>
            Select the work areas you have experience in or are interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeMultiSelect
            options={workCategoryOptions}
            selected={currentCategories}
            onChange={handleCategoryChange}
          />
        </CardContent>
      </Card>

      {/* Work Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Work Preferences</CardTitle>
          <CardDescription>
            Manage your work arrangements, location preferences, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                disabled={!isEditing}
                value={watch("experience_level") || ""}
                onValueChange={(value) => setValue("experience_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto bg-popover z-50">
                  <SelectItem value="emerging-talent">Emerging Talent (0-1 years)</SelectItem>
                  <SelectItem value="entry-level">Entry Level (1-2 years)</SelectItem>
                  <SelectItem value="mid-level">Mid-Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                  <SelectItem value="expert">Expert (10+ years)</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience_level && (
                <p className="text-sm text-destructive">{errors.experience_level.message}</p>
              )}
            </div>

            {/* Target Job Titles */}
            <div className="space-y-2">
              <Label htmlFor="desired_roles">Target Job Titles</Label>
              <JobTitleMultiSelect
                value={watch("desired_roles") || []}
                onChange={(value) => setValue("desired_roles", value)}
                disabled={!isEditing}
                placeholder="Select or type your target job titles..."
                maxSelections={5}
              />
              <p className="text-xs text-muted-foreground">
                💡 Select up to 5 specific roles you're targeting. You can choose from the list or add custom titles.
              </p>
              {errors.desired_roles && (
                <p className="text-sm text-destructive">{errors.desired_roles.message}</p>
              )}
            </div>

            {/* Work Arrangements */}
            <div className="space-y-2">
              <Label>Work Arrangements</Label>
              <BadgeMultiSelect
                options={workArrangementOptions}
                selected={workArrangements}
                onChange={setWorkArrangements}
              />
            </div>

            {/* Location Preferences */}
            <div className="space-y-2">
              <Label>Location Preferences</Label>
              <BadgeMultiSelect
                options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                selected={locationPrefs}
                onChange={setLocationPrefs}
              />
            </div>

            {/* Current Country */}
            <div className="space-y-2">
              <Label htmlFor="current_country">Current Country</Label>
              <Select
                disabled={!isEditing}
                value={watch("current_country") || ""}
                onValueChange={(value) => setValue("current_country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto bg-popover z-50">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.current_country && (
                <p className="text-sm text-destructive">{errors.current_country.message}</p>
              )}
            </div>

            {/* Current City */}
            <div className="space-y-2">
              <Label htmlFor="current_city">Current City</Label>
              <Input
                id="current_city"
                disabled={!isEditing}
                {...register("current_city")}
                placeholder="e.g., San Francisco"
              />
              {errors.current_city && (
                <p className="text-sm text-destructive">{errors.current_city.message}</p>
              )}
            </div>

            {/* Start Timing */}
            <div className="space-y-2">
              <Label htmlFor="start_timing">When Can You Start?</Label>
              <Select
                disabled={!isEditing}
                value={watch("start_timing") || ""}
                onValueChange={(value) => setValue("start_timing", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto bg-popover z-50">
                  {startTimingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.start_timing && (
                <p className="text-sm text-destructive">{errors.start_timing.message}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
            {!isEditing && (
              <div className="flex gap-2 pt-4">
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Preferences
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
