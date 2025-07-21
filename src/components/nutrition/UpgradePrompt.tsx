
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ChevronRight, Wand2, Sparkles, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  title: string;
  description: string;
  features: string[];
  tier: 'lite' | 'pro';
  onUpgrade: () => void;
}

const UpgradePrompt = ({ title, description, features, tier, onUpgrade }: UpgradePromptProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={tier === 'lite' ? "border-purple-200 overflow-hidden" : "border-amber-200 overflow-hidden"}>
        <div className={tier === 'lite' 
          ? "bg-purple-50/50 p-1 text-center text-xs font-medium text-purple-700" 
          : "bg-amber-50/50 p-1 text-center text-xs font-medium text-amber-700"
        }>
          {tier === 'lite' ? 'Lite' : 'Pro'} Tier Feature
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {tier === 'lite' ? (
              <Wand2 className="h-5 w-5 text-purple-500" />
            ) : (
              <Sparkles className="h-5 w-5 text-amber-500" />
            )}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={tier === 'lite' 
            ? "p-4 bg-purple-50/30 rounded-lg border border-purple-100" 
            : "p-4 bg-amber-50/30 rounded-lg border border-amber-100"
          }>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Key Features
            </h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onUpgrade}
            className={`w-full ${tier === 'pro' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            <span className="flex items-center gap-2">
              {tier === 'lite' ? 'Upgrade to Lite' : 'Upgrade to Pro'}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default UpgradePrompt;
