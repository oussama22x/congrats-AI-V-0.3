import * as React from "react";
import { Check, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { commonJobTitles } from "@/lib/jobTitles";

interface JobTitleMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
}

export function JobTitleMultiSelect({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Select target job titles...",
  maxSelections = 5,
}: JobTitleMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const filteredTitles = React.useMemo(() => {
    if (!inputValue) return commonJobTitles.slice(0, 8);
    
    const lowerInput = inputValue.toLowerCase();
    return commonJobTitles
      .filter((title) => title.toLowerCase().includes(lowerInput))
      .slice(0, 8);
  }, [inputValue]);

  const handleSelect = (selectedTitle: string) => {
    if (value.includes(selectedTitle)) {
      // Remove if already selected
      onChange(value.filter((title) => title !== selectedTitle));
    } else if (value.length < maxSelections) {
      // Add if under max limit
      onChange([...value, selectedTitle]);
      setInputValue("");
    }
  };

  const handleAddCustom = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !value.includes(trimmedInput) && value.length < maxSelections) {
      onChange([...value, trimmedInput]);
      setInputValue("");
    }
  };

  const handleRemove = (titleToRemove: string) => {
    onChange(value.filter((title) => title !== titleToRemove));
  };

  const canAddMore = value.length < maxSelections;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || !canAddMore}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value.length && "text-muted-foreground"
            )}
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
            {!canAddMore && <span className="ml-2 text-xs">(Max {maxSelections})</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-popover z-50" align="start">
          <Command>
            <CommandInput
              placeholder="Search or type custom title..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              <div className="p-2 text-center text-sm">
                {inputValue.trim() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddCustom}
                    disabled={!canAddMore}
                  >
                    Add "{inputValue.trim()}"
                  </Button>
                ) : (
                  "No job titles found"
                )}
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredTitles.map((title) => {
                const isSelected = value.includes(title);
                return (
                  <CommandItem
                    key={title}
                    value={title}
                    onSelect={() => handleSelect(title)}
                    disabled={!isSelected && !canAddMore}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected titles display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((title) => (
            <Badge key={title} variant="secondary" className="pl-2 pr-1">
              {title}
              <button
                type="button"
                onClick={() => handleRemove(title)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} of {maxSelections} selected
        </p>
      )}
    </div>
  );
}
