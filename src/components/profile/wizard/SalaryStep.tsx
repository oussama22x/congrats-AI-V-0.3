import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { salaryRanges, getFeedbackForRate } from "@/lib/salaryRanges";

interface SalaryStepProps {
  defaultValue: number | null;
  experienceLevel: string | null;
  onBack: () => void;
  onFinish: (salary: number) => void;
}

export function SalaryStep({ defaultValue, experienceLevel, onBack, onFinish }: SalaryStepProps) {
  const range = salaryRanges[experienceLevel || "mid-level"] || salaryRanges["mid-level"];
  
  // Convert stored annual salary to hourly, or use default
  const initialHourlyRate = defaultValue ? Math.round(defaultValue / 2080) : range.default;
  const [hourlyRate, setHourlyRate] = useState(initialHourlyRate);

  const formatHourlyRate = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const feedback = getFeedbackForRate(hourlyRate, experienceLevel);

  const handleFinish = () => {
    // Convert hourly rate to annual salary (hourly × 2080 hours/year)
    const annualSalary = hourlyRate * 2080;
    onFinish(annualSalary);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Compensation Expectations</h2>
        <p className="text-muted-foreground">
          What is your expected hourly rate?
        </p>
        <p className="text-sm font-medium text-primary">All rates are in USD ($)</p>
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {formatHourlyRate(hourlyRate)}
          </div>
          <p className="text-sm text-muted-foreground">per hour</p>
        </div>

        <div className="px-4">
          <Label className="mb-4 block">Adjust your expected hourly rate</Label>
          <Slider
            value={[hourlyRate]}
            onValueChange={(values) => setHourlyRate(values[0])}
            min={range.min}
            max={range.max}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatHourlyRate(range.min)}</span>
            <span>{formatHourlyRate(range.max)}</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 {feedback.message}
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleFinish}>Next</Button>
      </div>
    </div>
  );
}
