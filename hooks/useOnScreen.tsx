import { useState, useEffect, RefObject } from 'react';

interface ObserverOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export const useOnScreen = (
  ref: RefObject<HTMLElement>,
  { threshold = 0.1, triggerOnce = true }: ObserverOptions = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold, triggerOnce]);

  return isVisible;
};
