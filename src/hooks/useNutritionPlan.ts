
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { fetchNutritionPlanFromGemini, FoodCategory, Recipe, fetchRecipeFromGemini } from '@/services/NutritionGeminiService';

interface NutritionPlan {
  categories: FoodCategory[];
  generalAdvice: string;
}

export const useNutritionPlan = () => {
  const { toast } = useToast();
  const { healthData, geminiApiKey, geminiModel, geminiTier } = useHealthStore();
  
  const [loading, setLoading] = useState(true);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [showAllergiesInput, setShowAllergiesInput] = useState(false);
  
  // Recipe dialog states
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  
  // Category refreshing state
  const [refreshingCategory, setRefreshingCategory] = useState<string | null>(null);
  
  // For the upgrade dialog
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeDialogTab, setUpgradeDialogTab] = useState<string>('lite');
  
  // Fetch nutrition plan on initial load or when dependencies change
  useEffect(() => {
    if (!healthData.completedProfile || !useAI) {
      setLoading(false);
      return;
    }
    
    const fetchNutritionPlan = async () => {
      setLoading(true);
      
      try {
        // Check if we have cached data
        const cachedData = sessionStorage.getItem('nutrition-personalized-plan');
        const cachedAllergies = sessionStorage.getItem('nutrition-allergies');
        
        if (cachedData && cachedAllergies) {
          setNutritionPlan(JSON.parse(cachedData));
          setAllergies(JSON.parse(cachedAllergies));
          setLoading(false);
          return;
        }
        
        if (!geminiApiKey) {
          throw new Error('No API key provided');
        }
        
        // No cache, fetch fresh data
        const plan = await fetchNutritionPlanFromGemini(healthData, allergies, geminiApiKey, geminiModel);
        setNutritionPlan(plan);
        
        // Cache the data
        sessionStorage.setItem('nutrition-personalized-plan', JSON.stringify(plan));
        sessionStorage.setItem('nutrition-allergies', JSON.stringify(allergies));
      } catch (err) {
        console.error('Error fetching nutrition plan:', err);
        
        toast({
          title: 'Error',
          description: 'Could not generate personalized nutrition plan. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNutritionPlan();
  }, [healthData, useAI, geminiApiKey]);
  
  // Function to handle adding allergies
  const handleAddAllergy = (allergy: string) => {
    if (!allergy.trim() || allergies.includes(allergy.trim())) return;
    
    const updatedAllergies = [...allergies, allergy.trim()];
    setAllergies(updatedAllergies);
    
    // Clear cache to force regeneration with new allergies
    sessionStorage.removeItem('nutrition-personalized-plan');
    sessionStorage.setItem('nutrition-allergies', JSON.stringify(updatedAllergies));
    
    // Regenerate plan with new allergies if AI is enabled
    if (useAI && geminiApiKey) {
      setLoading(true);
      fetchNutritionPlanFromGemini(healthData, updatedAllergies, geminiApiKey, geminiModel)
        .then(plan => {
          setNutritionPlan(plan);
          sessionStorage.setItem('nutrition-personalized-plan', JSON.stringify(plan));
        })
        .catch(err => {
          console.error('Error updating plan with new allergy:', err);
          toast({
            title: 'Error',
            description: 'Failed to update nutrition plan with your allergy. Please try again.',
            variant: 'destructive',
          });
        })
        .finally(() => setLoading(false));
    }
  };
  
  // Function to handle removing allergies
  const handleRemoveAllergy = (allergy: string) => {
    const updatedAllergies = allergies.filter(a => a !== allergy);
    setAllergies(updatedAllergies);
    
    // Clear cache to force regeneration without removed allergy
    sessionStorage.removeItem('nutrition-personalized-plan');
    sessionStorage.setItem('nutrition-allergies', JSON.stringify(updatedAllergies));
    
    // Regenerate plan with updated allergies if AI is enabled
    if (useAI && geminiApiKey) {
      setLoading(true);
      fetchNutritionPlanFromGemini(healthData, updatedAllergies, geminiApiKey, geminiModel)
        .then(plan => {
          setNutritionPlan(plan);
          sessionStorage.setItem('nutrition-personalized-plan', JSON.stringify(plan));
        })
        .catch(err => {
          console.error('Error updating plan after removing allergy:', err);
          toast({
            title: 'Error',
            description: 'Failed to update nutrition plan. Please try again.',
            variant: 'destructive',
          });
        })
        .finally(() => setLoading(false));
    }
  };
  
  // Function to toggle AI usage
  const handleToggleAI = () => {
    setUseAI(!useAI);
    
    if (!useAI && !geminiApiKey) {
      // If turning on AI but no API key, show error
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in the settings to use AI features.",
        variant: "destructive",
      });
    }
  };
  
  // Function to fetch recipe details
  const fetchRecipeDetails = async (mealPlan: string) => {
    if (!geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in the settings to view recipes.",
        variant: "destructive",
      });
      return;
    }
    
    if (geminiTier === 'free') {
      if (setShowUpgradeDialog) {
        setUpgradeDialogTab('lite');
        setShowUpgradeDialog(true);
      }
      return;
    }
    
    setLoadingRecipe(true);
    setRecipeDialogOpen(true);
    
    try {
      const recipe = await fetchRecipeFromGemini(mealPlan, allergies, geminiApiKey, geminiModel);
      setCurrentRecipe(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      toast({
        title: "Recipe Error",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
      setRecipeDialogOpen(false);
    } finally {
      setLoadingRecipe(false);
    }
  };
  
  // Function to close recipe dialog
  const closeRecipeDialog = () => {
    setRecipeDialogOpen(false);
    setTimeout(() => {
      setCurrentRecipe(null);
    }, 300);
  };
  
  // Function to refresh a specific category
  const refreshCategoryMealPlan = async (categoryName: string) => {
    if (!geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in the settings to refresh meal plans.",
        variant: "destructive",
      });
      return;
    }
    
    setRefreshingCategory(categoryName);
    
    try {
      const fullPlan = await fetchNutritionPlanFromGemini(healthData, allergies, geminiApiKey, geminiModel);
      
      // Update only the specified category
      if (nutritionPlan) {
        const updatedCategories = nutritionPlan.categories.map(category => 
          category.category === categoryName 
            ? fullPlan.categories.find(c => c.category === categoryName) || category
            : category
        );
        
        const updatedPlan = {
          ...nutritionPlan,
          categories: updatedCategories
        };
        
        setNutritionPlan(updatedPlan);
        sessionStorage.setItem('nutrition-personalized-plan', JSON.stringify(updatedPlan));
      }
    } catch (error) {
      console.error("Error refreshing category:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingCategory(null);
    }
  };
  
  return {
    loading,
    nutritionPlan,
    useAI,
    allergies,
    showAllergiesInput,
    setShowAllergiesInput,
    handleAddAllergy,
    handleRemoveAllergy,
    handleToggleAI,
    currentRecipe,
    loadingRecipe, 
    recipeDialogOpen,
    refreshingCategory,
    fetchRecipeDetails,
    closeRecipeDialog,
    refreshCategoryMealPlan,
    showUpgradeDialog,
    setShowUpgradeDialog,
    upgradeDialogTab,
    setUpgradeDialogTab
  };
};
