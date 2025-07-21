
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { specialties } from '@/data/doctorSpecialties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface DoctorFilterSidebarProps {
  filters: {
    specialty: string;
    location: string;
    experience: number;
  };
  onFilterChange: (filters: any) => void;
}

export const DoctorFilterSidebar: React.FC<DoctorFilterSidebarProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const handleSpecialtySelect = (specialty: string) => {
    onFilterChange({ specialty });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: e.target.value });
  };

  const handleExperienceChange = (value: number[]) => {
    onFilterChange({ experience: value[0] });
  };

  const handleClearFilters = () => {
    onFilterChange({
      specialty: '',
      location: '',
      experience: 0
    });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Filters</CardTitle>
          {(filters.specialty || filters.location || filters.experience > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="City or hospital name"
              className="pl-8"
              value={filters.location}
              onChange={handleLocationChange}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Experience (Years)</Label>
          <Slider
            defaultValue={[filters.experience]}
            max={30}
            step={1}
            value={[filters.experience]}
            onValueChange={handleExperienceChange}
          />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">0 years</span>
            <span className="text-sm font-medium">
              {filters.experience > 0 ? `${filters.experience}+ years` : 'Any'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Specialty</Label>
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, 10).map((specialty) => (
              <Badge
                key={specialty}
                variant={filters.specialty === specialty ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSpecialtySelect(
                  filters.specialty === specialty ? '' : specialty
                )}
              >
                {specialty}
              </Badge>
            ))}
          </div>
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm text-muted-foreground"
            onClick={() => {}}
          >
            Show more
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
