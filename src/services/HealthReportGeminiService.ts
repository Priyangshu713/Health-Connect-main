
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealthData, GeminiModelType } from "@/store/healthStore";
import { Recommendation } from "@/lib/healthUtils";

export interface GeminiRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'diet' | 'exercise' | 'lifestyle' | 'medical';
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export const fetchRecommendationsFromGemini = async (
  healthData: HealthData, 
  apiKey: string,
  modelType: GeminiModelType = "gemini-1.5-flash"
): Promise<GeminiRecommendation[]> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: modelType,
    });
    
    const prompt = `
      You are a health advisor AI. Please analyze the following health data and provide personalized recommendations.
      Format your response in a JSON array of objects with the following structure:
      [
        {
          "id": "unique-id-1",
          "title": "Short, specific recommendation title",
          "description": "Detailed, actionable recommendation with specific advice",
          "type": "diet|exercise|lifestyle|medical",
          "priority": "high|medium|low",
          "icon": "utensils|dumbbell|heart-pulse|stethoscope|person-walking|apple-whole|clock|cookie|hospital|carrot"
        }
      ]
      
      Patient health data:
      - Age: ${healthData.age}
      - Gender: ${healthData.gender}
      - Height: ${healthData.height} cm
      - Weight: ${healthData.weight} kg
      - BMI: ${healthData.bmi} (Category: ${healthData.bmiCategory})
      - Blood Glucose: ${healthData.bloodGlucose} mg/dL
      
      Provide:
      - 3-4 Diet recommendations (type: "diet") - specific meal suggestions, foods to add/avoid based on health metrics
      - 3-4 Exercise recommendations (type: "exercise") - specific workout routines with frequency/duration 
      - 2-3 Medical recommendations (type: "medical") - health checkups, monitoring suggestions
      - 1-2 Lifestyle recommendations (type: "lifestyle") - sleep, stress management, etc.
      
      Make recommendations personalized to this person's specific health metrics and condition.
      Assign priority based on health risks (high for metrics far outside normal range, medium for borderline, low for preventive).
      
      Return ONLY a valid JSON array with no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    throw new Error("Failed to get AI recommendations. Please try again.");
  }
};

const parseGeminiResponse = (response: string): GeminiRecommendation[] => {
  try {
    // Find the JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in response");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedData)) {
      throw new Error("Parsed data is not an array");
    }
    
    // Validate and transform the data
    return parsedData.map((item, index) => ({
      id: item.id || `rec-${index}`,
      title: item.title || "Health Recommendation",
      description: item.description || "No description provided",
      type: ['diet', 'exercise', 'lifestyle', 'medical'].includes(item.type) 
        ? item.type 
        : 'lifestyle',
      priority: ['high', 'medium', 'low'].includes(item.priority) 
        ? item.priority 
        : 'medium',
      icon: item.icon || "heart-pulse"
    }));
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Could not parse recommendations from AI response");
  }
};
