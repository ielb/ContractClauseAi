import { AxiosInstance } from "axios";
import { AxiosConfig } from "@/config/axios.config";

/**
 * Base API class that provides shared axios configuration
 * All API classes should extend this class to ensure consistent configuration
 */
export abstract class BaseAPI {
  protected api: AxiosInstance;

  protected constructor() {
    this.api = AxiosConfig.getInstance();
  }

  /**
   * Helper method for file uploads
   */
  protected async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string | number>
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.api.post(
      endpoint,
      formData,
      AxiosConfig.createFormDataConfig()
    );
  }

  /**
   * Helper method for file downloads
   */
  protected async downloadFile(
    endpoint: string,
    filename?: string
  ): Promise<Blob> {
    const response = await this.api.get(
      endpoint,
      AxiosConfig.createDownloadConfig()
    );

    // If filename is provided, trigger download
    if (filename && typeof window !== "undefined") {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  }

  /**
   * Helper method for paginated requests
   */
  protected async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    additionalParams?: Record<string, string | number | boolean>
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const params = {
      page,
      limit,
      ...additionalParams,
    };

    const response = await this.api.get(endpoint, { params });
    return response.data;
  }
}
