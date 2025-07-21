import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, LineChart, Lock, UserRound, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthStore } from '@/store/healthStore';
import { useHistoryStore } from '@/store/historyStore';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileActionsProps {
  onOpenAdvancedAnalysis: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onOpenAdvancedAnalysis }) => {
  const navigate = useNavigate();
  const { healthData, geminiTier, setGeminiTier, setGeminiApiKey } = useHealthStore();
  const { addHistoryEntry } = useHistoryStore();
  const { toast } = useToast();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [proTierBanifites, setProTierBenefits] = useState(false);
  
  const isProUser = geminiTier === 'pro';
  const isLiteUser = geminiTier === 'lite';
  const isFreeUser = geminiTier === 'free';
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const renderTierBadge = () => {
    if (isFreeUser) {
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-100 cursor-pointer transition-colors"
          onClick={() => setSubscriptionDialogOpen(true)}
        >
          <Bot className="h-3.5 w-3.5" />
          Free Tier
        </Badge>
      );
    }

    if (isLiteUser) {
      return (
        <Badge 
          variant="outline" 
          className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-100 cursor-pointer transition-colors"
          onClick={() => setSubscriptionDialogOpen(true)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Lite Tier
        </Badge>
      );
    }

    if (isProUser) {
      return (
        <Badge 
          variant="outline" 
          className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-100 cursor-pointer transition-colors"
          onClick={() => setProTierBenefits(true)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Pro Tier Active
        </Badge>
      );
    }

    return null;
  };

  const handleAdvancedAnalysisClick = () => {
    if (isFreeUser) {
      setSubscriptionDialogOpen(true);
      return;
    }
    
    onOpenAdvancedAnalysis();
  };

  const handleFindSpecialistsClick = () => {
    if (isFreeUser) {
      setSubscriptionDialogOpen(true);
      return;
    }
    
    navigate('/doctor-finder');
  };

  const handleSelectTier = (tier: 'free' | 'lite' | 'pro') => {
    const previousTier = geminiTier;
    setGeminiTier(tier);
    
    // Store tier in localStorage for app-wide access
    localStorage.setItem('geminiTier', tier);
    
    // Set API key if it's a paid tier
    if (tier !== 'free') {
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envApiKey) {
        setGeminiApiKey(envApiKey);
      }
    } else {
      setGeminiApiKey(null);
    }
    
    // Add tier change to history if profile is completed
    if (healthData.completedProfile) {
      // Create a snapshot of current health data when changing tiers
      // This allows tracking health metrics at the time of tier changes
      addHistoryEntry({...healthData});
    }
    
    toast({
      title: `${tier === 'free' ? 'Downgraded to Free tier' : `Upgraded to ${tier === 'lite' ? 'Lite' : 'Pro'} tier`}`,
      description: tier === 'free' 
        ? "AI features have been disabled" 
        : "You now have access to enhanced AI features",
    });
    
    if (tier === 'pro' && previousTier !== 'pro' && healthData.completedProfile) {
      // Small delay before opening analysis to let the toast show first
      setTimeout(() => {
        onOpenAdvancedAnalysis();
      }, 500);
    }
  };

  return (
    <>
      <motion.div 
        variants={itemVariants}
        className="flex flex-col gap-4 mb-6"
      >
        {/* Tier Badge - Display at top for mobile and desktop */}
        <div className="w-full flex justify-end mb-1">
          {renderTierBadge()}
        </div>
        
        {/* Status Card */}
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 flex-1 flex items-center justify-between text-left">
          {healthData.completedProfile ? (
            <>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Your profile is complete! View your personalized health recommendations.</span>
              </div>
              <motion.button
                whileHover={{ x: 5 }}
                className="text-primary flex items-center text-sm font-medium"
                onClick={() => {
                  // Add current health data to history when viewing report
                  if (healthData.completedProfile) {
                    addHistoryEntry({...healthData});
                  }
                  window.location.href = '/health-report';
                }}
              >
                View Report <ChevronRight className="h-4 w-4 ml-1" />
              </motion.button>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Complete your health profile to get personalized recommendations</span>
              </div>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 whitespace-nowrap ${isFreeUser ? 'opacity-70' : ''}`}
            onClick={handleAdvancedAnalysisClick}
            disabled={!healthData.completedProfile}
          >

            {isFreeUser ? (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <LineChart className="h-4 w-4 text-primary" />
            )}
            <span className="hidden sm:inline">Advanced</span> Analysis
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 whitespace-nowrap ${isFreeUser ? 'opacity-70' : ''}`}
            onClick={handleFindSpecialistsClick}
          >
            {isFreeUser ? (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <UserRound className="h-4 w-4 text-primary" />
            )}
            Find Specialists
          </Button>
        </div>
      </motion.div>
      
      <SubscriptionPlansDialog 
        isOpen={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSelectTier={handleSelectTier}
        initialTab={isFreeUser ? "lite" : isLiteUser ? "lite" : "pro"}
      />

      <Dialog open={proTierBanifites} onOpenChange={setProTierBenefits}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Pro Tier Benefits
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-medium text-base mb-2">Premium Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Advanced AI-powered health recommendations using premium models</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Detailed nutrition analysis with meal planning capabilities</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Personalized exercise routines tailored to your health profile</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Advanced health insights with detailed explanations</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Premium support and early access to new features</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              You're currently subscribed to the Pro tier, enjoying all premium features and benefits.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileActions;
