import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const basicInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().max(20).optional(),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

export function BasicInfoEditor() {
  const { profile, updateProfile, isUpdating, isLoading } = useTalentProfile();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      phone: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                disabled={!isEditing}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                disabled={!isEditing}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              disabled={!isEditing}
              placeholder="Tell us about yourself and your career goals..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              💡 To update your location (city/country), please use the <strong>Work Preferences</strong> tab.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              disabled={!isEditing}
              placeholder="+254 700 000000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              {...register("linkedin_url")}
              disabled={!isEditing}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedin_url && (
              <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL (Optional)</Label>
            <Input
              id="github_url"
              {...register("github_url")}
              disabled={!isEditing}
              placeholder="https://github.com/yourusername"
            />
            {errors.github_url && (
              <p className="text-sm text-destructive">{errors.github_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL (Optional)</Label>
            <Input
              id="portfolio_url"
              {...register("portfolio_url")}
              disabled={!isEditing}
              placeholder="https://yourportfolio.com"
            />
            {errors.portfolio_url && (
              <p className="text-sm text-destructive">{errors.portfolio_url.message}</p>
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
        </form>
        
        {!isEditing && (
          <div className="flex gap-2 pt-4">
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Information
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
