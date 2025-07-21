
import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ThinkingModelProps {
  thinking: string[];
}

export const ThinkingModel: React.FC<ThinkingModelProps> = ({ thinking }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format the thinking text to handle markdown-like syntax
  const formatThinking = (text: string) => {
    // Handle bold text (**text**)
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle bullet points (lines with - or *)
    if (text.trim().startsWith('-') || text.trim().startsWith('*')) {
      return <li dangerouslySetInnerHTML={{ __html: formatted.replace(/^[\-\*]\s+/, '') }} />;
    }
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-3 pt-3 border-t border-purple-200/30"
    >
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-500 transition-colors">
        <Brain className="h-3 w-3" />
        <span>Thinking Process</span>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded p-2 text-xs space-y-2">
          {thinking.some(t => t.trim().startsWith('-') || t.trim().startsWith('*')) ? (
            <ul className="list-disc pl-4 space-y-1">
              {thinking.map((thought, index) => (
                <React.Fragment key={index}>
                  {thought.trim().startsWith('-') || thought.trim().startsWith('*') ? (
                    formatThinking(thought)
                  ) : (
                    <div key={index} className="text-muted-foreground mb-2">
                      <span className="text-purple-500 font-medium">Step {index + 1}:</span> {formatThinking(thought)}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </ul>
          ) : (
            thinking.map((thought, index) => (
              <div key={index} className="text-muted-foreground">
                <span className="text-purple-500 font-medium">Step {index + 1}:</span> {formatThinking(thought)}
              </div>
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
