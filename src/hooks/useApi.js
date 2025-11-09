import { useState, useCallback, useEffect } from 'react';

export const useApi = (apiCall, immediate = false) => {
  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: message });
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute };
};
