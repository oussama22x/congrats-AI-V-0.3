export interface SalaryRange {
  min: number;
  max: number;
  default: number;
}

export const salaryRanges: Record<string, SalaryRange> = {
  "emerging-talent": { min: 1, max: 15, default: 5 },
  "entry-level": { min: 10, max: 40, default: 15 },
  "mid-level": { min: 25, max: 75, default: 40 },
  "senior": { min: 40, max: 120, default: 60 },
  "expert": { min: 60, max: 200, default: 80 },
};

export const experienceLevelLabels: Record<string, string> = {
  "emerging-talent": "Emerging Talent",
  "entry-level": "Entry Level",
  "mid-level": "Mid-Level",
  "senior": "Senior",
  "expert": "Expert",
};

export function getFeedbackForRate(
  hourlyRate: number,
  experienceLevel: string | null,
  hourlyMin?: number,
  hourlyMax?: number
): { message: string; variant: "info" | "warning" | "success" } {
  const range = salaryRanges[experienceLevel || "mid-level"] || salaryRanges["mid-level"];
  const label = experienceLevelLabels[experienceLevel || "mid-level"] || "your experience level";
  const midpoint = (range.min + range.max) / 2;
  
  // If checking a range
  if (hourlyMin !== undefined && hourlyMax !== undefined) {
    const avgRate = (hourlyMin + hourlyMax) / 2;
    
    if (hourlyMax > range.max) {
      return {
        message: `Your maximum rate is above typical range for ${label} (${range.min}-${range.max}/hour). This may limit your match opportunities.`,
        variant: "warning"
      };
    } else if (hourlyMin < range.min) {
      return {
        message: `Your minimum rate is below typical range for ${label} (${range.min}-${range.max}/hour).`,
        variant: "info"
      };
    } else if (avgRate > midpoint) {
      return {
        message: `Your range is competitive for ${label} professionals.`,
        variant: "success"
      };
    } else {
      return {
        message: `Your range aligns well with ${label} market rates.`,
        variant: "success"
      };
    }
  }
  
  // Single rate feedback
  if (hourlyRate < midpoint) {
    return {
      message: `This is a competitive rate for ${label}`,
      variant: "info"
    };
  } else if (hourlyRate > midpoint + (range.max - range.min) * 0.25) {
    return {
      message: `This is above market average for ${label}`,
      variant: "warning"
    };
  } else {
    return {
      message: `This is a strong rate for ${label}`,
      variant: "success"
    };
  }
}
