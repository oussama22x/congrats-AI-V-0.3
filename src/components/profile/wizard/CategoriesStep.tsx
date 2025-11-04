import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeMultiSelect } from "./BadgeMultiSelect";
import { Layers } from "lucide-react";
import { workCategoryOptions } from "@/lib/workCategories";

interface CategoriesStepProps {
  defaultValues: string[];
  onNext: (categories: string[]) => void;
  onBack: () => void;
}

export function CategoriesStep({ defaultValues, onNext, onBack }: CategoriesStepProps) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [error, setError] = useState<string>("");

  const handleNext = () => {
    if (selected.length === 0) {
      setError("Please select at least one category");
      return;
    }
    onNext(selected);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Work Categories</h2>
        <p className="text-muted-foreground">
          Select the areas you have experience in or are interested in
        </p>
      </div>

      <div>
        <BadgeMultiSelect options={workCategoryOptions} selected={selected} onChange={setSelected} />
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
