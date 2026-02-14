import { useEffect, useState } from 'react';

/**
 * 입력값이 변경된 뒤 지정 시간(ms) 동안 추가 변경이 없을 때만
 * "최종값"을 반환하는 debounce 커스텀 훅
 *
 * @param value
 * @param delay
 *
 * @returns value
 */

function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
