import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce a entradas de búsqueda y autocompletado,
 * evitando filtrado o llamadas de red en cada pulsación de tecla.
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

