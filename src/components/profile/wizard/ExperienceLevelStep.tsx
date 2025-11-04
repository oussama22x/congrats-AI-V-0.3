import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectionCard } from "./SelectionCard";
import { Sparkles, Briefcase, TrendingUp, Award, Star } from "lucide-react";

interface ExperienceLevelStepProps {
  defaultValue: string | null;
  onNext: (level: string) => void;
  onBack: () => void;
}

const experienceLevels = [
  {
    value: "emerging-talent",
    icon: <Sparkles className="h-8 w-8" />,
    title: "Emerging Talent",
    description: "Students, recent graduates, or early-career professionals (0–1 year of experience)",
  },
  {
    value: "entry-level",
    icon: <Briefcase className="h-8 w-8" />,
    title: "Entry Level",
    description: "Professionals with 1–2 years of full-time work experience",
  },
  {
    value: "mid-level",
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Mid-Level",
    description: "Independent contributors or early managers with 3–5 years of experience",
  },
  {
    value: "senior",
    icon: <Award className="h-8 w-8" />,
    title: "Senior",
    description: "Experienced leads or managers with 6–10 years of professional experience",
  },
  {
    value: "expert",
    icon: <Star className="h-8 w-8" />,
    title: "Expert",
    description: "Specialists, advisors, or executives with 10+ years of experience",
  },
];

export function ExperienceLevelStep({ defaultValue, onNext, onBack }: ExperienceLevelStepProps) {
  const [selected, setSelected] = useState<string | null>(defaultValue);
  const [error, setError] = useState<string>("");

  const handleNext = () => {
    if (!selected) {
      setError("Please select your experience level");
      return;
    }
    onNext(selected);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Experience Level</h2>
        <p className="text-muted-foreground">
          What best describes your current experience level?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experienceLevels.map((level) => (
          <SelectionCard
            key={level.value}
            icon={level.icon}
            title={level.title}
            description={level.description}
            selected={selected === level.value}
            onClick={() => {
              setSelected(level.value);
              setError("");
            }}
          />
        ))}
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
