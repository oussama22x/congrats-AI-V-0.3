import { useState } from "react";
import { useTalentProfile } from "@/hooks/useTalentProfile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Lock, AlertCircle } from "lucide-react";
import { salaryRanges, experienceLevelLabels, getFeedbackForRate } from "@/lib/salaryRanges";

export function CompensationEditor() {
  const { profile, updateProfile, isUpdating } = useTalentProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get recommended range for user's experience level
  const experienceLevel = profile?.experience_level || "mid-level";
  const recommendedRange = salaryRanges[experienceLevel] || salaryRanges["mid-level"];
  
  // Convert stored annual values to hourly for display
  const [hourlyMin, setHourlyMin] = useState(profile?.desired_salary_min ? Math.round(profile.desired_salary_min / 2080) : recommendedRange.min);
  const [hourlyMax, setHourlyMax] = useState(profile?.desired_salary_max ? Math.round(profile.desired_salary_max / 2080) : recommendedRange.max);
  
  // Get dynamic feedback
  const feedback = getFeedbackForRate(0, experienceLevel, hourlyMin, hourlyMax);

  const handleSave = () => {
    // Convert hourly back to annual for storage
    updateProfile({
      desired_salary_min: hourlyMin * 2080,
      desired_salary_max: hourlyMax * 2080,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setHourlyMin(profile?.desired_salary_min ? Math.round(profile.desired_salary_min / 2080) : recommendedRange.min);
    setHourlyMax(profile?.desired_salary_max ? Math.round(profile.desired_salary_max / 2080) : recommendedRange.max);
    setIsEditing(false);
  };

  const useRecommendedRange = () => {
    setHourlyMin(recommendedRange.min);
    setHourlyMax(recommendedRange.max);
  };

  const formatHourly = (value: number) => {
    return `$${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compensation Expectations</CardTitle>
            <CardDescription>Your desired hourly rate (USD)</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hourly Rate Range (USD)</Label>
              <div className="text-sm font-medium">
                {formatHourly(isEditing ? hourlyMin : (profile?.desired_salary_min ? Math.round(profile.desired_salary_min / 2080) : 0))}/hour - {formatHourly(isEditing ? hourlyMax : (profile?.desired_salary_max ? Math.round(profile.desired_salary_max / 2080) : 0))}/hour
              </div>
            </div>

            {isEditing && (
              <div className="space-y-6 pt-4">
                {/* Experience Level & Recommended Range */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Experience Level: {experienceLevelLabels[experienceLevel]}</p>
                      <p className="text-xs text-muted-foreground">Recommended range: ${recommendedRange.min}-${recommendedRange.max}/hour</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={useRecommendedRange}
                    >
                      Use Recommended
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-medium">{formatHourly(hourlyMin)}/hour</span>
                  </div>
                  <Slider
                    value={[hourlyMin]}
                    onValueChange={([value]) => setHourlyMin(value)}
                    min={1}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maximum</span>
                    <span className="font-medium">{formatHourly(hourlyMax)}/hour</span>
                  </div>
                  <Slider
                    value={[hourlyMax]}
                    onValueChange={([value]) => setHourlyMax(value)}
                    min={1}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Dynamic Feedback */}
                <div className={`rounded-lg p-4 ${
                  feedback.variant === "warning" ? "bg-amber-500/10 border border-amber-500/20" : 
                  feedback.variant === "success" ? "bg-emerald-500/10 border border-emerald-500/20" :
                  "bg-muted/50"
                }`}>
                  <div className="flex gap-2">
                    {feedback.variant === "warning" && <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <p className="text-sm text-muted-foreground">
                      {feedback.variant === "warning" ? "⚠️" : "💡"} {feedback.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-2xl font-semibold">
                  {formatHourly(profile?.desired_salary_min ? Math.round(profile.desired_salary_min / 2080) : 0)} - {formatHourly(profile?.desired_salary_max ? Math.round(profile.desired_salary_max / 2080) : 0)} per hour
                </p>
                <p className="text-sm text-muted-foreground mt-1">Hourly rate (USD)</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Compensation
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={isUpdating || hourlyMin >= hourlyMax}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>

          {isEditing && hourlyMin >= hourlyMax && (
            <p className="text-sm text-destructive">Minimum rate must be less than maximum</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
