import { useEffect, useRef } from 'react';

export const useScrollToBottom = (dependency: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dependency]);

  return scrollRef;
};