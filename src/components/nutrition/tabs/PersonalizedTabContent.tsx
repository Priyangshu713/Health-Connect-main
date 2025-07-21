import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Wand2, Utensils, Plus, AlertCircle } from 'lucide-react';
import { HealthData } from '@/store/healthStore';
import LoadingNutritionPlan from '@/components/nutrition/LoadingNutritionPlan';
import EmptyRecommendations from '@/components/health-report/EmptyRecommendations';
import AllergiesInput from '@/components/nutrition/AllergiesInput';
import CategoryCard from '@/components/nutrition/CategoryCard';
import UpgradePrompt from '@/components/nutrition/UpgradePrompt';
import { FoodCategory } from '@/services/NutritionGeminiService';

interface Category {
  category: string;
  benefits: string;
  foods: string[];
  mealPlan?: string;
}

interface NutritionPlan {
  categories: FoodCategory[];
  generalAdvice: string;
}

interface PersonalizedTabContentProps {
  healthData: HealthData;
  geminiTier: 'free' | 'lite' | 'pro';
  loading: boolean;
  nutritionPlan: NutritionPlan | null;
  useAI: boolean;
  allergies: string[];
  showAllergiesInput: boolean;
  setShowAllergiesInput: (show: boolean) => void;
  handleAddAllergy: (allergy: string) => void;
  handleRemoveAllergy: (allergy: string) => void;
  handleToggleAI: () => void;
  refreshingCategory: string | null;
  fetchRecipeDetails: (mealPlan: string) => void;
  refreshCategoryMealPlan: (categoryName: string) => void;
  handleFoodClick: (food: string) => void;
  handleAIRequiredNotice: () => void;
  setUpgradeDialogTab: (tab: string) => void;
  setShowUpgradeDialog: (show: boolean) => void;
  itemVariants: any;
}

const PersonalizedTabContent = ({
  healthData,
  geminiTier,
  loading,
  nutritionPlan,
  useAI,
  allergies,
  showAllergiesInput,
  setShowAllergiesInput,
  handleAddAllergy,
  handleRemoveAllergy,
  handleToggleAI,
  refreshingCategory,
  fetchRecipeDetails,
  refreshCategoryMealPlan,
  handleFoodClick,
  handleAIRequiredNotice,
  setUpgradeDialogTab,
  setShowUpgradeDialog,
  itemVariants
}: PersonalizedTabContentProps) => {

  if (geminiTier === 'free') {
    return (
      <UpgradePrompt
        title="Personalized Nutrition Plan"
        description="Get AI-powered nutrition plans customized specifically for your health profile."
        features={[
          "Tailored food recommendations based on your health data",
          "Personalized meal plans for your specific needs",
          "Regular updates to your nutrition plan as your health changes",
          "Detailed recipes for each recommended meal"
        ]}
        tier="lite"
        onUpgrade={() => {
          setUpgradeDialogTab('lite');
          setShowUpgradeDialog(true);
        }}
      />
    );
  }

  if (!healthData.completedProfile) {
    return (
      <EmptyRecommendations type="Profile" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center p-4 bg-muted/40 rounded-lg border">
        <div className="flex-1">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI-Powered Nutrition Plan
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get personalized nutrition recommendations based on your health profile.
          </p>
        </div>

        <div className="flex flex-col gap-2">

          <div className="flex flex-wrap gap-2 items-center">
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allergies.map((allergy, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleRemoveAllergy(allergy)}
                  >
                    {allergy}
                    <span className="cursor-pointer ml-1 hover:text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setShowAllergiesInput(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {allergies.length > 0 ? 'Add More Allergies' : 'Add Allergies'}
            </Button>
          </div>
        </div>
      </div>

      {showAllergiesInput && (
        <AllergiesInput
          allergies={allergies}
          onAdd={handleAddAllergy}
          onRemove={handleRemoveAllergy}
        />
      )}

      {loading ? (
        <LoadingNutritionPlan />
      ) : nutritionPlan ? (
        <div className="space-y-6">
          {nutritionPlan.generalAdvice && (
            <motion.div
              variants={itemVariants}
              className="p-4 bg-primary/5 rounded-lg border border-primary/20"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">General Advice</h3>
                  <p className="text-sm text-muted-foreground">{nutritionPlan.generalAdvice}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {nutritionPlan.categories.map((category, index) => (
              <CategoryCard
                key={index}
                category={category}
                useAI={useAI}
                index={index}
                refreshingCategory={refreshingCategory}
                fetchRecipeDetails={fetchRecipeDetails}
                refreshCategoryMealPlan={refreshCategoryMealPlan}
                handleFoodClick={handleFoodClick}
                handleAIRequiredNotice={handleAIRequiredNotice}
                variants={itemVariants}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyRecommendations type="Nutrition" />
      )}
    </div>
  );
};

export default PersonalizedTabContent;

