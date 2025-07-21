
import React, { useState } from 'react';
import { Brain, KeyRound, Check, X, ExternalLink, HelpCircle, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';
import GeminiTierBenefits from './GeminiTierBenefits';

interface GeminiApiKeyManagerProps {
  onToggleAI?: (enabled: boolean) => void;
}

const GeminiApiKeyManager: React.FC<GeminiApiKeyManagerProps> = ({ onToggleAI }) => {
  const { toast } = useToast();
  const { geminiApiKey, setGeminiApiKey } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  
  const handleEnableAI = () => {
    if (inputKey.trim()) {
      setGeminiApiKey(inputKey.trim());
      setOpen(false);
      setInputKey('');
      
      toast({
        title: "AI Enabled",
        description: "Gemini AI is now enabled for personalized health insights",
      });
      
      if (onToggleAI) {
        onToggleAI(true);
      }
    }
  };
  
  const handleDisableAI = () => {
    setGeminiApiKey(null);
    
    toast({
      title: "AI Disabled",
      description: "Gemini AI is now disabled",
    });
    
    if (onToggleAI) {
      onToggleAI(false);
    }
  };

  const openGeminiApiDocs = () => {
    window.open('https://ai.google.dev/tutorials/setup', '_blank');
  };

  return (
    <div className="flex items-center space-x-2">
      {geminiApiKey ? (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableAI}
            className="gap-2"
          >
            <Brain className="h-4 w-4 text-health-lavender" />
            Disable Gemini AI
          </Button>
          <GeminiTierBenefits tierType="lite" />
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Brain className="h-4 w-4 text-health-lavender" />
                Enable Gemini AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Google Gemini API Key</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2 pt-4">
                <div className="grid flex-1 gap-2">
                  <label htmlFor="api-key" className="text-sm font-medium leading-none">
                    Enter your Gemini API key
                  </label>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="api-key"
                      type="password"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      This key will be stored locally and used for all AI features.
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-primary"
                          onClick={openGeminiApiDocs}
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          <span className="underline">How to get a key</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Opens Google Gemini API documentation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="gap-1"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleEnableAI}
                  disabled={!inputKey.trim()}
                  className="gap-1"
                >
                  <Check className="h-4 w-4" /> Enable AI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <GeminiTierBenefits tierType="free" />
        </div>
      )}
    </div>
  );
};

export default GeminiApiKeyManager;
