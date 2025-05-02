/* eslint-disable */
import { ApiClient } from './apiClient'; // Corrected casing
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
  private static mockMode = true; // Default to mock mode for demonstration

  /**
   * Get the API client instance - singleton pattern
   */
  public static getInstance(): IApiClient {
    if (!this.instance) {
      // For production, we'll check env vars to determine mode
      const useMockApi =
        process.env.NODE_ENV === 'development' ||
        // Simplify for development: Always use mock if NODE_ENV is development
        // unless explicitly disabled via localStorage override maybe?
        // For now, prioritizing development use case where backend might be down.
        false; // Remove other conditions for simplicity during debugging
        /*
        this.mockMode ||
        // Detect if we're in a GitHub Codespace and allow override
        (window.location.hostname.includes('githubpreview.dev') &&
          !localStorage.getItem('use_real_api'));
        */

      console.info(`🧠 Novamind API Gateway: Using ${useMockApi ? 'MOCK' : 'REAL'} API client (NODE_ENV: ${process.env.NODE_ENV})`);

      // If we detect API connection errors, we can auto-fallback to mock mode
      this.instance = useMockApi ? new EnhancedMockApiClient() : new ApiClient();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T>(url: string, config?: any): Promise<T> {
    return ApiGateway.getInstance().get(url, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post<T>(url: string, data?: any, config?: any): Promise<T> {
    return ApiGateway.getInstance().post(url, data, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put<T>(url: string, data?: any, config?: any): Promise<T> {
    return ApiGateway.getInstance().put(url, data, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any> {
    return ApiGateway.getInstance().predictTreatmentResponse(patientId, treatmentData);
  }

  getRiskAssessment(patientId: string): Promise<any> {
    return ApiGateway.getInstance().getRiskAssessment(patientId);
  }
}

// Export a singleton instance for convenience
export const apiClient: IApiClient = ApiGateway.getInstance();
