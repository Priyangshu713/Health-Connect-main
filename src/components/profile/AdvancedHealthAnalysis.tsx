import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs } from '@/components/ui/tabs';
import { HeartPulse, Brain, Dumbbell, BedIcon, CupSoda, Utensils, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore, AnalysisSection } from '@/store/healthStore';
import { useHistoryStore } from '@/store/historyStore';
import { analyzeAdvancedHealthData } from '@/services/AdvancedHealthGeminiService';
import AnalysisHeader from './analysis/AnalysisHeader';
import AnalysisTabs from './analysis/AnalysisTabs';
import AnalysisContent from './analysis/AnalysisContent';

export interface AdvancedHealthData {
  sleepHours: number;
  exerciseHours: number;
  stressLevel: number;
  waterIntake: number;
  caffeine: number;
  diet: string;
  foodHabits: {
    regularMeals: boolean;
    lateNightSnacking: boolean;
    fastFood: boolean;
    highSugar: boolean;
  };
  smoking: string;
  alcoholConsumption: string;
  sleepQuality: string;
  medicalConditions?: string;
  medications?: string;
  familyHistory?: string;
}

interface AdvancedHealthAnalysisProps {
  healthData: Partial<AdvancedHealthData>;
  onBack: () => void;
}

const AdvancedHealthAnalysis: React.FC<AdvancedHealthAnalysisProps> = ({
  healthData,
  onBack
}) => {
  const { toast } = useToast();
  const { geminiApiKey, healthData: basicHealthData, geminiModel, setAdvancedAnalysisComplete } = useHealthStore();
  const { addHistoryEntry } = useHistoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const generatePlaceholderAnalysis = (): AnalysisSection[] => {
    return [
      {
        category: 'sleep',
        icon: <BedIcon className="h-5 w-5 text-health-lavender" />,
        title: 'Sleep Analysis',
        analysis: 'Analyzing your sleep patterns...',
        recommendation: 'Preparing sleep recommendations...',
        score: 70
      },
      {
        category: 'exercise',
        icon: <Dumbbell className="h-5 w-5 text-health-mint" />,
        title: 'Exercise Analysis',
        analysis: 'Analyzing your exercise habits...',
        recommendation: 'Preparing exercise recommendations...',
        score: 70
      },
      {
        category: 'stress',
        icon: <Brain className="h-5 w-5 text-health-pink" />,
        title: 'Stress Analysis',
        analysis: 'Analyzing your stress levels...',
        recommendation: 'Preparing stress management recommendations...',
        score: 70
      },
      {
        category: 'nutrition',
        icon: <Utensils className="h-5 w-5 text-health-amber" />,
        title: 'Nutrition Analysis',
        analysis: 'Analyzing your nutrition habits...',
        recommendation: 'Preparing nutrition recommendations...',
        score: 70
      },
      {
        category: 'hydration',
        icon: <CupSoda className="h-5 w-5 text-health-sky" />,
        title: 'Hydration Analysis',
        analysis: 'Analyzing your hydration habits...',
        recommendation: 'Preparing hydration recommendations...',
        score: 70
      },
      {
        category: 'lifestyle',
        icon: <Activity className="h-5 w-5 text-health-teal" />,
        title: 'Lifestyle Analysis',
        analysis: 'Analyzing your lifestyle choices...',
        recommendation: 'Preparing lifestyle recommendations...',
        score: 70
      },
      {
        category: 'overall',
        icon: <HeartPulse className="h-5 w-5 text-primary" />,
        title: 'Overall Health Analysis',
        analysis: 'Analyzing your overall health...',
        recommendation: 'Preparing overall recommendations...',
        score: 70
      }
    ];
  };

  const addIconsToAnalysis = (analysisData: AnalysisSection[]): AnalysisSection[] => {
    return analysisData.map(item => {
      const icon = (() => {
        switch (item.category) {
          case 'sleep':
            return <BedIcon className="h-5 w-5 text-health-lavender" />;
          case 'exercise':
            return <Dumbbell className="h-5 w-5 text-health-mint" />;
          case 'stress':
            return <Brain className="h-5 w-5 text-health-pink" />;
          case 'nutrition':
            return <Utensils className="h-5 w-5 text-health-amber" />;
          case 'hydration':
            return <CupSoda className="h-5 w-5 text-health-sky" />;
          case 'lifestyle':
            return <Activity className="h-5 w-5 text-health-teal" />;
          case 'overall':
          default:
            return <HeartPulse className="h-5 w-5 text-primary" />;
        }
      })();

      return {
        ...item,
        icon
      };
    });
  };

  const loadSavedAnalysis = () => {
    if (basicHealthData.savedAnalysis && basicHealthData.savedAnalysis.length > 0) {
      console.log("Loading saved analysis data");
      const analysisWithIcons = addIconsToAnalysis(basicHealthData.savedAnalysis);
      setAnalysis(analysisWithIcons);
      setLoading(false);
      return true;
    }
    return false;
  };

  const fetchAnalysis = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    if (!forceRefresh && loadSavedAnalysis()) {
      return;
    }
    
    setAnalysis(generatePlaceholderAnalysis());
    
    try {
      if (!geminiApiKey) {
        throw new Error("Please enable Gemini AI first by adding your API key");
      }
      
      console.log("Preparing to analyze health data", { 
        basicDataExists: !!basicHealthData,
        advancedDataExists: !!healthData
      });
      
      const combinedData = {
        ...basicHealthData,
        ...healthData
      };
      
      console.log("Combined data prepared for analysis");
      
      const result = await analyzeAdvancedHealthData(combinedData, geminiApiKey, geminiModel);
      const analysisWithIcons = addIconsToAnalysis(result);
      setAnalysis(analysisWithIcons);
      
      const analysisScores = {
        sleepScore: result.find(item => item.category === 'sleep')?.score || 70,
        exerciseScore: result.find(item => item.category === 'exercise')?.score || 70,
        stressScore: result.find(item => item.category === 'stress')?.score || 70,
        hydrationScore: result.find(item => item.category === 'hydration')?.score || 70,
        overallScore: result.find(item => item.category === 'overall')?.score || 70,
      };
      
      setAdvancedAnalysisComplete(analysisScores, result);
      
      addHistoryEntry({...basicHealthData}, result);
      
      toast({
        title: "Analysis Complete",
        description: "Your advanced health analysis is complete and has been saved to your profile and history.",
      });
    } catch (err) {
      console.error("Error analyzing health data:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze health data. Please try again later.");
      
      if (!loadSavedAnalysis()) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Could not generate health analysis.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Using Saved Analysis",
          description: "We encountered an error fetching new analysis, but loaded your previous analysis instead.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchAnalysis(true);
  };

  useEffect(() => {
    fetchAnalysis();
  }, [healthData, refreshKey]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <AnalysisHeader 
        onBack={onBack} 
        onRefresh={handleRefresh} 
        loading={loading} 
      />
      
      <Tabs defaultValue="overall" className="w-full">
        <AnalysisTabs />
        <AnalysisContent analysis={analysis} loading={loading} error={error} />
      </Tabs>
    </motion.div>
  );
};

export default AdvancedHealthAnalysis;
