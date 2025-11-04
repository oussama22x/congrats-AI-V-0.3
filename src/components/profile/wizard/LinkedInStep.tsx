import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { linkedInSchema, type LinkedInFormData } from "@/lib/profileWizardSchema";
import { Linkedin } from "lucide-react";

interface LinkedInStepProps {
  defaultValues: Partial<LinkedInFormData>;
  onNext: (data: LinkedInFormData) => void;
}

export function LinkedInStep({ defaultValues, onNext }: LinkedInStepProps) {
  const form = useForm<LinkedInFormData>({
    resolver: zodResolver(linkedInSchema),
    defaultValues,
  });

  const handleNext = (data: LinkedInFormData) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Linkedin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">LinkedIn Profile</h2>
          <p className="text-muted-foreground">
            Your LinkedIn profile is required to help recruiters learn more about you
          </p>
        </div>

        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
