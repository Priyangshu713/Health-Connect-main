import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Brain, Dumbbell, BedIcon, CupSoda, BarChart, ClipboardList, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useHealthStore } from '@/store/healthStore';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import { updateUserTier } from '@/api/auth';

interface AdvancedMetric {
  icon: React.ReactNode;
  name: string;
  value: string;
  color: string;
}

interface AdvancedHealthMetricsCardProps {
  hasAdvancedAnalysis: boolean;
  metrics?: Array<AdvancedMetric>;
}

const AdvancedHealthMetricsCard: React.FC<AdvancedHealthMetricsCardProps> = ({
  hasAdvancedAnalysis,
  metrics
}) => {
  const navigate = useNavigate();
  const { geminiTier, setGeminiTier, setGeminiApiKey } = useHealthStore();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const isProTier = geminiTier === 'pro';

  const placeholderMetrics: AdvancedMetric[] = [
    {
      icon: <BedIcon className="h-5 w-5 text-health-lavender" />,
      name: "Sleep Quality",
      value: "74/100",
      color: "text-health-lavender"
    },
    {
      icon: <Dumbbell className="h-5 w-5 text-health-mint" />,
      name: "Exercise Score",
      value: "68/100",
      color: "text-health-mint"
    },
    {
      icon: <Brain className="h-5 w-5 text-health-pink" />,
      name: "Stress Level",
      value: "82/100",
      color: "text-health-pink"
    },
    {
      icon: <CupSoda className="h-5 w-5 text-health-sky" />,
      name: "Hydration",
      value: "55/100",
      color: "text-health-sky"
    }
  ];

  const displayMetrics = hasAdvancedAnalysis ? metrics : placeholderMetrics;

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  const handleViewAnalysis = () => {
    navigate('/profile', { state: { showAnalysisResults: true } });
  };

  const handleSelectTier = (tier: 'free' | 'lite' | 'pro') => {
    setGeminiTier(tier);

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

    if (tier !== 'free') {
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envApiKey) {
        setGeminiApiKey(envApiKey);
      }
    } else {
      setGeminiApiKey(null);
    }

    setSubscriptionDialogOpen(false);
  };

  const itemVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <Card className="relative overflow-hidden border border-health-mint/20 shadow-md">
      <CardHeader className="pb-2 bg-gradient-to-r from-health-mint/10 to-health-sky/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Advanced Health Metrics
          </CardTitle>

          {isProTier && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 hover:bg-amber-100 cursor-pointer transition-colors"
              onClick={() => setSubscriptionDialogOpen(true)}
            >
              <Sparkles className="h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasAdvancedAnalysis && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6">
            <LockKeyhole className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-medium text-lg mb-2">Advanced Analysis Required</h3>
            <p className="text-center text-sm mb-2 text-muted-foreground">
              Complete the advanced health analysis to unlock detailed metrics about your sleep, exercise, stress, and hydration.
            </p>
            {!isProTier && (
              <p className="text-center text-xs mb-4 text-amber-600 font-medium flex items-center gap-1 justify-center">
                <Sparkles className="h-3.5 w-3.5" />
                This is a Pro tier feature
              </p>
            )}
            <Button
              onClick={handleNavigateToProfile}
              className="gap-2"
            >
              {isProTier ? (
                <>
                  <Brain className="h-4 w-4" />
                  Complete Advanced Analysis
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro Tier
                </>
              )}
            </Button>
          </div>
        )}

        <div className="py-3 grid grid-cols-2 gap-4">
          {displayMetrics?.map((metric, index) => (
            <motion.div
              key={metric.name}
              className="flex items-center gap-3"
              variants={itemVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <div className={cn(
                "p-2 rounded-full flex items-center justify-center",
                hasAdvancedAnalysis ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-800"
              )}>
                {metric.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.name}</p>
                <p className={cn(
                  "font-medium",
                  hasAdvancedAnalysis ? metric.color : "text-gray-400"
                )}>
                  {metric.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {hasAdvancedAnalysis && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 group"
              onClick={handleViewAnalysis}
            >
              <ClipboardList className="h-4 w-4" />
              View Complete Health Analysis
              <div className="ml-auto w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors">
                <span className="text-xs text-primary">→</span>
              </div>
            </Button>
          </div>
        )}
      </CardContent>

      <SubscriptionPlansDialog
        isOpen={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSelectTier={handleSelectTier}
        initialTab="pro"
      />
    </Card>
  );
};

export default AdvancedHealthMetricsCard;
