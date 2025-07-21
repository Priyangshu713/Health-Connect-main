import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doctor } from '@/types/doctor';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DoctorScheduleProps {
  doctor: Doctor;
  onRequestConsultation?: (date: Date) => void;
}

export const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ doctor, onRequestConsultation }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Map doctor availability days to dates for the next 2 weeks
  const availableDates = React.useMemo(() => {
    const dates: Date[] = [];
    
    // If doctor has availability info, use it
    if (doctor.availability?.days && doctor.availability.days.length > 0) {
      const dayMapping: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      
      // Generate dates for the next 4 weeks
      for (let i = 1; i <= 28; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Check if the day of week is in the doctor's available days
        const dayOfWeek = date.getDay();
        const dayName = Object.keys(dayMapping).find(key => dayMapping[key] === dayOfWeek);
        
        if (dayName && doctor.availability?.days.includes(dayName)) {
          dates.push(date);
        }
      }
      
      return dates;
    }
    
    // Fallback to sample data if no availability info
    return [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
    ];
  }, [doctor.availability, today]);
  
  // Format office hours based on doctor's availability or use default
  const officeHours = React.useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    if (doctor.availability?.days) {
      return days.map(day => {
        const isAvailable = doctor.availability?.days.includes(day.toLowerCase());
        return {
          day,
          hours: isAvailable ? (doctor.availability?.hours || '9:00 AM - 5:00 PM') : 'Closed'
        };
      });
    }
    
    // Fallback to sample data
    return [
      { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 12:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 3:00 PM' },
      { day: 'Saturday', hours: 'Closed' },
      { day: 'Sunday', hours: 'Closed' },
    ];
  }, [doctor.availability]);

  // Custom modifiers to highlight available dates
  const modifiers = {
    available: availableDates
  };

  const modifiersStyles = {
    available: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: 'rgb(22, 163, 74)',
      fontWeight: '500' as const
    }
  };

  // Function to handle requesting a consultation
  const handleRequestConsultation = () => {
    if (selectedDate && onRequestConsultation) {
      onRequestConsultation(selectedDate);
    }
  };

  // Determine if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Check if the date is before today
    if (date < today) {
      return true;
    }
    
    // Check if the date is in the available dates
    return !availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() && 
      availableDate.getMonth() === date.getMonth() && 
      availableDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card id="schedule-section">
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>
            Select a date to request an appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={isDateDisabled}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
          
          <div className="mt-6 flex flex-col space-y-4">
            {selectedDate ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Date selected: {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                  </p>
                  <p className="mt-1 text-green-600 dark:text-green-400">
                    Available hours: {doctor.availability?.hours || '9:00 AM - 5:00 PM'}
                  </p>
                </div>
              </div>
            ) : (
              <Alert className="bg-muted/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Green dates indicate available appointment days.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleRequestConsultation}
              disabled={!selectedDate}
              className="w-full"
              aria-label="Schedule appointment for selected date"
            >
              Schedule Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Office Hours</CardTitle>
          <CardDescription>
            Regular schedule at {doctor.hospital}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {officeHours.map((schedule) => (
              <div key={schedule.day} className="flex items-center justify-between">
                <div className="font-medium">{schedule.day}</div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {schedule.hours === 'Closed' ? (
                    <Badge variant="outline" className="bg-muted">Closed</Badge>
                  ) : (
                    <span className="text-sm">{schedule.hours}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
