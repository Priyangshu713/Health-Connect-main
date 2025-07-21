
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { getAllRecommendations } from '@/lib/healthUtils';
import { fetchRecommendationsFromGemini, GeminiRecommendation } from '@/services/HealthReportGeminiService';

export const useHealthRecommendations = () => {
  const { toast } = useToast();
  const { healthData, geminiApiKey, geminiTier } = useHealthStore();
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<GeminiRecommendation[]>([]);
  const [fallbackRecommendations, setFallbackRecommendations] = useState(
    getAllRecommendations(healthData.bmi || 0, healthData.bloodGlucose || 0)
  );
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [healthScore, setHealthScore] = useState(70);

  // Calculate health score based on health metrics
  const calculateHealthScore = () => {
    let score = 70; // Default score
    
    // BMI factor
    if (healthData.bmi) {
      if (healthData.bmi >= 18.5 && healthData.bmi < 25) {
        score += 15; // Normal BMI
      } else if ((healthData.bmi >= 17 && healthData.bmi < 18.5) || (healthData.bmi >= 25 && healthData.bmi < 30)) {
        score += 5; // Slightly outside normal range
      } else {
        score -= 10; // Far from normal range
      }
    }
    
    // Blood glucose factor
    if (healthData.bloodGlucose) {
      if (healthData.bloodGlucose >= 70 && healthData.bloodGlucose <= 99) {
        score += 15; // Normal blood glucose
      } else if (healthData.bloodGlucose > 99 && healthData.bloodGlucose < 126) {
        score -= 5; // Prediabetic range
      } else if (healthData.bloodGlucose >= 126) {
        score -= 15; // Diabetic range
      }
    }
    
    // Ensure score stays between 0-100
    return Math.max(0, Math.min(100, score));
  };

  const fetchRecommendations = async () => {
    if (!healthData.completedProfile) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Only use AI if user has a paid tier (lite or pro) and has an API key
      if (useAI && geminiApiKey && geminiTier !== 'free') {
        const recommendations = await fetchRecommendationsFromGemini(healthData, geminiApiKey);
        setAiRecommendations(recommendations);
      } else {
        // Update fallback recommendations when not using AI
        const fallbackRecs = getAllRecommendations(
          healthData.bmi || 0, 
          healthData.bloodGlucose || 0
        );
        setFallbackRecommendations(fallbackRecs);
        // Add a small delay to simulate loading for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to generate recommendations. Please try again later.");
      
      toast({
        title: "Error",
        description: "Could not generate health recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAI = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !useAI;
    
    if (newState && geminiTier === 'free') {
      toast({
        title: "AI Features Restricted",
        description: "Please upgrade to Lite or Pro tier to access AI-powered health recommendations",
        variant: "destructive",
      });
      return; // Don't update useAI state if user is on free tier
    }
    
    if (newState && !geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in the Profile page to use AI features",
        variant: "destructive",
      });
      return; // Don't update useAI state if there's no API key
    }
    
    setUseAI(newState);
    
    toast({
      title: newState ? "AI Enabled" : "AI Disabled",
      description: newState 
        ? "Using Gemini AI for personalized health recommendations" 
        : "Using standard recommendations instead of Gemini AI",
    });
  };

  // Update useAI when geminiTier or API key changes
  useEffect(() => {
    // Only enable AI if user has a paid tier (lite or pro) and has an API key
    const shouldUseAI = geminiTier !== 'free' && !!geminiApiKey;
    setUseAI(shouldUseAI);
  }, [geminiTier, geminiApiKey]);

  // Update health score and fetch recommendations when health data changes
  useEffect(() => {
    if (healthData.completedProfile) {
      const score = calculateHealthScore();
      setHealthScore(score);
      fetchRecommendations();
    }
  }, [healthData, geminiApiKey, useAI]);

  return {
    loading,
    recommendations: useAI ? aiRecommendations : fallbackRecommendations,
    error,
    useAI,
    healthScore,
    fetchRecommendations,
    handleToggleAI,
    healthData,
    geminiTier
  };
};
