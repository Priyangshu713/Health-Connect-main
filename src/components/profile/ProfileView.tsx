
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ruler, Weight, Activity, Droplet } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileViewProps {
  onOpenAdvancedAnalysis: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAdvancedAnalysis }) => {
  const { toast } = useToast();
  const { healthData, resetHealthData } = useHealthStore();
  const isMobile = useIsMobile();

  const handleReset = () => {
    resetHealthData();
    
    toast({
      title: 'Profile reset',
      description: 'Your health profile has been reset.',
      variant: 'destructive',
    });
  };
  
  const profileSummary = [
    { 
      label: 'Age', 
      value: healthData.age ?? '–', 
      icon: <Calendar className="h-4 w-4 text-health-cream" /> 
    },
    { 
      label: 'Height',
      value: healthData.height ? `${healthData.height} cm` : '–', 
      icon: <Ruler className="h-4 w-4 text-health-mint" /> 
    },
    { 
      label: 'Weight', 
      value: healthData.weight ? `${healthData.weight} kg` : '–', 
      icon: <Weight className="h-4 w-4 text-health-sky" /> 
    },
    { 
      label: 'BMI', 
      value: healthData.bmi ?? '–', 
      icon: <Activity className="h-4 w-4 text-health-pink" /> 
    },
    { 
      label: 'Blood Glucose', 
      value: healthData.bloodGlucose ? `${healthData.bloodGlucose} mg/dL` : '–', 
      icon: <Droplet className="h-4 w-4 text-health-lavender" /> 
    },
  ];

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: isMobile ? 0.05 : 0.1,
        delayChildren: isMobile ? 0.1 : 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-background to-health-mint/5"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <main className="container mx-auto max-w-5xl pt-16 sm:pt-20 md:pt-24 pb-16 px-4">
        <ProfileHeader />
        <ProfileActions onOpenAdvancedAnalysis={onOpenAdvancedAnalysis} />
        <ProfileTabs profileSummary={profileSummary} onReset={handleReset} />
      </main>
    </motion.div>
  );
};

export default ProfileView;
