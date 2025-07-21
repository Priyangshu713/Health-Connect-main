
import { useState, useEffect, TouchEvent } from 'react';

interface SwipeDirection {
  isLeft: boolean;
  isRight: boolean;
  isUp: boolean;
  isDown: boolean;
}

export function useSwipe(element?: React.RefObject<HTMLElement>) {
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>({
    isLeft: false,
    isRight: false,
    isUp: false,
    isDown: false,
  });

  // Minimum distance in pixels required for a swipe
  const minSwipeDistance = 50;

  const resetSwipeDirection = () => {
    setSwipeDirection({
      isLeft: false,
      isRight: false,
      isUp: false,
      isDown: false,
    });
  };

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    resetSwipeDirection();
    
    if (isHorizontalSwipe) {
      if (distanceX > minSwipeDistance) {
        setSwipeDirection(prev => ({ ...prev, isLeft: true }));
      } else if (distanceX < -minSwipeDistance) {
        setSwipeDirection(prev => ({ ...prev, isRight: true }));
      }
    } else {
      if (distanceY > minSwipeDistance) {
        setSwipeDirection(prev => ({ ...prev, isUp: true }));
      } else if (distanceY < -minSwipeDistance) {
        setSwipeDirection(prev => ({ ...prev, isDown: true }));
      }
    }
  };

  useEffect(() => {
    const target = element?.current || document;
    
    if (target) {
      target.addEventListener('touchstart', onTouchStart as any);
      target.addEventListener('touchmove', onTouchMove as any);
      target.addEventListener('touchend', onTouchEnd as any);
    }
    
    return () => {
      if (target) {
        target.removeEventListener('touchstart', onTouchStart as any);
        target.removeEventListener('touchmove', onTouchMove as any);
        target.removeEventListener('touchend', onTouchEnd as any);
      }
    };
  }, [element?.current]);

  return { swipeDirection };
}

// Detect if touch is available
export function useTouchAvailable() {
  const [isTouchAvailable, setIsTouchAvailable] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    setIsTouchAvailable(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);
  
  return isTouchAvailable;
}

// Hook for better touch handling on inputs
export function useTouchInput() {
  const isTouchAvailable = useTouchAvailable();
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isTouchAvailable) {
      // On iOS, focus doesn't always work well with fixed elements
      const viewportHeight = window.innerHeight;
      const elementRect = e.target.getBoundingClientRect();
      const elementTop = elementRect.top;
      
      // If input is in the bottom half of the screen, scroll it into view
      if (elementTop > viewportHeight / 2) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };
  
  return { handleFocus };
}
