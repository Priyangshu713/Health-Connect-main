
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useHealthStore } from '@/store/healthStore';
import { Doctor } from '@/types/doctor';
import { sampleDoctors } from '@/data/sampleDoctors';

interface DoctorFilters {
  specialty: string;
  location: string;
  experience: number;
}

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

export function useDoctorRecommendations(filters: DoctorFilters) {
  const { healthData, geminiApiKey, geminiModel } = useHealthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get all doctors with filters
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        // Simulate API call delay
        const response = await fetch(`${API_URL}/auth/getAlldoctor`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         }, 
        });
        const data = await response.json();
        console.log(data.allDoctor);

        // Apply filters to sample doctors
        let getAllDoctors = JSON.stringify(data.allDoctor);

        localStorage.setItem('allDoctor',getAllDoctors);
        let filteredDoctors =JSON.parse(localStorage.getItem("allDoctor"));

        if (filters.specialty) {
          filteredDoctors = filteredDoctors.filter(doctor =>
            doctor.specialty.toLowerCase() === filters.specialty.toLowerCase() ||
            doctor.subspecialties?.some(sub =>
              sub.toLowerCase().includes(filters.specialty.toLowerCase())
            )
          );
        }

        if (filters.location) {
          filteredDoctors = filteredDoctors.filter(doctor =>
            doctor.location.toLowerCase().includes(filters.location.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        if (filters.experience > 0) {
          filteredDoctors = filteredDoctors.filter(doctor =>
            doctor.experience >= filters.experience
          );
        }

        setDoctors(filteredDoctors);
        setIsLoadingDoctors(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err as Error);
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [filters]);

  // Get personalized recommendations using Gemini
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!healthData.completedProfile || !geminiApiKey) {
        setRecommendedDoctors([]);
        setIsLoadingRecommendations(false);
        return;
      }

      setIsLoadingRecommendations(true);
      try {
        // For simple cases, just use logic to recommend
        if (!geminiApiKey) {
          const simpleRecommendations = getSimpleRecommendations(healthData, sampleDoctors);
          setRecommendedDoctors(simpleRecommendations);
          setIsLoadingRecommendations(false);
          return;
        }

        // Use Gemini for more personalized recommendations
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: geminiModel,
        });

        const prompt = `
          You are a healthcare specialist matching system. Based on a patient's health profile, 
          recommend the most suitable doctors from a database. Return your response ONLY as a JSON 
          array of doctor IDs from the database, with the most highly recommended doctors first.
          
          Patient health profile:
          - Age: ${healthData.age}
          - Gender: ${healthData.gender}
          - BMI: ${healthData.bmi} (${healthData.bmiCategory})
          - Blood Glucose: ${healthData.bloodGlucose} mg/dL
          ${healthData.sleepScore ? `- Sleep Score: ${healthData.sleepScore}` : ''}
          ${healthData.exerciseScore ? `- Exercise Score: ${healthData.exerciseScore}` : ''}
          ${healthData.stressScore ? `- Stress Score: ${healthData.stressScore}` : ''}
          ${healthData.hydrationScore ? `- Hydration Score: ${healthData.hydrationScore}` : ''}
          
          Doctor database (ID and specialties):
          ${sampleDoctors.map(doctor => `- Doctor ID: ${doctor._id}, Specialty: ${doctor.specialty}, Subspecialties: ${doctor.subspecialties?.join(', ')}`).join('\n')}
          
          Return an array of doctor IDs only, like: ["3", "1", "7"]
        `;

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          // Extract the JSON array from the response
          const match = text.match(/\[(.*)\]/s);
          if (match) {
            const idArray = JSON.parse(match[0]) as string[];
            // Map IDs to actual doctor objects
            const recommended = idArray
              .map(id => sampleDoctors.find(doc => doc._id === id))
              .filter(Boolean) as Doctor[];

            setRecommendedDoctors(recommended);
          } else {
            // Fallback to simple recommendations if parsing fails
            const fallback = getSimpleRecommendations(healthData, sampleDoctors);
            setRecommendedDoctors(fallback);
          }
        } catch (e) {
          console.error("Error parsing Gemini response:", e);
          // Fallback to simple recommendations
          const fallback = getSimpleRecommendations(healthData, sampleDoctors);
          setRecommendedDoctors(fallback);
        }

        setIsLoadingRecommendations(false);
      } catch (err) {
        console.error('Error getting recommendations:', err);
        setError(err as Error);
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [healthData, geminiApiKey, geminiModel]);

  return {
    doctors,
    recommendedDoctors,
    isLoadingDoctors,
    isLoadingRecommendations,
    error
  };
}

// Simple recommendation logic as fallback
function getSimpleRecommendations(healthData: any, doctors: Doctor[]): Doctor[] {
  let recommended: Doctor[] = [];

  // Based on BMI
  if (healthData.bmiCategory === 'Obese' || healthData.bmiCategory === 'Overweight') {
    const nutritionist = doctors.find(d =>
      d.specialty === 'Nutritionist' ||
      d.specialty === 'Endocrinologist'
    );
    if (nutritionist) recommended.push(nutritionist);
  }

  // Based on blood glucose
  if (healthData.bloodGlucose && healthData.bloodGlucose > 125) {
    const endocrinologist = doctors.find(d => d.specialty === 'Endocrinologist');
    if (endocrinologist && !recommended.includes(endocrinologist)) {
      recommended.push(endocrinologist);
    }
  }

  // Based on stress score
  if (healthData.stressScore && healthData.stressScore < 60) {
    const psychiatrist = doctors.find(d => d.specialty === 'Psychiatrist');
    if (psychiatrist) recommended.push(psychiatrist);
  }

  // If we don't have enough recommendations, add top-rated doctors
  if (recommended.length < 3) {
    const topRated = doctors
      .filter(d => !recommended.includes(d))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3 - recommended.length);

    recommended = [...recommended, ...topRated];
  }

  return recommended;
}
