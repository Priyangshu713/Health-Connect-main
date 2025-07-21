
import React from 'react';
import { useHealthStore, GeminiModelType, GeminiModelOption } from '@/store/healthStore';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Bot, Zap, Cpu, Brain, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: "gemini-2.5-flash-lite-preview-06-17",
    name: "Gemini 2.5 Flash Lite",
    description: "Fastest responses with efficient compute",
    isPremium: false,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Latest general-purpose model with improved capabilities",
    isPremium: false,
  },
  {
    id: "gemini-2.0-flash-thinking-exp-01-21",
    name: "Gemini 2.0 Flash Thinking",
    description: "Advanced reasoning with step-by-step thinking process",
    isPremium: true,
  },
];

const ModelIcon = ({ model }: { model: GeminiModelType }) => {
  switch (model) {
    case "gemini-2.5-flash":
      return <Zap className="h-4 w-4 text-health-sky" />;
    case "gemini-2.5-flash-lite-preview-06-17":
      return <Cpu className="h-4 w-4 text-health-mint" />;
    case "gemini-2.0-flash-thinking-exp-01-21":
      return <Brain className="h-4 w-4 text-purple-500" />;
    default:
      return <Bot className="h-4 w-4 text-health-lavender" />;
  }
};

interface ModelSelectorProps {
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ compact = false }) => {
  const { geminiApiKey, geminiModel, setGeminiModel, geminiTier } = useHealthStore();
  const { toast } = useToast();
  
  if (!geminiApiKey) {
    return null;
  }

  const isPremiumUser = geminiTier === 'pro';
  const isLiteUser = geminiTier === 'lite';
  const isFreeUser = geminiTier === 'free';

  const handleModelChange = (value: string) => {
    const selectedModel = GEMINI_MODELS.find(model => model.id === value);
    
    if (isFreeUser) {
      toast({
        title: "AI Models Restricted",
        description: "You need to upgrade to Lite or Pro tier to use AI models",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedModel?.isPremium && !isPremiumUser) {
      toast({
        title: "Premium Model Restricted",
        description: "You need to upgrade to Pro tier to use this premium model",
        variant: "destructive",
      });
      return;
    }
    
    setGeminiModel(value as GeminiModelType);
  };

  // Set background color based on tier
  let bgColorClass = "bg-blue-50 border-blue-200";
  if (isPremiumUser) {
    bgColorClass = "bg-amber-50 border-amber-200";
  } else if (isLiteUser) {
    bgColorClass = "bg-purple-50 border-purple-200";
  }

  const selectedModel = GEMINI_MODELS.find(model => model.id === geminiModel);

  return (
    <div className={`${compact ? 'w-full' : 'w-72'}`}>
      <Select value={geminiModel} onValueChange={handleModelChange}>
        <SelectTrigger className={`w-full ${compact ? 'h-8 text-xs' : ''} ${bgColorClass}`}>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {GEMINI_MODELS.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={(model.isPremium && !isPremiumUser) || isFreeUser}
              className={(model.isPremium && !isPremiumUser) || isFreeUser ? "opacity-60" : ""}
            >
              <div className="flex items-center gap-2">
                <ModelIcon model={model.id} />
                <span>{model.name}</span>
                {model.isPremium && (
                  <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 py-0.5 px-1.5 rounded-full">
                    Premium
                  </span>
                )}
                {((model.isPremium && !isPremiumUser) || isFreeUser) && (
                  <Lock className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
