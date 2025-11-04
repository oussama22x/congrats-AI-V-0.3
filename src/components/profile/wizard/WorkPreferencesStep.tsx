import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeMultiSelect } from "./BadgeMultiSelect";
import { LOCATION_PREFERENCES } from "@/lib/locationPreferences";
import { WORK_ARRANGEMENTS } from "@/lib/workArrangements";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";

interface WorkPreferencesStepProps {
  defaultValues: {
    work_arrangements: string[];
    location_preferences: string[];
    current_city: string;
    current_country: string;
    start_timing: string;
  };
  onNext: (data: WorkPreferencesStepProps["defaultValues"]) => void;
  onBack: () => void;
}

// Work arrangements and location preferences now use centralized constants
const workArrangementOptions = WORK_ARRANGEMENTS;
const locationOptions = LOCATION_PREFERENCES;

const startTimingOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "within-3-months", label: "Within 3 months" },
  { value: "within-6-months", label: "Within 6 months" },
  { value: "just-exploring", label: "Just exploring" },
];

export function WorkPreferencesStep({ defaultValues, onNext, onBack }: WorkPreferencesStepProps) {
  const [workArrangements, setWorkArrangements] = useState<string[]>(defaultValues.work_arrangements || []);
  const [locationPreferences, setLocationPreferences] = useState<string[]>(defaultValues.location_preferences || []);
  const [currentCity, setCurrentCity] = useState(defaultValues.current_city || "");
  const [currentCountry, setCurrentCountry] = useState(defaultValues.current_country || "");
  const [startTiming, setStartTiming] = useState(defaultValues.start_timing || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryOpen, setCountryOpen] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (workArrangements.length === 0) newErrors.workArrangements = "Select at least one";
    if (locationPreferences.length === 0) newErrors.locationPreferences = "Select at least one";
    if (!currentCity.trim()) newErrors.currentCity = "City is required";
    if (!currentCountry) newErrors.currentCountry = "Country is required";
    if (!startTiming) newErrors.startTiming = "Please select when you can start";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    
    onNext({
      work_arrangements: workArrangements,
      location_preferences: locationPreferences,
      current_city: currentCity,
      current_country: currentCountry,
      start_timing: startTiming,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Work Preferences</h2>
        <p className="text-muted-foreground">
          Tell us about your ideal work arrangement
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Work Arrangements</Label>
          <div className="mt-2">
            <BadgeMultiSelect
              options={workArrangementOptions}
              selected={workArrangements}
              onChange={setWorkArrangements}
            />
          </div>
          {errors.workArrangements && (
            <p className="text-sm text-destructive mt-1">{errors.workArrangements}</p>
          )}
        </div>

        <div>
          <Label>Location Preferences</Label>
          <div className="mt-2">
            <BadgeMultiSelect
              options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              selected={locationPreferences}
              onChange={setLocationPreferences}
            />
          </div>
          {errors.locationPreferences && (
            <p className="text-sm text-destructive mt-1">{errors.locationPreferences}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Current Country</Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between mt-2"
                >
                  {currentCountry
                    ? countries.find((country) => country.name === currentCountry)?.name
                    : "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={(currentValue) => {
                            setCurrentCountry(currentValue === currentCountry ? "" : currentValue);
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currentCountry === country.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.currentCountry && (
              <p className="text-sm text-destructive mt-1">{errors.currentCountry}</p>
            )}
          </div>
          <div>
            <Label>Current City</Label>
            <Input
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="e.g. Nairobi"
              className="mt-2"
            />
            {errors.currentCity && (
              <p className="text-sm text-destructive mt-1">{errors.currentCity}</p>
            )}
          </div>
        </div>

        <div>
          <Label>When can you start?</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {startTimingOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={startTiming === option.value ? "default" : "outline"}
                onClick={() => setStartTiming(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {errors.startTiming && (
            <p className="text-sm text-destructive mt-1">{errors.startTiming}</p>
          )}
        </div>
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
