
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModelType } from "@/store/healthStore";

export interface WorkoutAnalysis {
    caloriesBurned: number;
    benefitsSummary: string;
    recommendations: string[];
    bodyImpact: string;
    calorieBalance?: {
        totalBurned: number;
        bmr: number;
        activityBurn: number;
        consumed: number;
        deficit: number;
        weightImpact: string;
    };
}

export const analyzeWorkout = async (
    workoutType: string,
    duration: number,
    intensity: string,
    weight: number,
    gender: string,
    age: number,
    caloriesConsumed: number,
    bmrValue: number,
    apiKey: string,
    modelType: GeminiModelType = "gemini-2.5-flash-lite-preview-06-17"
): Promise<WorkoutAnalysis> => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: modelType,
        });

        const prompt = `
      You are a fitness expert AI. Please analyze the following workout data and provide a detailed breakdown:
      
      User profile:
      - Weight: ${weight} kg
      - Gender: ${gender}
      - Age: ${age}
      - BMR: ${bmrValue} kcal
      
      Workout details:
      - Type: ${workoutType}
      - Duration: ${duration} minutes
      - Intensity: ${intensity}
      - Calories consumed today: ${caloriesConsumed} kcal
      
      Format your response in a JSON object with the following structure:
      {
        "caloriesBurned": estimated calories burned during this workout (number only),
        "benefitsSummary": "brief summary of the benefits of this workout type",
        "recommendations": ["1-3 specific recommendations for this workout"],
        "bodyImpact": "description of how this workout affects the body",
        "calorieBalance": {
          "totalBurned": total calories burned (BMR + workout + other activity),
          "bmr": BMR value,
          "activityBurn": calories burned from workout and other activity,
          "consumed": calories consumed,
          "deficit": deficit or surplus (if negative, it's a surplus),
          "weightImpact": "brief statement about whether user is likely losing/gaining weight and at what rate"
        }
      }
      
      Be realistic in your calorie estimations based on duration, intensity, and user profile.
      Return ONLY a valid JSON object with no other text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return parseWorkoutAnalysis(text);
    } catch (error) {
        console.error("Error analyzing workout:", error);
        throw new Error("Failed to analyze workout. Please try again.");
    }
};

const parseWorkoutAnalysis = (response: string): WorkoutAnalysis => {
    try {
        // Find the JSON object in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in response");
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        // Return parsed data with fallbacks for any missing properties
        return {
            caloriesBurned: parsedData.caloriesBurned || 0,
            benefitsSummary: parsedData.benefitsSummary || "No information available",
            recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
            bodyImpact: parsedData.bodyImpact || "No information available",
            calorieBalance: parsedData.calorieBalance ? {
                totalBurned: parsedData.calorieBalance.totalBurned || 0,
                bmr: parsedData.calorieBalance.bmr || 0,
                activityBurn: parsedData.calorieBalance.activityBurn || 0,
                consumed: parsedData.calorieBalance.consumed || 0,
                deficit: parsedData.calorieBalance.deficit || 0,
                weightImpact: parsedData.calorieBalance.weightImpact || "No information available"
            } : undefined
        };
    } catch (error) {
        console.error("Error parsing workout analysis:", error);

        // Return default info if parsing fails
        return {
            caloriesBurned: 0,
            benefitsSummary: "Analysis unavailable",
            recommendations: [],
            bodyImpact: "Analysis unavailable"
        };
    }
};
