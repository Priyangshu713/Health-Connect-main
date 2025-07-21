
import React from 'react';
import { motion } from 'framer-motion';
import { TabsContent } from '@/components/ui/tabs';
import HealthMetricsCard from './HealthMetricsCard';
import ProfileSummaryCard from './ProfileSummaryCard';
import HealthInsights from './HealthInsights';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileTabContentProps {
  profileSummary: Array<{
    label: string;
    value: string | number;
    icon: JSX.Element;
  }>;
  onReset: () => void;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ 
  profileSummary,
  onReset
}) => {
  const isMobile = useIsMobile();
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
        delayChildren: isMobile ? 0.1 : 0.3
      }
    }
  };

  return (
    <>
      <TabsContent value="metrics" className="mt-0 space-y-4 sm:space-y-6">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={container}
        >
          <HealthMetricsCard onReset={onReset} />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="summary" className="mt-0">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="grid gap-4 sm:gap-6 md:grid-cols-2"
        >
          <ProfileSummaryCard profileSummary={profileSummary} />
          <HealthInsights className="md:col-span-2" />
        </motion.div>
      </TabsContent>
    </>
  );
};

export default ProfileTabContent;
