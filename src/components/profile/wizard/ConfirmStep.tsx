import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Eye, Rocket } from "lucide-react";

interface ConfirmStepProps {
  onBack: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function ConfirmStep({ onBack, onFinish, isLoading }: ConfirmStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold">Your Profile is Ready!</h3>
        <p className="text-base text-muted-foreground">
          Welcome to <span className="text-primary font-semibold">CongratsAI</span>. You've successfully created your talent profile.
          Head to your dashboard to see your status and discover the next steps to get matched.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Profile Created</p>
                <p className="text-sm text-muted-foreground">Your information has been saved</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Next Up</p>
                <p className="text-sm text-muted-foreground">Look for the "Vetting Challenge" on your dashboard to get ranked and noticed by employers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Rocket className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Get Started</p>
                <p className="text-sm text-muted-foreground">Explore your new career hub</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Completing..." : "Go to My Dashboard"}
        </Button>
      </div>
    </div>
  );
}
