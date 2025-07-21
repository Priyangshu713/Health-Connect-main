
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { InsightSection } from './types';
import { generateSampleInsights } from './SampleInsightsGenerator';
import { fetchInsightsFromGemini } from './GeminiService';

export const useHealthInsights = () => {
  const { toast } = useToast();
  const { healthData, geminiApiKey, setGeminiApiKey } = useHealthStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [useAI, setUseAI] = useState(false);

  const fetchInsightsFromAI = async () => {
    if (!healthData.completedProfile) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useAI && geminiApiKey) {
        const aiInsights = await fetchInsightsFromGemini(healthData, geminiApiKey);
        setInsights(aiInsights);
      } else {
        const sampleInsights = generateSampleInsights(healthData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInsights(sampleInsights);
      }
    } catch (err) {
      console.error("Error fetching AI insights:", err);
      setError("Failed to generate health insights. Please try again later.");
      
      toast({
        title: "Error",
        description: "Could not generate health insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAI = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !useAI;
    
    if (newState && !geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enable Gemini AI first by adding your API key",
        variant: "destructive",
      });
      return; // Don't update useAI state if there's no API key
    }
    
    setUseAI(newState);
    
    toast({
      title: newState ? "AI Enabled" : "AI Disabled",
      description: newState 
        ? "Using Gemini AI for personalized health insights" 
        : "Using sample insights instead of Gemini AI",
    });
  };

  useEffect(() => {
    // Set useAI to true if we have an API key
    if (geminiApiKey && !useAI) {
      setUseAI(true);
    } else if (!geminiApiKey && useAI) {
      setUseAI(false);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    if (healthData.completedProfile) {
      fetchInsightsFromAI();
    }
  }, [healthData.completedProfile, geminiApiKey, useAI]);

  return {
    loading,
    insights,
    error,
    isOpen,
    useAI,
    setIsOpen,
    fetchInsightsFromAI,
    handleToggleAI,
    healthData
  };
};
