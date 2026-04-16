import { useState, useCallback } from "react";
import { apiClient } from "./api";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (promise: Promise<T>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await promise;
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.login({ email, password });
      setUser(response.user);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.register({
          email,
          password,
          firstName,
          lastName,
          role: "patient",
        });
        setUser(response.user);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    apiClient.clearToken();
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}

export function useUserBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getUserBills();
      setBills(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bills, loading, error, fetch };
}

export function useUserClaims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getUserClaims();
      setClaims(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { claims, loading, error, fetch };
}
