import { InsightSection } from './types';
import { getInsightIcon } from './IconProvider';

export const generateSampleInsights = (data: any): InsightSection[] => {
  const results: InsightSection[] = [];
  
  if (data.bmi) {
    if (data.bmi < 18.5) {
      results.push({
        title: "Underweight BMI",
        content: "Your BMI of " + data.bmi + " indicates you're underweight. Consider working with a nutritionist to develop a healthy weight gain plan with nutrient-dense foods.",
        type: "warning",
        icon: getInsightIcon("warning")
      });
    } else if (data.bmi >= 18.5 && data.bmi < 25) {
      results.push({
        title: "Healthy Weight Range",
        content: "Your BMI of " + data.bmi + " is within the healthy range. Maintain your balanced diet and regular physical activity.",
        type: "positive",
        icon: getInsightIcon("positive")
      });
    } else if (data.bmi >= 25 && data.bmi < 30) {
      results.push({
        title: "Overweight BMI",
        content: "Your BMI of " + data.bmi + " indicates you're overweight. Increasing physical activity and moderating caloric intake can help reach a healthier range.",
        type: "warning",
        icon: getInsightIcon("warning")
      });
    } else if (data.bmi >= 30) {
      results.push({
        title: "Obesity Health Risks",
        content: "Your BMI of " + data.bmi + " indicates obesity, which increases risk for several health conditions. Consider consulting a healthcare provider for a personalized plan.",
        type: "critical",
        icon: getInsightIcon("critical")
      });
    }
  }
  
  if (data.bloodGlucose) {
    if (data.bloodGlucose < 70) {
      results.push({
        title: "Low Blood Glucose",
        content: "Your blood glucose of " + data.bloodGlucose + " mg/dL is below normal range. Consider eating small, frequent meals with complex carbohydrates to stabilize your levels.",
        type: "warning",
        icon: getInsightIcon("warning")
      });
    } else if (data.bloodGlucose >= 70 && data.bloodGlucose <= 99) {
      results.push({
        title: "Healthy Blood Glucose",
        content: "Your fasting blood glucose of " + data.bloodGlucose + " mg/dL is within the normal range. Continue your healthy eating habits.",
        type: "positive",
        icon: getInsightIcon("positive")
      });
    } else if (data.bloodGlucose > 99 && data.bloodGlucose < 126) {
      results.push({
        title: "Prediabetic Range",
        content: "Your blood glucose of " + data.bloodGlucose + " mg/dL indicates prediabetes. Reducing refined carbohydrates and increasing physical activity can help improve insulin sensitivity.",
        type: "warning",
        icon: getInsightIcon("warning")
      });
    } else if (data.bloodGlucose >= 126) {
      results.push({
        title: "Elevated Blood Glucose",
        content: "Your blood glucose of " + data.bloodGlucose + " mg/dL is in the diabetic range. Please consult with a healthcare provider for proper evaluation and management.",
        type: "critical",
        icon: getInsightIcon("critical")
      });
    }
  }
  
  if (data.age) {
    if (data.age < 30) {
      results.push({
        title: "Early Adult Health",
        content: "At " + data.age + ", establishing healthy habits now will set a foundation for long-term health. Focus on stress management and regular exercise.",
        type: "normal",
        icon: getInsightIcon("normal")
      });
    } else if (data.age >= 30 && data.age < 50) {
      results.push({
        title: "Midlife Wellness",
        content: "At " + data.age + ", metabolic changes may occur. Regular health screenings and maintaining muscle mass through strength training become increasingly important.",
        type: "normal",
        icon: getInsightIcon("normal")
      });
    } else {
      results.push({
        title: "Senior Health Focus",
        content: "At " + data.age + ", focus on bone health with calcium-rich foods, vitamin D, and weight-bearing exercises. Regular check-ups become more critical for preventive care.",
        type: "normal",
        icon: getInsightIcon("normal")
      });
    }
  }
  
  return results.slice(0, 4);
};
