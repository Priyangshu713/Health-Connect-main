
import React from 'react';
import { motion } from 'framer-motion';
import MealGenerator from '../MealGenerator';
import UpgradePrompt from '../UpgradePrompt';

interface MealGeneratorTabContentProps {
  geminiTier: string;
  setUpgradeDialogTab: (tab: string) => void;
  setShowUpgradeDialog: (show: boolean) => void;
  containerVariants: any;
  itemVariants: any;
}

const MealGeneratorTabContent = ({ 
  geminiTier,
  setUpgradeDialogTab,
  setShowUpgradeDialog,
  containerVariants,
  itemVariants 
}: MealGeneratorTabContentProps) => {
  if (geminiTier !== 'pro') {
    return (
      <UpgradePrompt 
        title="Unlock AI Meal Generation"
        description="Upgrade to Pro tier to access our advanced AI-powered meal generator."
        features={[
          "Generate complete meal plans tailored to your preferences",
          "Get detailed recipes with nutritional information",
          "Customize meals based on dietary restrictions and health goals"
        ]}
        tier="pro"
        onUpgrade={() => {
          setUpgradeDialogTab('pro');
          setShowUpgradeDialog(true);
        }}
      />
    );
  }
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-left"
    >
      <motion.div variants={itemVariants}>
        <MealGenerator />
      </motion.div>
    </motion.div>
  );
};

export default MealGeneratorTabContent;
