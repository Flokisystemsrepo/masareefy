import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  clearError: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    refreshing: false,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await apiFunction(...args);
        setState((prev) => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    },
    [apiFunction]
  );

  const refresh = useCallback(async (): Promise<T | null> => {
    try {
      setState((prev) => ({ ...prev, refreshing: true, error: null }));
      const result = await apiFunction();
      setState((prev) => ({ ...prev, data: result, refreshing: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, error: errorMessage, refreshing: false }));
      return null;
    }
  }, [apiFunction]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    refresh,
    clearError,
    setData,
  };
}

// Specialized hooks for common API patterns
export function useListApi<T>(
  apiFunction: (filters?: any) => Promise<{ data: T[]; pagination?: any }>,
  initialFilters?: any
) {
  const [filters, setFilters] = useState(initialFilters || {});

  const listApi = useCallback(
    async (newFilters?: any) => {
      const finalFilters = newFilters || filters;
      return apiFunction(finalFilters);
    },
    [apiFunction, filters]
  );

  const apiState = useApi(listApi);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

  return {
    ...apiState,
    filters,
    updateFilters,
    resetFilters,
  };
}

export function useCreateApi<T, CreateData>(
  apiFunction: (data: CreateData) => Promise<T>
) {
  const createApi = useCallback(
    async (data: CreateData) => {
      return apiFunction(data);
    },
    [apiFunction]
  );

  return useApi(createApi);
}

export function useUpdateApi<T, UpdateData>(
  apiFunction: (id: string, data: UpdateData) => Promise<T>
) {
  const updateApi = useCallback(
    async (id: string, data: UpdateData) => {
      return apiFunction(id, data);
    },
    [apiFunction]
  );

  return useApi(updateApi);
}

export function useDeleteApi(apiFunction: (id: string) => Promise<any>) {
  const deleteApi = useCallback(
    async (id: string) => {
      return apiFunction(id);
    },
    [apiFunction]
  );

  return useApi(deleteApi);
}
