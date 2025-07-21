import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, InfoIcon, HeartPulse, Brain, Dumbbell, BedIcon, CupSoda, Coffee, Apple, Utensils, Cigarette, Wine, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHealthStore } from '@/store/healthStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import GeminiApiKeyManager from '@/components/common/GeminiApiKeyManager';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import { updateUserTier } from '@/api/auth';

interface AdvancedHealthInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const AdvancedHealthInfoDialog: React.FC<AdvancedHealthInfoDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const { geminiApiKey, geminiTier, setGeminiTier } = useHealthStore();
  const { toast } = useToast();
  const [showGeminiAlert, setShowGeminiAlert] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const isProTier = geminiTier === 'pro';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleContinueClick = () => {
    if (!geminiApiKey) {
      setShowGeminiAlert(true);
      return;
    }

    if (!isProTier) {
      setShowSubscriptionDialog(true);
      return;
    }

    onContinue();
  };

  const handleEnableGemini = () => {
    setShowGeminiAlert(false);
    toast({
      title: "Gemini API Required",
      description: "Please enable Gemini AI to access advanced health analysis",
    });
  };

  const handleSelectTier = (tier: 'free' | 'lite' | 'pro') => {
    setGeminiTier(tier);

    // Save to local storage
    localStorage.setItem('geminiTier', tier);

    // If the user is authenticated, update their tier in the backend
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      updateUserTier(tier)
        .then(data => {
          console.log('Tier updated in database:', data);
        })
        .catch(error => {
          console.error('Error updating tier:', error);
        });
    }

    setShowSubscriptionDialog(false);

    if (tier === 'pro') {
      toast({
        title: "Pro Tier Activated",
        description: "You now have access to Advanced Health Analysis",
      });

      setTimeout(() => {
        onContinue();
      }, 500);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[525px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-primary" />
              Advanced Health Analysis
            </DialogTitle>
            <DialogDescription>
              Get deeper insights with AI-powered analysis
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h4 variants={itemVariants} className="font-medium text-sm">What we'll analyze:</motion.h4>

            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3">
              {[
                { icon: <BedIcon className="h-4 w-4 text-health-lavender" />, name: "Sleep Patterns" },
                { icon: <Dumbbell className="h-4 w-4 text-health-mint" />, name: "Exercise Habits" },
                { icon: <Brain className="h-4 w-4 text-health-pink" />, name: "Stress Levels" },
                { icon: <CupSoda className="h-4 w-4 text-health-sky" />, name: "Hydration" },
                { icon: <Coffee className="h-4 w-4 text-health-cream" />, name: "Caffeine" },
                { icon: <Apple className="h-4 w-4 text-green-400" />, name: "Diet" },
                { icon: <Utensils className="h-4 w-4 text-orange-400" />, name: "Food Habits" },
                { icon: <Cigarette className="h-4 w-4 text-gray-500" />, name: "Smoking" },
                { icon: <Wine className="h-4 w-4 text-purple-400" />, name: "Alcohol" },
                { icon: <HeartPulse className="h-4 w-4 text-red-400" />, name: "Medical History" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/10"
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs mt-2"
            >
              <p className="font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Pro Tier Feature:
              </p>
              <p className="text-muted-foreground">
                Advanced health analysis requires Gemini AI and Pro tier subscription.
                {isProTier ? (
                  <span className="ml-1 text-green-500 font-medium">Pro tier is enabled!</span>
                ) : (
                  <span className="ml-1 text-amber-500 font-medium">Pro tier is required.</span>
                )}
              </p>
            </motion.div>
          </motion.div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={onClose} size="sm">
              Not Now
            </Button>
            <Button
              onClick={handleContinueClick}
              className="gap-2 group"
              size="sm"
              variant={isProTier ? "default" : "outline"}
            >
              {isProTier ? "Continue" : "Upgrade to Pro"}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showGeminiAlert} onOpenChange={setShowGeminiAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gemini AI Required</AlertDialogTitle>
            <AlertDialogDescription>
              Advanced health analysis is a premium feature that requires Gemini AI to be enabled.
              Please add your Gemini API key to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <GeminiApiKeyManager />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableGemini}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Plans Dialog */}
      <SubscriptionPlansDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSelectTier={handleSelectTier}
        initialTab="pro"
      />
    </>
  );
};

export default AdvancedHealthInfoDialog;
