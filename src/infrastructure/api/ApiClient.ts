/* eslint-disable */
/**
 * ApiClient
 *
 * Base API client for handling HTTP requests.
 * This is a lightweight wrapper around fetch with some additional features:
 * - Automatic JSON parsing
 * - Base URL configuration
 * - Default headers
 * - Request/response interceptors
 * - HTTP verb convenience methods (get, post, put, delete)
 */

import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import type { IApiClient } from './IApiClient'; // Add this import
import { ApiProxyService } from './ApiProxyService';

// Request options type
export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  /**
   * Internal flag to indicate that this request is a retry after a silent token
   * refresh. This prevents infinite refresh→retry loops.
   */
  _isRetry?: boolean;
}

// Response interceptor type
export type ResponseInterceptor = (
  response: Response,
  requestOptions: RequestOptions
) => Promise<any>;

// Custom Error class for HTTP errors
class HttpError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    // Ensure the prototype chain is correct
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * ApiClient class for making HTTP requests
 */
export class ApiClient implements IApiClient {
  public baseUrl: string;
  public headers: Record<string, string>;
  private responseInterceptors: ResponseInterceptor[];
  private authToken: string | null = null;

  /**
   * Create a new ApiClient
   */
  constructor(
    baseUrl: string,
    headers: Record<string, string> = {},
    responseInterceptors: ResponseInterceptor[] = []
  ) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };
    this.responseInterceptors = responseInterceptors;
  }

  /**
   * Set the authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Clear all response interceptors
   */
  clearResponseInterceptors(): void {
    this.responseInterceptors = [];
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    // Map frontend path to backend path
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    return this.fetch(mappedPath, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any  ,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    // Map and transform request data
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    const mappedData = ApiProxyService.mapRequestData(rawPath, data);
    const body = mappedData ? JSON.stringify(mappedData) : undefined;
    return this.fetch(mappedPath, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any  ,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    const mappedData = ApiProxyService.mapRequestData(rawPath, data);
    const body = mappedData ? JSON.stringify(mappedData) : undefined;
    return this.fetch(mappedPath, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    return this.fetch(mappedPath, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Make a fetch request with the configured baseUrl and headers
   */
  async fetch<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    let response: Response | null = null;
    NProgress.start();
    try {
      // Construct full URL
      const fullUrl = this.createUrl(url, options.params);

      // Combine headers
      const headers: Record<string, string> = {
        ...this.headers,
        ...((options.headers as Record<string, string>) || {}),
      };

      // Extract custom fields not allowed in RequestInit
       
      const { params: _params, _isRetry, ...restOptions } = options;

      // Create request options (exclude custom fields)
      const requestOptions: RequestInit = {
        ...restOptions,
        credentials: 'include',
        headers,
      };

      response = await fetch(fullUrl, requestOptions);

      // Check for HTTP errors (status codes >= 400)
      if (!response.ok) {
        let errorData: any = null;
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          // Try to parse response body for more specific error details
          errorData = await response.json();
          // Use backend error detail if available (common in FastAPI)
          errorMessage = errorData?.detail || errorData?.message || errorMessage;
        } catch (jsonError) {
          // Response body wasn't valid JSON or empty
          console.debug('Could not parse error response body as JSON', jsonError);
        }
        // Throw custom error
        throw new HttpError(errorMessage, response.status, errorData);
      }

      // Process successful response through interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse, options);
        // Note: Interceptors could potentially modify the response or throw errors
      }

      // Handle JSON responses from successful requests
      if (processedResponse.headers.get('Content-Type')?.includes('application/json')) {
        const rawData = await processedResponse.json();
        const mapped = ApiProxyService.mapResponseData(url, rawData);
        const standardized = ApiProxyService.standardizeResponse(mapped);
        return standardized.data as T;
      }

      // Handle text responses
      if (processedResponse.headers.get('Content-Type')?.includes('text/')) {
        const rawText = await processedResponse.text();
        const mappedText = ApiProxyService.mapResponseData(url, rawText);
        const standardizedText = ApiProxyService.standardizeResponse(mappedText);
        return standardizedText.data as unknown as T;
      }

      // Handle No Content (204) response
      if (processedResponse.status === 204) {
        return undefined as unknown as T; // Return undefined or null based on expected type
      }

      // Return other response types as is (may need refinement)
      console.warn(`[ApiClient] Unhandled successful response type for ${url}`);
      const standardized = ApiProxyService.standardizeResponse(processedResponse as any);
      return standardized.data as unknown as T;
    } catch (error: any) {
      console.error('[ApiClient] Fetch error:', error);

      // Enhanced error handling with toast notifications
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof HttpError) {
        errorMessage = `Error ${error.status}: ${error.message}`;
        switch (error.status) {
          case 401: // Unauthorized
            toast.error('Authentication failed. Please log in again.');
            // Attempt silent refresh or redirect to login (handled by interceptor usually)
            break;
          case 403: // Forbidden
            toast.error('You do not have permission to perform this action.');
            break;
          case 404: // Not Found
            toast.warn('The requested resource was not found.');
            break;
          case 429: // Too Many Requests
            toast.warn('Rate limit exceeded. Please try again later.');
            break;
          case 500:
          case 502:
          case 503:
          case 504: // Server errors
            toast.error('Server error. Please try again or contact support.');
            break;
          default: // Other client errors (4xx)
            toast.error(errorMessage);
        }
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request aborted.';
        console.warn('[ApiClient]', errorMessage);
        // Don't show toast for deliberate aborts
      } else {
        // Network errors or other unexpected errors
        toast.error('Network error or unexpected issue. Please check your connection.');
      }

      // Re-throw the error so calling code (e.g., React Query, AuthContext) can handle it
      throw error;
    } finally {
      NProgress.done();
    }
  }

  /**
   * Create a URL with query parameters
   */
  private createUrl(path: string, params?: Record<string, any>): string {
    // Ensure path doesn't start with a slash if baseUrl ends with one
    const normalizedPath =
      this.baseUrl.endsWith('/') && path.startsWith('/') ? path.slice(1) : path;

    // For testing environments, we need a valid URL format
    // In the browser, this would be the actual window.location.origin
    const mockOrigin = 'http://localhost';

    // Create a URL object for the base path
    let baseUrl = this.baseUrl;

    // If the baseUrl is not a full URL, prefix it with the mock origin
    if (!baseUrl.match(/^https?:\/\//)) {
      baseUrl = baseUrl.startsWith('/') ? `${mockOrigin}${baseUrl}` : `${mockOrigin}/${baseUrl}`;
    }

    // Combine baseUrl and path
    // Combine baseUrl and path correctly, ensuring no double slashes
    const combinedPath = `${baseUrl.replace(/\/$/, '')}/${normalizedPath.replace(/^\//, '')}`;
    const url = new URL(combinedPath, baseUrl.match(/^https?:\/\//) ? undefined : mockOrigin); // Use origin only if baseUrl is relative

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .forEach(([key, value]) => {
          // Handle arrays
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)));
            return;
          }

          // Handle objects
          if (typeof value === 'object') {
            url.searchParams.append(key, JSON.stringify(value));
            return;
          }

          // Handle primitives
          url.searchParams.append(key, String(value));
        });
    }

    return url.toString();
  }

  // --- IApiClient Implementation ---

  clearAuthToken(): void {
    this.setAuthToken(null);
    // Optionally remove from localStorage if stored there
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    // Check if the token exists and potentially validate it (basic check here)
    return !!this.authToken;
  }

  async login(email: string, password: string): Promise<any> {
    // Assuming a /auth/login endpoint
    const response = await this.post<any>('/auth/login', { email, password });
    if (response && response.token) {
      // Adjust based on actual response structure
      this.setAuthToken(response.token);
      localStorage.setItem('authToken', response.token); // Store token
    }
    return response;
  }

  getPatients(): Promise<any[]> {
    // Assuming a /patients endpoint
    return this.get<any[]>('/ml/patients/'); // Match path from console errors
  }

  getPatientById(patientId: string): Promise<any> {
    // Assuming a /patients/{id} endpoint
    return this.get<any>(`/ml/patients/${patientId}`); // Match path structure
  }

  getBrainModel(modelId?: string): Promise<any> {
    // Assuming a /brain-models/{id} endpoint, default if no ID?
    const endpoint = modelId ? `/ml/brain/brain-models/${modelId}` : '/ml/brain/brain-models'; // Match path from console errors
    return this.get<any>(endpoint);
  }

  predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any> {
    // Assuming a /predictions/treatment endpoint
    return this.post<any>(`/predictions/treatment/${patientId}`, treatmentData);
  }

  getRiskAssessment(patientId: string): Promise<any> {
    // Assuming a /risk-assessment/{id} endpoint
    return this.get<any>(`/risk-assessment/${patientId}`);
  }

  // --------------------------------
}

// Remove the direct export of ApiClient instance below
// const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/';
// export const apiClient = new ApiClient(apiBaseUrl);
