import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { commonJobTitles } from "@/lib/jobTitles";

interface JobTitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function JobTitleAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = "Select or type a job title...",
}: JobTitleAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredTitles = React.useMemo(() => {
    if (!inputValue) return commonJobTitles.slice(0, 8);
    
    const searchTerm = inputValue.toLowerCase();
    return commonJobTitles
      .filter((title) => title.toLowerCase().includes(searchTerm))
      .slice(0, 8);
  }, [inputValue]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or type your own..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-2 px-2 text-sm">
                <div className="font-medium">Use custom title:</div>
                <div className="text-muted-foreground mt-1">"{inputValue}"</div>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                  }}
                >
                  Use this title
                </Button>
              </div>
            </CommandEmpty>
            {filteredTitles.length > 0 && (
              <CommandGroup>
                {filteredTitles.map((title) => (
                  <CommandItem
                    key={title}
                    value={title}
                    onSelect={() => handleSelect(title)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === title ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
