// src/hooks/useApi.ts
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Generic hook for API calls with loading and error handling
function useApi<T, P extends any[]>(
  apiFunc: (...args: P) => Promise<T>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: P) => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiFunc(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
        throw error;
      }
    },
    [apiFunc]
  );

  return {
    ...state,
    execute,
  };
}

export default useApi;