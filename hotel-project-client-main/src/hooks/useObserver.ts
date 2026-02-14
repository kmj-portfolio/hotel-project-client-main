import { useEffect, useRef, useState } from 'react';

const useObserver = (threshold?: number) => {
  const observerElement = useRef<HTMLDivElement>(null);
  const [isView, setIsView] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsView(entry.isIntersecting);
        });
      },
      {
        threshold: threshold || 0.5,
      },
    );
    if (observerElement.current) {
      observer.observe(observerElement.current);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (observerElement.current) {
        observer.disconnect();
      }
    };
  }, [threshold]);

  return {
    ref: observerElement,
    isView,
  };
};

export default useObserver;
