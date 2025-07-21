
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/home/HomeHero';
import FeaturesSection from '@/components/home/FeaturesSection';
import HealthIssuesSection from '@/components/home/HealthIssuesSection';
import GetStartedCTA from '@/components/home/GetStartedCTA';
import HomeFooter from '@/components/home/HomeFooter';
import HealthInfoDialog from '@/components/HealthInfoDialog';
import healthInfoContent from '@/utils/healthInfoContent';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  // Add "overflow-x-hidden" to body on mount and set vh property for mobile
  useEffect(() => {
    document.body.classList.add('overflow-x-hidden');
    
    // Fix for mobile viewport height issues
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    
    // iOS Safari Address bar fix
    const handleScroll = () => {
      if (window.scrollY > 100 && isMobile) {
        document.documentElement.classList.add('scroll-active');
      } else {
        document.documentElement.classList.remove('scroll-active');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.body.classList.remove('overflow-x-hidden');
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const openDialog = (dialogKey: string) => {
    setActiveDialog(dialogKey);
    // On mobile, scroll to top when opening dialog to ensure good visibility
    if (isMobile) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  const closeDialog = () => {
    setActiveDialog(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <HomeHero />
      <FeaturesSection />
      <HealthIssuesSection openDialog={openDialog} />
      <GetStartedCTA />
      <HomeFooter />
      
      {/* Health Info Dialog */}
      {activeDialog && healthInfoContent[activeDialog] && (
        <HealthInfoDialog
          isOpen={!!activeDialog}
          onClose={closeDialog}
          title={healthInfoContent[activeDialog].title}
          description={healthInfoContent[activeDialog].description}
          content={healthInfoContent[activeDialog].content}
        />
      )}
    </div>
  );
};

export default Index;
