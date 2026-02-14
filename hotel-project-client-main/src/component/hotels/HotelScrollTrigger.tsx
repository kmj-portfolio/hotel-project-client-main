import { useEffect, useRef } from 'react';

export const HotelScrollTrigger = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(); // 화면에 보이면 콜백 실행
        }
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={ref} style={{ height: 1 }} />;
};
