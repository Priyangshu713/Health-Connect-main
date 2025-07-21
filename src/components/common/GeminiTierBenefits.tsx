
import React from 'react';
import { Check } from 'lucide-react';

interface GeminiTierBenefitsProps {
  tierType: string;
}

const GeminiTierBenefits: React.FC<GeminiTierBenefitsProps> = ({ tierType }) => {
  const isPro = tierType === 'pro';
  
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">Features include:</div>
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-sm">
          <Check className={`h-4 w-4 mt-0.5 ${isPro ? 'text-amber-500' : 'text-purple-500'}`} />
          <span>AI-powered health recommendations</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <Check className={`h-4 w-4 mt-0.5 ${isPro ? 'text-amber-500' : 'text-purple-500'}`} />
          <span>Personalized nutrition suggestions</span>
        </li>
        <li className="flex items-start gap-2 text-sm">
          <Check className={`h-4 w-4 mt-0.5 ${isPro ? 'text-amber-500' : 'text-purple-500'}`} />
          <span>Basic health insights</span>
        </li>
        
        {isPro && (
          <>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Advanced analysis with premium Gemini models</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Detailed health reports and trends</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Custom meal planning and recipes</span>
            </li>
            
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Access to Meal Generator</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Access to search button</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Access to Meal Tracker</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-medium">
              <Check className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>Priority support</span>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default GeminiTierBenefits;
