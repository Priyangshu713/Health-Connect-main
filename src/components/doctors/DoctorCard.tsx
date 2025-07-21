
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Doctor } from '@/types/doctor';
import { Star, MapPin, Calendar } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem("doctor_Id",doctor._id)
    navigate(`/doctor/${doctor._id}`);
  };

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {doctor.firstName.charAt(0)} {doctor.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-lg">Dr. {doctor.firstName} {doctor.lastName}</h3>
            <Badge variant="outline" className="bg-primary/5 text-primary mt-1">
              {doctor.specialty}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-amber-500" />
            <span>{doctor.rating} ({doctor.reviewCount} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{doctor.hospital}, {doctor.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{doctor.experience} years experience</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <Button variant="outline" className="w-full" onClick={handleClick}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};
