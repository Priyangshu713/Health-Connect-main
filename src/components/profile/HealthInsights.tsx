
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import InsightsContent from './insights/InsightsContent';
import { useHealthInsights } from './insights/useHealthInsights';
import { HealthInsightsProps } from './insights/types';

const HealthInsights: React.FC<HealthInsightsProps> = ({ className }) => {
  const {
    loading,
    insights,
    error,
    isOpen,
    useAI,
    setIsOpen,
    fetchInsightsFromAI,
    healthData
  } = useHealthInsights();

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-health-lavender/20 bg-card/80 backdrop-blur-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-2 relative">
            <motion.div 
              className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-health-lavender" />
              {useAI ? "Gemini Health Insights" : "AI Health Insights"}
            </CardTitle>
            
            <div className="flex items-center justify-between">
              <CardDescription>
                {useAI 
                  ? "Powered by Google Gemini AI"
                  : "Personalized analysis based on your health data"
                }
              </CardDescription>
              
              <CollapsibleTrigger
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                {isOpen ? 
                  <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                }
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-2">
              <InsightsContent 
                healthDataComplete={healthData.completedProfile}
                loading={loading}
                error={error}
                insights={insights}
                onRetry={fetchInsightsFromAI}
              />
            </CardContent>
          </CollapsibleContent>
          
          {healthData.completedProfile && (
            <CardFooter className="px-6 py-4 border-t flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchInsightsFromAI}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh insights
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Collapsible>
      </Card>
    </motion.div>
  );
};

export default HealthInsights;
