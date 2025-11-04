import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectionCard({ icon, title, description, selected, onClick }: SelectionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02]",
        selected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-3">
        <div className={cn("text-muted-foreground", selected && "text-primary")}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
