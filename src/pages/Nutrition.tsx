  import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthStore } from '@/store/healthStore';
import { useNutritionPlan } from '@/hooks/useNutritionPlan';
import { useNutritionData } from '@/hooks/useNutritionData';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import RecipeDialog from '@/components/nutrition/RecipeDialog';
import FoodInfoDialog from '@/components/nutrition/FoodInfoDialog';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import GeneralTabContent from '@/components/nutrition/tabs/GeneralTabContent';
import PersonalizedTabContent from '@/components/nutrition/tabs/PersonalizedTabContent';
import MealGeneratorTabContent from '@/components/nutrition/tabs/MealGeneratorTabContent';
import MealTrackerTabContent from '@/components/nutrition/tabs/MealTrackerTabContent';
import ExpandableSearch from '@/components/nutrition/ExpandableSearch';
import BarcodeScanner from '@/components/nutrition/BarcodeScanner';
import FoodSearchResults, { FoodSearchInfo } from '@/components/nutrition/FoodSearchResults';
import { searchFoodHealth } from '@/services/FoodSearchService';
import { Apple, User, ChefHat, Lock, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const Nutrition = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { healthData, geminiTier, geminiApiKey, geminiModel } = useHealthStore();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeDialogTab, setUpgradeDialogTab] = useState<string>('lite');
  const [activeTab, setActiveTab] = useState('general');

  // Food search related states
  const [searchedFood, setSearchedFood] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<FoodSearchInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const {
    loading: personalizedLoading,
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
    setShowUpgradeDialog: setNutritionPlanUpgradeDialog,
    setUpgradeDialogTab: setNutritionPlanUpgradeDialogTab
  } = useNutritionPlan();

  const {
    nutritionData: generalNutrition,
    loading: generalLoading,
    error: generalError,
    refreshData
  } = useNutritionData();

  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [foodInfoDialogOpen, setFoodInfoDialogOpen] = useState(false);
  const [loadingFoodInfo, setLoadingFoodInfo] = useState(false);

  const handleTabChange = (value: string) => {
    if (geminiTier === 'free' && value === 'personalized') {
      setUpgradeDialogTab('lite');
      setShowUpgradeDialog(true);
      return;
    }

    if (geminiTier !== 'pro' && (value === 'meal-generator' || value === 'meal-tracker')) {
      setUpgradeDialogTab('pro');
      setShowUpgradeDialog(true);
      return;
    }

    setActiveTab(value);
  };

  const showAppleNutrition = () => {
    const nutritionText = 'Calories: 95 kcal\nCarbs: 25 g\nFiber: 4 g\nSugars: 19 g\nProtein: 0.5 g\nFat: 0.3 g\nVitamin C: 14% DV';
    toast({
      title: 'Sample Nutrition (Apple)',
      description: nutritionText.replace(/\n/g, ' | '),
      duration: 8000,
    });
  };

  // const handleBarcodeScan = async (barcode: string) => {
  //   // Send to backend (non-blocking)
  //   fetch('/api/barcode', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ barcode }),
  //   }).catch(() => {});

  //   // Demo: show apple nutrition
  //   const nutritionText = 'Calories: 95 kcal\nCarbs: 25 g\nFiber: 4 g\nSugars: 19 g\nProtein: 0.5 g\nFat: 0.3 g\nVitamin C: 14% DV';

  //   // Show toast (primary UX)
  //   toast({
  //     title: 'Sample Nutrition (Apple)',
  //     description: nutritionText.replace(/\n/g, ' | '),
  //     duration: 8000,
  //   });

  //   // Fallback alert in case toast is hidden by overlay or z-index issues
  //   setTimeout(() => {
  //     alert(`Apple Nutrition Facts:\n${nutritionText}`);
  //   }, 100);
  // };

  const handleFoodClick = (food: string) => {
    if (!useAI) {
      return;
    }

    setSelectedFood(food);
    setLoadingFoodInfo(true);
    setFoodInfoDialogOpen(true);

    setTimeout(() => {
      setLoadingFoodInfo(false);
    }, 500);
  };

  const handleSearch = async (foodName: string) => {
    if (geminiTier !== 'pro') {
      setUpgradeDialogTab('pro');
      setShowUpgradeDialog(true);
      return;
    }

    if (!geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set up your Gemini API key in profile settings.",
        variant: "destructive",
      });
      return;
    }

    setSearchedFood(foodName);
    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const foodInfo = await searchFoodHealth(foodName, geminiApiKey, geminiModel);
      setSearchResults(foodInfo);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Could not get information for this food. Please try again.",
        variant: "destructive",
      });
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = () => {
    if (searchedFood) {
      setSelectedFood(searchedFood);
      setFoodInfoDialogOpen(true);
      setShowSearchResults(false);
    }
  };

  const closeFoodInfoDialog = () => {
    setFoodInfoDialogOpen(false);
    setTimeout(() => {
      setSelectedFood(null);
    }, 300);
  };

  const handleAIRequiredNotice = () => {
    toast({
      title: "AI Feature Required",
      description: "Please enable AI in the settings to view detailed nutrition information.",
      variant: "default",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    if (geminiTier === 'free' && activeTab === 'personalized') {
      setActiveTab('general');
    }

    if (geminiTier !== 'pro' && (activeTab === 'meal-generator' || activeTab === 'meal-tracker')) {
      setActiveTab('general');
    }
  }, [geminiTier, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl pt-24 pb-16 px-4">
        <header className="mb-8 text-left">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Nutrition Guide</h1>
            <div className="flex items-center gap-2">
                
                <BarcodeScanner  />  
                {/* // onScanResult={handleBarcodeScan} */}
                <ExpandableSearch onSearchResult={handleSearch} />
              </div>
          </div>
          <p className="text-muted-foreground">
            Discover foods that can help improve your health and well-being
          </p>
        </header>

        {/* Search Results */}
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Search Results</h2>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FoodSearchResults
              foodInfo={searchResults}
              isLoading={isSearching}
              onViewDetails={handleViewDetails}
              onClose={() => setShowSearchResults(false)}
            />
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`mb-6 ${isMobile ? 'flex w-full' : ''}`}>
            <TabsTrigger value="general" className="gap-2">
              <Apple className="h-4 w-4" />
              <span className={isMobile ? 'hidden md:inline' : ''}>General Recommendations</span>
              {isMobile && <span className="md:hidden">General</span>}
            </TabsTrigger>
            <TabsTrigger value="personalized" className="gap-2" disabled={!healthData.completedProfile}>
              <User className="h-4 w-4" />
              <span className={isMobile ? 'hidden md:inline' : ''}>Personalized For You</span>
              {isMobile && <span className="md:hidden">Personal</span>}
              {geminiTier === 'free' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="meal-generator" className="gap-2">
              <ChefHat className="h-4 w-4" />
              <span className={isMobile ? 'hidden md:inline' : ''}>Meal Generator</span>
              {isMobile && <span className="md:hidden">Meals</span>}
              {geminiTier !== 'pro' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="meal-tracker" className="gap-2">
              <CalendarClock className="h-4 w-4" />
              <span className={isMobile ? 'hidden md:inline' : ''}>Nutrition & Fitness Tracker</span>
              {isMobile && <span className="md:hidden">Tracker</span>}
              {geminiTier !== 'pro' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <GeneralTabContent
              generalNutrition={generalNutrition}
              generalLoading={generalLoading}
              generalError={generalError}
              refreshData={refreshData}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          </TabsContent>

          <TabsContent value="personalized" className="mt-0">
            <PersonalizedTabContent
              healthData={healthData}
              geminiTier={geminiTier}
              loading={personalizedLoading}
              nutritionPlan={nutritionPlan}
              useAI={useAI}
              allergies={allergies}
              showAllergiesInput={showAllergiesInput}
              setShowAllergiesInput={setShowAllergiesInput}
              handleAddAllergy={handleAddAllergy}
              handleRemoveAllergy={handleRemoveAllergy}
              handleToggleAI={handleToggleAI}
              refreshingCategory={refreshingCategory}
              fetchRecipeDetails={fetchRecipeDetails}
              refreshCategoryMealPlan={refreshCategoryMealPlan}
              handleFoodClick={handleFoodClick}
              handleAIRequiredNotice={handleAIRequiredNotice}
              setUpgradeDialogTab={setUpgradeDialogTab}
              setShowUpgradeDialog={setShowUpgradeDialog}
              itemVariants={itemVariants}
            />
          </TabsContent>

          <TabsContent value="meal-generator" className="mt-0">
            <MealGeneratorTabContent
              geminiTier={geminiTier}
              setUpgradeDialogTab={setUpgradeDialogTab}
              setShowUpgradeDialog={setShowUpgradeDialog}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          </TabsContent>

          <TabsContent value="meal-tracker" className="mt-0">
            <MealTrackerTabContent
              geminiTier={geminiTier}
              setUpgradeDialogTab={setUpgradeDialogTab}
              setShowUpgradeDialog={setShowUpgradeDialog}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          </TabsContent>
        </Tabs>
      </main>

      <RecipeDialog
        recipe={currentRecipe}
        isOpen={recipeDialogOpen}
        onClose={closeRecipeDialog}
        isLoading={loadingRecipe}
      />

      <FoodInfoDialog
        food={selectedFood}
        isOpen={foodInfoDialogOpen}
        onClose={closeFoodInfoDialog}
        isLoading={loadingFoodInfo}
      />

      <SubscriptionPlansDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onSelectTier={(tier) => {
          setShowUpgradeDialog(false);
          if (upgradeDialogTab === 'personalized' || upgradeDialogTab === 'meal-generator' || upgradeDialogTab === 'meal-tracker') {
            setActiveTab(upgradeDialogTab);
          }
        }}
        initialTab={upgradeDialogTab}
      />
    </div>
  );
};

export default Nutrition;
