import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/config/env";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class AxiosConfig {
  private static instance: AxiosInstance;

  public static getInstance(): AxiosInstance {
    if (!AxiosConfig.instance) {
      AxiosConfig.instance = AxiosConfig.createInstance();
    }
    return AxiosConfig.instance;
  }

  private static createInstance(): AxiosInstance {
    const axiosInstance = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = AxiosConfig.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
            {
              data: config.data,
              params: config.params,
            }
          );
        }

        return config;
      },
      (error: AxiosError) => {
        console.error("[API Request Error]", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${
              response.config.url
            }`,
            {
              status: response.status,
              data: response.data,
            }
          );
        }

        return response;
      },
      (error: AxiosError) => {
        const apiError = AxiosConfig.handleError(error);

        // Handle specific error cases
        if (error.response?.status === 401) {
          AxiosConfig.handleUnauthorized();
        }

        return Promise.reject(apiError);
      }
    );

    return axiosInstance;
  }

  private static getAuthToken(): string | null {
    try {
      return localStorage.getItem("authToken");
    } catch {
      // Handle SSR or localStorage not available
      return null;
    }
  }

  private static handleUnauthorized(): void {
    try {
      // Clear auth token
      localStorage.removeItem("authToken");

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } catch {
      // Handle SSR or localStorage not available
      console.warn("Unable to handle unauthorized error in SSR context");
    }
  }

  private static handleError(error: AxiosError): ApiError {
    console.error("[API Error]", error);

    // Network error
    if (!error.response) {
      return {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }

    // Server error with response
    const { status, data } = error.response;

    // Try to extract error message from response
    let message = "An unexpected error occurred.";

    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        message = data.message;
      } else if ("error" in data && typeof data.error === "string") {
        message = data.error;
      } else if ("detail" in data && typeof data.detail === "string") {
        message = data.detail;
      }
    }

    // Handle specific status codes
    switch (status) {
      case 400:
        message = message || "Bad request. Please check your input.";
        break;
      case 401:
        message = "Authentication required. Please log in.";
        break;
      case 403:
        message =
          "Access denied. You do not have permission to perform this action.";
        break;
      case 404:
        message = "Resource not found.";
        break;
      case 409:
        message =
          message ||
          "Conflict. The resource already exists or there is a conflict.";
        break;
      case 422:
        message = message || "Validation error. Please check your input.";
        break;
      case 429:
        message = "Too many requests. Please try again later.";
        break;
      case 500:
        message = "Internal server error. Please try again later.";
        break;
      case 502:
        message = "Bad gateway. The server is temporarily unavailable.";
        break;
      case 503:
        message = "Service unavailable. Please try again later.";
        break;
      default:
        message = message || `Server error (${status}). Please try again.`;
    }

    return {
      message,
      status,
      code: error.code,
    };
  }

  // Utility methods for common configurations
  public static createFormDataConfig(): AxiosRequestConfig {
    return {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }

  public static createDownloadConfig(): AxiosRequestConfig {
    return {
      responseType: "blob",
    };
  }

  // Method to update auth token
  public static setAuthToken(token: string): void {
    try {
      localStorage.setItem("authToken", token);
    } catch {
      console.warn("Unable to set auth token in SSR context");
    }
  }

  // Method to clear auth token
  public static clearAuthToken(): void {
    try {
      localStorage.removeItem("authToken");
    } catch {
      console.warn("Unable to clear auth token in SSR context");
    }
  }
}
