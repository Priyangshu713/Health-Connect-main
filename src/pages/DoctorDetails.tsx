
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle, Clock, MapPin, MessageSquare, Phone, Star, ThumbsUp, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { useDoctorDetails } from '@/hooks/useDoctorDetails';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import { ContactDoctorDialog } from '@/components/doctors/ContactDoctorDialog';
import { DoctorReviews } from '@/components/doctors/DoctorReviews';
import { DoctorSchedule } from '@/components/doctors/DoctorSchedule';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Doctor } from '@/types/doctor';
import { Doctor } from "@/types/doctor"
const DoctorDetails = () => {
  const { _id } = useParams<{ _id: string }>();

  const navigate = useNavigate();
  const { toast } = useToast();
  const { geminiTier, setGeminiTier, healthData } = useHealthStore();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('about');
  const [doctor, setDoctor] = useState<any>("")
  const [isLoading ,setIsloding] = useState(false);

  const {
    // doctor,
    // isLoading,
    error
  } = useDoctorDetails(_id);



  useEffect(() => {
    // Check if user is Pro tier
    if (geminiTier !== 'pro') {
      setSubscriptionDialogOpen(true);
    }
    window.scrollTo(0, 0);
  }, [geminiTier]);

  useEffect(() => {

    setIsloding(true);
    const getDoctorId = localStorage.getItem("doctor_Id");
    const getAllDoctor: Doctor[] = JSON.parse(localStorage.getItem("allDoctor"));
    const getDoctor = getAllDoctor?.filter(element => {
      return element._id == getDoctorId
    });
    
    setDoctor(getDoctor[0]);
    setIsloding(false)

  },[])

  const handleSelectTier = (tier: 'free' | 'lite' | 'pro') => {
    setGeminiTier(tier);
    localStorage.setItem('geminiTier', tier);

    if (tier !== 'pro') {
      toast({
        title: "Pro tier required",
        description: "This feature is only available for Pro tier users",
        variant: "destructive"
      });
      navigate('/profile');
    } else {
      setSubscriptionDialogOpen(false);
      toast({
        title: "Pro Tier Activated",
        description: "You now have access to the Doctor Finder feature",
      });
    }
  };

  const handleContactDoctor = (date?: Date) => {
    if (!healthData.completedProfile) {
      toast({
        title: "Complete your profile",
        description: "Please complete your health profile before contacting a specialist",
        variant: "destructive"
      });
      navigate('/profile');
      return;
    }

    if (date) {
      setSelectedDate(date);
      setContactDialogOpen(true);
    } else {
      // If no date is provided, switch to the schedule tab
      setActiveTab('schedule');

      // Scroll to the schedule section
      const scheduleSection = document.getElementById('schedule-section');
      if (scheduleSection) {
        setTimeout(() => {
          scheduleSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col safe-area-insets">
        <Navbar />
        <main className="container mx-auto pt-16 sm:pt-20 md:pt-24 pb-16 px-4 md:px-8 flex-1">
          <div className="max-w-4xl mx-auto animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
            <div className="flex gap-6">
              <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
              <div className="space-y-4 flex-1">
                <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col safe-area-insets">
        <Navbar />
        <main className="container mx-auto pt-16 sm:pt-20 md:pt-24 pb-16 px-4 md:px-8 flex-1">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Specialist Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the specialist you're looking for.
            </p>
            <Button onClick={() => navigate('/doctor-finder')}>
              Back to Specialists
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col safe-area-insets">
      <Navbar />
      <main className="container mx-auto pt-16 sm:pt-20 md:pt-24 pb-16 px-4 md:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/doctor-finder')}
          >
            ← Back to specialists
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="md:w-1/3 flex flex-col items-center">
              <Avatar className="h-40 w-40 border-4 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-semibold">
                  {doctor?.firstName?.charAt(0)}{doctor?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(doctor?.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{doctor?.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {doctor?.reviewCount} patient reviews
                </p>
              </div>
            </div>

            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-2">
                Dr. {doctor?.firstName} {doctor?.lastName}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {doctor?.specialty}
                </Badge>
                {doctor?.subspecialties?.map((sub, index) => (
                  <Badge key={index} variant="outline">
                    {sub}
                  </Badge>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor?.hospital}, {doctor?.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor?.experience} years experience</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{doctor?.patients}+ patients</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleContactDoctor()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Office
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-3">About Dr. {doctor.lastName}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {doctor.bio}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="font-medium mb-2">Education</h4>
                      <ul className="space-y-2">
                        {doctor.education?.map((edu, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-1 text-primary" />
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      <ul className="space-y-2">
                        {doctor.certifications?.map((cert, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-1 text-primary" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Specializes In</h4>
                    <ul className="space-y-2">
                      {doctor.specializations?.map((spec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ThumbsUp className="h-4 w-4 mt-1 text-primary" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Available for consultations</AlertTitle>
                <AlertDescription>
                  Dr. {doctor.lastName} typically responds within 24 hours.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="schedule">
              {doctor && <DoctorSchedule
                doctor={doctor}
                onRequestConsultation={handleContactDoctor}
              />}
            </TabsContent>

            <TabsContent value="reviews">
              <DoctorReviews doctorId={doctor?._id || ''} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SubscriptionPlansDialog
        isOpen={subscriptionDialogOpen}
        onClose={() => {
          setSubscriptionDialogOpen(false);
          if (geminiTier !== 'pro') {
            navigate('/profile');
          }
        }}
        onSelectTier={handleSelectTier}
        initialTab="pro"
      />

      {doctor && (
        <ContactDoctorDialog
          isOpen={contactDialogOpen}
          onClose={() => {
            setContactDialogOpen(false);
            setSelectedDate(undefined);
          }}
          doctor={doctor}
          appointmentDate={selectedDate}
        />
      )}
    </div>
  );
};

export default DoctorDetails;
