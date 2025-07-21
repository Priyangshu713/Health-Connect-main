
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileTabContent from '@/components/profile/ProfileTabContent';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileTabsProps {
  profileSummary: Array<{
    label: string;
    value: string | number;
    icon: JSX.Element;
  }>;
  onReset: () => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ profileSummary, onReset }) => {
  const isMobile = useIsMobile();
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: isMobile ? 0.3 : 0.5, ease: "easeOut" } }
  };

  return (
    <Tabs defaultValue="metrics" className="w-full">
      <motion.div
        variants={itemVariants}
      >
        <TabsList className="mb-4 sm:mb-6 bg-background/80 backdrop-blur-sm p-1 border shadow-sm w-full md:w-auto overflow-x-auto scrollbar-none">
          <TabsTrigger value="metrics" className="gap-1 sm:gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary w-full md:w-auto text-sm sm:text-base">
            <Heart className="h-4 w-4" />
            <span>Health Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1 sm:gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary w-full md:w-auto text-sm sm:text-base">
            <User className="h-4 w-4" />
            <span>Profile Summary</span>
          </TabsTrigger>
        </TabsList>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <ProfileTabContent 
          profileSummary={profileSummary}
          onReset={onReset}
        />
      </motion.div>
    </Tabs>
  );
};

export default ProfileTabs;
