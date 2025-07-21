import { FoodSearchInfo } from '@/components/nutrition/FoodSearchResults';
import { getFoodNutritionInfoFromGemini } from '@/services/NutritionGeminiService';
import { GeminiModelType } from '@/store/healthStore';

export const searchFoodHealth = async (
  foodName: string,
  apiKey: string,
  modelType: GeminiModelType
): Promise<FoodSearchInfo> => {
  try {
    // First check if the input is actually a food item
    const isFoodResult = await checkIfFoodItem(foodName, apiKey, modelType);

    if (!isFoodResult.isFood) {
      // Return non-food response
      return {
        name: foodName,
        category: 'junk',
        calories: "0 per 100g",
        protein: "0g per 100g",
        carbs: "0g per 100g",
        fat: "0g per 100g",
        isVegan: false,
        ingredients: isFoodResult.components || ["Not edible"],
        healthImplications: [
          "Not a food item - not meant for consumption",
          "Could be harmful if ingested",
          "No nutritional value",
          "Please search for actual food items for nutritional information"
        ],
        benefitsInfo: [],
        isNonFood: true
      };
    }

    // If it is a food item, proceed with normal processing
    const nutritionInfo = await getFoodNutritionInfoFromGemini(foodName, apiKey, modelType);

    // Then get additional health categorization from Gemini
    const healthInfo = await getHealthCategorization(foodName, apiKey, modelType);

    // Combine the information
    return {
      name: nutritionInfo.name,
      category: healthInfo.category,
      calories: nutritionInfo.calories,
      protein: nutritionInfo.protein,
      carbs: nutritionInfo.carbs,
      fat: nutritionInfo.fat,
      isVegan: nutritionInfo.isVegan,
      ingredients: healthInfo.ingredients,
      healthImplications: healthInfo.healthImplications,
      benefitsInfo: healthInfo.benefits ? healthInfo.benefits.split('. ').filter(b => b.trim()) : [],
      isNonFood: false
    };
  } catch (error) {
    console.error('Error searching food health:', error);
    throw new Error('Failed to get food health information');
  }
};

interface FoodCheckResult {
  isFood: boolean;
  components?: string[];
}

const checkIfFoodItem = async (
  query: string,
  apiKey: string,
  modelType: GeminiModelType
): Promise<FoodCheckResult> => {
  try {
    // Import GoogleGenerativeAI dynamically to avoid SSR issues
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelType,
    });

    const prompt = `
      You are a food identification expert. For the following item, determine if it is a food item that humans consume as nutrition:
      
      Item: "${query}"
      
      Provide a JSON response with this format:
      {
        "isFood": true/false,
        "components": ["component1", "component2", "etc"] (if not food, list primary materials/components)
      }
      
      Guidelines:
      - "isFood" should be true ONLY for items that are edible and commonly consumed by humans as food or drink.
      - For non-food items, "isFood" should be false.
      - For toys, objects, chemicals, and other non-edible items, return false.
      - Be strict in classification - if in doubt, classify as non-food.
      
      Return ONLY a valid JSON object with no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return {
      isFood: parsedData.isFood === true,
      components: Array.isArray(parsedData.components) ? parsedData.components : undefined
    };
  } catch (error) {
    console.error("Error in food identification:", error);

    // Default to assuming it's food in case of error to avoid false negatives
    return { isFood: true };
  }
};

interface HealthCategorizationResponse {
  category: 'healthy' | 'unhealthy' | 'junk' | 'neutral';
  ingredients: string[];
  healthImplications: string[];
  benefits: string;
}

const getHealthCategorization = async (
  foodName: string,
  apiKey: string,
  modelType: GeminiModelType
): Promise<HealthCategorizationResponse> => {
  try {
    // Import GoogleGenerativeAI dynamically to avoid SSR issues
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelType,
    });

    const prompt = `
      As a nutrition expert, analyze the following food item: "${foodName}"
      
      Provide a JSON response with the following structure:
      {
        "category": "healthy" OR "unhealthy" OR "junk" OR "neutral", 
        "ingredients": ["main ingredient 1", "main ingredient 2", ...],
        "healthImplications": ["health implication 1", "health implication 2", ...],
        "benefits": "Brief description of any health benefits"
      }
      
      Guidelines:
      - For "category": classify as "healthy" (nutritious foods that promote wellbeing), "unhealthy" (foods with some concerning nutritional aspects), "junk" (highly processed with little nutritional value), or "neutral" (moderate nutritional value)
      - For "ingredients": list 3-5 main ingredients typically found in this food
      - For "healthImplications": provide 3-4 brief points about potential health effects of regular consumption
      - For "benefits": briefly describe any health benefits, or state "Limited health benefits" if appropriate
      
      Return ONLY a valid JSON object with no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return {
      category: parsedData.category || 'neutral',
      ingredients: Array.isArray(parsedData.ingredients) ? parsedData.ingredients : [],
      healthImplications: Array.isArray(parsedData.healthImplications) ? parsedData.healthImplications :
        ["Information not available"],
      benefits: parsedData.benefits || "Information not available"
    };
  } catch (error) {
    console.error("Error in health categorization:", error);

    // Return default fallback data
    return {
      category: 'neutral',
      ingredients: [],
      healthImplications: ["Could not determine health implications"],
      benefits: "Information not available"
    };
  }
};
