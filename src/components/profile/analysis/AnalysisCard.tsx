
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LucideAlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisSection } from '@/store/healthStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DetailedRecommendations from './DetailedRecommendations';

interface AnalysisCardProps {
  section: AnalysisSection;
  loading: boolean;
  error?: string | null;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ section, loading, error }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <LucideAlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{section.title}</h3>
            <p className="text-sm text-muted-foreground">Based on your health data</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            We couldn't generate your analysis at this time. Please try refreshing the analysis or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={item} className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{section.title}</h3>
            <p className="text-sm text-muted-foreground">Based on your health data</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Health Score</h4>
              <span className="text-xl font-bold text-orange-500">{section.score}/100</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full" 
                style={{ width: `${section.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Analysis</h4>
            <p className="text-sm text-muted-foreground">{section.analysis}</p>
          </div>
          
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <CollapsibleTrigger className="flex justify-between items-center w-full text-left">
                <h4 className="font-medium">Recommendation</h4>
                <button className="ml-2 p-1 rounded-full hover:bg-muted/50 transition-colors">
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <p className="text-sm text-muted-foreground">{section.recommendation}</p>
              
              <CollapsibleContent className="pt-3 mt-2 border-t border-border/40">
                <DetailedRecommendations category={section.category} />
              </CollapsibleContent>
            </div>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnalysisCard;
