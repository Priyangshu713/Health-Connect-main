
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface HealthInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  content: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const HealthInfoDialog: React.FC<HealthInfoDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  content,
  className = '',
  contentClassName = '',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            
            <DialogContent className={`p-0 border-none bg-transparent shadow-none max-w-md mx-auto ${className}`} hideCloseButton>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  duration: 0.3 
                }}
                className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-lg p-5 shadow-xl overflow-auto max-h-[85vh] ${contentClassName}`}
              >
                {/* Custom close button to replace the default one */}
                <button 
                  onClick={onClose}
                  className="absolute right-3 top-3 rounded-full p-1.5 bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <DialogHeader className="pb-3">
                  <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
                </DialogHeader>
                
                <div className="mt-4 space-y-4 text-sm">
                  {content}
                </div>
              </motion.div>
            </DialogContent>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default HealthInfoDialog;
