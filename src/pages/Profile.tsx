import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProfileView from '@/components/profile/ProfileView';
import AdvancedHealthInfoDialog from '@/components/profile/AdvancedHealthInfoDialog';
import AdvancedHealthData from '@/components/profile/AdvancedHealthData';
import AdvancedHealthAnalysis from '@/components/profile/AdvancedHealthAnalysis';
import GeminiModelSelector from '@/components/profile/GeminiModelSelector';
import AuthView from '@/components/auth/AuthView';
import { useHealthStore } from '@/store/healthStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { dispatchAuthEvent } from '@/App';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { healthData, geminiApiKey, geminiTier, setGeminiTier } = useHealthStore();
  const isMobile = useIsMobile();
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [advancedHealthData, setAdvancedHealthData] = useState<any>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const isProTier = geminiTier === 'pro';

  useEffect(() => {
    if (location.state?.showAnalysisResults) {
      if (healthData.completedAdvancedAnalysis && isProTier) {
        setShowAnalysis(true);
      } else if (!isProTier) {
        setShowSubscriptionDialog(true);
        navigate(location.pathname, { replace: true });
      }
    }
    
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth);
      
      if (isAuth && location.state?.justLoggedIn) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const namePart = userEmail.split('@')[0];
          const cleanName = namePart.replace(/[0-9]/g, '');
          const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          
          toast({
            title: "Login successful",
            description: `Welcome back to HealthConnect${formattedName ? ', ' + formattedName : ''}!`,
          });
        } else {
          toast({
            title: "Login successful",
            description: "Welcome back to HealthConnect!",
          });
        }
        
        navigate(location.pathname, { replace: true });
      }
    };
    
    const handleAuthStateChanged = (event: CustomEvent) => {
      const { isAuthenticated } = event.detail;
      setIsAuthenticated(isAuthenticated);
    };
    
    checkAuth();
    
    window.addEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    };
  }, [location, navigate, toast, healthData.completedAdvancedAnalysis, isProTier]);

  useEffect(() => {
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);
    
    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  useEffect(() => {
    const storedTier = localStorage.getItem('geminiTier') as 'free' | 'lite' | 'pro' | null;
    if (storedTier && storedTier !== geminiTier) {
      setGeminiTier(storedTier);
      
      if (storedTier !== 'free') {
        const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envApiKey && !geminiApiKey) {
          setTimeout(() => {
            const event = new CustomEvent('updateGeminiApiKey', { 
              detail: { key: envApiKey }
            });
            window.dispatchEvent(event);
          }, 0);
        }
      }
    }
  }, [geminiTier, setGeminiTier, geminiApiKey]);

  const handleInfoDialogContinue = () => {
    if (!isProTier) {
      setShowSubscriptionDialog(true);
      return;
    }
    
    setInfoDialogOpen(false);
    setShowAdvancedForm(true);
  };

  const handleAdvancedFormComplete = (data: any) => {
    setAdvancedHealthData(data);
    setShowAdvancedForm(false);
    setShowAnalysis(true);
    
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToProfile = () => {
    setShowAnalysis(false);
  };

  const handleOpenAdvancedAnalysis = () => {
    setInfoDialogOpen(true);
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    
    navigate('/profile', { state: { justLoggedIn: true } });
  };
  
  const handleSelectTier = (tier: 'free' | 'lite' | 'pro') => {
    setGeminiTier(tier);
    setShowSubscriptionDialog(false);
    
    localStorage.setItem('geminiTier', tier);
    
    if (tier !== 'free') {
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envApiKey) {
        const event = new CustomEvent('updateGeminiApiKey', { 
          detail: { key: envApiKey }
        });
        window.dispatchEvent(event);
      }
    }
    
    if (tier === 'pro') {
      toast({
        title: "Pro Tier Activated",
        description: "You now have access to Advanced Health Analysis",
      });
      
      if (infoDialogOpen) {
        setTimeout(() => {
          setInfoDialogOpen(false);
          setShowAdvancedForm(true);
        }, 500);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-health-mint/10 safe-area-insets">
        <Navbar />
        <AuthView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (showAdvancedForm) {
    return (
      <div className="min-h-screen flex flex-col safe-area-insets">
        <Navbar />
        <main className="container mx-auto max-w-3xl pt-16 sm:pt-20 md:pt-24 pb-16 px-4 flex-1 overflow-auto momentum-scroll">
          <AdvancedHealthData 
            onComplete={handleAdvancedFormComplete}
            onCancel={() => setShowAdvancedForm(false)}
          />
        </main>
      </div>
    );
  }
  
  if (showAnalysis) {
    const analysisData = advancedHealthData || healthData;
    
    return (
      <div className="min-h-screen flex flex-col safe-area-insets">
        <Navbar />
        <main className="container mx-auto max-w-5xl pt-16 sm:pt-20 md:pt-24 pb-16 px-4 md:px-8 flex-1 overflow-auto momentum-scroll">
          <AdvancedHealthAnalysis 
            healthData={analysisData}
            onBack={handleBackToProfile}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col safe-area-insets">
      <Navbar />
      <main className="container mx-auto max-w-3xl pt-16 sm:pt-20 md:pt-24 pb-16 px-4 flex-1 overflow-auto momentum-scroll">
        <ProfileView onOpenAdvancedAnalysis={handleOpenAdvancedAnalysis} />
        
        {geminiApiKey && (
          <div className="mt-6">
             <GeminiModelSelector />
          </div>
        )}
      </main>
      
      <AdvancedHealthInfoDialog
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        onContinue={handleInfoDialogContinue}
      />
      
      <SubscriptionPlansDialog 
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSelectTier={handleSelectTier}
        initialTab="pro"
      />
    </div>
  );
};

export default Profile;
