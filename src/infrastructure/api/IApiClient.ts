/* eslint-disable */
/**
 * IApiClient - The common interface for all API clients
 *
 * This interface acts as the "port" in ports & adapters architecture.
 * All API clients must implement this interface, allowing them to be
 * interchangeable with zero changes to business logic.
 */
export interface IApiClient {
  // Authentication
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  isAuthenticated(): boolean;
  login(email: string, password: string): Promise<any>;

  // HTTP methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T>(url: string, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete<T>(url: string, config?: any): Promise<T>;

  // Domain-specific methods
  getPatients(): Promise<any[]>;
  getPatientById(patientId: string): Promise<any>;
  getBrainModel(modelId?: string): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any>;
  getRiskAssessment(patientId: string): Promise<any>;
}
