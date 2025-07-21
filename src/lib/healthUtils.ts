
// Define the Recommendation interface
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'diet' | 'exercise' | 'lifestyle' | 'medical';
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

// Define Category interface
export interface Category {
  category: string;
  foods: string[];
  benefits: string;
  mealPlan?: string;
}

// Main function for personalized nutrition
export const getPersonalizedNutrition = (bmi: number, bloodGlucose: number = 0, age: number = 0): Category[] => {
  const nutritionCategories: Category[] = [
    {
      category: "High-Fiber Foods",
      foods: ["Oatmeal", "Broccoli", "Beans", "Apples", "Whole Grains", "Chia Seeds"],
      benefits: "High-fiber foods help manage weight, stabilize blood sugar, and improve digestion.",
      mealPlan: "Start your day with a bowl of oatmeal topped with chia seeds and apple slices."
    },
    {
      category: "Hydrating Foods",
      foods: ["Cucumber", "Watermelon", "Spinach", "Strawberries", "Celery", "Zucchini"],
      benefits: "These foods have high water content, which helps maintain hydration, supports kidney function, and aids in nutrient absorption.",
      mealPlan: "Enjoy a refreshing watermelon and cucumber salad with a hint of mint."
    },
    {
      category: "Antioxidant-Rich Foods",
      foods: ["Blueberries", "Kale", "Dark Chocolate", "Pecans", "Artichokes", "Red Cabbage"],
      benefits: "Antioxidants protect your cells from damage, reduce inflammation, and lower the risk of chronic diseases.",
      mealPlan: "Snack on a handful of blueberries and a small piece of dark chocolate for an antioxidant boost."
    }
  ];

  // Custom logic based on health metrics
  if (bmi >= 25) {
    nutritionCategories.push({
      category: "Low-Calorie, Nutrient-Dense Foods",
      foods: ["Leafy Greens", "Berries", "Greek Yogurt", "Lean Poultry", "Fish", "Tofu"],
      benefits: "These foods provide essential nutrients with fewer calories, supporting weight management.",
      mealPlan: "Try a spinach salad with grilled chicken, berries, and a light vinaigrette dressing."
    });
  }

  if (bloodGlucose > 100) {
    nutritionCategories.push({
      category: "Low-Glycemic Foods",
      foods: ["Sweet Potatoes", "Quinoa", "Lentils", "Nuts", "Barley", "Non-starchy Vegetables"],
      benefits: "Low-glycemic foods help maintain stable blood sugar levels and improve insulin sensitivity.",
      mealPlan: "Combine lentils, barley, and vegetables for a hearty, blood-sugar friendly stew."
    });
  }

  if (age > 50) {
    nutritionCategories.push({
      category: "Bone-Supporting Foods",
      foods: ["Dairy Products", "Sardines", "Fortified Cereals", "Almonds", "Leafy Greens", "Tofu"],
      benefits: "These calcium-rich foods help maintain bone density and prevent osteoporosis as you age.",
      mealPlan: "Include calcium-fortified cereal with milk and a side of almonds for a bone-healthy breakfast."
    });
  }

  return nutritionCategories;
};

// Health recommendations function
export const getAllRecommendations = (bmi: number, bloodGlucose: number = 0): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Diet recommendations based on BMI
  if (bmi < 18.5) {
    recommendations.push({
      id: "diet-1",
      title: "Increase Caloric Intake",
      description: "Focus on nutrient-dense foods that provide more calories, such as nuts, avocados, and healthy oils.",
      type: "diet",
      priority: "high",
      icon: "utensils"
    });
  } else if (bmi >= 25) {
    recommendations.push({
      id: "diet-2",
      title: "Focus on Low-Calorie Foods",
      description: "Incorporate more vegetables, lean proteins, and whole grains to support weight management.",
      type: "diet",
      priority: "high",
      icon: "utensils"
    });
  }
  
  recommendations.push({
    id: "diet-3",
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to support metabolism and overall health.",
    type: "diet",
    priority: "medium",
    icon: "cup-soda"
  });
  
  // Exercise recommendations
  recommendations.push({
    id: "exercise-1",
    title: "Regular Physical Activity",
    description: "Aim for at least 150 minutes of moderate-intensity exercise per week, spread throughout the week.",
    type: "exercise",
    priority: "high",
    icon: "dumbbell"
  });
  
  if (bmi >= 30) {
    recommendations.push({
      id: "exercise-2",
      title: "Low-Impact Exercise",
      description: "Start with walking, swimming, or cycling to reduce stress on joints while improving cardiovascular health.",
      type: "exercise",
      priority: "high",
      icon: "person-walking"
    });
  } else {
    recommendations.push({
      id: "exercise-2",
      title: "Mix Cardio and Strength Training",
      description: "Combine aerobic exercises with resistance training for optimal fitness and metabolism.",
      type: "exercise",
      priority: "medium",
      icon: "dumbbell"
    });
  }
  
  // Medical recommendations based on blood glucose
  if (bloodGlucose > 100) {
    recommendations.push({
      id: "medical-1",
      title: "Monitor Blood Glucose",
      description: "Regularly check your blood glucose levels and consider consulting an endocrinologist.",
      type: "medical",
      priority: "high",
      icon: "stethoscope"
    });
    
    recommendations.push({
      id: "medical-2",
      title: "Limit Sugar Intake",
      description: "Reduce consumption of simple carbohydrates and added sugars to help manage blood glucose levels.",
      type: "medical",
      priority: "high",
      icon: "cookie"
    });
  } else {
    recommendations.push({
      id: "medical-1",
      title: "Annual Health Check-up",
      description: "Schedule regular medical check-ups to monitor your overall health and catch issues early.",
      type: "medical",
      priority: "medium",
      icon: "stethoscope"
    });
  }
  
  // Lifestyle recommendations
  recommendations.push({
    id: "lifestyle-1",
    title: "Improve Sleep Quality",
    description: "Aim for 7-9 hours of quality sleep per night to support metabolism and recovery.",
    type: "lifestyle",
    priority: "medium",
    icon: "bed"
  });
  
  return recommendations;
}
