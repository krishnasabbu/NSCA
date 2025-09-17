import { useState, useEffect } from 'react';
import { ApiResponse } from '@/services/api';

interface UseApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiData<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiDataState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiCall();
      console.log("response === "+JSON.stringify(response));
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || 'An error occurred',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<T, P = any>() {
  const [state, setState] = useState<UseApiDataState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (
    apiCall: (params: P) => Promise<ApiResponse<T>>,
    params: P
  ): Promise<T | null> => {
    try {
      setState({ data: null, loading: true, error: null });
      const response = await apiCall(params);
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || 'An error occurred',
        });
        return null;
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
      return null;
    }
  };

  return {
    ...state,
    mutate,
  };
}