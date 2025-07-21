import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { useHistoryStore } from '@/store/historyStore';
import { InsightSection } from '../components/profile/insights/types';
import { generateSampleInsights } from '../components/profile/insights/SampleInsightsGenerator';
import { fetchInsightsFromGemini } from '../components/profile/insights/GeminiService';

export const useHealthInsights = () => {
  const { toast } = useToast();
  const { healthData, geminiApiKey, geminiTier } = useHealthStore();
  const { addHistoryEntry } = useHistoryStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [useAI, setUseAI] = useState(geminiTier !== 'free');

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

        // Add a history entry when new insights are generated
        addHistoryEntry({ ...healthData });
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
        title: "AI Tier Required",
        description: "Please select a Gemini AI tier to use AI features",
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
    setUseAI(geminiTier !== 'free');
  }, [geminiTier]);

  useEffect(() => {
    if (geminiApiKey && !useAI) {
      setUseAI(true);
    } else if (!geminiApiKey && useAI) {
      setUseAI(false);
    }
  }, [geminiApiKey, useAI]);

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
