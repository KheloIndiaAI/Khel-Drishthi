import { useEffect, useRef, useState } from "react";

interface UseSwipeNavigationProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: UseSwipeNavigationProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
      setIsSwiping(true);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current) return;
      
      const currentX = e.changedTouches[0].screenX;
      const diff = touchStartX.current - currentX;
      
      if (Math.abs(diff) > 20) {
        setSwipeDirection(diff > 0 ? 'left' : 'right');
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      
      if (touchStartX.current === null || touchEndX.current === null) {
        setIsSwiping(false);
        setSwipeDirection(null);
        return;
      }
      
      const diff = touchStartX.current - touchEndX.current;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          onSwipeLeft(); // Swipe left = next section
        } else {
          onSwipeRight(); // Swipe right = previous section
        }
      }
      
      touchStartX.current = null;
      touchEndX.current = null;
      setIsSwiping(false);
      setSwipeDirection(null);
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, onSwipeLeft, onSwipeRight]);
  
  return { isSwiping, swipeDirection };
}
