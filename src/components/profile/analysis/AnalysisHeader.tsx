
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface AnalysisHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  loading: boolean;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ 
  onBack, 
  onRefresh, 
  loading 
}) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <motion.div variants={item} className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRefresh()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </motion.div>
      
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold mb-2">Your Advanced Health Analysis</h2>
        <p className="text-muted-foreground">
          Personalized insights based on your lifestyle and health metrics
        </p>
      </motion.div>
    </>
  );
};

export default AnalysisHeader;
