import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { JobTitleMultiSelect } from "@/components/ui/job-title-multi-select";
import { currentRoleSchema, type CurrentRoleFormData } from "@/lib/profileWizardSchema";
import { Briefcase } from "lucide-react";

interface CurrentRoleStepProps {
  defaultValues: Partial<CurrentRoleFormData>;
  onNext: (data: CurrentRoleFormData) => void;
  onBack: () => void;
}

export function CurrentRoleStep({ defaultValues, onNext, onBack }: CurrentRoleStepProps) {
  const form = useForm<CurrentRoleFormData>({
    resolver: zodResolver(currentRoleSchema),
    defaultValues,
  });

  const handleNext = (data: CurrentRoleFormData) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">Target Job Titles</h2>
          <p className="text-muted-foreground">
            Select up to 5 specific roles you're targeting
          </p>
        </div>

        <FormField
          control={form.control}
          name="desired_roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Job Titles</FormLabel>
              <FormControl>
                <JobTitleMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select or type your target job titles..."
                  maxSelections={5}
                />
              </FormControl>
              <FormDescription className="text-xs">
                💡 Select up to 5 specific roles you're targeting. You can choose from the list or add custom titles.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
