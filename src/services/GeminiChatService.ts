import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { useHealthStore } from "@/store/healthStore";
import { GeminiModelType } from "@/store/healthStore";

// Message type for chat history
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  text: string;
  thinking?: string; // Add thinking property for the thinking process
}

// Function to format the Gemini response text with proper markdown rendering
const formatGeminiResponse = (text: string): string => {
  // Remove raw HTML tags that might be in the response
  let formattedText = text.replace(/<\/?p[^>]*>/g, '');
  formattedText = formattedText.replace(/<\/?strong[^>]*>/g, '');

  // Handle bold text marked with asterisks or **text**
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Handle section headers (lines that use asterisks for formatting)
  formattedText = formattedText.replace(/^\s*\*\*([^*:]+):\*\*/gm, '<h4 class="font-bold text-primary mt-2 mb-1">$1:</h4>');

  // Handle bullet points (lines starting with - or *)
  formattedText = formattedText.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');

  // Wrap lists in <ul> tags
  formattedText = formattedText.replace(/(<li>.*<\/li>)(?!\s*<\/ul>)/gs, '<ul class="list-disc pl-5 my-2">$1</ul>');

  // Add proper paragraph spacing
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="mb-2">');

  // Ensure the text is wrapped in paragraphs
  if (!formattedText.startsWith('<h4') && !formattedText.startsWith('<ul') && !formattedText.startsWith('<p')) {
    formattedText = '<p class="mb-2">' + formattedText;
  }
  if (!formattedText.endsWith('</p>') && !formattedText.endsWith('</ul>') && !formattedText.endsWith('</h4>')) {
    formattedText = formattedText + '</p>';
  }

  return formattedText;
};

export const createGeminiChatSession = (apiKey: string, modelType: GeminiModelType = "gemini-1.5-flash") => {
  // Validate API key
  if (!apiKey || apiKey.trim() === '') {
    console.error("No API key provided to Gemini service");
    return {
      sendMessage: async (message: string): Promise<GeminiResponse> => {
        return {
          text: "I'm sorry, there was an error creating the chat session. Please check your API key and try again."
        };
      }
    };
  }

  console.log(`Creating new Gemini chat session with model: ${modelType}`);
  const genAI = new GoogleGenerativeAI(apiKey);

  // Define the base system instruction for health bot
  const systemInstruction = "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nPlease adhere to the following guidelines:\n\n* Be helpful, informative, empathetic, and understanding.\n* Maintain a professional and neutral tone.\n* Prioritize clarity and simplicity in your responses.\n* Structure your responses logically for easy readability.\n* Ask clarifying questions if needed to understand the user's query better.\n* Acknowledge your limitations as an AI and emphasize that you cannot provide diagnoses or treatment recommendations.\n* Advise users to consult healthcare professionals for diagnosis and treatment.\n* In case of potential medical emergencies, instruct users to call their local emergency number.\n* Do not ask for Personally Identifiable Information (PII).\n* Base your information on reliable medical sources and established scientific understanding.\n* Avoid speculation or unverified information.\n* Welcome feedback but note that you cannot directly implement changes.\n\nUse Markdown formatting in your responses: use **bold** for important terms, headers, and section titles. For lists, use * or - with proper indentation. Structure your answers with clear sections when appropriate.";

  // Use the selected model or fall back to default
  const model = genAI.getGenerativeModel({
    model: modelType,
    systemInstruction: systemInstruction,
  });

  // Check if this is a thinking model that should show its thought process
  const isThinkingModel = modelType.includes("thinking") || modelType === "gemini-2.5-pro-exp-03-25";

  // Adjust generation config based on model
  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: isThinkingModel ? 65536 : 8192, // Larger for thinking models
    responseMimeType: "text/plain",
  };

  try {
    const initialHistory: ChatMessage[] = [
      {
        role: "user",
        parts: [
          { text: "You are \"Health Connect Bot\". Your primary purpose is to provide users with general information related to health and medicine in a professional manner. Remember that you are not a medical professional, and the information you provide is for educational purposes only and should not be considered medical advice. For any health concerns, please consult with a qualified healthcare provider.\n\nRemember to always include a disclaimer that you are not a medical professional and users should consult with a qualified healthcare provider for any health concerns.\n\nAlways format your responses using Markdown: use **bold** for important terms, headers, and section titles. Use proper formatting for lists and structure your answers with clear sections when appropriate." },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Understood. I am \"Health Connect Bot\" and I will provide general health and medical information for educational purposes only. I will maintain a professional tone and emphasize that I am not a medical professional. All information I provide should not be considered a substitute for professional medical consultation. I will advise users to consult with qualified healthcare providers for any health concerns.\n\nI will use **bold** formatting for important terms, headers, and section titles, and will structure my responses with clear sections and proper formatting for lists when appropriate." },
        ],
      },
    ];

    // Special handling for Gemini 2.5 Pro model
    if (modelType === "gemini-2.5-pro-exp-03-25") {
      initialHistory.push({
        role: "user",
        parts: [
          { text: "When responding to health questions, I'd like you to show your thinking process. First, think through the question step by step using available medical knowledge. Label this section as 'THINKING PROCESS:'. When you're ready to provide the actual response, use the exact phrase 'RESPONSE_BEGINS_HEALTH_CONNECT:' to indicate where your formal answer starts. This will help me understand how you arrive at your health guidance. Use Markdown formatting in your answer section: use **bold** for important terms and section titles." }]
      });
      initialHistory.push({
        role: "model",
        parts: [
          { text: "I understand. For health-related questions, I'll structure my responses in two parts:\n\n1. THINKING PROCESS: Where I'll analyze the question systematically using medical knowledge.\n2. RESPONSE_BEGINS_HEALTH_CONNECT: Where I'll provide a clear, concise response based on that analysis.\n\nThis format will give transparency to how I develop health guidance while ensuring my final answer remains accessible. In my answer section, I'll use **bold text** for important terms and section titles to improve readability.\n\nPlease note that regardless of my analysis, I'll always maintain that I'm not a medical professional, and my information should not replace professional medical advice." }]
      });
    }
    // For other thinking models
    else if (isThinkingModel) {
      initialHistory.push({
        role: "user",
        parts: [
          { text: "When responding to health questions, I'd like you to show your thinking process. First, think through the question step by step using available medical knowledge. Label this section as 'THINKING PROCESS:'. When you're ready to provide the actual response, use the exact phrase 'RESPONSE_BEGINS_HEALTH_CONNECT:' to indicate where your formal answer starts. This will help me understand how you arrive at your health guidance. Use Markdown formatting in your answer section: use **bold** for important terms and section titles." }]
      });
      initialHistory.push({
        role: "model",
        parts: [
          { text: "I understand. For health-related questions, I'll structure my responses in two parts:\n\n1. THINKING PROCESS: Where I'll analyze the question systematically using medical knowledge.\n2. RESPONSE_BEGINS_HEALTH_CONNECT: Where I'll provide a clear, concise response based on that analysis.\n\nThis format will give transparency to how I develop health guidance while ensuring my final answer remains accessible. In my answer section, I'll use **bold text** for important terms and section titles to improve readability." }]
      });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: initialHistory,
    });

    return {
      sendMessage: async (message: string): Promise<GeminiResponse> => {
        try {
          const result = await chatSession.sendMessage(message);
          const responseText = result.response.text();

          // If using thinking model, parse out the thinking and answer parts
          if (isThinkingModel) {
            const thinkingMatch = responseText.match(/THINKING PROCESS:([\s\S]*?)(?=RESPONSE_BEGINS_HEALTH_CONNECT:|ANSWER:)/i);
            const answerMatch = responseText.match(/(?:RESPONSE_BEGINS_HEALTH_CONNECT:|ANSWER:)([\s\S]*)/i);

            if (thinkingMatch && answerMatch) {
              // Store the raw thinking process for UI that wants to display it separately
              const rawThinking = thinkingMatch[1].trim();
              const formattedAnswer = formatGeminiResponse(answerMatch[1].trim());

              // Create a structured response with the thinking process first, 
              // but don't add the collapsible element as that's handled by the ThinkingModel component
              return {
                text: formattedAnswer,
                thinking: rawThinking // Keep the raw thinking for the ThinkingModel component
              };
            }
          }

          return { text: formatGeminiResponse(responseText) };
        } catch (error) {
          console.error("Error sending message to Gemini:", error);
          return {
            text: "I'm sorry, I encountered an error processing your request. Please try again."
          };
        }
      }
    };
  } catch (error) {
    console.error("Error creating Gemini chat session:", error);
    return {
      sendMessage: async (message: string): Promise<GeminiResponse> => {
        return {
          text: "I'm sorry, there was an error creating the chat session. Please check your API key and try again."
        };
      }
    };
  }
};
