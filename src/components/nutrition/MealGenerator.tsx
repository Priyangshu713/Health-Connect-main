
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Refrigerator, ChefHat, AlertCircle, Search, 
  Plus, X, Timer, ScrollText, Award, Info, 
  Sparkles, Loader2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  generateMealFromIngredients, 
  MealIdeaFromIngredients 
} from '@/services/NutritionGeminiService';

const MealGenerator = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { geminiApiKey } = useHealthStore();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [currentRestriction, setCurrentRestriction] = useState('');
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [mealIdea, setMealIdea] = useState<MealIdeaFromIngredients | null>(null);
  const ingredientInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddIngredient = () => {
    if (currentIngredient.trim() !== '' && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
      
      if (ingredientInputRef.current) {
        ingredientInputRef.current.focus();
      }
    }
  };
  
  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };
  
  const handleAddRestriction = () => {
    if (currentRestriction.trim() !== '' && !dietaryRestrictions.includes(currentRestriction.trim())) {
      setDietaryRestrictions([...dietaryRestrictions, currentRestriction.trim()]);
      setCurrentRestriction('');
    }
  };
  
  const handleRemoveRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
  };
  
  const handleGenerateMeal = async () => {
    if (!geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in the Profile page to use this feature",
        variant: "destructive",
      });
      return;
    }
    
    if (ingredients.length === 0) {
      toast({
        title: "Ingredients Required",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setGenerated(false);
    
    try {
      const meal = await generateMealFromIngredients(
        ingredients, 
        servings, 
        dietaryRestrictions, 
        geminiApiKey
      );
      
      setMealIdea(meal);
      setGenerated(true);
      
      toast({
        title: "Meal Generated",
        description: `Successfully created: ${meal.title}`,
      });
    } catch (error) {
      console.error("Error generating meal:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };
  
  const resetForm = () => {
    setIngredients([]);
    setDietaryRestrictions([]);
    setServings(2);
    setGenerated(false);
    setMealIdea(null);
  };
  
  return (
    <div className="flex flex-col gap-6 w-full">
      {!geminiApiKey ? (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Lock className="h-5 w-5" />
              Feature Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-400">
              To use the meal generator, you need to add your Gemini API key in the Profile page.
              This feature uses AI to create personalized meal ideas with only your provided ingredients.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/profile'} variant="outline" className="border-amber-300">
              Go to Profile
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Refrigerator className="h-5 w-5 text-primary" />
                What's In Your Kitchen?
              </CardTitle>
              <CardDescription>
                Enter the ingredients you have, and we'll create a meal idea using only these items plus basic staples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter an ingredient..."
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleAddIngredient)}
                    ref={ingredientInputRef}
                    disabled={loading}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleAddIngredient} 
                    disabled={currentIngredient.trim() === '' || loading}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ingredients.map((ingredient, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="pl-2 flex items-center gap-1"
                      >
                        {ingredient}
                        <button 
                          className="ml-1 hover:bg-muted rounded-full p-0.5" 
                          onClick={() => handleRemoveIngredient(ingredient)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Servings</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    disabled={servings <= 1 || loading}
                    className="flex-shrink-0"
                  >
                    <span>-</span>
                  </Button>
                  <span className="w-8 text-center">{servings}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setServings(servings + 1)}
                    disabled={loading}
                    className="flex-shrink-0"
                  >
                    <span>+</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dietary Restrictions/Allergies</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="E.g., dairy, nuts, gluten..."
                    value={currentRestriction}
                    onChange={(e) => setCurrentRestriction(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleAddRestriction)}
                    disabled={loading}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleAddRestriction} 
                    disabled={currentRestriction.trim() === '' || loading}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {dietaryRestrictions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryRestrictions.map((restriction, index) => (
                      <Badge 
                        key={index} 
                        variant="destructive" 
                        className="pl-2 flex items-center gap-1 bg-red-500/20 text-red-600 hover:bg-red-500/30"
                      >
                        {restriction}
                        <button 
                          className="ml-1 hover:bg-red-500/20 rounded-full p-0.5" 
                          onClick={() => handleRemoveRestriction(restriction)}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex flex-wrap gap-2">
              <Button 
                onClick={handleGenerateMeal} 
                disabled={ingredients.length === 0 || loading} 
                className="flex-1 gap-2 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4" />
                    Generate Meal Idea
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm} 
                disabled={loading} 
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            </CardFooter>
          </Card>
          
          {ingredients.length === 0 && !generated && !loading && (
            <Card className="bg-muted/50 w-full">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Add Ingredients to Get Started</h3>
                <p className="text-muted-foreground">
                  Enter the ingredients you have available, and we'll create a delicious meal idea using only those ingredients.
                </p>
              </CardContent>
            </Card>
          )}
          
          {loading && (
            <Card className="w-full">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ChefHat className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-medium mb-2">Creating Your Meal</h3>
                <p className="text-muted-foreground">
                  Our AI chef is working on a delicious meal idea using only your ingredients...
                </p>
              </CardContent>
            </Card>
          )}
          
          {generated && mealIdea && (
            <Card className="w-full">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  AI Generated
                </Badge>
                <CardTitle className="text-xl">{mealIdea.title}</CardTitle>
                <CardDescription>{mealIdea.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-primary" />
                    Preparation Time
                  </h3>
                  <p className="text-sm">{mealIdea.preparationTime}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <ScrollText className="h-4 w-4 text-primary" />
                    Ingredients
                  </h3>
                  <ul className="space-y-1">
                    {mealIdea.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm flex gap-2">
                        <span className="font-medium">{ingredient.amount}</span>
                        <span>{ingredient.name}</span>
                        {ingredient.optional && (
                          <span className="text-xs text-muted-foreground italic ml-1">(optional)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    Nutrition (per serving)
                  </h3>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                      <span className="font-medium">Calories:</span> {mealIdea.nutritionInfo.calories}
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                      <span className="font-medium">Protein:</span> {mealIdea.nutritionInfo.protein}
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                      <span className="font-medium">Carbs:</span> {mealIdea.nutritionInfo.carbs}
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                      <span className="font-medium">Fat:</span> {mealIdea.nutritionInfo.fat}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <ChefHat className="h-4 w-4 text-primary" />
                    Instructions
                  </h3>
                  <ol className="space-y-3 pl-4 list-decimal">
                    {mealIdea.instructions.map((step, index) => (
                      <li key={index} className="text-sm pl-1">{step}</li>
                    ))}
                  </ol>
                </div>
                
                {mealIdea.tips && (
                  <>
                    <Separator />
                    <div className="rounded-md bg-primary/5 p-3 flex gap-2">
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <h4 className="font-medium mb-1">Chef's Tips</h4>
                        <p>{mealIdea.tips}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2 flex-wrap">
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <X className="h-4 w-4" />
                  New Recipe
                </Button>
                <Button onClick={handleGenerateMeal} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ChefHat className="h-4 w-4" />
                      Regenerate
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MealGenerator;
