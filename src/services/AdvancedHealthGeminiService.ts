
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HealthData, GeminiModelType } from "@/store/healthStore";

interface AdvancedHealthData {
  sleepHours: number;
  exerciseHours: number;
  stressLevel: number;
  waterIntake: number;
  caffeine: number;
  diet: string;
  foodHabits: {
    regularMeals: boolean;
    lateNightSnacking: boolean;
    fastFood: boolean;
    highSugar: boolean;
  };
  smoking: string;
  alcoholConsumption: string;
  medicalConditions?: string;
  medications?: string;
  familyHistory?: string;
  sleepQuality: string;
}

interface HealthAnalysisSection {
  category: string;
  icon: JSX.Element; // This will be added after parsing
  title: string;
  analysis: string;
  recommendation: string;
  score: number;
}

export const analyzeAdvancedHealthData = async (
  combinedData: HealthData & Partial<AdvancedHealthData>, 
  apiKey: string,
  modelType: GeminiModelType = "gemini-2.5-flash-lite-preview-06-17"
): Promise<HealthAnalysisSection[]> => {
  if (!apiKey) {
    throw new Error("Please enable Gemini AI first by adding your API key");
  }
  
  try {
    // Validate that required properties exist
    const safeData = {
      age: combinedData.age || 30,
      gender: combinedData.gender || "Not specified",
      height: combinedData.height || 170,
      weight: combinedData.weight || 70,
      bmi: combinedData.bmi || 24.2,
      bmiCategory: combinedData.bmiCategory || "Normal",
      bloodGlucose: combinedData.bloodGlucose || 90,
      sleepHours: combinedData.sleepHours || 7,
      sleepQuality: combinedData.sleepQuality || "Average",
      exerciseHours: combinedData.exerciseHours || 3,
      stressLevel: combinedData.stressLevel || 5,
      waterIntake: combinedData.waterIntake || 2,
      caffeine: combinedData.caffeine || 2,
      diet: combinedData.diet || "Balanced",
      foodHabits: {
        regularMeals: combinedData.foodHabits?.regularMeals || false,
        lateNightSnacking: combinedData.foodHabits?.lateNightSnacking || false,
        fastFood: combinedData.foodHabits?.fastFood || false,
        highSugar: combinedData.foodHabits?.highSugar || false,
      },
      smoking: combinedData.smoking || "Never",
      alcoholConsumption: combinedData.alcoholConsumption || "Occasional",
      medicalConditions: combinedData.medicalConditions || "None reported",
      medications: combinedData.medications || "None reported",
      familyHistory: combinedData.familyHistory || "None reported",
    };
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: modelType,
    });
    
    // Check if there's meaningful medical history information
    const hasMedicalHistory = 
      safeData.medicalConditions && 
      safeData.medicalConditions !== "None reported" && 
      safeData.medicalConditions.length > 5;
    
    const hasMedications = 
      safeData.medications && 
      safeData.medications !== "None reported" && 
      safeData.medications.length > 5;
    
    const hasFamilyHistory = 
      safeData.familyHistory && 
      safeData.familyHistory !== "None reported" && 
      safeData.familyHistory.length > 5;
    
    // Enhanced prompt with special focus on medical history when present
    const prompt = `
      You are a health advisor AI. Please analyze the following health data and provide detailed analysis in these categories: sleep, exercise, stress, nutrition, hydration, lifestyle, and overall health.
      Format your response in a JSON array of objects with these fields:
      - category: "sleep", "exercise", "stress", "nutrition", "hydration", "lifestyle", or "overall"
      - title: A title for this analysis section
      - analysis: A paragraph analyzing this aspect of health
      - recommendation: A specific, actionable recommendation
      - score: A health score (0-100) for this category
      
      Patient health data:
      - Age: ${safeData.age}
      - Gender: ${safeData.gender}
      - Height: ${safeData.height} cm
      - Weight: ${safeData.weight} kg
      - BMI: ${safeData.bmi} (Category: ${safeData.bmiCategory})
      - Blood Glucose: ${safeData.bloodGlucose} mg/dL
      - Sleep Hours: ${safeData.sleepHours} hours per day
      - Sleep Quality: ${safeData.sleepQuality}
      - Exercise: ${safeData.exerciseHours} hours per week
      - Stress Level: ${safeData.stressLevel}/10
      - Water Intake: ${safeData.waterIntake} liters per day
      - Caffeine Intake: ${safeData.caffeine} cups per day
      - Diet Type: ${safeData.diet}
      - Food Habits: 
        * Regular meals: ${safeData.foodHabits.regularMeals ? 'Yes' : 'No'}
        * Late night snacking: ${safeData.foodHabits.lateNightSnacking ? 'Yes' : 'No'}
        * Frequent fast food: ${safeData.foodHabits.fastFood ? 'Yes' : 'No'}
        * High sugar consumption: ${safeData.foodHabits.highSugar ? 'Yes' : 'No'}
      - Smoking Status: ${safeData.smoking}
      - Alcohol Consumption: ${safeData.alcoholConsumption}
      - Medical Conditions: ${safeData.medicalConditions}
      - Medications: ${safeData.medications}
      - Family History: ${safeData.familyHistory}
      
      ${hasMedicalHistory || hasMedications || hasFamilyHistory ? 'IMPORTANT: The patient has provided medical history information. In your analysis and recommendations, specifically address how their medical conditions, medications, and/or family history impact their health in EACH relevant category, not just the lifestyle category. Include specific advice tailored to their medical situation.' : ''}
      
      Provide thorough but concise analysis for each category. 
      
      For the "nutrition" category, include a detailed assessment of the diet type and food habits.
      
      For the "lifestyle" category, provide specific insights about caffeine intake, smoking status, alcohol consumption, and medical history.
      ${hasMedicalHistory ? 'Pay special attention to how the reported medical conditions might affect health outcomes. Provide specific recommendations that consider these conditions.' : ''}
      ${hasMedications ? 'Consider how the mentioned medications might impact other health factors and provide appropriate guidance.' : ''}
      ${hasFamilyHistory ? 'Factor in family history when assessing risk and making recommendations.' : ''}
      
      For the "overall" category, provide a comprehensive summary that includes insights from all other categories, and specifically mentions the impact of their medical history, medications, and family health background if provided.
      
      For the scores:
      - Use 80-100 for excellent habits
      - Use 60-79 for good but improvable habits
      - Use 40-59 for habits that need moderate improvement
      - Use 0-39 for habits that need significant improvement
      
      Return ONLY a valid JSON array with exactly 7 objects, one for each category.
    `;

    console.log("Sending request to Gemini AI with sanitized data");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini AI");
    
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Error analyzing advanced health data:", error);
    throw new Error("Failed to analyze health data. Please try again.");
  }
};

// Icons will be added in the frontend component
const parseGeminiResponse = (response: string): HealthAnalysisSection[] => {
  try {
    // Find the JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No valid JSON array found in response:", response);
      throw new Error("No valid JSON array found in response");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedData)) {
      console.error("Parsed data is not an array:", parsedData);
      throw new Error("Parsed data is not an array");
    }
    
    // Validate and transform the data
    return parsedData.map(item => ({
      category: item.category || "overall",
      title: item.title || "Health Analysis",
      analysis: item.analysis || "No analysis provided",
      recommendation: item.recommendation || "No recommendations provided",
      score: typeof item.score === 'number' ? item.score : 70,
      icon: null // Icons will be added in the React component
    }));
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return default placeholder data instead of throwing
    return [
      {
        category: "overall",
        title: "Overall Health",
        analysis: "Unable to analyze health data at this time.",
        recommendation: "Please try again later or contact support if the issue persists.",
        score: 70,
        icon: null
      }
    ];
  }
};
