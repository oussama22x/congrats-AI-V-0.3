import { z } from "zod";

// Step 1: Name
export const nameSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name is too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
});

// Step 2: LinkedIn Profile
export const linkedInSchema = z.object({
  linkedin_url: z.string().min(1, "LinkedIn URL is required").url("Please enter a valid LinkedIn URL"),
});

// Step 2: Work Categories (stored in talent_skills)
export const categoriesSchema = z.object({
  categories: z.array(z.string()).min(1, "Please select at least one category"),
});

// Step 3: Experience Level
export const experienceLevelSchema = z.object({
  experience_level: z.enum(["entry", "mid-level", "senior", "expert"], {
    required_error: "Please select your experience level",
  }),
});

// Step 4: Target Job Titles (Multi-select, max 5)
export const currentRoleSchema = z.object({
  desired_roles: z
    .array(z.string())
    .min(1, "Select at least one target job title")
    .max(5, "You can select up to 5 target job titles"),
});

// Step 5: Work Preferences
export const workPreferencesSchema = z.object({
  work_arrangements: z.array(z.string()).min(1, "Select at least one work arrangement"),
  location_preferences: z.array(z.string()).min(1, "Select at least one location preference"),
  current_city: z.string().min(1, "City is required"),
  current_country: z.string().min(1, "Country is required"),
  start_timing: z.string().min(1, "Please select when you can start"),
});

// Step 6: Salary
export const salarySchema = z.object({
  desired_salary: z.coerce.number().min(1000, "Salary must be at least $1,000").max(1000000, "Salary seems too high"),
});

// Combined schema for full profile
export const fullProfileSchema = nameSchema
  .merge(linkedInSchema)
  .merge(experienceLevelSchema)
  .merge(currentRoleSchema)
  .merge(workPreferencesSchema)
  .merge(salarySchema);

export type NameFormData = z.infer<typeof nameSchema>;
export type LinkedInFormData = z.infer<typeof linkedInSchema>;
export type CategoriesFormData = z.infer<typeof categoriesSchema>;
export type ExperienceLevelFormData = z.infer<typeof experienceLevelSchema>;
export type CurrentRoleFormData = z.infer<typeof currentRoleSchema>;
export type WorkPreferencesFormData = z.infer<typeof workPreferencesSchema>;
export type SalaryFormData = z.infer<typeof salarySchema>;
export type FullProfileFormData = z.infer<typeof fullProfileSchema>;
