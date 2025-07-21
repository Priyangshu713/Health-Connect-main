
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Bot, Zap, Sparkles, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { GeminiTier } from '@/store/healthStore';
import GeminiTierBenefits from './GeminiTierBenefits';
import PaymentDialog from './PaymentDialog';
import {initiatePayment} from "@/api/auth.ts"
import { useNavigate} from 'react-router-dom';

interface SubscriptionPlansDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (tier: GeminiTier) => void;
  initialTab?: string | null;
}

type BillingCycle = 'monthly' | 'yearly';

interface PlanPricing {
  amount: number;
  originalAmount?: number;
  discount?: string;
  perMonth?: string;
}

type PricingMap = {
  [key in GeminiTier]: {
    [key in BillingCycle]: PlanPricing;
  };
};

const planPricing: PricingMap = {
  free: {
    
    monthly: { amount: 0 },
   
    yearly: { amount: 0 },
  },
  lite: {
   
    monthly: { amount: 799 },
    yearly: { amount: 6999, originalAmount: 9588, discount: '30% Off', perMonth: '₹583/month' },
  },
  pro: {
    monthly: { amount: 999 },

    yearly: { amount: 9999, originalAmount: 11988, discount: '30% Off', perMonth: '₹833/month' },
  }
};

const billingCycleLabels: { [key in BillingCycle]: string } = {
 
  monthly: 'Monthly',
 
  yearly: 'Yearly',
};

const billingCycleOrder: BillingCycle[] = [ 'monthly',   'yearly'];

const SubscriptionPlansDialog: React.FC<SubscriptionPlansDialogProps> = ({
  isOpen,
  onClose,
  onSelectTier,
  initialTab = 'lite'
}) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState(initialTab || 'lite');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showBillingOptions, setShowBillingOptions] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const navigate = useNavigate()
  
  const [currentTier, setCurrentTier] = useState<GeminiTier>('free');
  const [currentBillingCycle, setCurrentBillingCycle] = useState<BillingCycle | null>(null);
  const [showFreeTierOption, setShowFreeTierOption] = useState(false);
  
  useEffect(() => {
    if (initialTab) {
      setSelectedTab(initialTab);
    }
  }, [initialTab]);
  
  useEffect(() => {
    const storedTier = localStorage.getItem('geminiTier') as GeminiTier || 'free';
    const storedBilling = localStorage.getItem('billingCycle') as BillingCycle | null;
    
    setCurrentTier(storedTier);
    setCurrentBillingCycle(storedBilling);
  }, []);
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const handleSubscribe = async() => {

    // console.log('handleSubscribe called with selectedTab:', selectedTab);
    // console.log('currentTier:', currentTier);
    // console.log('currentBillingCycle:', currentBillingCycle);
    // console.log('billingCycle:', billingCycle);
    // console.log("amount:", planPricing[selectedTab as GeminiTier][billingCycle].amount);
    if (selectedTab === 'free' && currentTier === 'free') {
      toast({
        title: "Already on Free Tier",
        description: "You are already subscribed to the Free tier.",
      });
      onClose();
      return;
    }
   


    if (selectedTab === 'free') {
      handleDowngradeToFree();
      return;
    }

    if (selectedTab === currentTier ) {
      if (currentBillingCycle === billingCycle) {
        toast({
          title: "Already Subscribed",
          description: `You are already subscribed to the Lite plan with ${billingCycle} billing cycle.`,
        });
        onClose();
        return;
      }
    }

    if( currentTier === 'pro' && selectedTab !== 'lite' ) {
      toast({
        title: "Upgrade Required",
        description: "You need to downgrade to Lite plan before upgrading to Pro plan.",
      });
      onClose();
      return;
    }


    if (currentTier !== selectedTab ) {
      onClose();
      await initiatePayment(planPricing[selectedTab as GeminiTier][billingCycle].amount, billingCycle, selectedTab);
      // onClose();
      return;
    }
    

    // Handle payment result here if initiatePayment returns a value in the future
    navigate('/profile');


  };

  const handleDowngradeToFree = () => {
    localStorage.setItem('geminiTier', 'free');
    localStorage.removeItem('billingCycle');
    
    window.dispatchEvent(
      new CustomEvent('geminiTierChanged', { 
        detail: { tier: 'free' } 
      })
    );
    
    onSelectTier('free');
    
    toast({
      title: "Downgraded to Free Tier",
      description: "AI features have been disabled",
    });
    
    onClose();
  };
  
  const handlePaymentSuccess = () => {
    // setPaymentDialogOpen(false);
    
    localStorage.setItem('geminiTier', selectedTab);
    localStorage.setItem('billingCycle', billingCycle);
    
    window.dispatchEvent(
      new CustomEvent('geminiTierChanged', { 
        detail: { tier: selectedTab } 
      })
    );
    
    onSelectTier(selectedTab as GeminiTier);
    
    toast({
      title: `Subscribed to ${selectedTab === 'pro' ? 'Pro' : 'Lite'} Plan`,
      description: `You now have access to ${selectedTab === 'pro' ? 'premium' : 'standard'} Gemini AI features`,
    });
    
    onClose();
  };
  
  const toggleBillingOptions = () => {
    setShowBillingOptions(!showBillingOptions);
  };
  
  const selectBillingCycle = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    setShowBillingOptions(false);
  };
  
  const isBillingCycleAvailable = (cycle: BillingCycle): boolean => {
    if (currentTier === 'free' || currentTier !== selectedTab) {
      return true;
    }
    
    if (currentBillingCycle) {
      const currentIndex = billingCycleOrder.indexOf(currentBillingCycle);
      const selectedIndex = billingCycleOrder.indexOf(cycle);
      
      return selectedIndex >= currentIndex;
    }
    
    return true;
  };
  
  const isSubscribeEnabled = (): boolean => {
    if (selectedTab === 'free') return true;
    
    if (currentTier === selectedTab && currentBillingCycle === billingCycle) {
      return false;
    }
    
    return isBillingCycleAvailable(billingCycle);
  };
  
  const getSubscribeButtonText = (): string => {
    if (selectedTab === 'free') {
      return 'Downgrade to Free Tier';
    }
    
    if (currentTier === selectedTab && currentBillingCycle === billingCycle) {
      return 'Current Plan';
    }
    
    if (!isSubscribeEnabled()) {
      return 'Not Available';
    }

    
    return `Subscribe to ${selectedTab === 'pro' ? 'Pro' : 'Lite'} Plan`;
  };
  
  const selectedPlan = planPricing[selectedTab as GeminiTier][billingCycle];

  console.log(currentTier, selectedTab, billingCycle, selectedPlan);
  
  return (
    <>
      <Dialog open={isOpen}  onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose Your AI Plan</DialogTitle>
            <DialogDescription>
              Select a subscription plan to access Gemini AI features
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className={`grid ${currentTier !== 'free' ? 'grid-cols-3' : 'grid-cols-2'} mb-4`}>
              {currentTier !== 'free' && (
                <TabsTrigger value="free" className={`flex items-center gap-2 ${currentTier === "pro"?"invisible":""} ${currentTier === "lite"?"invisible":""}`}>
                  <Bot className="h-4 w-4 text-blue-500" />
                  Free Tier
                </TabsTrigger>
              )}
              <TabsTrigger value="lite" className={`flex items-center gap-2 ${currentTier === "pro"?"invisible":""} ${currentTier === "lite"?"invisible":""} `}>
                <Zap className="h-4 w-4 text-purple-500" />
                Lite Plan
              </TabsTrigger>
              <TabsTrigger value="pro" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Pro Plan
              </TabsTrigger>
            </TabsList>
            
            {currentTier !== 'free' && (
              <TabsContent value="free" className="mt-0">
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        Free Tier
                      </h3>
                      <p className="text-sm text-muted-foreground">Basic health tracking</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <p>Downgrading to Free tier will disable all AI-powered features. You can upgrade again anytime.</p>
                  </div>
                  
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Basic health tracking</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Standard health recommendations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>AI-powered recommendations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>Advanced health analysis</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={handleSubscribe} 
                    variant="destructive"
                    className="w-full"
                  >
                    {getSubscribeButtonText()}
                  </Button>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="lite" className="mt-0">
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      Lite Plan 
                    </h3>
                    <p className="text-sm text-muted-foreground">Standard AI features</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{selectedPlan.amount}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : billingCycle}</span></div>
                                        {/* <div className="text-2xl font-bold">₹{selectedPlan.amount}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'weekly' ? 'week' : billingCycle === 'monthly' ? 'month' : billingCycle}</span></div> */}
                    {selectedPlan.discount && (
                      <div className="text-xs text-green-600 font-medium">{selectedPlan.discount}</div>
                    )}
                    {selectedPlan.perMonth && (
                      <div className="text-xs text-muted-foreground">{selectedPlan.perMonth}</div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Button 
                    onClick={toggleBillingOptions} 
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    {billingCycleLabels[billingCycle]} Billing
                    {showBillingOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showBillingOptions && (
                    <div className="absolute top-full left-0 w-full bg-background border rounded-md mt-1 shadow-md z-10">
                      {Object.entries(billingCycleLabels).map(([cycle, label]) => {
                        const isAvailable = isBillingCycleAvailable(cycle as BillingCycle);
                        
                        return (
                          <button 
                            key={cycle}
                            className={`w-full text-left px-4 py-2 hover:bg-muted flex justify-between items-center 
                              ${cycle === billingCycle ? 'bg-muted' : ''} 
                              ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => isAvailable && selectBillingCycle(cycle as BillingCycle)}
                            disabled={!isAvailable}
                          >
                            <span className="flex items-center gap-1">
                              {label}
                              {!isAvailable && (
                                <Info size={14} className="text-muted-foreground" />
                              )}
                            </span>
                            <div className="flex items-center">
                              {cycle === currentBillingCycle && currentTier === 'lite' && (
                                <span className="mr-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                              {planPricing.lite[cycle as BillingCycle].discount && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {planPricing.lite[cycle as BillingCycle].discount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {!isBillingCycleAvailable(billingCycle) && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <p>You cannot downgrade to a shorter billing cycle than your current subscription. Please select a longer billing cycle or a different plan.</p>
                  </div>
                )}
                
                <GeminiTierBenefits tierType="lite" />
                
                <Button 
                  onClick={handleSubscribe} 
                  className="w-full"
                  disabled={!isSubscribeEnabled()}
                >
                  {getSubscribeButtonText()}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="pro" className="mt-0">
              <div className="border rounded-lg p-6 space-y-4 bg-amber-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Pro Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">Premium AI features</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{planPricing.pro[billingCycle].amount}<span className="text-sm font-normal text-muted-foreground">/{ billingCycle === 'monthly' ? 'month' : billingCycle}</span></div>
                    {planPricing.pro[billingCycle].discount && (
                      <div className="text-xs text-green-600 font-medium">{planPricing.pro[billingCycle].discount}</div>
                    )}
                    {planPricing.pro[billingCycle].perMonth && (
                      <div className="text-xs text-muted-foreground">{planPricing.pro[billingCycle].perMonth}</div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Button 
                    onClick={toggleBillingOptions} 
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    {billingCycleLabels[billingCycle]} Billing
                    {showBillingOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {showBillingOptions && (
                    <div className="absolute top-full left-0 w-full bg-background border rounded-md mt-1 shadow-md z-10">
                      {Object.entries(billingCycleLabels).map(([cycle, label]) => {
                        const isAvailable = isBillingCycleAvailable(cycle as BillingCycle);
                        
                        return (
                          <button 
                            key={cycle}
                            className={`w-full text-left px-4 py-2 hover:bg-muted flex justify-between items-center 
                              ${cycle === billingCycle ? 'bg-muted' : ''} 
                              ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => isAvailable && selectBillingCycle(cycle as BillingCycle)}
                            disabled={!isAvailable}
                          >
                            <span className="flex items-center gap-1">
                              {label}
                              {!isAvailable && (
                                <Info size={14} className="text-muted-foreground" />
                              )}
                            </span>
                            <div className="flex items-center">
                              {cycle === currentBillingCycle && currentTier === 'pro' && (
                                <span className="mr-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                              {planPricing.pro[cycle as BillingCycle].discount && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {planPricing.pro[cycle as BillingCycle].discount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {!isBillingCycleAvailable(billingCycle) && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <p>You cannot downgrade to a shorter billing cycle than your current subscription. Please select a longer billing cycle or a different plan.</p>
                  </div>
                )}
                
                <GeminiTierBenefits tierType="pro" />
                
                <Button 
                  onClick={handleSubscribe} 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={!isSubscribeEnabled()}
                >
                  
                  {getSubscribeButtonText()}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* <PaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        plan={selectedTab as GeminiTier}
        billingCycle={billingCycle}
        amount={planPricing[selectedTab as GeminiTier][billingCycle].amount}


        Implemented Machine Learning models for Diabetes Prediction Classification compared are analyze Multi subject learning - KNN , SVM , Random Forest (Python) Frontend development using react.js Backend development using node.js containerize your application using docker monitoring your application using Prometheus and Grafana security chack deploy on aws ec2 , S3 curent time deploy on Render , Vercel
      /> */}
    </>
  );
};

export default SubscriptionPlansDialog;
