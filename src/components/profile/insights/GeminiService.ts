
import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsightSection } from './types';
import { getInsightIcon } from './IconProvider';
import { useHealthStore, GeminiModelType } from "@/store/healthStore";

// Function to format text content with proper markdown rendering
const formatInsightContent = (content: string): string => {
  // Handle bold text marked with asterisks
  let formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Handle section headers (lines that begin with asterisks)
  formattedContent = formattedContent.replace(/^\s*\*\*([^*:]+):\*\*/gm, '<span class="font-bold text-primary">$1:</span> ');
  
  // Handle bullet points (lines starting with - or *)
  formattedContent = formattedContent.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap lists in <ul> tags
  formattedContent = formattedContent.replace(/(<li>.*<\/li>)(?!\s*<\/ul>)/gs, '<ul class="list-disc pl-4 my-2">$1</ul>');
  
  // Add proper paragraph spacing for better readability
  formattedContent = formattedContent.replace(/\n\n/g, '</p><p class="mb-1">');
  
  // Ensure content is wrapped in paragraphs if it's not already
  if (!formattedContent.startsWith('<p') && !formattedContent.startsWith('<span') && !formattedContent.startsWith('<ul')) {
    formattedContent = '<p class="mb-1">' + formattedContent;
  }
  if (!formattedContent.endsWith('</p>') && !formattedContent.endsWith('</ul>')) {
    formattedContent = formattedContent + '</p>';
  }
  
  return formattedContent;
};

export const fetchInsightsFromGemini = async (
  healthData: any, 
  apiKey: string,
  modelType: GeminiModelType = "gemini-1.5-flash"
): Promise<InsightSection[]> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: modelType,
  });
  
  const prompt = `
    You are a health advisor AI. Please analyze the following health data and provide 3-4 concise, specific health insights with actionable recommendations. Format your response in a JSON array of objects with 'title', 'content', and 'type' fields.
    
    Patient health data:
    - Age: ${healthData.age}
    - Gender: ${healthData.gender}
    - Height: ${healthData.height} cm
    - Weight: ${healthData.weight} kg
    - BMI: ${healthData.bmi} (Category: ${healthData.bmiCategory})
    - Blood Glucose: ${healthData.bloodGlucose} mg/dL
    
    For 'type', assign one of these values based on the severity:
    - 'positive' for good health indicators
    - 'normal' for general advice
    - 'warning' for mild concerns
    - 'critical' for serious health concerns

    For 'content', provide detailed but concise health insights. DO NOT include any HTML tags or Markdown syntax in your content like <p>, <strong>, etc. Your text should be plain text only. I will handle the formatting on my end.

    Keep insights concise and immediately actionable. Response format example:
    [
      {"title": "Healthy Weight Range", "content": "Your BMI of 22 is within the normal range. Maintain your current dietary and exercise habits.", "type": "positive"},
      {"title": "Increase Physical Activity", "content": "Adding 30 minutes of moderate exercise 5 days a week will help maintain cardiovascular health.", "type": "normal"}
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseGeminiResponse(text);
};

const parseGeminiResponse = (response: string): InsightSection[] => {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in response");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsedData)) {
      throw new Error("Parsed data is not an array");
    }
    
    return parsedData.map(item => ({
      title: item.title || "Health Insight",
      content: formatInsightContent(item.content) || "No content provided",
      type: ['normal', 'warning', 'critical', 'positive'].includes(item.type) 
        ? item.type 
        : 'normal',
      icon: getInsightIcon(item.type)
    })).slice(0, 4);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Could not parse health insights from AI response");
  }
};
