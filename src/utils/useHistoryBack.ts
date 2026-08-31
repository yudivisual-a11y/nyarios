import { useEffect, useRef } from 'react';

/**
 * Hook to handle mobile swipe-back gesture (side drag from left edge),
 * browser history back navigation, and device back button.
 *
 * Layer 1: Pushes state to window.history and listens to `popstate`.
 * Layer 2: Listens to touchstart / touchend on the left screen edge (X < 40px swipe right > 60px)
 * to guarantee instantaneous back navigation on any mobile browser (Safari, Chrome, PWA).
 */
export function useHistoryBack(
  isOpen: boolean,
  onClose: () => void,
  stateKey = 'nyarios_view'
) {
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Layer 1: Native History State
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      if (!isPushedRef.current) {
        window.history.pushState({ [stateKey]: true, t: Date.now() }, '');
        isPushedRef.current = true;
      }

      const handlePopState = () => {
        isPushedRef.current = false;
        onCloseRef.current();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (isPushedRef.current) {
          isPushedRef.current = false;
          if (window.history.state && window.history.state[stateKey]) {
            window.history.back();
          }
        }
      };
    } else {
      isPushedRef.current = false;
    }
  }, [isOpen, stateKey]);

  // Layer 2: Touch Edge-Swipe Gesture Listener (Swipe from left edge to right)
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isEdgeTouch = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      // Active if touch begins within 45px of the left edge
      isEdgeTouch = touchStartX <= 45;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeTouch || e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);

      // If dragged right by > 60px and horizontal movement is dominant
      if (deltaX > 60 && deltaX > deltaY * 1.3) {
        if (isPushedRef.current) {
          window.history.back();
        } else {
          onCloseRef.current();
        }
      }
      isEdgeTouch = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);
}
