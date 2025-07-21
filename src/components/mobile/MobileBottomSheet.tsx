
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSwipe } from '@/hooks/use-touch';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  snapPoints?: number[];
  initialSnapPoint?: number;
  className?: string;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  snapPoints = [100], // Percentage of screen height
  initialSnapPoint = 0,
  className,
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  // Set up portal element on mount
  useEffect(() => {
    const element = document.getElementById('modal-root') || document.body;
    setPortalElement(element);
    
    // Handle body scroll lock
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Listen for swipe events
  const contentRef = useRef<HTMLDivElement>(null);
  const { swipeDirection } = useSwipe(contentRef);
  
  useEffect(() => {
    if (swipeDirection.isDown && isOpen) {
      onClose();
    }
  }, [swipeDirection, isOpen, onClose]);
  
  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const { clientY } = e.touches[0];
    setStartY(clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const { clientY } = e.touches[0];
    setCurrentY(clientY);
    
    const deltaY = clientY - startY;
    
    // Only allow dragging down, not up
    if (deltaY < 0) return;
    
    // Update sheet position during drag
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (!sheetRef.current) return;
    
    const deltaY = currentY - startY;
    
    // If dragged down more than 20% of the screen height, close
    if (deltaY > window.innerHeight * 0.2) {
      onClose();
    } else {
      // Snap back to current snap point
      sheetRef.current.style.transform = '';
    }
  };
  
  if (!portalElement || !isOpen) return null;
  
  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div 
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-lg transform transition-transform duration-300 pt-safe-bottom pb-safe-bottom",
          isOpen ? "translate-y-0" : "translate-y-full",
          className
        )}
        style={{ 
          maxHeight: `${snapPoints[currentSnapPoint]}vh`,
          minHeight: '30vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for dragging */}
        {showHandle && (
          <div 
            className="w-full flex justify-center py-2 cursor-grab touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 bg-muted rounded-full"></div>
          </div>
        )}
        
        {/* Header with title and close button */}
        {title && (
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="mobile-touch-target rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="overflow-y-auto px-4 py-3 momentum-scroll scrollbar-hide"
          style={{ maxHeight: 'calc(80vh - 4rem)' }}
        >
          {children}
        </div>
      </div>
    </div>,
    portalElement
  );
};

export default MobileBottomSheet;
