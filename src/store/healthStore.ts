import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HealthData {
  age: number | null;
  height: number | null; // in cm
  weight: number | null; // in kg
  gender: 'male' | 'female' | 'other' | null;
  bloodGlucose: number | null; // in mg/dL
  bmi: number | null;
  bmiCategory: string | null;
  completedProfile: boolean;
  completedAdvancedAnalysis?: boolean;
  sleepScore?: number;
  exerciseScore?: number;
  stressScore?: number;
  hydrationScore?: number;
  overallAdvancedScore?: number;
  savedAnalysis?: AnalysisSection[]; // Store the complete analysis data
}

// Define the AnalysisSection interface to match what's used in components
export interface AnalysisSection {
  category: string;
  icon?: JSX.Element; // Optional since we'll re-add icons when displaying
  title: string;
  analysis: string;
  recommendation: string;
  score: number;
}

export type GeminiModelType =
  | "gemini-2.5-flash-lite-preview-06-17" // Gemini 2.5 Flash Lite
  | "gemini-2.5-flash"                  // Gemini 2.5 Flash
  | "gemini-2.0-flash-thinking-exp-01-21"; // Gemini 2.0 Flash Thinking

export interface GeminiModelOption {
  id: GeminiModelType;
  name: string;
  description: string;
  isPremium: boolean;
}

export type GeminiTier = 'free' | 'lite' | 'pro';

interface HealthStore {
  healthData: HealthData;
  geminiApiKey: string | null;
  geminiModel: GeminiModelType;
  geminiTier: GeminiTier;
  updateHealthData: (data: Partial<HealthData>) => void;
  calculateBMI: () => void;
  resetHealthData: () => void;
  setGeminiApiKey: (key: string | null) => void;
  setGeminiModel: (model: GeminiModelType) => void;
  setGeminiTier: (tier: GeminiTier) => void;
  setAdvancedAnalysisComplete: (analysisData: any, fullAnalysis?: AnalysisSection[]) => void;
}

// Normal BMI ranges from 18.5 to 24.9
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
};

// Helper function to check if a value is valid (not null or undefined)
const isValidValue = (value: any): boolean => {
  return value !== null && value !== undefined;
};

// Get API key from environment variables
const envApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => {
      // Add event listener for API key updates
      setTimeout(() => {
        window.addEventListener('updateGeminiApiKey', ((event: CustomEvent) => {
          const { key } = event.detail;
          if (key) {
            set({ geminiApiKey: key });
          }
        }) as EventListener);
      }, 0);
      
      return {
        healthData: {
          age: null,
          height: null,
          weight: null,
          gender: null,
          bloodGlucose: null,
          bmi: null,
          bmiCategory: null,
          completedProfile: false,
          completedAdvancedAnalysis: false,
        },
        geminiApiKey: envApiKey,
        geminiModel: "gemini-2.5-flash-lite-preview-06-17",
        geminiTier: 'free',
        
        updateHealthData: (data) => 
          set((state) => {
            // Determine updated values while checking if they are actually filled
            const updatedAge = data.age !== undefined ? data.age : state.healthData.age;
            const updatedHeight = data.height !== undefined ? data.height : state.healthData.height;
            const updatedWeight = data.weight !== undefined ? data.weight : state.healthData.weight;
            const updatedGender = data.gender !== undefined ? data.gender : state.healthData.gender;
            
            // Check if all required fields have valid values
            const isProfileComplete = 
              isValidValue(updatedAge) && 
              isValidValue(updatedHeight) && 
              isValidValue(updatedWeight) && 
              isValidValue(updatedGender) &&
              updatedAge! > 0 && 
              updatedHeight! > 0 && 
              updatedWeight! > 0;
              
            return {
              healthData: {
                ...state.healthData,
                ...data,
                completedProfile: isProfileComplete,
              },
            };
          }),
        
        calculateBMI: () => {
          const { height, weight } = get().healthData;
          
          if (height && weight && height > 0) {
            // BMI formula: weight(kg) / (height(m))²
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            const roundedBMI = Math.round(bmi * 10) / 10;
            
            set((state) => ({
              healthData: {
                ...state.healthData,
                bmi: roundedBMI,
                bmiCategory: getBMICategory(roundedBMI),
              },
            }));
          }
        },
        
        resetHealthData: () => 
          set({
            healthData: {
              age: null,
              height: null,
              weight: null,
              gender: null,
              bloodGlucose: null,
              bmi: null,
              bmiCategory: null,
              completedProfile: false,
              completedAdvancedAnalysis: false,
              sleepScore: undefined,
              exerciseScore: undefined,
              stressScore: undefined,
              hydrationScore: undefined,
              overallAdvancedScore: undefined,
              savedAnalysis: undefined,
            },
          }),
          
        setGeminiApiKey: (key) => 
          set({
            geminiApiKey: key || envApiKey
          }),
        
        setGeminiModel: (model) =>
          set({
            geminiModel: model
          }),
        
        setGeminiTier: (tier) =>
          set({
            geminiTier: tier
          }),
          
        setAdvancedAnalysisComplete: (analysisData, fullAnalysis) => 
          set((state) => ({
            healthData: {
              ...state.healthData,
              completedAdvancedAnalysis: true,
              sleepScore: analysisData.sleepScore || 74,
              exerciseScore: analysisData.exerciseScore || 68,
              stressScore: analysisData.stressScore || 82,
              hydrationScore: analysisData.hydrationScore || 55,
              overallAdvancedScore: analysisData.overallScore || 70,
              savedAnalysis: fullAnalysis, // Store the complete analysis data
            },
          })),
      };
    },
    {
      name: 'health-connect-storage',
    }
  )
);
