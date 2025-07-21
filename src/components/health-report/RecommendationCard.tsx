
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Utensils, Dumbbell, HeartPulse, Stethoscope, PersonStanding, 
  Clock, Info, Apple, Cookie, Building2, Carrot
} from 'lucide-react';
import { GeminiRecommendation } from '@/services/HealthReportGeminiService';
import { Recommendation } from '@/lib/healthUtils';

type RecommendationCardProps = {
  recommendation: GeminiRecommendation | Recommendation;
  index: number;
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index }) => {
  // Function to get icon for recommendation
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="h-5 w-5" />;
      case 'dumbbell':
        return <Dumbbell className="h-5 w-5" />;
      case 'apple-whole':
      case 'apple':
        return <Apple className="h-5 w-5" />;
      case 'heart-pulse':
        return <HeartPulse className="h-5 w-5" />;
      case 'stethoscope':
        return <Stethoscope className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      case 'cookie':
        return <Cookie className="h-5 w-5" />;
      case 'person-walking':
        return <PersonStanding className="h-5 w-5" />;
      case 'hospital':
        return <Building2 className="h-5 w-5" />;
      case 'carrot':
        return <Carrot className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };
  
  // Function to get icon background color
  const getIconBackground = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.43, 0.13, 0.23, 0.96] 
      }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="will-change-transform"
    >
      <Card className={`overflow-hidden border-l-4 ${getPriorityColor(recommendation.priority)}`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${getIconBackground(recommendation.priority)}`}>
              {getIcon(recommendation.icon)}
            </div>
            
            <div className="space-y-1.5 text-left">
              <h3 className="text-lg font-medium leading-tight text-left">{recommendation.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="capitalize">{recommendation.type}</span>
                <span className="mx-2">•</span>
                <span className={`capitalize ${
                  recommendation.priority === 'high' 
                    ? 'text-red-500' 
                    : recommendation.priority === 'medium' 
                      ? 'text-amber-500' 
                      : 'text-green-500'
                }`}>
                  {recommendation.priority} Priority
                </span>
              </div>
              <p className="text-sm mt-2 text-foreground/90">{recommendation.description}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecommendationCard;
