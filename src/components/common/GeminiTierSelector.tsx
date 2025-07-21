import React, { useState, useRef, useEffect } from 'react';
import { Bot, Zap, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore, GeminiTier } from '@/store/healthStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import Confetti from 'react-confetti';
import SubscriptionPlansDialog from './SubscriptionPlansDialog';
import { updateUserTier, debugUpdateUserTier, synchronizeTier } from '@/api/auth';

interface GeminiTierSelectorProps {
  onToggleAI?: (enabled: boolean) => void;
}

const GeminiTierSelector: React.FC<GeminiTierSelectorProps> = ({ onToggleAI }) => {
  const { toast } = useToast();
  const { geminiTier, setGeminiTier, geminiApiKey, setGeminiApiKey } = useHealthStore();
  const [open, setOpen] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiColors, setConfettiColors] = useState<string[]>([]);
  const [confettiRecycleKey, setConfettiRecycleKey] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dialogDimensions, setDialogDimensions] = useState({ width: 0, height: 0 });

  const [glowTier, setGlowTier] = useState<GeminiTier | null>(null);

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [subscriptionInitialTab, setSubscriptionInitialTab] = useState<string | null>(null);

  const [showProBenefitsDialog, setShowProBenefitsDialog] = useState(false);

  useEffect(() => {
    if (open && dialogRef.current) {
      const { width, height } = dialogRef.current.getBoundingClientRect();
      setDialogDimensions({ width, height });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShowConfetti(false);
      setGlowTier(null);
    }
  }, [open]);

  const handleSelectTier = (tier: GeminiTier) => {
    setGeminiTier(tier);

    localStorage.setItem('geminiTier', tier);

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('token');

    if (isAuthenticated && token) {
      console.log(`Updating tier to ${tier} in database...`);

      // Use the synchronizeTier function which is more direct
      synchronizeTier()
        .then(data => {
          console.log('Tier synchronized with database:', data);
          toast({
            title: "Tier Updated",
            description: `Your subscription tier has been updated to ${tier}`,
          });
        })
        .catch(error => {
          console.error('Error synchronizing tier:', error);

          // Fall back to the original methods if synchronization fails
          updateUserTier(tier)
            .then(data => {
              console.log('Tier updated in database via API utility:', data);
              toast({
                title: "Tier Updated",
                description: `Your subscription tier has been updated to ${tier}`,
              });
            })
            .catch(updateError => {
              console.error('Error updating tier via API utility:', updateError);

              // Try debug endpoint as fallback
              console.log('Trying debug endpoint as fallback...');
              debugUpdateUserTier(tier)
                .then(debugData => {
                  console.log('Tier updated via debug endpoint:', debugData);
                  toast({
                    title: "Tier Updated (Debug)",
                    description: `Your subscription tier has been updated to ${tier} using debug endpoint`,
                  });
                })
                .catch(debugError => {
                  console.error('Error in debug tier update:', debugError);

                  // Finally try direct fetch as a last resort
                  console.log('Trying direct fetch as last resort...');
                  const API_URL = 'https://health-connect-backend-umber.vercel.app/api';

                  fetch(`${API_URL}/auth/tier-debug`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tier })
                  })
                    .then(response => {
                      console.log('Direct fetch response status:', response.status);
                      return response.json().then(data => {
                        console.log('Direct fetch response data:', data);
                        if (!response.ok) {
                          throw new Error(data.message || 'Failed to update tier');
                        }
                        return data;
                      });
                    })
                    .then(data => {
                      console.log('Tier updated via direct fetch:', data);
                      toast({
                        title: "Tier Updated (Direct)",
                        description: `Your subscription tier has been updated to ${tier} (direct)`,
                      });
                    })
                    .catch(directError => {
                      console.error('Error in direct fetch update:', directError);
                      toast({
                        title: "Update Failed",
                        description: "There was a problem updating your tier in the database. Your local settings have been updated.",
                        variant: "destructive",
                      });
                    });
                });
            });
        });
    } else if (!isAuthenticated) {
      console.log('User not authenticated, skipping database update');
    } else if (!token) {
      console.log('No token available, skipping database update');
    }

    window.dispatchEvent(
      new CustomEvent('geminiTierChanged', {
        detail: { tier: tier }
      })
    );

    if (tier === 'free') {
      localStorage.removeItem('billingCycle');
      setGeminiApiKey(null);
      if (onToggleAI) onToggleAI(false);
      toast({
        title: "Gemini AI Disabled",
        description: "Using standard recommendations instead of AI",
      });
    } else {
      setGeminiApiKey(import.meta.env.VITE_GEMINI_API_KEY);
      if (onToggleAI) onToggleAI(true);

      if (tier === 'lite' as GeminiTier) {
        setConfettiColors(['#9b87f5', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']);
        setGlowTier('lite');
        setShowConfetti(true);
        setConfettiRecycleKey(prev => prev + 1);
      } else if (tier === 'pro' as GeminiTier) {
        setConfettiColors(['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']);
        setGlowTier('pro');
        setShowConfetti(true);
        setConfettiRecycleKey(prev => prev + 1);
      }

      toast({
        title: `${tier === 'pro' ? 'Pro' : 'Lite'} Tier Activated`,
        description: `Using Gemini AI with ${tier === 'pro' ? 'premium' : 'standard'} features`,
      });
    }

    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  const handleTierButtonClick = () => {
    setOpen(true);
  };





    // jgdfkjls;adlfkjdsla;ljk










  const handleUpgradeToProClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // setSubscriptionInitialTab('pro');
    
    setShowSubscriptionDialog(true);
  };

  const handleProBenefitsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProBenefitsDialog(true);
  };

  const buttonBgColor = () => {
    switch (geminiTier) {
      case 'free':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'lite':
        return 'bg-purple-50 hover:bg-purple-100';
      case 'pro':
        return 'bg-amber-50 hover:bg-amber-100';
      default:
        return '';
    }
  };

  const getTierIcon = () => {
    switch (geminiTier) {
      case 'free':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'lite':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'pro':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <Bot className="h-4 w-4 text-health-lavender" />;
    }
  };

  const getCardGlowClass = (tier: GeminiTier) => {
    if (glowTier !== tier) return '';

    switch (tier) {
      case 'lite':
        return 'relative overflow-hidden bg-purple-50 shadow-[0_0_15px_rgba(139,92,246,0.5)] before:absolute before:content-[""] before:top-0 before:left-[-100%] before:w-[120%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-purple-300/30 before:to-transparent before:animate-[sweep_1.5s_ease_forwards]';
      case 'pro':
        return 'relative overflow-hidden bg-amber-50 shadow-[0_0_15px_rgba(249,115,22,0.5)] before:absolute before:content-[""] before:top-0 before:left-[-100%] before:w-[120%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-amber-300/30 before:to-transparent before:animate-[sweep_1.5s_ease_forwards]';
      default:
        return '';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${buttonBgColor()}`}
        onClick={handleTierButtonClick}
      >
        {getTierIcon()}
        {geminiTier === 'free' ?
          "Free Tier" :
          `${geminiTier === 'pro' ? 'Pro' : 'Lite'} Tier Active`}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs" ref={dialogRef}>
          {showConfetti && (
            <Confetti
              key={confettiRecycleKey}
              width={dialogDimensions.width}
              height={dialogDimensions.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
              colors={confettiColors}
              confettiSource={{
                x: dialogDimensions.width / 2,
                y: dialogDimensions.height / 2,
                w: 0,
                h: 0
              }}
            />
          )}

          <DialogHeader>
            <DialogTitle>Select Gemini AI Tier </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-3 py-2 ">
              <Card
                className={`cursor-pointer border-2 ${geminiTier === 'free' ? 'border-primary' : 'border-muted'} transition-all duration-300  hidden`}
                // onClick={() => handleSelectTier('free' as GeminiTier)}
              >
                <CardHeader className="pb-2 pt-4 ">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    Free Tier
                  </CardTitle>
                  <CardDescription>Basic health tracking</CardDescription>
                </CardHeader>
                <CardContent className="text-xs pb-2">
                  <p>Standard health tracking without AI-powered recommendations</p>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                  <Button
                    variant={geminiTier === 'free' ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTier('free' as GeminiTier);
                    }}
                  >
                    {geminiTier === 'free' ? 'Currently Selected' : 'Select Free Tier'}
                  </Button>
                </CardFooter>
              </Card>

              <Card
                className={`cursor-pointer border-2 ${geminiTier === 'lite' ? 'border-primary' : 'border-muted'} transition-all duration-300 ${getCardGlowClass('lite')}`}
                // onClick={() => handleSelectTier('lite' as GeminiTier)}
              >
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Lite Tier
                  </CardTitle>
                  <CardDescription>AI-powered recommendations</CardDescription>
                </CardHeader>
                <CardContent className="text-xs pb-2">
                  <p>Personalized AI recommendations using standard Gemini models</p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex flex-col gap-2">
                  <Button
                    variant={geminiTier !== 'lite' ? "default" : "outline"}
                    size="sm"
                    className={`w-full text-xs h-8 ${geminiTier === 'lite' ? "hidden": ""} ${geminiTier === 'pro' ? "hidden": ""}  `} 
                    
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   handleSelectTier('lite' as GeminiTier);
                    // }}
                    onClick={handleUpgradeToProClick}
                  >
                    {geminiTier === 'lite' ? 'Currently Selected' : 'Select Lite Tier'}
                  </Button>

                  {geminiTier === 'lite' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={handleUpgradeToProClick}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <Card
                className={`cursor-pointer border-2 ${geminiTier === 'pro' ? 'border-primary' : 'border-muted'} transition-all duration-300 ${getCardGlowClass('pro')}`}
                // onClick={() => handleSelectTier('pro' as GeminiTier)}
              >
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Pro Tier
                  </CardTitle>
                  <CardDescription>Advanced AI features</CardDescription>
                </CardHeader>
                <CardContent className="text-xs pb-2">
                  <p>Premium AI recommendations with advanced models and detailed analysis</p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex flex-col gap-2">
                  <Button
                    variant={geminiTier != 'pro' ? "default" : "outline"}
                    size="sm"
                    className={`w-full text-xs h-8 ${geminiTier === 'pro' ? "hidden": "visible"} `} 
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   handleSelectTier('pro' as GeminiTier);
                    // }}
                    onClick={handleUpgradeToProClick}
                  >
                    {geminiTier === 'pro' ? 'Currently Selected' : 'Select Pro Tier'}
                  </Button>

                  {geminiTier === 'pro' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={handleProBenefitsClick}
                    >
                      Pro Benefits
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <SubscriptionPlansDialog
        isOpen={showSubscriptionDialog}
        onClose={() => {
          setShowSubscriptionDialog(false);
          setSubscriptionInitialTab(null);
        }}
        onSelectTier={handleSelectTier}
        initialTab={subscriptionInitialTab}
      />

      <Dialog open={showProBenefitsDialog} onOpenChange={setShowProBenefitsDialog}>
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

export default GeminiTierSelector;
