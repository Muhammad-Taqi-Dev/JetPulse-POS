/**
 * Framework: BaseService (REST API Client / Mock Service Engine)
 * Handles HTTP requests, simulated latency, error interceptors, and typed promise responses.
 */

export interface ServiceRequestOptions<T = any> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  mockResponse?: T;
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

export interface ServiceResponse<T = any> {
  status: number;
  statusText: string;
  data: T;
}

class BaseService {
  /**
   * Simulates an asynchronous REST API call with realistic network latency
   */
  fetch<T = any>(options: ServiceRequestOptions<T>): Promise<ServiceResponse<T>> {
    return new Promise((resolve, reject) => {
      const delay = typeof options.delay === "number" ? options.delay : 200;

      setTimeout(() => {
        if (options.shouldFail) {
          reject({
            status: 500,
            statusText: "Internal Server Error",
            message: options.errorMessage || "An unexpected error occurred while communicating with the server."
          });
          return;
        }

        resolve({
          status: 200,
          statusText: "OK",
          data: options.mockResponse as T
        });
      }, delay);
    });
  }

  /**
   * Standard GET request wrapper
   */
  get<T = any>(url: string, mockData: T, delay: number = 200): Promise<ServiceResponse<T>> {
    return this.fetch<T>({
      url,
      method: "GET",
      mockResponse: mockData,
      delay
    });
  }

  /**
   * Standard POST request wrapper
   */
  post<T = any>(url: string, payload: any, mockResponse: T, delay: number = 350): Promise<ServiceResponse<T>> {
    return this.fetch<T>({
      url,
      method: "POST",
      data: payload,
      mockResponse,
      delay
    });
  }
}

export default new BaseService();
