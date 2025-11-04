import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeMultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function BadgeMultiSelect({ options, selected, onChange }: BadgeMultiSelectProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Badge
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-all",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
