import { useState, useEffect, useCallback } from "react";
import { AuthAPI } from "@/api/auth.api";
import { AxiosConfig } from "@/config/axios.config";
import { LoginDto, SignupDto, AuthResponse } from "@/types/auth";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const authAPI = AuthAPI.getInstance();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (data: LoginDto): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response: AuthResponse = await authAPI.login(data);

        // Store tokens and user data
        localStorage.setItem("authToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Set auth token in axios config
        AxiosConfig.setAuthToken(response.accessToken);

        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [authAPI]
  );

  const signup = useCallback(
    async (data: SignupDto): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response: AuthResponse = await authAPI.signup(data);

        // Store tokens and user data
        localStorage.setItem("authToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Set auth token in axios config
        AxiosConfig.setAuthToken(response.accessToken);

        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Signup failed";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [authAPI]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Clear auth token from axios config
      AxiosConfig.clearAuthToken();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [authAPI]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    signup,
    logout,
    clearError,
  };
};
