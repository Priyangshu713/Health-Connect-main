import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Sparkles, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { createGeminiChatSession } from '@/services/GeminiChatService';
import { ThinkingModel } from '@/components/common/ThinkingModel';
import { useHealthStore } from '@/store/healthStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  thinking?: string[];
  thinkingTime?: number;
}

interface ChatBotProps {
  useGemini: boolean;
  geminiTier?: 'free' | 'lite' | 'pro';
  onRequestUpgrade?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ useGemini: initialUseGemini, geminiTier = 'free', onRequestUpgrade }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! How can I help with your health questions today?',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useGemini, setUseGemini] = useState(initialUseGemini);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const healthStore = useHealthStore();
  const { geminiModel, geminiApiKey } = healthStore;
  const currentGeminiTier = healthStore.geminiTier;
  const isThinkingModel = geminiModel.includes('thinking') || geminiModel === 'gemini-2.5-pro-exp-03-25';
  const isPaidUser = currentGeminiTier === 'lite' || currentGeminiTier === 'pro';
  const isPremiumModel = geminiModel === 'gemini-2.0-pro-exp-02-05' ||
    geminiModel === 'gemini-2.0-flash-thinking-exp-01-21' ||
    geminiModel === 'gemini-2.5-pro-exp-03-25';
  const canUseSelectedModel = isPaidUser && (!isPremiumModel || currentGeminiTier === 'pro');

  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isPaidUser && geminiApiKey) {
      setUseGemini(true);
    } else {
      setUseGemini(false);
    }
  }, [isPaidUser, geminiApiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleThinking = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (isPremiumModel && currentGeminiTier !== 'pro') {
      toast({
        title: "Premium Model Restricted",
        description: "You need to upgrade to Pro tier to use this premium model",
        variant: "destructive",
      });

      if (onRequestUpgrade) {
        onRequestUpgrade();
      }
      return;
    }

    if (currentGeminiTier === 'free' && useGemini) {
      if (onRequestUpgrade) {
        onRequestUpgrade();
      }
      return;
    }

    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      text: input,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      let response;

      if (useGemini && geminiApiKey && canUseSelectedModel) {
        const geminiSession = createGeminiChatSession(geminiApiKey, geminiModel);
        const geminiResponse = await geminiSession.sendMessage(input);

        const endTime = Date.now();
        const thinkingTime = endTime - startTime;

        if (isThinkingModel && geminiResponse.thinking) {
          const thinkingArray = geminiResponse.thinking
            .split(/\n(?=\d+\.|\*|\-|\(\d+\)|Step \d+:)/)
            .filter(item => item.trim().length > 0)
            .map(item => {
              return item.trim().replace(/^Answer:\s*/i, 'Analysis: ');
            });

          response = {
            text: geminiResponse.text,
            thinking: thinkingArray,
            thinkingTime: thinkingTime
          };
        } else {
          response = {
            text: geminiResponse.text
          };
        }
      } else {
        if (currentGeminiTier === 'free') {
          response = {
            text: `<div>
              <p><strong>Upgrade Required</strong></p>
              <p>To access the AI-powered health assistant with personalized recommendations, please upgrade to our Lite or Pro tier.</p>
              <ul>
                <li>Lite Tier: AI-powered personalized responses</li>
                <li>Pro Tier: Advanced AI models with in-depth health analysis</li>
              </ul>
              <p>Click the "Upgrade" button below to access premium features.</p>
            </div>`
          };
        } else {
          response = await simulateResponse(input);
        }
      }

      const botMessageId = Date.now().toString();

      if (isThinkingModel && response.thinking) {
        setExpandedMessages(prev => ({
          ...prev,
          [botMessageId]: false
        }));
      }

      if (isThinkingModel && response.thinking) {
        setMessages(prev => [
          ...prev,
          {
            id: botMessageId,
            text: response.text,
            sender: 'bot',
            thinking: response.thinking,
            thinkingTime: response.thinkingTime
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: botMessageId,
            text: response.text,
            sender: 'bot'
          }
        ]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "I'm sorry, I encountered an error processing your request. Please try again.",
          sender: 'bot'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateResponse = async (query: string): Promise<{ text: string, thinking?: string[] }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('headache') || lowerQuery.includes('head pain')) {
          resolve({
            text: "Headaches can be caused by various factors such as stress, dehydration, lack of sleep, or eye strain. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you're experiencing severe or recurring headaches, it's best to consult a healthcare professional.",
          });
        } else if (lowerQuery.includes('diet') || lowerQuery.includes('eat') || lowerQuery.includes('food')) {
          resolve({
            text: "A balanced diet is essential for good health. Try to include plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats in your meals. Limit processed foods, sugary drinks, and excessive salt. Remember to stay hydrated by drinking plenty of water throughout the day.",
          });
        } else if (lowerQuery.includes('sleep') || lowerQuery.includes('insomnia')) {
          resolve({
            text: "Good sleep hygiene is important for overall health. Aim for 7-9 hours of quality sleep each night. Establish a regular sleep schedule, create a relaxing bedtime routine, and make your bedroom comfortable and free from distractions. Avoid caffeine, large meals, and screen time before bed.",
          });
        } else if (lowerQuery.includes('exercise') || lowerQuery.includes('workout')) {
          resolve({
            text: "Regular physical activity is beneficial for both physical and mental health. Aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, along with muscle-strengthening activities twice a week. Find activities you enjoy to make exercise a sustainable part of your routine.",
          });
        } else if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety')) {
          resolve({
            text: "Managing stress is crucial for wellbeing. Consider techniques like deep breathing, meditation, physical activity, or connecting with loved ones. Ensure you're getting enough sleep and maintaining a balanced diet. If stress or anxiety is significantly affecting your daily life, consider speaking with a healthcare provider.",
          });
        } else {
          resolve({
            text: "I'm here to provide general health information. While I can offer basic guidance on topics like nutrition, exercise, sleep, and common health concerns, I'm not a substitute for professional medical advice. If you have specific health concerns, please consult with a healthcare provider.",
          });
        }
      }, 1000);
    });
  };

  const formatMessageText = (text: string) => {
    if (text.includes('<') && text.includes('>')) {
      return <div dangerouslySetInnerHTML={{ __html: text }} />;
    } else {
      return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
  };

  const formatThinkingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className={message.sender === 'user' ? 'bg-primary/10' : 'bg-muted'}>
                    <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
                    {message.sender === 'bot' && (
                      <AvatarImage
                        src="/lovable-uploads/d0d800ca-f073-4663-a228-b3dca4178d45.png"
                        alt="AI Bot"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/lovable-uploads/85e10dd8-810c-44de-8661-df3911e610ce.png';
                        }}
                      />
                    )}
                  </Avatar>

                  <div className={`rounded-lg p-3 ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                    }`}>
                    <div className="text-sm prose-sm max-w-none">
                      {message.thinking && message.thinking.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => toggleThinking(message.id)}
                            className="flex items-center justify-between w-full mb-2 p-2 bg-primary/10 hover:bg-primary/15 rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-1 text-xs text-primary font-medium">
                              <Brain className="h-3 w-3" />
                              <span>Thought for {message.thinkingTime ? formatThinkingTime(message.thinkingTime) : '?'}</span>
                            </div>
                            {expandedMessages[message.id] ? (
                              <ChevronUp className="h-3 w-3 text-primary" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-primary" />
                            )}
                          </button>

                          {expandedMessages[message.id] && (
                            <div className="bg-primary/5 p-3 rounded-md border border-primary/10 mb-2 animate-in fade-in-50 duration-150">
                              <div className="text-xs space-y-2">
                                {message.thinking.map((thought, index) => (
                                  <div key={index} className="text-muted-foreground">
                                    {thought.trim().startsWith('-') || thought.trim().startsWith('*') ? (
                                      <div className="ml-4">• {thought.replace(/^[\-\*]\s+/, '')}</div>
                                    ) : (
                                      <>
                                        <span className="text-primary font-medium">Step {index + 1}:</span> {thought}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="border-t border-primary/10 pt-3 mt-1">
                            <div className="font-medium text-sm mb-2">Answer:</div>
                            {formatMessageText(message.text)}
                          </div>
                        </div>
                      )}

                      {(!message.thinking || message.thinking.length === 0) && (
                        formatMessageText(message.text)
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="bg-muted">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage
                    src="/lovable-uploads/85e10dd8-810c-44de-8661-df3911e610ce.png"
                    alt="AI Bot"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/path/to/default/bot/icon.png';
                    }}
                  />
                </Avatar>
                <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                  {isThinkingModel ? (
                    <div className="flex items-center space-x-2 text-primary/70">
                      <Brain className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Type your health question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || (!isPaidUser && useGemini)}
            className="flex-1"
          />

          {isPaidUser ? (
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onRequestUpgrade}
              className="bg-amber-500 hover:bg-amber-600 text-white flex gap-2 px-4"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade
            </Button>
          )}
        </form>

        {!isPaidUser && (
          <p className="text-xs text-muted-foreground mt-2">
            <Bot className="h-3 w-3 inline mr-1" />
            Upgrade to access AI-powered health assistant
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
