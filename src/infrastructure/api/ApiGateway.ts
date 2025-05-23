/* eslint-disable */
import { ApiClient } from './ApiClient'; // Corrected casing
import { EnhancedMockApiClient } from './EnhancedMockApiClient';
import type { IApiClient } from './IApiClient';

/**
 * ApiGateway - Implementation of the clean hexagonal architecture pattern
 *
 * This gateway allows the frontend application to operate without a backend
 * using the following clean architecture principles:
 *
 * 1. Dependency Inversion - high level modules depend on abstractions
 * 2. Interface Segregation - clients only depend on methods they use
 * 3. Single Responsibility - each implementation handles one aspect
 */
export class ApiGateway implements IApiClient {
  private static instance: IApiClient;
  // Determine initial mock mode from env variable (defaults to false)
  private static mockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

  /**
   * Get the API client instance - singleton pattern
   */
  public static getInstance(): IApiClient {
    if (!this.instance) {
      // For production, we'll check env vars to determine mode
      const envFlag = import.meta.env.VITE_USE_MOCK_API;
      // Highest-priority: explicit env flag, then localStorage toggle, then static mockMode
      const useMockApi =
        envFlag !== undefined
          ? envFlag === 'true'
          : localStorage.getItem('use_mock_api') === 'true' || this.mockMode;

      console.info(
        `🧠 Novamind API Gateway: Using ${useMockApi ? 'MOCK' : 'REAL'} API client (NODE_ENV: ${process.env.NODE_ENV})`
      );
      console.log(`[ApiGateway] Checking NODE_ENV: ${process.env.NODE_ENV}`);

      // Determine base URL based on environment
      let baseUrl = '/'; // Default for development/production relative paths
      if (process.env.NODE_ENV === 'test') {
        baseUrl = 'http://localhost'; // Use absolute path for MSW in tests
      } else {
        baseUrl = import.meta.env.VITE_API_BASE_URL || '/'; // Use Vite env var or default
      }
      console.log(`[ApiGateway] Determined baseUrl: ${baseUrl}`);

      // If we detect API connection errors, we can auto-fallback to mock mode
      // Provide the required baseUrl for the real ApiClient
      const realApiClient = new ApiClient(baseUrl);
      this.instance = useMockApi ? new EnhancedMockApiClient({}) : realApiClient;
    }

    return this.instance;
  }

  /**
   * Force mock mode - useful for demos
   */
  public static enableMockMode(): void {
    this.mockMode = true;
    this.instance = null as unknown as IApiClient; // Force recreation
    localStorage.setItem('use_mock_api', 'true');
    console.info('🧠 Novamind API Gateway: Mock mode ENABLED');
  }

  /**
   * Force real API mode - only use if backend is running
   */
  public static disableMockMode(): void {
    this.mockMode = false;
    this.instance = null as unknown as IApiClient; // Force recreation
    localStorage.setItem('use_mock_api', 'false');
    console.info('🧠 Novamind API Gateway: Mock mode DISABLED - attempting to use real API');
  }

  // Forward all methods to the instance - clean implementation of the Proxy pattern
  setAuthToken(token: string): void {
    return ApiGateway.getInstance().setAuthToken(token);
  }

  clearAuthToken(): void {
    return ApiGateway.getInstance().clearAuthToken();
  }

  isAuthenticated(): boolean {
    return ApiGateway.getInstance().isAuthenticated();
  }

  login(email: string, password: string): Promise<any> {
    return ApiGateway.getInstance().login(email, password);
  }

   
  get<T>(url: string, config?: any): Promise<T> {
    return ApiGateway.getInstance().get(url, config);
  }

   
  post<T>(url: string, data?: any, config?: any): Promise<T> {
    return ApiGateway.getInstance().post(url, data, config);
  }

   
  put<T>(url: string, data?: any, config?: any): Promise<T> {
    return ApiGateway.getInstance().put(url, data, config);
  }

   
  delete<T>(url: string, config?: any): Promise<T> {
    return ApiGateway.getInstance().delete(url, config);
  }

  getPatients(): Promise<any[]> {
    return ApiGateway.getInstance().getPatients();
  }

  getPatientById(patientId: string): Promise<any> {
    return ApiGateway.getInstance().getPatientById(patientId);
  }

  getBrainModel(modelId?: string): Promise<any> {
    return ApiGateway.getInstance().getBrainModel(modelId);
  }

   
  predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any> {
    return ApiGateway.getInstance().predictTreatmentResponse(patientId, treatmentData);
  }

  getRiskAssessment(patientId: string): Promise<any> {
    return ApiGateway.getInstance().getRiskAssessment(patientId);
  }
}

// Export a singleton instance for convenience
export const apiClient: IApiClient = ApiGateway.getInstance();
