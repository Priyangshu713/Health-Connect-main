
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AllergiesInputProps {
  allergies: string[];
  onAdd: (allergy: string) => void;
  onRemove: (allergy: string) => void;
}

const AllergiesInput: React.FC<AllergiesInputProps> = ({ 
  allergies, 
  onAdd, 
  onRemove 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-health-lavender/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-health-lavender" />
            Food Allergies & Preferences
          </CardTitle>
          <CardDescription>
            Let us know about any food allergies or restrictions to customize your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter an allergy or food to avoid"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!inputValue.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {allergies.map((allergy) => (
                <motion.div
                  key={allergy}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="secondary" className="px-3 py-1.5">
                    {allergy}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => onRemove(allergy)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {allergies.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No allergies or restrictions added
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AllergiesInput;
