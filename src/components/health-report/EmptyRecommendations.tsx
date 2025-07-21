
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface EmptyRecommendationsProps {
  type: string;
}

const EmptyRecommendations: React.FC<EmptyRecommendationsProps> = ({ type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No {type} recommendations</AlertTitle>
        <AlertDescription>
          Based on your current health metrics, we don't have specific {type.toLowerCase()} recommendations.
          Complete your health profile for more personalized advice.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default EmptyRecommendations;
