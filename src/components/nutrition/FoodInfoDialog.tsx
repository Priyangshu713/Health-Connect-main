import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHealthStore } from '@/store/healthStore';
import { Leaf, Utensils, Flame, Info, ChevronRight, X, ExternalLink, Lock } from 'lucide-react';
import { getFoodNutritionInfoFromGemini, fetchRecipeFromGemini, Recipe } from '@/services/NutritionGeminiService';
import { useToast } from '@/hooks/use-toast';
import RecipeDialog from './RecipeDialog';

export interface FoodNutritionInfo {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  isVegan: boolean;
  dishes: string[];
  preparationTips: string;
  benefits: string;
}

interface FoodInfoDialogProps {
  food: string | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

// Fallback function when AI is not available
const getFallbackNutritionInfo = (food: string): FoodNutritionInfo => {
  // Database of food nutrition information
  const foodDatabase: Record<string, FoodNutritionInfo> = {
    // Lean Proteins
    "Chicken breast": {
      name: "Chicken Breast",
      calories: "165 per 100g",
      protein: "31g per 100g",
      carbs: "0g per 100g",
      fat: "3.6g per 100g",
      isVegan: false,
      dishes: ["Grilled Chicken Salad", "Chicken Stir-Fry", "Chicken Parmesan"],
      preparationTips: "For maximum nutrition, cook chicken breast at lower temperatures to retain moisture and nutrients. Remove skin before cooking to reduce fat content.",
      benefits: "Excellent source of lean protein, vitamin B6, and niacin. Helps build muscle and supports immune function."
    },
    "Salmon": {
      name: "Salmon",
      calories: "208 per 100g",
      protein: "20g per 100g",
      carbs: "0g per 100g",
      fat: "13g per 100g",
      isVegan: false,
      dishes: ["Baked Salmon with Herbs", "Salmon Sushi", "Grilled Salmon with Lemon"],
      preparationTips: "To preserve omega-3 fatty acids, bake, grill, or steam rather than frying. Leave the skin on during cooking to retain more nutrients.",
      benefits: "Rich in omega-3 fatty acids, high-quality protein, and vitamin D. Supports heart health and brain function."
    },
    "Lentils": {
      name: "Lentils",
      calories: "116 per 100g",
      protein: "9g per 100g",
      carbs: "20g per 100g",
      fat: "0.4g per 100g",
      isVegan: true,
      dishes: ["Lentil Soup", "Lentil Curry", "Lentil Salad"],
      preparationTips: "Soak lentils for a few hours before cooking to reduce cooking time and improve digestibility. Add a strip of kombu seaweed during cooking to enhance mineral absorption.",
      benefits: "Excellent source of plant-based protein and dietary fiber. Rich in iron, folate, and potassium. Helps stabilize blood sugar."
    },
    "Tofu": {
      name: "Tofu",
      calories: "76 per 100g",
      protein: "8g per 100g",
      carbs: "2g per 100g",
      fat: "4.8g per 100g",
      isVegan: true,
      dishes: ["Tofu Stir-Fry", "Tofu Scramble", "Crispy Tofu Tacos"],
      preparationTips: "Press tofu before cooking to remove excess moisture for better texture. Marinate tofu before cooking to enhance flavor absorption.",
      benefits: "Complete plant protein containing all essential amino acids. Good source of calcium, iron, and isoflavones. Supports bone health and may reduce heart disease risk."
    },
    "Greek yogurt": {
      name: "Greek Yogurt",
      calories: "59 per 100g",
      protein: "10g per 100g",
      carbs: "3.6g per 100g",
      fat: "0.4g per 100g",
      isVegan: false,
      dishes: ["Yogurt Parfait", "Tzatziki Sauce", "Yogurt Bowl with Fruits"],
      preparationTips: "Choose plain, unsweetened varieties and add your own fresh fruit for natural sweetness. Use as a healthier substitute for sour cream or mayonnaise in recipes.",
      benefits: "High in protein and probiotics for gut health. Good source of calcium, vitamin B12, and riboflavin. Supports digestive and immune health."
    },
    "Beans": {
      name: "Beans",
      calories: "127 per 100g",
      protein: "8.7g per 100g",
      carbs: "22.8g per 100g",
      fat: "0.5g per 100g",
      isVegan: true,
      dishes: ["Bean Burrito", "Three Bean Salad", "Bean and Vegetable Soup"],
      preparationTips: "Soak dried beans overnight and discard the soaking water to reduce gas-causing compounds. Adding herbs like bay leaf, cumin, or epazote during cooking can improve digestibility.",
      benefits: "High in protein and fiber. Rich in antioxidants, iron, magnesium, and folate. Helps lower cholesterol and stabilize blood sugar."
    },
    // Add more foods as needed
  };

  // Return the food info if it exists, otherwise return a default message
  return foodDatabase[food] || {
    name: food,
    calories: "Information not available",
    protein: "Information not available",
    carbs: "Information not available",
    fat: "Information not available",
    isVegan: false,
    dishes: ["Information not available"],
    preparationTips: "Information not available",
    benefits: "Information not available"
  };
};

const FoodInfoDialog = ({ food, isOpen, onClose, isLoading: initialLoading }: FoodInfoDialogProps) => {
  const { geminiApiKey, geminiModel, geminiTier } = useHealthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(initialLoading);
  const [foodInfo, setFoodInfo] = useState<FoodNutritionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States for recipe dialog
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);
  
  // Add missing states for upgrade dialog
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeDialogTab, setUpgradeDialogTab] = useState<string>('pro');
  
  const aiEnabled = Boolean(geminiApiKey) && geminiTier !== 'free';
  
  useEffect(() => {
    const fetchNutritionInfo = async () => {
      if (!food) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (geminiApiKey && geminiTier === 'pro') {
          // Use Gemini AI to get nutrition info (for Pro tier only)
          const aiResponse = await getFoodNutritionInfoFromGemini(food, geminiApiKey, geminiModel);
          setFoodInfo(aiResponse);
        } else {
          // Fallback to local database for non-Pro tiers
          setFoodInfo(getFallbackNutritionInfo(food));
        }
      } catch (err) {
        console.error("Error fetching food information:", err);
        setError("Failed to fetch nutrition information. Using backup data.");
        setFoodInfo(getFallbackNutritionInfo(food));
        
        toast({
          title: "Error",
          description: "Could not fetch detailed nutrition information from AI. Using backup data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && food) {
      fetchNutritionInfo();
    }
  }, [isOpen, food, geminiApiKey, geminiModel, geminiTier]);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setFoodInfo(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle dish click to open recipe dialog
  const handleDishClick = async (dish: string) => {
    if (!geminiApiKey || geminiTier !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "Recipe details are available only for Pro tier subscribers.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedDish(dish);
    setRecipeLoading(true);
    setIsRecipeDialogOpen(true);
    
    try {
      // Consider food allergies when generating recipe (empty array for now)
      const recipe = await fetchRecipeFromGemini(dish, [], geminiApiKey, geminiModel);
      setRecipeData(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      toast({
        title: "Recipe Error",
        description: "Failed to generate recipe details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRecipeLoading(false);
    }
  };
  
  const closeRecipeDialog = () => {
    setIsRecipeDialogOpen(false);
    setSelectedDish(null);
    setRecipeData(null);
  };

  if (!food && !loading) return null;
  
  // Format benefits text with bullet points and emojis
  const formatBenefitsWithBullets = (benefitsText: string) => {
    if (!benefitsText) return [];
    
    // Split text by periods or line breaks to create bullet points
    const points = benefitsText
      .split(/\.\s+|\.(?=\w)|\n/)
      .filter(point => point.trim().length > 0)
      .map(point => point.trim() + (point.endsWith('.') ? '' : '.'));
    
    // Assign appropriate emojis to each bullet point
    const emojis = ['💪', '🧠', '❤️', '🔋', '🛡️', '🦴', '🩸', '🫀', '🧬', '⚡'];
    
    return points.map((point, index) => ({
      emoji: emojis[index % emojis.length],
      text: point
    }));
  };
  
  // Format preparation tips with bullet points and emojis
  const formatTipsWithBullets = (tipsText: string) => {
    if (!tipsText) return [];
    
    // Split text by periods or line breaks to create bullet points
    const points = tipsText
      .split(/\.\s+|\.(?=\w)|\n/)
      .filter(point => point.trim().length > 0)
      .map(point => point.trim() + (point.endsWith('.') ? '' : '.'));
    
    // Assign cooking-related emojis to each bullet point
    const emojis = ['🍳', '🔪', '⏲️', '🥣', '🌡️', '🧂', '🍽️', '🥄', '🧊', '🧈'];
    
    return points.map((point, index) => ({
      emoji: emojis[index % emojis.length],
      text: point
    }));
  };
  
  // Show Pro Required message if not on Pro tier
  if (geminiTier !== 'pro' && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
              Pro Feature Required
            </DialogTitle>
            <DialogDescription>
              Detailed food nutrition analysis requires Pro tier subscription
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Pro Tier Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">🔍</span>
                  <span className="text-muted-foreground">Search any food and get detailed nutrition analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🍽️</span>
                  <span className="text-muted-foreground">Get personalized recipe recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🧪</span>
                  <span className="text-muted-foreground">View health implications and ingredient details</span>
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Upgrade to Pro tier to unlock these advanced nutrition features
            </p>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onClose();
                setShowUpgradeDialog(true);
                setUpgradeDialogTab('pro');
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-center text-muted-foreground">Loading nutrition information...</p>
            </div>
          ) : foodInfo && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl pr-8">{foodInfo.name}</DialogTitle>
                  <Badge variant={foodInfo.isVegan ? "outline" : "default"} className={`ml-2 ${foodInfo.isVegan ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""}`}>
                    {foodInfo.isVegan ? (
                      <span className="flex items-center">
                        <Leaf className="h-3 w-3 mr-1" /> Vegan
                      </span>
                    ) : "Non-Vegan"}
                  </Badge>
                </div>
                <DialogDescription>
                  Detailed nutritional information and preparation tips
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-6">
                {/* Nutritional values */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Flame className="h-5 w-5 text-primary mr-2" />
                    Nutritional Values
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">Calories</p>
                        <p className="text-lg font-bold text-primary">{foodInfo.calories}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">Protein</p>
                        <p className="text-lg font-bold text-primary">{foodInfo.protein}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">Carbohydrates</p>
                        <p className="text-lg font-bold text-primary">{foodInfo.carbs}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium">Fat</p>
                        <p className="text-lg font-bold text-primary">{foodInfo.fat}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                {/* Health Benefits with bullet points and emojis */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Info className="h-5 w-5 text-primary mr-2" />
                    Health Benefits
                  </h3>
                  <ul className="space-y-2">
                    {formatBenefitsWithBullets(foodInfo.benefits).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-lg">{benefit.emoji}</span>
                        <span className="text-muted-foreground">{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                {/* Popular Dishes - Made Clickable */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Utensils className="h-5 w-5 text-primary mr-2" />
                    Popular Dishes (Click for Recipe)
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {foodInfo.dishes.map((dish, i) => (
                      <li 
                        key={i} 
                        className="flex items-center bg-muted/30 hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleDishClick(dish)}
                      >
                        <ChevronRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span>{dish}</span>
                        <ExternalLink className="h-3 w-3 ml-2 text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                {/* Preparation Tips with bullet points and emojis */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Utensils className="h-5 w-5 text-primary mr-2" />
                    Preparation Tips for Maximum Nutrition
                  </h3>
                  <ul className="space-y-2">
                    {formatTipsWithBullets(foodInfo.preparationTips).map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-lg">{tip.emoji}</span>
                        <span className="text-muted-foreground">{tip.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Recipe Dialog */}
      <RecipeDialog 
        recipe={recipeData}
        isOpen={isRecipeDialogOpen}
        onClose={closeRecipeDialog}
        isLoading={recipeLoading}
      />
    </>
  );
};

export default FoodInfoDialog;
