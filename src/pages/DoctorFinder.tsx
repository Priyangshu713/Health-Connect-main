
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { DoctorFilterSidebar } from '@/components/doctors/DoctorFilterSidebar';
import { DoctorListSkeleton } from '@/components/doctors/DoctorListSkeleton';
import { useDoctorRecommendations } from '@/hooks/useDoctorRecommendations';
import { useHealthStore } from '@/store/healthStore';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const DoctorFinder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { geminiTier, setGeminiTier, healthData } = useHealthStore();
  const [selectedTab, setSelectedTab] = useState<'all' | 'recommended'>('all');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    experience: 0,
  });
  
  const {
    doctors,
    recommendedDoctors,
    isLoadingDoctors,
    isLoadingRecommendations,
    error
  } = useDoctorRecommendations(filters);

  useEffect(() => {
    // Check if user is Pro tier
    if (geminiTier !== 'pro') {
      setSubscriptionDialogOpen(true);
    }
    
    ;(async()=>{
      
    })()


    // Check if profile is complete for recommendations
    if (selectedTab === 'recommended' && !healthData.completedProfile) {
      toast({
        title: "Complete your profile",
        description: "Please complete your health profile to get doctor recommendations",
        variant: "destructive"
      });
      navigate('/profile');
    }
  }, [geminiTier, selectedTab, healthData.completedProfile, navigate, toast]);

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

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="min-h-screen flex flex-col safe-area-insets">
      <Navbar />
      <main className="container mx-auto pt-16 sm:pt-20 md:pt-24 pb-16 px-4 md:px-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-bold tracking-tight">Specialist Finder</h1>
            <p className="text-muted-foreground mt-2">
              Connect with top healthcare specialists tailored to your health needs
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <DoctorFilterSidebar onFilterChange={handleFilterChange} filters={filters} />
              
            </div>
            
            <div className="md:w-3/4">
              <Tabs 
                defaultValue="all" 
                value={selectedTab} 
                onValueChange={(value) => setSelectedTab(value as 'all' | 'recommended')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="all">All Specialists</TabsTrigger>
                  <TabsTrigger value="recommended" disabled={!healthData.completedProfile}>
                    Recommended for You
                  </TabsTrigger>
                </TabsList>
                







                <TabsContent value="all" className="space-y-4">
                  {isLoadingDoctors ? (
                    <DoctorListSkeleton count={6} />
                  ) : error ? (
                    <div className="p-6 text-center bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                      <h3 className="font-medium text-lg">Failed to load specialists</h3>
                      <p className="text-muted-foreground mt-2">Please try again later</p>
                      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="p-6 text-center bg-muted rounded-lg">
                      <h3 className="font-medium text-lg">No specialists found</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {doctors.map((doctor) => (
                        <DoctorCard key={doctor._id} doctor={doctor} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recommended" className="space-y-4">
                  {!healthData.completedProfile ? (
                    <div className="p-6 text-center bg-muted rounded-lg">
                      <h3 className="font-medium text-lg">Complete your health profile</h3>
                      <p className="text-muted-foreground mt-2">
                        We need your health information to provide personalized recommendations
                      </p>
                      <Button className="mt-4" onClick={() => navigate('/profile')}>
                        Complete Profile
                      </Button>
                    </div>
                  ) : isLoadingRecommendations ? (
                    <DoctorListSkeleton count={3} />
                  ) : recommendedDoctors.length === 0 ? (
                    <div className="p-6 text-center bg-muted rounded-lg">
                      <h3 className="font-medium text-lg">No recommendations available</h3>
                      <p className="text-muted-foreground mt-2">
                        We couldn't find specialists that match your health profile
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                        <h3 className="font-medium">Personalized Recommendations</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          These specialists are recommended based on your health profile
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedDoctors.map((doctor) => (
                          <DoctorCard key={doctor._id} doctor={doctor} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
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
    </div>
  );
};

export default DoctorFinder;
